import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import classroomRoutes from './routes/classroom.js'; // Import classroom routes
import cors from 'cors';

dotenv.config();

const app = express();

// Enable CORS before defining routes
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow frontend
    credentials: true, // Allow cookies/auth headers
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classroom', classroomRoutes); // Use classroom routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));