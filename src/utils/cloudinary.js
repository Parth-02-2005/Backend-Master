import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import apiError from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folderName) => {
    try {
        if(!file) return;
        // upload to cloudinary
        const result = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
            folder: folderName // optional folder name in cloudinary
        })

        // file has been uploaded
        // console.log(result);
        fs.unlinkSync(file) // remove the file from server

        return result;
        
    } catch (error) {
        fs.unlinkSync(file) // remove the file from server
        console.log(error);
        throw new apiError(500, "Image upload failed, please try again")
    }
}

export const deleteToCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary delete result:", result);
        return result;
    } catch (error) {
        throw new apiError('Failed to delete image from cloudinary')
    }
}

// export default { uploadToCloudinary, deleteToCloudinary }