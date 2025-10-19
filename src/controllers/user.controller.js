import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary, deleteToCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

  // save refresh token to user document
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

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
    { $unset: { refreshToken: 1 } },
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
  // console.log("working");

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // console.log(incomingRefreshToken);

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

    // console.log("Decoded token:", decodedToken);

    if (!decodedToken || !decodedToken._id) {
      res.status(401);
      throw new apiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken?._id);

    // console.log(user);

    const incomingUserRefreshToken = user?.refreshToken;

    if (incomingRefreshToken !== incomingUserRefreshToken) {
      res.status(401);
      throw new apiError(401, "Invalid refresh token");
    }

    // generate new access token
    const { accessToken, newRefreshToken } = await generateTokens(user._id);

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true, // only server can access the cookie
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true, // only server can access the cookie
      })
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    res.status(401);
    throw new apiError(
      401,
      error?.message || "Invalid or expired refresh token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.user._id;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new apiError(400, "Current and new passwords are required");
  }

  const user = await User.findById(userId);

  const isPasswordMatched = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordMatched) {
    res.status(401);
    throw new apiError(401, "Current password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, null, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new apiResponse(200, user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    res.status(400);
    throw new apiError(400, "fullName and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "user updated successfully"));
});

const udpateUserAvatar = asyncHandler(async (req, res) => {
  const user = req.user;

  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    res.status(400);
    throw new apiError(400, "avatar file is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath, "Avatars");

  if (!avatar.secure_url) {
    res.status(400);
    throw new apiError(400, "Failed to upload avatar, no URL returned");
  }

  if (user.avatar) {
    function extractPublicId(secureUrl) {
      // Example URL: https://res.cloudinary.com/mycloud/image/upload/v1727123456/avatars/profile_pic_abcd1234.jpg
      const parts = secureUrl.split("/");
      const versionIndex = parts.findIndex((part) => part.startsWith("v"));

      // join everything after version and remove extension (.jpg, .png, etc.)
      const publicIdWithExt = parts.slice(versionIndex + 1).join("/");
      const publicId = publicIdWithExt.substring(
        0,
        publicIdWithExt.lastIndexOf(".")
      );

      return publicId;
    }

    const publicId = extractPublicId(user.avatar);
    await deleteToCloudinary(publicId);
  }

  user.avatar = avatar.secure_url;
  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, user, "avatar updated successfully"));
});

const udpateUserCoverImage = asyncHandler(async (req, res) => {
  const user = req.user;

  const coverImageLocalPath = req.file.path;

  if (!coverImageLocalPath) {
    res.status(400);
    throw new apiError(400, "coverImage file is required");
  }

  const coverImage = await uploadToCloudinary(
    coverImageLocalPath,
    "CoverImages"
  );

  if (!coverImage.url) {
    res.status(400);
    throw new apiError(400, "Failed to upload coverImage, no URL returned");
  }

  user.coverImage = coverImage.secure_url;
  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, user, "coverImage updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    res.status(400);
    throw new apiError(400, "usernmae is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: this.username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id", // _id of current user
        foreignField: "subscriber", // field in subscription docs that stores subscriber id
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  console.log(channel);

  if (!channel?.length) {
    res.status(404);
    throw new apiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  udpateUserAvatar,
  udpateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
}; // named export shorthand
