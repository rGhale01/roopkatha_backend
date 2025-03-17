import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import { ArtistModel } from '../model/Artist.js';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../authorize.js';

dotenv.config();

const artistRoute = express.Router();
artistRoute.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Register artist with profile picture upload
artistRoute.post('/ArtistRegister', upload.single('profilePicture'), async (req, res) => {
    const { name, email, password, role, specialization } = req.body;
    const profilePictureUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const artist = await ArtistModel.findOne({ email });
    if (artist) {
        res.status(409).send({ message: 'Already Artist registered' });
    } else {
        try {
            bcrypt.hash(password, 5, async function (err, hash) {
                if (err) {
                    res.status(500).send({ ERROR: err });
                } else {
                    const data = new ArtistModel({ name, email, password: hash, role, specialization, profilePictureUrl });
                    await data.save();
                    res.status(201).send({ message: 'Artist Registered' });
                }
            });
        } catch (err) {
            res.status(500).send({ ERROR: err });
        }
    }
});

// Artist Login
artistRoute.post('/ArtistLogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const artist = await ArtistModel.findOne({ email });

        if (!artist) {
            return res.status(401).json({ message: 'No artist found' });
        }

        bcrypt.compare(password, artist.password, (err, result) => {
            if (result) {
                const token = jwt.sign({ artistID: artist._id }, process.env.JWT_SECRET);
                const refreshToken = jwt.sign({ artistID: artist._id }, process.env.JWT_SECRET, { expiresIn: 60 * 1000 });

                res.status(200).json({
                    message: 'Validation done',
                    token,
                    refresh: refreshToken,
                    name: artist.name,
                    id: artist._id
                });
            } else {
                res.status(401).json({ message: 'INVALID credentials' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update artist profile with profile picture upload
artistRoute.patch('/update/:id', authenticate, authorise(['artist', 'admin']), upload.single('profilePicture'), async (req, res) => {
    const updateData = req.body;
    if (req.file) {
        updateData.profilePictureUrl = `/uploads/${req.file.filename}`;
    }
    try {
        const updatedArtist = await ArtistModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedArtist) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        res.json({ message: 'Profile updated successfully', artist: updatedArtist });
    } catch (err) {
        console.error('Error updating artist:', err);
        res.status(500).json({ error: 'Error updating artist' });
    }
});

// Delete Artist
artistRoute.delete('/delete/:id', authenticate, authorise(['artist', 'admin']), async (req, res) => {
    try {
        const artist = await ArtistModel.findByIdAndDelete(req.params.id);
        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        res.json({ message: 'Artist deleted successfully' });
    } catch (err) {
        console.error('Error deleting artist:', err);
        res.status(500).json({ error: 'Error deleting artist' });
    }
});

// Get All Artists
artistRoute.get('/all', async (req, res) => {
    try {
        const artists = await ArtistModel.find().select('-password');
        res.status(200).json({ artists });
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.status(500).json({ error: 'Error fetching artists' });
    }
});

// Get Artist by ID
artistRoute.get('/artists/:id', async (req, res) => {
    try {
        const artist = await ArtistModel.findById(req.params.id).select('-password');
        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        // Use the Android emulator's loopback address
        const fullUrl = 'http://10.0.2.2:8000';
        const profilePictureUrl = artist.profilePictureUrl ? fullUrl + artist.profilePictureUrl : null;

        // Log the profile picture URL
        console.log('Profile Picture URL:', profilePictureUrl);

        res.status(200).json({
            name: artist.name,
            profilePictureUrl: profilePictureUrl,  // Return the full profile picture URL
            specialization: artist.specialization 
        });
    } catch (err) {
        console.error('Error fetching artist:', err);
        res.status(500).json({ error: 'Error fetching artist' });
    }
});

// Logout Artist (Token Blacklisting)
artistRoute.post('/logout', authenticate, async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(400).json({ error: 'No active session found' });
        }

        let blacklistedTokens = [];
        if (fs.existsSync('./blacklist.json')) {
            blacklistedTokens = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
        }
        blacklistedTokens.push(token);
        fs.writeFileSync('./blacklist.json', JSON.stringify(blacklistedTokens));

        res.json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Serve uploaded files
artistRoute.use('/uploads', express.static('uploads'));

export { artistRoute };