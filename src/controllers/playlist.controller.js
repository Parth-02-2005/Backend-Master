import mongoose, { isValidObjectId } from "mongoose";
import PlayList, { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if ([name, description].some((field) => !field?.trim())) {
    throw new apiError(400, "Name or Description is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new apiError(404, "user not found");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    video: [],
  });

  res
    .status(200)
    .json(new apiResponse(200, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId || !userId.trim()) {
    throw new apiError(404, "User Id not found");
  }
  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(400, "Invalid user");
  }

  const playlist = await Playlist.find({
    owner: userId,
  }).populate("videos");

  res.status(200).json(new apiResponse(200, playlist, "fetched user playlist"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId || !playlistId.trim()) {
    throw new apiError(400, "Invalid playlist ID");
  }
  const playlist = await PlayList.findById(playlistId)
    .populate("videos")
    .populate("owner", "username email");

  if (!playlist) {
    throw new apiError(404, "playlist not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, playlist, "Fetched playlist successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new apiError(400, "Playlist ID and Video ID are required");
  }
  // find video in database
  const video = await Video.findById(videoId);
  const playlist = await PlayList.findById(playlistId);

  if (!playlist) {
    throw new apiError(404, "Playlist not found");
  }

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  // check if video already exists in playlist or not
  const videoInPlaylist = playlist.videos.some(
    (video) => video.toString() === videoId
  );

  if (videoInPlaylist) {
    throw new apiError(400, "video already in playlist");
  }
  // push the id of video in playlist
  playlist.videos.push(videoId);
  const updatePlaylist = await playlist.save();

  if(!updatePlaylist) {
    throw new apiError(404, 'Failed to update playlist');
  }

  const populatePlaylist = await updatePlaylist.populate({
    path: "videos",
    select: "title thumbnail duration createdAt",
  }).populate({
    path: "owner",
    select: "username email"
  });

  if(!populatePlaylist)  {
    throw new apiError(404, "playlist not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, populatePlaylist, 'Video added to playlist successfully'));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId || !videoId) {
    throw new apiError(400, "Playlist ID and Video ID are required");
  }

  // find video in database
  const video = await Video.findById(videoId);
  const playlist = await PlayList.findById(playlistId);

   if (!playlist) {
    throw new apiError(404, "Playlist not found");
  }

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  // check if video already exists in playlist or not
  const videoInPlaylist = playlist.videos.some(
    (video) => video.toString() === videoId
  );

  if (!videoInPlaylist) {
    throw new apiError(400, "Video not in playlist");
  }

  playlist.videos = playlist.videos.filter((video) => video._id.toString() !== videoId);

  const updatedPlaylist = playlist.save();

  if(!updatePlaylist) {
    throw new apiError(400, 'Failed to remove video from playlist')
  }
  
  // populate videos in playlist
    const populatedPlaylist = await updatedPlaylist.populate("videos")
    if(!populatedPlaylist){
        throw new apiError(500, "Failed to populate videos in playlist")
    }

    res.status(200).json(new apiResponse(200, populatedPlaylist, 'Video removed from playlist successfully'));

});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if(!playlistId) {
    throw new apiError(400, 'Playlist ID is required');
  }

  const deletedPlaylist = await PlayList.findByIdAndDelete(playlistId);

  if(!deletedPlaylist) {
    throw new apiError(500, 'Failed to delete playlist');
  }

  if (deletedPlaylist.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "Not authorized to delete this playlist");
  }
  
  res.status(200).json( new apiResponse(200, deletedPlaylist, 'playlist deleted successfully'));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
