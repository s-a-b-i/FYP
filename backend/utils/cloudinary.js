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
        
        // Check if file exists before uploading
        if (!fs.existsSync(localFilePath)) {
            throw new ApiError(400, "File not found");
        }

        // Upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "Re-fashion",
            quality: "auto",
            fetch_format: "auto"
        });
        
        // Remove file from local storage
        try {
            fs.unlinkSync(localFilePath);
        } catch (err) {
            console.error("Error deleting temp file:", err);
        }
        
        return {
            url: response.secure_url,
            public_id: response.public_id
        };

    } catch (error) {
        // Try to remove the locally saved temporary file if it exists
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