import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadToCloudinary} from "../utils/cloudinary.js";
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js";


const getAllVideos = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
  const query = (req.query.query || "").trim();
  const sortBy = req.query.sortBy || "createdAt";
  const sortType = (req.query.sortType || "desc").toLowerCase();
  const userId = req.query.userId;

  const pageNumber = page;
  const limitNumber = limit;

  if (!userId) {
    throw new apiError(400, "Unauthorized access: userId required");
  }

  const existedUser = await User.findById(userId);
  if (!existedUser) {
    throw new apiError(404, "User not found");
  }

  const userVideos = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },
    { $unwind: { path: "$videos", preserveNullAndEmptyArrays: true } },
    ...(query
      ? [{ $match: { "videos.title": { $regex: query, $options: "i" } } }]
      : []),
    {
      $sort: { [`videos.${sortBy}`]: sortType === "asc" ? 1 : -1 },
    },
    { $skip: (pageNumber - 1) * limitNumber },
    { $limit: limitNumber },
    {
      $group: {
        _id: "$_id",
        videos: { $push: "$videos" },
      },
    },
  ]);

  if (!userVideos || userVideos.length === 0 || !userVideos[0].videos.length) {
    throw new apiError(404, "No videos found");
  }

  const videos = userVideos[0].videos;

  return res.status(200).json(
    new apiResponse(
      200,
      {
        currentPage: pageNumber,
        totalVideos: videos.length,
        videos,
      },
      "Videos fetched successfully"
    )
  );
});

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
    .json(new apiResponse(200,video,"Video published successfully")) 

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