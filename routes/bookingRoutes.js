import express from 'express';
import dotenv from 'dotenv';
import { BookingModel } from '../model/Booking.js';
import { authenticate } from '../middleware/auth.js';

dotenv.config();

const bookingRoute = express.Router();
bookingRoute.use(express.json());
bookingRoute.use(authenticate);

// Get all bookings
bookingRoute.get('/bookings', async (req, res) => {
    try {
        let data = await BookingModel.find().populate('customerId artistId');
        res.status(200).send({ Bookings: data });
    } catch (err) {
        res.status(404).send({ ERROR: err });
    }
});

// Get bookings for a specific artist
bookingRoute.get('/artist/:id', async (req, res) => {
    const ID = req.params.id;
    try {
        let data = await BookingModel.find({ artistId: ID }).populate('artistId customerId');
        res.status(200).send({ Bookings: data });
    } catch (err) {
        res.status(500).send({ ERROR: err });
    }
});

// Get bookings for a specific customer
bookingRoute.get('/customer/:id', async (req, res) => {
    const ID = req.params.id;
    try {
        let data = await BookingModel.find({ customerId: ID }).populate('artistId customerId');
        res.status(200).send({ Bookings: data });
    } catch (err) {
        res.status(500).send({ ERROR: err });
    }
});

// Add a new booking
bookingRoute.post('/add', async (req, res) => {
    const { artistId, date, startTime, endTime, customerId } = req.body;
    try {
        const isSlotBooked = await BookingModel.exists({
            artistId,
            date,
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } }
            ]
        });

        if (isSlotBooked) {
            return res.status(409).send({ error: 'Time slot not available. Please choose a different time.' });
        }

        const booking = new BookingModel({
            artistId,
            customerId,
            date,
            startTime,
            endTime
        });

        await booking.save();
        res.send({ message: 'Booking confirmed successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'An error occurred while booking the service' });
    }
});

// Update a booking
bookingRoute.patch('/update/:id', async (req, res) => {
    const ID = req.params.id;
    const payload = req.body;
    try {
        await BookingModel.findByIdAndUpdate({ _id: ID }, payload);
        res.send({ message: 'Booking modified' });
    } catch (err) {
        console.log(err);
        res.send({ message: 'error' });
    }
});

// Delete a booking
bookingRoute.delete('/delete/:id', async (req, res) => {
    const ID = req.params.id;
    try {
        await BookingModel.findByIdAndDelete({ _id: ID });
        res.send({ message: 'Booking has been deleted' });
    } catch (err) {
        console.log(err);
        res.send({ message: 'error' });
    }
});

export { bookingRoute };