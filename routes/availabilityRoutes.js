// import express from 'express';
// import { AvailabilityModel } from '../model/Availiability.js';
// import moment from 'moment';

// const availabilityRoute = express.Router();
// availabilityRoute.use(express.json());

// const validateDate = (date) => {
//   return moment(date, 'YYYY-MM-DD', true).isValid();
// };

// // Create a new availability
// availabilityRoute.post('/create', async (req, res) => {
//   const { artistID, serviceID, date, startTime, endTime } = req.body;

//   try {
//     if (!artistID || !serviceID || !date || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Validate date format
//     if (!validateDate(date)) {
//       return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
//     }

//     // Check for conflicting availability
//     const conflictingAvailability = await AvailabilityModel.findOne({
//       serviceID,
//       date,
//       $or: [
//         { startTime: { $lt: endTime, $gte: startTime } },
//         { endTime: { $gt: startTime, $lte: endTime } },
//       ],
//     });

//     if (conflictingAvailability) {
//       return res.status(400).json({ error: 'Conflicting availability exists' });
//     }

//     const newAvailability = new AvailabilityModel({ artistID, serviceID, date, startTime, endTime });
//     await newAvailability.save();
//     res.status(201).json({ message: 'Availability created successfully', availability: newAvailability });
//   } catch (err) {
//     res.status(500).json({ error: `Error creating availability: ${err.message}` });
//   }
// });

// // Get all availability by artist ID
// availabilityRoute.get('/artist/:artistId', async (req, res) => {
//   try {
//     const availability = await AvailabilityModel.find({ artistID: req.params.artistId });
//     res.status(200).json(availability);
//   } catch (err) {
//     console.error('Error fetching availability:', err);
//     res.status(500).json({ error: 'Error fetching availability' });
//   }
// });

// // Get availability by service ID
// availabilityRoute.get('/service/:serviceId', async (req, res) => {
//   try {
//     const availability = await AvailabilityModel.find({ serviceID: req.params.serviceId });
//     res.status(200).json(availability);
//   } catch (err) {
//     console.error('Error fetching availability:', err);
//     res.status(500).json({ error: 'Error fetching availability' });
//   }
// });

// // Update availability by ID
// availabilityRoute.patch('/update/:id', async (req, res) => {
//   const updateData = req.body;
//   try {
//     if (updateData.date && !validateDate(updateData.date)) {
//       return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
//     }

//     const updatedAvailability = await AvailabilityModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     if (!updatedAvailability) {
//       return res.status(404).json({ error: 'Availability not found' });
//     }
//     res.json({ message: 'Availability updated successfully', availability: updatedAvailability });
//   } catch (err) {
//     console.error('Error updating availability:', err);
//     res.status(500).json({ error: 'Error updating availability' });
//   }
// });

// // Delete availability by ID
// availabilityRoute.delete('/delete/:id', async (req, res) => {
//   try {
//     const availability = await AvailabilityModel.findByIdAndDelete(req.params.id);
//     if (!availability) {
//       return res.status(404).json({ error: 'Availability not found' });
//     }
//     res.json({ message: 'Availability deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting availability:', err);
//     res.status(500).json({ error: 'Error deleting availability' });
//   }
// });

// export { availabilityRoute };