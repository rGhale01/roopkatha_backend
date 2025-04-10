import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'node:fs';  // Using node: prefix for built-in modules
import mongoose from 'mongoose';
import { CustomerModel } from '../model/Customer.js';
import moment from 'moment';
import ResponseHelper from '../helpers/response_helper.cjs';
import OTPMail from '../mails/otp-mail.cjs';

dotenv.config();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Controller functions
export const register = async (req, res) => {
    const { name, email, password, confirmPassword, phoneNo, DOB, gender } = req.body;

    // Log incoming request body for debugging
    console.log('Incoming request body:', req.body);

    const profilePictureUrl = req.file 
        ? `http://10.0.2.2:8000/uploads/${req.file.filename}`
        : 'http://10.0.2.2:8000/uploads/cusPP.png';


    try {
        let customer = await CustomerModel.findOne({ email });
        if (customer) {
            if (!customer.isVerified) {
                // Update unverified customer instead of deleting
                customer.name = name;
                customer.password = await bcrypt.hash(password, 10);
                customer.phoneNo = phoneNo;
                customer.DOB = DOB;
                customer.gender = gender;
                customer.otp = Math.floor(Math.random() * 9000) + 1000;
                await customer.save();
            } else {
                return res.status(400).json({ error: 'Email address already in use!' });
            }
        } else {
            const otp = Math.floor(Math.random() * 9000) + 1000;
            const hashedPassword = await bcrypt.hash(password, 10);

            customer = new CustomerModel({
                name,
                email,
                password: hashedPassword,
                profilePictureUrl,
                otp,
                phoneNo,
                DOB,
                gender,
            });

            await customer.save();
        }

        // Send OTP via email
        if (customer && customer.email) {
            const otpMail = new OTPMail(
                { to: customer.email },
                { otp: customer.otp, customer }
            );
            otpMail.send();
        }

        return res.status(201).json({ message: 'Customer registered successfully!', customer });
    } catch (err) {
        console.error('Error in register function:', err);
        return res.status(500).json({ error: err.message });
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    console.log('Received OTP verification request:', { email, otp });  // Debug log

    try {
        let customer = await CustomerModel.findOne({ email });
        console.log('Customer found:', customer);  // Debug log

        if (!customer) {
            return ResponseHelper.validationResponse(res, {
                email: ["Not registered!"]
            });
        }

        if (customer.isVerified && customer.otp === null) {
            return ResponseHelper.response403(res, null, "Customer already verified!");
        }

        if (customer.otp === otp) {  // Compare OTP directly as strings
            customer.isVerified = true;
            customer.otp = null;  // Clear the OTP after successful verification
            await customer.save();

            const token = jwt.sign(customer.toObject(), process.env.APP_KEY, { expiresIn: '1h' });
            customer.token = token;

            console.log('Generated JWT token:', token);  // Debug log for JWT token
            console.log('OTP verified successfully:', customer);  // Debug log
            return res.json({ customer });
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

    try {
        // Find customer by email or phoneNo using the identifier
        let customer = await CustomerModel.findOne({
            $or: [
                { email: identifier }, // If identifier matches email
                { phoneNo: identifier } // If identifier matches phone number
            ]
        });

        // If no customer is found, return a validation response
        if (!customer) {
            return ResponseHelper.validationResponse(res, {
                identifier: ["No customer found with the provided email or phone number."]
            });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return ResponseHelper.validationResponse(res, {
                password: ["Invalid credentials."]
            });
        }

        // Update last login date and FCM token if provided
        customer.lastLoginDate = moment();

        if (fcmToken) {
            customer.fcmToken = fcmToken;
        }

        await customer.save();

        // Generate JWT token
        const token = jwt.sign({ id: customer._id }, process.env.APP_KEY, { expiresIn: '1h' });

        console.log('Generated JWT token:', token); // Debug log for JWT token

        // Return customer details and the generated token
        return res.status(200).json({
            customer: {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phoneNo: customer.phoneNo,
                profilePictureUrl: customer.profilePictureUrl,
                role: customer.role,
                otp: customer.otp,
                isVerified: customer.isVerified,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
            },
            token: token
        });
    } catch (err) {
        console.error('Error in login function:', err); // Debug log
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update customer profile - Improved file handling
export const updateCustomerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId first
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid Customer ID" });
        }
        
        console.log('Update Profile Request Body:', req.body);
        
        // Define allowed updates
        const allowedUpdates = ['name', 'email', 'phoneNo'];
        const updates = Object.keys(req.body);
        
        // Validate updates
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }
        
        // Find customer
        const customer = await CustomerModel.findById(id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        // Apply text field updates
        updates.forEach((update) => {
            customer[update] = req.body[update];
        });
        
        // Handle file upload if present
        if (req.file) {
            console.log('Uploaded File:', req.file);
            // Construct the URL with the proper filename
            const profilePictureUrl = `http://10.0.2.2:8000/uploads/${req.file.filename}`;
            customer.profilePictureUrl = profilePictureUrl;
            
            // Delete old profile picture if it exists and isn't the default
            // (You'd need to extract the old filename and check if it exists)
            // This is optional but helps manage disk space
        }
        
        // Save customer with updates
        await customer.save();
        
        res.status(200).json({
            message: 'Profile updated successfully',
            customer,
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: err.message || 'Failed to update profile' });
    }
};

export const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Customer ID" });

    try {
        const customer = await CustomerModel.findByIdAndDelete(id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        return res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        console.error('Error deleting customer:', err);
        return res.status(500).json({ error: 'Error deleting customer' });
    }
};

// This function can now be removed as it's redundant with updateCustomerProfile
// export const uploadProfilePicture = async (req, res) => {...};

export const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerModel.find().select('-password');
        return res.status(200).json({ customers });
    } catch (err) {
        console.error('Error fetching customers:', err);
        return res.status(500).json({ error: 'Error fetching customers' });
    }
};

export const getCustomerById = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Customer ID" });

    try {
        const customer = await CustomerModel.findById(id).select('-password');
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        return res.status(200).json({ name: customer.name, email: customer.email, role: customer.role });
    } catch (err) {
        console.error('Error fetching customer:', err);
        return res.status(500).json({ error: 'Error fetching customer' });
    }
};

export const getCustomerDetails = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Customer ID" });

    try {
        const customer = await CustomerModel.findById(id).select('name phoneNo');
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        return res.status(200).json({ name: customer.name, phoneNo: customer.phoneNo });
    } catch (err) {
        console.error('Error fetching customer details:', err);
        return res.status(500).json({ error: 'Error fetching customer details' });
    }
};

export const getTotalCustomers = async (req, res) => {
    try {
        const totalCustomers = await CustomerModel.countDocuments();
        return res.status(200).json({ totalCustomers });
    } catch (err) {
        console.error('Error fetching total customers:', err);
        return res.status(500).json({ error: 'Error fetching total customers' });
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