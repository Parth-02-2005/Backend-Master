import mongoose, {isValidObjectId} from "mongoose"
import PlayList, {Playlist} from "../models/playlist.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist

    if ([name, description].some((field) => !field?.trim())) {
        throw new apiError(400, 'Name or Description is required')
    }

    const user = await User.findById(req.user._id);

    if(!user) {
        throw new apiError(404, 'user not found');
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        video: []
    })

    res.status(200).json(new apiResponse(200, playlist, 'playlist created successfully'));

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if(!userId || !userId.trim()) {
        throw new apiError(404, 'User Id not found');
    }
    const user = await User.findById(userId);

    if(!user) {
        throw new apiError(400, 'Invalid user');
    }

    const playlist = await Playlist.find({
        owner: userId
    }).populate('videos')

    res.status(200).json(new apiResponse(200, playlist, 'fetched user playlist'))


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId || !playlistId.trim()) {
        throw new apiError(400, 'Invalid playlist ID');
    }
    const playlist = await PlayList.findById(playlistId).populate('videos').populate('owner', 'username email');

    if(!playlist) {
        throw new apiError(404, 'playlist not found');
    }

    res.status(200).json(new apiResponse(200, playlist, 'Fetched playlist successfully'));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}