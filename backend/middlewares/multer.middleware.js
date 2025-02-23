// middlewares/multer.middleware.js
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
        cleanupTempFiles(); // Clean up before storing new file
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