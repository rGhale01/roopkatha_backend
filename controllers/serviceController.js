import mongoose from 'mongoose';
import ServiceModel from '../model/Service.js';

// Controller functions

export const createService = async (req, res) => {
    const { artistID, name, description, price, duration } = req.body;

    try {
        if (!artistID) {
            return res.status(400).json({ error: 'Missing artistID' });
        }
        if (!mongoose.Types.ObjectId.isValid(artistID)) {
            return res.status(400).json({ error: 'Invalid artistID' });
        }
        if (!name || !price || !duration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newService = new ServiceModel({ artistID, name, description, price, duration });
        await newService.save();
        res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (err) {
        res.status(500).json({ error: `Error creating service: ${err.message}` });
    }
};

export const getAllServices = async (req, res) => {
    try {
        const services = await ServiceModel.find();
        res.status(200).json({ services });
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ error: 'Error fetching services' });
    }
};

export const getServicesByArtistId = async (req, res) => {
    try {
        const { artistId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(artistId)) {
            return res.status(400).json({ error: 'Invalid artistID' });
        }
        const services = await ServiceModel.find({ artistID: artistId });
        if (!services || services.length === 0) {
            return res.status(404).json({ error: 'Services not found' });
        }
        res.status(200).json(services);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ error: 'Error fetching services' });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid service ID' });
        }
        const service = await ServiceModel.findById(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json({ service });
    } catch (err) {
        console.error('Error fetching service:', err);
        res.status(500).json({ error: 'Error fetching service' });
    }
};

export const updateService = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid service ID' });
        }
        const updatedService = await ServiceModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedService) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service updated successfully', service: updatedService });
    } catch (err) {
        console.error('Error updating service:', err);
        res.status(500).json({ error: 'Error updating service' });
    }
};

export const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid service ID' });
        }
        const service = await ServiceModel.findByIdAndDelete(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ error: 'Error deleting service' });
    }
};