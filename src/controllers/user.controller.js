import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from req.body
  const { username, fullName, email, password } = req.body;

  // validate user details - not empty
  if (!username || !email || !password || !fullName) {
    res.status(400);
    throw new apiError(400, "All fields are required");
  }

  // Check if user already exists in DB
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existedUser) {
    res.status(409);
    throw new apiError(409, "User already exists with this email or username");
  }

  // Check for images, avatars upload to cloudinary
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // console.log("multer req.files", req.files);

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  // console.log(coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath, "Avatars");
  const coverImage = coverImageLocalPath
    ? await uploadToCloudinary(coverImageLocalPath, "CoverImages")
    : "";

  if (!avatar) {
    throw new apiError(500, "Avatar upload failed, please try again");
  }

  // Create user object and save to DB
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar?.secure_url,
    coverImage: coverImage?.secure_url,
  });

  // remove password and ref token from response
  const CheckUserCreated = await User.findById(user._id).select(
    "-password -refreshToken -__v -createdAt -updatedAt"
  );
  if (!CheckUserCreated) {
    throw new apiError(500, "User creation failed, please try again");
  }

  // check if user created successfully and send response
  return res
    .status(201)
    .json(new apiResponse(201, CheckUserCreated, "User created successfully"));
});

const generateTokens = async (user) => {
  try {
    const userId = await User.findById(user);
    const accessToken = userId.generateAccessToken();
    const refreshToken = userId.generateRefreshToken();

    userId.refreshToken = refreshToken;
    await userId.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Token generation failed, please try again");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // validate user details - not empty
  if (!username || !email || !password) {
    res.status(400);
    throw new apiError(400, "All fields are required");
  }

  // check if user exists in DB
  const user = await User.findOne({
    $or: [
      { username: username.toLowerCase() },
      { email: username.toLowerCase() },
    ],
  });
  if (!user) {
    res.status(404);
    throw new apiError(404, "User not found, please register");
  }

  // check if password matches
  const isPasswordMatched = await user.isPasswordCorrect(password);
  if (!isPasswordMatched) {
    res.status(401);
    throw new apiError(401, "Invalid credentials, password does not match");
  }

  // generate access and refresh tokens
  const { accessToken, refreshToken } = await generateTokens(user._id);

  const options = {
    httpOnly: true,
    secure: true, // only server can access the cookie
    sameSite: "Strict", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            coverImage: user.coverImage,
            watchHistory: user.watchHistory,
          },
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Remove refresh token from DB
  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true, // only server can access the cookie
    sameSite: "Strict", // CSRF protection
  };
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  return res
    .status(200)
    .json(new apiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from cookie or req.body
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    res.status(401);
    throw new apiError(401, "Refresh token is required");
  }

  try {
    // verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    if (!decodedToken || !decodedToken.id) {
      res.status(401);
      throw new apiError(401, "Invalid refresh token");
    }
  
    const user = await User.findById(decodedToken?._id);
  
    const incomingUserRefreshToken = user?.refreshToken;
  
    if (incomingRefreshToken !== incomingUserRefreshToken) {
      res.status(401);
      throw new apiError(401, "Invalid refresh token");
    }
    
    // generate new access token
    const { accessToken, newRefreshToken } = await generateTokens(user._id);
  
    res.status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // only server can access the cookie
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true, // only server can access the cookie
    })
    .json(
      new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully")
    );
  } catch (error) {
    res.status(401);
    throw new apiError(401, error?.message || "Invalid or expired refresh token");
  }

});

export { registerUser, loginUser, logoutUser, refreshAccessToken }; // named export shorthand