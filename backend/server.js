import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import profileRoutes from './routes/profile.routes.js';
import categoryRoutes from './routes/category.routes.js';
import itemRoutes from './routes/item.routes.js';
import notificationRoutes from './routes/notification.routes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares (order matters!)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (including multipart/form-data headers)
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/item', itemRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use("/api/auth", authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});