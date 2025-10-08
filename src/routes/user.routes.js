import express from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
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

export default router