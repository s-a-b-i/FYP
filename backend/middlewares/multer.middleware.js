import multer from "multer";
import fs from "fs";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

// Function to clean up old temp files
const cleanupTempFiles = () => {
  const tempDir = "./public/temp";
  const maxAge = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error("Error reading temp directory:", err);
      return;
    }

    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return;
        }

        if (now - stats.mtimeMs > maxAge) {
          fs.unlink(filePath, err => {
            if (err) console.error("Error deleting old temp file:", err);
          });
        }
      });
    });
  });
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// Create temp directory if it doesn't exist
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cleanupTempFiles(); // Clean up before storing new files
    cb(null, tempDir);
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
  // Add safeguard for undefined headers
  if (!req || !req.headers || !req.headers['content-type']) {
    return cb(new ApiError(400, "Missing or invalid content-type header. Expected multipart/form-data"), false);
  }
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files are allowed"), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB per file
};

// Create a base multer instance
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Export pre-configured middleware functions
export const uploadSingleProfile = upload.single('profilePhoto'); // For profile photo uploads
export const uploadSingleCategory = upload.single('icon'); // For category icon uploads
export const uploadMultiple = upload.array('images', 12); // For multiple file uploads (e.g., item images)