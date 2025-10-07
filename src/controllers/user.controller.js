import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary  from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
    // Get user details from req.body
    const { username, fullName, email, password } = req.body;

    // validate user details - not empty
    if(!username || !email || !password || !fullName) {
        res.status(400);
        throw new apiError(400, "All fields are required");
    }
    
    // Check if user already exists in DB
    const existedUser = await User.findOne(
        { $or: [ { email }, { username } ] }
    );

    if(existedUser){
        res.status(409);
        throw new apiError(409, "User already exists with this email or username");
    }

    // Check for images, avatars upload to cloudinary
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("multer req.files", req.files);

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // console.log(coverImageLocalPath);

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath, "Avatars")
    const coverImage = coverImageLocalPath ? await uploadToCloudinary(coverImageLocalPath, "CoverImages") : "";

    if(!avatar) {
        throw new apiError(500, "Avatar upload failed, please try again");
    }

    // Create user object and save to DB
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar?.secure_url,
        coverImage: coverImage?.secure_url
    })

    // remove password and ref token from response
    const CheckUserCreated = await User.findById(user._id).select("-password -refreshToken -__v -createdAt -updatedAt");
    if(!CheckUserCreated) {
        throw new apiError(500, "User creation failed, please try again");
    }

    // check if user created successfully and send response
    return res.status(201).json(
        new apiResponse(
            201,
            CheckUserCreated,
            "User created successfully"
        )
    );

})

const loginUser = asyncHandler( async (req, res) => {
    const { email, username, password } = req.body;

    // validate user details - not empty
    if(!username || !email || !password) {
        res.status(400);
        throw new apiError(400, "All fields are required");
    }

    // check if user exists in DB
    const user = User.findOne({ 
        $or: [ { username: username.toLowerCase() }, { email: username.toLowerCase() } ]
     })
    if(!user) {
        res.status(404);
        throw new apiError(404, "User not found, please register");
    }

    // check if password matches 
    const isPasswordMatched = await user.isPasswordCorrect(password);
    if(!isPasswordMatched) {
        res.status(401);
        throw new apiError(401, "Invalid credentials, password does not match");
    }

    // generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // send response
    return res.status(200).json(
        new apiResponse(200, {
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
            }
        }, "User logged in successfully")
    );


});

export { registerUser, loginUser }; // named export shorthand
