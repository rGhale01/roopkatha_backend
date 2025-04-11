import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import { ArtistModel } from '../model/Artist.js';
import moment from 'moment';
import ResponseHelper from '../helpers/response_helper.cjs';
import OTPMail from '../mails/otp-mail.cjs';

dotenv.config();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Controller functions
export const register = async (req, res) => {
    const { name, email, password, confirmPassword, DOB, phoneNo, gender } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!name || !email || !password || !DOB || !phoneNo || !gender) {
    }
        

    const profilePictureUrl = req.file 
        ? `http://10.0.2.2:8000/uploads/${req.file.filename}`
        : 'http://10.0.2.2:8000/uploads/123.jpeg';

    try {
        let artist = await ArtistModel.findOne({ email });
        if (artist) {
            if (!artist.isVerified) {
                await ArtistModel.deleteOne({ _id: artist._id });
            } else {
                return ResponseHelper.validationResponse(res, {
                    email: ["Email address already in use!"]
                });
            }
        }

        const otp = Math.floor(Math.random() * 9000) + 1000;
        console.log('Generated OTP:', otp);  // Debug log for OTP
        const hashedPassword = await bcrypt.hash(password, 10); // Use a standard salt rounds value

        // Create the artist object with new fields
        artist = new ArtistModel({
            name,
            email,
            password: hashedPassword,
            profilePictureUrl,
            otp,
            DOB, // Added DOB
            phoneNo, // Added phoneNo
            gender, // Added gender
        });

        await artist.save();
        console.log('Created artist:', artist);  // Debug log for created artist

        // Send OTP via email
        if (artist && artist.email) {
            const otpMail = new OTPMail({
                to: artist.email
            }, {
                otp: artist.otp,  // Ensure otp is passed correctly
                artist
            });
            console.log('OTPMail object:', otpMail);  // Debug log for OTPMail object
            otpMail.send();
        }

        return res.json({ message: 'Artist registered successfully!', artist });
    } catch (err) {
        console.error('Error in register function:', err);  // Debug log for errors
        return res.status(500).json({ ERROR: err.message });
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    console.log('Received OTP verification request:', { email, otp });  // Debug log

    try {
        let artist = await ArtistModel.findOne({ email });
        console.log('Artist found:', artist);  // Debug log

        if (!artist) {
            return ResponseHelper.validationResponse(res, {
                email: ["Not registered!"]
            });
        }

        if (artist.isVerified && artist.otp === null) {
            return ResponseHelper.response403(res, null, "Artist already verified!");
        }

        if (artist.otp === otp) {  // Compare OTP directly as strings
            artist.isVerified = true;
            artist.otp = null;  // Clear the OTP after successful verification
            await artist.save();

            const token = jwt.sign(artist.toObject(), process.env.APP_KEY, { expiresIn: '1h' });
            artist.token = token;

            console.log('Generated JWT token:', token);  // Debug log for JWT token
            console.log('OTP verified successfully:', artist);  // Debug log
            return res.json({ artist });
        } else {
            return ResponseHelper.validationResponse(res, {
                otp: ["OTP invalid!"]
            });
        }
    } catch (err) {
        console.error('Error in verifyOTP function:', err);  // Debug log
        return res.status(500).json({ ERROR: err.message });
    }
};

