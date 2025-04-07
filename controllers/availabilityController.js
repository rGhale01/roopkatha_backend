import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AvailabilityModel } from '../model/Availiability.js';
import moment from 'moment';
import ResponseHelper from '../helpers/response_helper.cjs';

dotenv.config();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to validate date format
const validateDate = (date) => moment(date, 'YYYY-MM-DD', true).isValid();

// Controller functions
export const createAvailability = async (req, res) => {
    const { artistID, serviceID, date, startTime, endTime } = req.body;

    if (!artistID || !serviceID || !date || !startTime || !endTime) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (!validateDate(date)) {
        return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    }

    try {
        // Check for conflicting availability
        const conflictingAvailability = await AvailabilityModel.findOne({
            serviceID,
            date,
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
            ],
        });

        if (conflictingAvailability) {
            return res.status(400).json({ error: 'Conflicting availability exists' });
        }

        const newAvailability = new AvailabilityModel({ artistID, serviceID, date, startTime, endTime });
        await newAvailability.save();

        return res.status(201).json({ message: 'Availability created successfully', availability: newAvailability });
    } catch (err) {
        console.error('Error creating availability:', err);
        return res.status(500).json({ error: `Error creating availability: ${err.message}` });
    }
};

export const getAvailabilityByArtistId = async (req, res) => {
    const { artistId } = req.params;
    if (!isValidObjectId(artistId)) return res.status(400).json({ error: "Invalid Artist ID" });

    try {
        const availability = await AvailabilityModel.find({ artistID: artistId });
        return res.status(200).json({ availability });
    } catch (err) {
        console.error('Error fetching availability:', err);
        return res.status(500).json({ error: 'Error fetching availability' });
    }
};

export const getAvailabilityByServiceId = async (req, res) => {
    const { serviceId } = req.params;
    if (!isValidObjectId(serviceId)) return res.status(400).json({ error: "Invalid Service ID" });

    try {
        const availability = await AvailabilityModel.find({ serviceID: serviceId });
        return res.status(200).json({ availability });
    } catch (err) {
        console.error('Error fetching availability:', err);
        return res.status(500).json({ error: 'Error fetching availability' });
    }
};

export const updateAvailability = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Availability ID" });

    const updateData = req.body;
    if (updateData.date && !validateDate(updateData.date)) {
        return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    }

    try {
        const updatedAvailability = await AvailabilityModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedAvailability) {
            return res.status(404).json({ error: 'Availability not found' });
        }
        return res.json({ message: 'Availability updated successfully', availability: updatedAvailability });
    } catch (err) {
        console.error('Error updating availability:', err);
        return res.status(500).json({ error: 'Error updating availability' });
    }
};

export const deleteAvailability = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Availability ID" });

    try {
        const availability = await AvailabilityModel.findByIdAndDelete(id);
        if (!availability) {
            return res.status(404).json({ error: 'Availability not found' });
        }
        return res.json({ message: 'Availability deleted successfully' });
    } catch (err) {
        console.error('Error deleting availability:', err);
        return res.status(500).json({ error: 'Error deleting availability' });
    }
};

export const getAllAvailability = async (req, res) => {
    try {
        const availability = await AvailabilityModel.find();
        return res.status(200).json({ availability });
    } catch (err) {
        console.error('Error fetching availability:', err);
        return res.status(500).json({ error: 'Error fetching availability' });
    }
};