// import express from 'express';
// import dotenv from 'dotenv';
// import BookingModel from '../model/Booking.js';
// import { authenticate } from '../middleware/auth.js';

// dotenv.config();

// const bookingRoute = express.Router();
// bookingRoute.use(express.json());

// // Get all bookings
// bookingRoute.get('/allBookings', async (req, res) => {
//     try {
//         let data = await BookingModel.find().populate('customerID serviceID availabilityID');
//         res.status(200).send({ Bookings: data });
//     } catch (err) {
//         res.status(404).send({ ERROR: err });
//     }
// });

// // Get available time slots for a specific artist and date
// bookingRoute.get('/available-slots', async (req, res) => {
//     const { artistId, date } = req.query;
//     try {
//         const existingBookings = await BookingModel.find({ artistId, date });

//         const allSlots = [
//             "09:00", "10:00", "11:00", "12:00",
//             "13:00", "14:00", "15:00", "16:00",
//             "17:00", "18:00"
//         ];

//         const bookedSlots = existingBookings.map(booking => booking.startTime);
//         const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

//         res.status(200).send({ availableSlots });
//     } catch (err) {
//         res.status(500).send({ ERROR: err });
//     }
// });

// // Add a new booking
// bookingRoute.post('/newBooking', async (req, res) => {
//     const { customerID, availabilityID, serviceID, price, paymentMethod } = req.body;

//     try {
//         const booking = new BookingModel({
//             customerID,
//             availabilityID,
//             serviceID,
//             price,
//             paymentMethod
//         });

//         await booking.save();
//         res.status(201).send({ bookingID: booking._id });
//     } catch (error) {
//         console.error('Error during booking creation:', error.message || error);
//         res.status(500).send({ error: 'An error occurred while booking the service' });
//     }
// });

// // Update a booking
// bookingRoute.patch('/update/:id', async (req, res) => {
//     const ID = req.params.id;
//     const payload = req.body;
//     try {
//         await BookingModel.findByIdAndUpdate({ _id: ID }, payload);
//         res.send({ message: 'Booking modified' });
//     } catch (err) {
//         console.log(err);
//         res.send({ message: 'error' });
//     }
// });

// // Delete a booking
// bookingRoute.delete('/delete/:id', async (req, res) => {
//     const ID = req.params.id;
//     try {
//         await BookingModel.findByIdAndDelete({ _id: ID });
//         res.send({ message: 'Booking has been deleted' });
//     } catch (err) {
//         console.log(err);
//         res.send({ message: 'error' });
//     }
// });

// export { bookingRoute };