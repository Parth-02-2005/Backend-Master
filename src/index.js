import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/db";
import app from "./app";

connectDB()
.then(() => {
  console.log("Database connected successfully");
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
})
.catch((error) => {
  console.error("Database connection failed:", error);
});





// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";
// import dotenv from "dotenv";
// dotenv.config();

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// }