import asyncHandler from "../services/asyncHandler.js";
import apiError from "../services/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";


export const authenticateUser = asyncHandler( async (req, res, next) => {
    try {
        // get token from headers or cookies
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')
    
        if(!token) {
            res.status(401);
            throw new apiError(401, "Not authorized, token missing");
        }
        // verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded?._id).select("-password -refreshToken -__v -createdAt -updatedAt");
        
        if(!user) {
            res.status(401);
            throw new apiError(401, "Not authorized, user not found");
        }
    
        req.user = user;
    
        next();
    } catch (error) {
        res.status(401)
        throw new apiError(401, error.mesage ||"Not authorized, token failed");
    }
});