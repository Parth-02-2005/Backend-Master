import express from "express"
import upload from "../middlewares/multer.middleware.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { createPlaylist } from "../controllers/playlist.controller";


const router = express.Router()

router.post('/playlist', authenticateUser, createPlaylist);
router.get('/playlists/:userId', authenticateUser, getUserPlaylists);