export const login = async (req, res) => {
    const { identifier, password, fcmToken } = req.body;

    console.log('Login attempt with:', { identifier, password }); // Debug log

    try {
        // Find artist by email or phoneNo using the identifier
        let artist = await ArtistModel.findOne({
            $or: [
                { email: identifier }, // If identifier matches email
                { phoneNo: identifier } // If identifier matches phone number
            ]
        });
        
        if (!artist) {
            return ResponseHelper.validationResponse(res, {
                email: ["No artist found"]
            });
        }

        const isMatch = await bcrypt.compare(password, artist.password);
        if (!isMatch) {
            return ResponseHelper.validationResponse(res, {
                password: ["INVALID credentials"]
            });
        }

        if (!artist.KYCVerified) {
            return res.status(403).json({ error: "KYC verification is pending" });
        }

        artist.lastLoginDate = moment();

        if (fcmToken) {
            artist.fcmToken = fcmToken;
        }

        await artist.save();

        const token = jwt.sign({ _id: artist._id }, process.env.APP_KEY, { expiresIn: '1h' });
        
        console.log('Generated JWT token:', token);  // Debug log for JWT token
        
        return res.status(200).json({
            artist: {
                _id: artist._id,
                name: artist.name,
                email: artist.email,
                profilePictureUrl: artist.profilePictureUrl,
                otp: artist.otp,
                isVerified: artist.isVerified,
                KYCVerified: artist.KYCVerified,
                artistID: artist.artistID,
                DOB: artist.DOB, 
                phoneNo: artist.phoneNo,
                gender: artist.gender,
                createdAt: artist.createdAt,
                updatedAt: artist.updatedAt,
            },
            token: token
        });
    } catch (err) {
        console.error('Error in login function:', err);  // Debug log
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


export const updateProfile = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

    try {
        // Find the artist first to verify they exist
        const artist = await ArtistModel.findById(id);
        if (!artist) return res.status(404).json({ error: 'Artist not found' });

        // Get update data from request body
        const { name, email, phoneNo } = req.body;
        
        // Create update object with only fields that are provided
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phoneNo) updateData.phoneNo = phoneNo;

        // Handle profile picture if file is uploaded
        if (req.file) {
            // Use 10.0.2.2 for Android emulator access
            updateData.profilePictureUrl = `http://10.0.2.2:8000/uploads/${req.file.filename}`;
            console.log('New profile picture URL:', updateData.profilePictureUrl);
        }

        // Update the artist in database
        const updatedArtist = await ArtistModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true } // Return updated document
        );

        // Return success response with updated artist data
        return res.status(200).json({ 
            message: 'Profile updated successfully', 
            artist: {
                _id: updatedArtist._id,
                name: updatedArtist.name,
                email: updatedArtist.email,
                phoneNo: updatedArtist.phoneNo,
                profilePictureUrl: updatedArtist.profilePictureUrl,
                DOB: updatedArtist.DOB,
                gender: updatedArtist.gender
                // Add any other fields you want to return
            }
        });
    } catch (err) {
        console.error('Error updating artist:', err);
        return res.status(500).json({ error: 'Error updating artist profile' });
    }
};

// Add this new function to your artistAuthController.js
export const updateBio = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

    const { bio } = req.body;
    if (bio === undefined) {
        return res.status(400).json({ error: "Bio content is required" });
    }

    try {
        const updatedArtist = await ArtistModel.findByIdAndUpdate(
            id, 
            { bio }, 
            { new: true }
        );

        if (!updatedArtist) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        return res.status(200).json({ 
            message: 'Bio updated successfully', 
            artist: {
                _id: updatedArtist._id,
                bio: updatedArtist.bio
            }
        });
    } catch (err) {
        console.error('Error updating artist bio:', err);
        return res.status(500).json({ error: 'Error updating artist bio' });
    }
};

export const deleteArtist = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

    try {
        const artist = await ArtistModel.findByIdAndDelete(id);
        if (!artist) return res.status(404).json({ error: 'Artist not found' });

        return res.json({ message: 'Artist deleted successfully' });
    } catch (err) {
        console.error('Error deleting artist:', err);
        return res.status(500).json({ error: 'Error deleting artist' });
    }
};

export const getAllArtists = async (req, res) => {
    try {
        const artists = await ArtistModel.find().select('-password');
        return res.status(200).json({ artists });
    } catch (err) {
        console.error('Error fetching artists:', err);
        return res.status(500).json({ error: 'Error fetching artists' });
    }
};

export const getArtistById = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

    try {
        const artist = await ArtistModel.findById(id).select('-password');
        if (!artist) return res.status(404).json({ error: 'Artist not found' });

        const fullUrl = 'http://10.0.2.2:8000';
        const profilePictureUrl = artist.profilePictureUrl || `${fullUrl}/uploads/123.jpeg`;

        return res.status(200).json({ name: artist.name, profilePictureUrl });
    } catch (err) {
        console.error('Error fetching artist:', err);
        return res.status(500).json({ error: 'Error fetching artist' });
    }
};

