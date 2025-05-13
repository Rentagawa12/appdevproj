import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import itemRoutes from './routes/itemRoutes.js';
import multer from 'multer';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// API Routes
app.use('/api/items', itemRoutes);

// Determine if we're running in Docker/production
const isDocker = process.env.NODE_ENV === 'production';

// Serve static frontend files and uploaded images
if (isDocker) {
  // In Docker, the frontend is in the public directory
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} else {
  // In development, the frontend is in a different directory
  app.use(express.static(path.join(__dirname, '../FRONTEND')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Catch-all route for SPA (Single Page Application)
app.get('*', (req, res) => {
  if (isDocker) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, '../FRONTEND', 'index.html'));
  }
});

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lostAndFound';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
}).catch(err => console.error(err));
