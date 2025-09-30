import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file) => {
    try {
        if(!file) return;
        // upload to cloudinary
        const result = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        })

        // file has been uploaded
        console.log(result.url);

        return result;
        
    } catch (error) {
        fs.unlinkSync(file) // remove the file from server
        console.log(error);
        throw new Error(error.message)
    }
}

export default uploadToCloudinary;