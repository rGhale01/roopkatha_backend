import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        let customer = await CustomerModel.findOne({ email });
        if (customer) {
            if (!customer.isVerified) {
                await CustomerModel.deleteOne({ _id: customer._id });
            } else {
                return ResponseHelper.validationResponse(res, {
                    email: ["Email address already in use!"]
                });
            }
        }

        const otp = Math.floor(Math.random() * 9000) + 1000;
        console.log('Generated OTP:', otp);  // Debug log for OTP
        const hashedPassword = await bcrypt.hash(password, 10); // Use a standard salt rounds value

        // Create the customer object with otp field
        customer = new CustomerModel({
            name,
            email,
            password: hashedPassword,
            otp
        });

        await customer.save();
        console.log('Created customer:', customer);  // Debug log for created customer

        // Send OTP via email
        if (customer && customer.email) {
            const otpMail = new OTPMail({
                to: customer.email
            }, {
                otp: customer.otp,  // Ensure otp is passed correctly
                customer
            });
            console.log('OTPMail object:', otpMail);  // Debug log for OTPMail object
            otpMail.send();
        }

        return res.json({ message: 'Customer registered successfully!', customer });
    } catch (err) {
        console.error('Error in register function:', err);  // Debug log for errors
        return res.status(500).json({ ERROR: err.message });
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
    const { email, password, fcmToken } = req.body;

    try {
        let customer = await CustomerModel.findOne({ email });
        if (!customer) return ResponseHelper.validationResponse(res, {
            email: ["No customer found"]
        });

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) return ResponseHelper.validationResponse(res, {
            password: ["INVALID credentials"]
        });

        customer.lastLoginDate = moment();

        if (fcmToken) {
            customer.fcmToken = fcmToken;
        }

        await customer.save();

        const token = jwt.sign({ _id: customer._id }, process.env.APP_KEY, { expiresIn: '1h' });
        
        console.log('Generated JWT token:', token);  // Debug log for JWT token
        
        return res.status(200).json({
            customer: {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                role: customer.role,
                otp: customer.otp,
                isVerified: customer.isVerified,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
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
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid Customer ID" });

    const updateData = req.body;

    try {
        const updatedCustomer = await CustomerModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedCustomer) return res.status(404).json({ error: 'Customer not found' });

        return res.json({ message: 'Profile updated successfully', customer: updatedCustomer });
    } catch (err) {
        console.error('Error updating customer:', err);
        return res.status(500).json({ error: 'Error updating customer' });
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