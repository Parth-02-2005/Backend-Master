import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // middleware to parse URL-encoded bodies
app.use(express.static('public')); // middleware to serve static files from the 'public' directory
app.use(cookieParser()); // middleware to parse cookies
export default app;