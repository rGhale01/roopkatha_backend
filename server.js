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
  fs.mkdirSync(uploadDir);
}

app.use(cors()); // Enable CORS for all routes

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));

app.use(express.json()); // Middleware to handle JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to handle URL-encoded data

// Register routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.send('This is home page');
});

// Connect to MongoDB and start server
mongoose.connect(MONGOURL,)
  .then(() => {
    console.log('Db connected');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

export { app };