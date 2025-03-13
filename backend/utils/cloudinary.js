// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// utils/cloudinary.js
const uploadToCloudinary = async (localFilePath) => {
    try {
      if (!localFilePath) {
        throw new ApiError(400, "No file path provided");
      }
      
      if (!fs.existsSync(localFilePath)) {
        throw new ApiError(400, "File not found");
      }
  
      console.log("Uploading to Cloudinary:", localFilePath);
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
        folder: "Re-fashion",
        quality: "auto",
        fetch_format: "auto"
      });
      
      console.log("Cloudinary Response:", response);
  
      const result = {
        secure_url: response.secure_url, // Changed from url to secure_url
        public_id: response.public_id
      };
      console.log("Returning from uploadToCloudinary:", result);
  
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }
      
      return result;
    } catch (error) {
      try {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }
      throw new ApiError(500, "Error while uploading file to cloudinary: " + error.message);
    }
  };

const deleteFromCloudinary = async (public_id) => {
    try {
      if (!public_id) {
        console.error("No public_id provided for deletion");
        throw new ApiError(400, "No public_id provided");
      }
  
      const response = await cloudinary.uploader.destroy(public_id);
      return response;
    } catch (error) {
      throw new ApiError(500, "Error while deleting file from cloudinary: " + error.message);
    }
  };


export {
    uploadToCloudinary,
    deleteFromCloudinary
};