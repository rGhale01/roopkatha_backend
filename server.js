import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import routes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create 'uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware to handle JSON requests
app.use(express.json());

// Middleware to log raw request body
app.use((req, res, next) => {
  console.log('Raw Body:', req.body);
  next();
});

// Enable CORS for all routes
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));

// Middleware to handle URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.send('This is the home page');
});

// MongoDB Connection and Server Start
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log('Db connected');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error.message);
  });

export { app };