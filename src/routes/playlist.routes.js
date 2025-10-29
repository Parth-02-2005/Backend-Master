import express from "express"
import upload from "../middlewares/multer.middleware.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist } from "../controllers/playlist.controller";


const router = express.Router()

router.post('/playlist', authenticateUser, createPlaylist);
router.get('/playlists/:userId', authenticateUser, getUserPlaylists);
router.get('/playlist/:playlistId', authenticateUser, getPlaylistById);
router.post(
  '/playlist/:playlistId/add-video/:videoId',
  authenticateUser,
  addVideoToPlaylist
);
router.post('/playlist/:playlistId/remove-video/:videoId', authenticateUser, removeVideoFromPlaylist);
