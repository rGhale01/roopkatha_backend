import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { customerRoute } from './routes/customerRoutes.js';
import { artistRoute } from './routes/artistRoutes.js';
import { bookingRoute } from './routes/bookingRoutes.js';
import { paymentRoute } from './routes/paymentRoutes.js'; 
import { serviceRoute } from './routes/serviceRoutes.js';
import { availabilityRoute } from './routes/availabilityRoutes.js';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create 'uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));

app.use(express.json());

mongoose.connect(MONGOURL).then(() => {
  console.log('Db connected');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  app.get('/', (req, res) => {
    res.send('This is home page');
  });
}).catch((error) => console.log(error));

// Register routes
app.use('/customers', customerRoute);
app.use('/artist', artistRoute);
app.use('/bookings', bookingRoute);
app.use('/payment', paymentRoute); // Register the payment routes
app.use('/service', serviceRoute);
app.use('/availability', availabilityRoute);

export { app };
