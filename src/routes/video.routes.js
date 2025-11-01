import express from "express";
import upload from "../middlewares/multer.middleware.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router = express.Router();

router.post('/publish-video',
    authenticateUser, 
    upload.fields([{name: 'videoFile', maxCount: 1}, {name: 'thumbnail', maxCount: 1}]), 
    publishAVideo)
router.get('/get-video', authenticateUser, getAllVideos);
router.get('/get-video/:videoId', authenticateUser, getVideoById);
router.put("/update/:videoId", 
    authenticateUser, 
    upload.fields([{ name: "thumbnail", maxCount: 1 }], 
    ), updateVideo);
router.delete('/delete/:videoId', authenticateUser, deleteVideo);
router.patch('/toggle-status/:videoId', authenticateUser, togglePublishStatus);
export default router 