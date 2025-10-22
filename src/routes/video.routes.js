import express from "express";
import upload from "../middlewares/multer.middleware.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { getAllVideos, getVideoById, publishAVideo } from "../controllers/video.controller.js";

const router = express.Router();

router.post('/publish-video',
    authenticateUser, 
    upload.fields([{name: 'videoFile', maxCount: 1}, {name: 'thumbnail', maxCount: 1}]), 
    publishAVideo)
router.get('/get-video', authenticateUser, getAllVideos);
router.get('/get-video/:videoId', authenticateUser, getVideoById);

export default router