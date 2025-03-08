import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';  // Notice the '.js' extension is required in ES modules
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';


//profile routes
import profileRoutes from './routes/profile.routes.js';
import categoryRoutes from './routes/category.routes.js'
import itemRoutes from './routes/item.routes.js'
import notificationRoutes from './routes/notification.routes.js';


dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();


app.use(cors({
  origin: 'http://localhost:5173', credentials: true,
}))

// Middlewares
app.use(express.json()); // For parsing JSON
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Routes
app.get("/" , (req, res) => {
  res.send("Hello World!");
})
// profile routes
app.use('/api/v1/profile', profileRoutes);

// category routes
app.use('/api/v1/category', categoryRoutes);

// item routes
app.use('/api/v1/item', itemRoutes);


// notification routes
app.use('/api/v1/notifications', notificationRoutes);

// auth routes
app.use("/api/auth" , authRoutes)

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
