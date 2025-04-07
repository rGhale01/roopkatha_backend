// import express from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import fs from 'fs';
// import mongoose from 'mongoose'; // Ensure this is imported
// import { ArtistModel } from '../model/Artist.js';
// import { authenticate } from '../middleware/auth.js';
// import { authorise } from '../authorize.js';

// dotenv.config();

// const artistRoute = express.Router();
// artistRoute.use(express.json());

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
// });
// const upload = multer({ storage });

// // Helper function to validate ObjectId
// const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// // Register artist with profile picture upload
// artistRoute.post('/ArtistRegister', upload.single('profilePicture'), async (req, res) => {
//     const { name, email, password } = req.body;
//     const profilePictureUrl = req.file 
//         ? `http://10.0.2.2:8000/uploads/${req.file.filename}`
//         : 'http://10.0.2.2:8000/uploads/123.jpeg';

//     try {
//         const artist = await ArtistModel.findOne({ email });
//         if (artist) return res.status(409).json({ message: 'Artist already registered' });

//         const hashedPassword = await bcrypt.hash(password, 5);
//         const newArtist = new ArtistModel({ name, email, password: hashedPassword, profilePictureUrl });
//         await newArtist.save();
//         res.status(201).json({ message: 'Artist Registered' });
//     } catch (err) {
//         res.status(500).json({ ERROR: err.message });
//     }
// });

// // Artist Login
// artistRoute.post('/ArtistLogin', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const artist = await ArtistModel.findOne({ email });
//         if (!artist) return res.status(401).json({ message: 'No artist found' });

//         const isMatch = await bcrypt.compare(password, artist.password);
//         if (!isMatch) return res.status(401).json({ message: 'INVALID credentials' });

//         const token = jwt.sign({ artistID: artist._id }, process.env.JWT_SECRET);
//         const refreshToken = jwt.sign({ artistID: artist._id }, process.env.JWT_SECRET, { expiresIn: '1m' });

//         res.status(200).json({ message: 'Validation done', token, refresh: refreshToken, name: artist.name, id: artist._id });
//     } catch (err) {
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// // Update artist profile
// artistRoute.patch('/update/:id', authenticate, authorise(['artist', 'admin']), upload.single('profilePicture'), async (req, res) => {
//     const { id } = req.params;
//     if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

//     const updateData = req.body;
//     if (req.file) updateData.profilePictureUrl = `http://10.0.2.2:8000/uploads/${req.file.filename}`;

//     try {
//         const updatedArtist = await ArtistModel.findByIdAndUpdate(id, updateData, { new: true });
//         if (!updatedArtist) return res.status(404).json({ error: 'Artist not found' });

//         res.json({ message: 'Profile updated successfully', artist: updatedArtist });
//     } catch (err) {
//         console.error('Error updating artist:', err);
//         res.status(500).json({ error: 'Error updating artist' });
//     }
// });

// // Delete Artist
// artistRoute.delete('/delete/:id', authenticate, authorise(['artist', 'admin']), async (req, res) => {
//     const { id } = req.params;
//     if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

//     try {
//         const artist = await ArtistModel.findByIdAndDelete(id);
//         if (!artist) return res.status(404).json({ error: 'Artist not found' });

//         res.json({ message: 'Artist deleted successfully' });
//     } catch (err) {
//         console.error('Error deleting artist:', err);
//         res.status(500).json({ error: 'Error deleting artist' });
//     }
// });

// // Get All Artists
// artistRoute.get('/all', async (req, res) => {
//     try {
//         const artists = await ArtistModel.find().select('-password');
//         res.status(200).json({ artists });
//     } catch (err) {
//         console.error('Error fetching artists:', err);
//         res.status(500).json({ error: 'Error fetching artists' });
//     }
// });

// // Get Artist by ID
// artistRoute.get('/:id', async (req, res) => {
//     const { id } = req.params;
//     if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

//     try {
//         const artist = await ArtistModel.findById(id).select('-password');
//         if (!artist) return res.status(404).json({ error: 'Artist not found' });

//         const fullUrl = 'http://10.0.2.2:8000';
//         const profilePictureUrl = artist.profilePictureUrl || `${fullUrl}/uploads/123.jpeg`;

//         res.status(200).json({ name: artist.name, profilePictureUrl });
//     } catch (err) {
//         console.error('Error fetching artist:', err);
//         res.status(500).json({ error: 'Error fetching artist' });
//     }
// });

// // Logout Artist (Token Blacklisting)
// artistRoute.post('/logout', authenticate, async (req, res) => {
//     try {
//         const token = req.headers.authorization;
//         if (!token) return res.status(400).json({ error: 'No active session found' });

//         let blacklistedTokens = [];
//         if (fs.existsSync('./blacklist.json')) {
//             blacklistedTokens = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
//         }
//         blacklistedTokens.push(token);
//         fs.writeFileSync('./blacklist.json', JSON.stringify(blacklistedTokens));

//         res.json({ message: 'Logout successful' });
//     } catch (err) {
//         console.error('Error during logout:', err);
//         res.status(500).json({ error: 'Logout failed' });
//     }
// });

// // Serve uploaded files
// artistRoute.use('/uploads', express.static('uploads'));

// export { artistRoute };