export const logout = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Extract token
      console.log('Received token for logout:', token); // Debug statement
      if (!token) return res.status(400).json({ error: 'No active session found' });
  
      // Verify the token
      jwt.verify(token, process.env.APP_KEY, (err, decoded) => {
        if (err) {
          console.log('Token verification error:', err); // Debug statement
          return res.status(401).json({ error: 'Invalid token' });
        }
  
        // Token is valid, proceed with logout logic
        let blacklistedTokens = [];
        if (fs.existsSync('./blacklist.json')) {
          try {
            blacklistedTokens = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
          } catch (readErr) {
            console.error('Error reading blacklist file:', readErr); // Debug statement
            return res.status(500).json({ error: 'Internal server error' });
          }
        }
  
        blacklistedTokens.push(token);
        try {
          fs.writeFileSync('./blacklist.json', JSON.stringify(blacklistedTokens));
        } catch (writeErr) {
          console.error('Error writing to blacklist file:', writeErr); // Debug statement
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        return res.json({ message: 'Logout successful' });
      });
    } catch (err) {
      console.error('Error during logout:', err); // Debug statement
      return res.status(500).json({ error: 'Logout failed' });
    }
  };


export const uploadKYC = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

    // Check if files were uploaded successfully
    if (!req.files || !req.files.citizenship || !req.files.pan) {
        return res.status(400).json({ error: "Both Citizenship and PAN documents are required" });
    }

    const updateData = {};
    
    // Use 10.0.2.2 instead of localhost for the URLs when accessing from Android emulator
    if (req.files.citizenship) {
        updateData.citizenshipFilePath = `http://10.0.2.2:8000/uploads/${req.files.citizenship[0].filename}`;
    }
    
    if (req.files.pan) {
        updateData.panFilePath = `http://10.0.2.2:8000/uploads/${req.files.pan[0].filename}`;
    }

    try {
        const updatedArtist = await ArtistModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedArtist) return res.status(404).json({ error: 'Artist not found' });

        return res.json({ 
            message: 'KYC documents uploaded successfully', 
            artist: updatedArtist 
        });
    } catch (err) {
        console.error('Error uploading KYC documents:', err);
        return res.status(500).json({ error: 'Error uploading KYC documents' });
    }
};

export const getUnverifiedArtists = async (req, res) => {
    try {
        const artists = await ArtistModel.find({ KYCVerified: false }).select('name email citizenshipFilePath panFilePath');
        return res.status(200).json({ artists });
    } catch (err) {
        console.error('Error fetching unverified artists:', err);
        return res.status(500).json({ error: 'Error fetching unverified artists' });
    }
};

export const getVerifyArtistById = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

    try {
        const artist = await ArtistModel.findById(id).select('-password');
        if (!artist) return res.status(404).json({ error: 'Artist not found' });

        const fullUrl = 'http://10.0.2.2:8000';
        const profilePictureUrl = artist.profilePictureUrl || `${fullUrl}/uploads/123.jpeg`;

        return res.status(200).json({
            name: artist.name,
            profilePictureUrl,
            citizenshipFilePath: artist.citizenshipFilePath,
            panFilePath: artist.panFilePath
        });
    } catch (err) {
        console.error('Error fetching artist:', err);
        return res.status(500).json({ error: 'Error fetching artist' });
    }
};

export const verifyArtist = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Artist ID" });

    try {
        const artist = await ArtistModel.findById(id);
        if (!artist) return res.status(404).json({ error: 'Artist not found' });

        artist.KYCVerified = true;
        await artist.save();

        return res.json({ message: 'Artist verified successfully', artist });
    } catch (err) {
        console.error('Error verifying artist:', err);
        return res.status(500).json({ error: 'Error verifying artist' });
    }
};

export const getTotalVerifiedArtists = async (req, res) => {
    try {
        const totalVerifiedArtists = await ArtistModel.countDocuments({ KYCVerified: true });
        return res.status(200).json({ totalVerifiedArtists });
    } catch (err) {
        console.error('Error fetching total verified artists:', err);
        return res.status(500).json({ error: 'Error fetching total verified artists' });
    }
};

export const getTotalUnverifiedArtists = async (req, res) => {
    try {
        const totalUnverifiedArtists = await ArtistModel.countDocuments({ KYCVerified: false });
        return res.status(200).json({ totalUnverifiedArtists });
    } catch (err) {
        console.error('Error fetching total unverified artists:', err);
        return res.status(500).json({ error: 'Error fetching total unverified artists' });
    }
};

