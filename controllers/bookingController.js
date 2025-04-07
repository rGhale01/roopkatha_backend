import dotenv from 'dotenv';
import BookingModel from '../model/Booking.js';
import mongoose from 'mongoose';

dotenv.config();

// Controller functions

export const getAllBookingsForArtist = async (req, res) => {
    const artistId = req.params.artistId;
    try {
        let data = await BookingModel.find({ artistID: artistId })
            .populate('customerID')
            .populate('serviceID')
            .populate('availabilityID');
        res.status(200).send({ Bookings: data });
    } catch (err) {
        console.error('Error fetching bookings for artist:', err.message || err);
        res.status(500).send({ error: 'An error occurred while fetching bookings for the artist', details: err.message });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        let data = await BookingModel.find().populate('customerID serviceID availabilityID');
        res.status(200).send({ Bookings: data });
    } catch (err) {
        console.error('Error fetching all bookings:', err.message || err);
        res.status(500).send({ error: 'An error occurred while fetching all bookings', details: err.message });
    }
};

export const getAvailableSlots = async (req, res) => {
    const { artistId, date } = req.query;
    try {
        const existingBookings = await BookingModel.find({ artistId, date });

        const allSlots = [
            "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00",
            "17:00", "18:00"
        ];

        const bookedSlots = existingBookings.map(booking => booking.startTime);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

        res.status(200).send({ availableSlots });
    } catch (err) {
        console.error('Error fetching available slots:', err.message || err);
        res.status(500).send({ error: 'An error occurred while fetching available slots', details: err.message });
    }
};

export const createBooking = async (req, res) => {
    const { customerID, availabilityID, serviceID, price, paymentMethod } = req.body;

    console.log('Received booking data:', req.body);

    if (!customerID) {
        return res.status(400).send({ error: 'Customer ID cannot be empty' });
    }

    try {
        const booking = new BookingModel({
            customerID,
            availabilityID,
            serviceID,
            price,
            paymentMethod
        });

        await booking.save();
        res.status(201).send({ bookingID: booking._id });
    } catch (error) {
        console.error('Error during booking creation:', error.message || error);
        res.status(500).send({ error: 'An error occurred while booking the service', details: error.message });
    }
};

export const updateBooking = async (req, res) => {
    const ID = req.params.id;
    const payload = req.body;
    try {
        await BookingModel.findByIdAndUpdate(ID, payload);
        res.send({ message: 'Booking modified' });
    } catch (err) {
        console.error('Error updating booking:', err.message || err);
        res.status(500).send({ error: 'An error occurred while updating the booking', details: err.message });
    }
};

export const deleteBooking = async (req, res) => {
    const ID = req.params.id;
    try {
        await BookingModel.findByIdAndDelete(ID);
        res.send({ message: 'Booking has been deleted' });
    } catch (err) {
        console.error('Error deleting booking:', err.message || err);
        res.status(500).send({ error: 'An error occurred while deleting the booking', details: err.message });
    }
};