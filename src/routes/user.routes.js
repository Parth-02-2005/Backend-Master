import express from "express";

import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    updateAccountDetails, 
    udpateUserAvatar, 
    udpateUserCoverImage, 
    getWatchHistory } from "../controllers/user.controller.js";

import upload from "../middlewares/multer.middleware.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/register',upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 5 }
]), registerUser);

router.post('/login', loginUser);

// Protected route 
router.post('/logout', authenticateUser, logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/change-password', authenticateUser, changeCurrentPassword);
router.get('/current-user', authenticateUser, getCurrentUser);
router.patch('/update-account', authenticateUser, updateAccountDetails);
router.patch('/avatar', authenticateUser, upload.single('avatar'), udpateUserAvatar);
router.patch('/cover-image', authenticateUser, upload.single('coverImage'), udpateUserCoverImage);
router.get('/channel/:username', authenticateUser, getUserChannelProfile);
router.get('/history', authenticateUser, getWatchHistory);

export default router