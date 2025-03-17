import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { customerRoute } from './routes/customerRoutes.js';
import { artistRoute } from './routes/artistRoutes.js';
import { bookingRoute } from './routes/bookingRoutes.js';

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
        res.send('this is home page');
    });
}).catch((error) => console.log(error));

// Redirect routes
app.use('/customers', customerRoute);
app.use('/artist', artistRoute); // Instead of '/artists'
app.use('/bookings', bookingRoute);

// Uncomment and fix the following routes if needed:

// fetch artist by category
// app.get('/category', async (req, res) => {
//     const { category } = req.query;

//     try {
//         if (!category) {
//             return res.status(400).json({ msg: 'Please fill all the fields' });
//         }
//         const artists = await ArtistModel.find({ specialization: category });
        
//         if (artists.length === 0) {
//             return res.status(400).json({ msg: 'No artist found in this category' });
//         } 
//         res.status(200).json({ msg: artists });
//     } catch (err) {
//         res.status(500).json({ msg: 'Server Error' });
//     }
// });

// booking route
// app.post('/bookAppointment', async (req, res) => {
//     const { cname, artistName, service, phone, cId, artistId } = req.body;

//     try {
//         if (!cname || !artistName || !service || !phone || !cId || !artistId) {
//             return res.status(400).json({ msg: 'Please fill all the fields' });
//         }

//         const newBooking = new Booking({
//             cname,
//             artistName,
//             service,
//             phone,
//             cId,
//             artistId,
//             status: "booked",
//         });
        
//         await newBooking.save();

//         res.status(200).json({ msg: 'Success', booking: newBooking });
//     } catch (err) {
//         res.status(400).json({ msg: 'Server error' });
//     }
// });

// fetch by customer ID
// app.get('/appointment/:cID', async (req, res) => {
//     const { cID } = req.params;

//     try {
//         if (!cID) {
//             return res.status(400).json({ msg: 'Please fill all the fields' });
//         }

//         const bookings = await Booking.find({ cId: cID, status: 'booked' });

//         if (bookings.length === 0) {
//             return res.status(400).json({ msg: 'No Bookings Yet' });
//         }
//         res.status(200).json({ msg: bookings });
//     } catch (err) {
//         res.status(400).json({ msg: 'Server error' });
//     }
// });

// fetch by artist ID and status booked
// app.get('/appointment/artist/:artistId', async (req, res) => {
//     const { artistId } = req.params;

//     try {
//         if (!artistId) {
//             return res.status(400).json({ msg: 'Please fill all the fields' });
//         }

//         const bookings = await Booking.find({ artistId, status: 'booked' });

//         if (bookings.length === 0) {
//             return res.status(400).json({ msg: 'No Bookings Yet' });
//         }
//         res.status(200).json({ msg: bookings });
//     } catch (err) {
//         res.status(400).json({ msg: 'Server error' });
//     }
// });

// update appointment status to done
// app.put('/bookingStatus/:_id', async (req, res) => {
//     const { _id } = req.params;

//     try {
//         if (!_id) {
//             return res.status(400).json({ msg: 'Please fill all the fields' });
//         }
//         const booking = await Booking.findById(_id);
        
//         if (!booking) {
//             return res.status(400).json({ msg: 'Appointment not found' });
//         }

//         booking.status = 'done';
//         await booking.save();

//         res.status(200).json({ msg: 'Success', updatedBooking: booking });
//     } catch (err) {
//         res.status(500).json({ msg: 'Server error' });
//     }
// });

export { app };