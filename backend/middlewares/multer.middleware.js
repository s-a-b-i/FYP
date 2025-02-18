// middlewares/multer.middleware.js
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + getExtension(file.originalname));
    }
});

function getExtension(filename) {
    return filename.substring(filename.lastIndexOf('.'));
}

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only image files are allowed"), false);
    }
};

const limits = {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
    files: 1 // Maximum 1 file per request
};

export const upload = multer({ 
    storage,
    fileFilter,
    limits
});