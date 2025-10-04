import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";


const registerUser = asyncHandler( async (req, res) => {
    // Get user details from req.body
    const { username, fullName, email, password } = req.body;

    // validate user details - not empty
    if(!username || !email || !password || !fullName) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }
    // Check if user already exists in DB
    



    // Check for images, avatars upload to cloudinary


    // Create user object and save to DB


    // remove password and ref token from response


    // check if user created successfully and send response

})

export { registerUser }; // named export shorthand
