import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // middleware to parse URL-encoded bodies
app.use(express.static('public')); // middleware to serve static files from the 'public' directory
app.use(cookieParser()); // middleware to parse cookies

// routes import
import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js'

// routes decelaration
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/videos', videoRoutes);



export default app; // export the app for use in other modules