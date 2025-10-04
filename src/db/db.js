import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  try {
    const connectDatabse = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`${connectDatabse.connection.host} connected to database ${connectDatabse.connection.name}`);
    
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure 
  }
} 