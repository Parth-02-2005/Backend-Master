import mongoose from "mongoose"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { user } = req.user._id;

    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
     
})

export {
    getChannelStats, 
    getChannelVideos
    } // export 