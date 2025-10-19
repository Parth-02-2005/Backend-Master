import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import uploadToCloudinary from "../utils/cloudinary.js";
import apiError from "../utils/apiError.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if(!title || !description) {
        res.status(400)
        throw new apiError(400, "All fields are required");
    }
    // TODO: get video, upload to cloudinary, create video
    const videoLocalFile = req.files?.videoFile[0]?.path;
    const thumbnailLocalFile = req.files?.thumbnail[0]?.path;

    if(!videoLocalFile || !thumbnailLocalFile) {
        res.status(400)
        throw new apiError(400, 'video or thumbnail missing')
    }

    const videoFile = await uploadToCloudinary(videoLocalFile, "Videos");
    const thumbnailFile = await uploadToCloudinary(thumbnailLocalFile, "Thumbnail");

    if(!videoFile || !thumbnailFile) {
        res.status(400)
        throw new apiError(400, 'failed upload to cloudinary');
    }

    const video = await Video.create({
        videoFile: videoFile.secure_url,
        thumbnail: thumbnailFile.secure_url,
        title, 
        description,
        owner: req.user._id,
        isPublished: true,
        duration: videoFile.duration,
        views: 0
    })

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video published successfully")) 

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}