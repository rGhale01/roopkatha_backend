import express from 'express';
import {
    register as artistRegister,
    verifyOTP as artistVerifyOTP,
    login as artistLogin,
    updateProfile as updateArtistProfile,
    deleteArtist,
    getAllArtists,
    getArtistById,
    uploadKYC, getUnverifiedArtists, verifyArtist,getVerifyArtistById,
    logout as artistLogout
} from './controllers/artistAuthController.js'; // Import the artist controller functions

import {
    register as customerRegister,
    verifyOTP as customerVerifyOTP,
    login as customerLogin,
    updateProfile as updateCustomerProfile,
    deleteCustomer,
    getAllCustomers,
    getCustomerById,
    logout as customerLogout
} from './controllers/customerController.js'; // Import the customer controller functions

import RegisterValidator from './validator/register-validator.js';
import LoginValidator from './validator/login-validator.js';
import VerifyOTPValidator from './validator/verify-otp-validator.js';
import KYCValidator from './validator/kycValidator.js';
import CustomerAuthMiddleware from './middleware/customerAuthMiddleware.js'; // Import the CustomerAuthMiddleware
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Define artist routes and apply validators
router.post('/artist/ArtistRegister', RegisterValidator.middleware, artistRegister);
router.post('/artist/verifyOTP', VerifyOTPValidator.middleware, artistVerifyOTP);
router.post('/artist/ArtistLogin', LoginValidator.middleware, artistLogin);
router.patch('/artist/update/:id', updateArtistProfile);
router.delete('/artist/delete/:id', deleteArtist);
router.get('/artist/all', getAllArtists);
router.get('/artist/:id', getArtistById);
router.post('/artist/logout', artistLogout);
router.use('/artist/uploads', express.static('uploads'));

// Configure multer for file uploads
router.post('/upload-kyc/:id', upload.fields([{ name: 'citizenship', maxCount: 1 }, { name: 'pan', maxCount: 1 }]),  KYCValidator.middleware, uploadKYC);

// Get unverified artists route (test this)
router.get('/unverified', getUnverifiedArtists);

// Verify artist route (test this)
router.put('/verify/:id', verifyArtist);

// test this route
router.get('/Verify/:id', getVerifyArtistById);


// Define customer routes and apply validators
router.post('/customer/CustomerRegister', RegisterValidator.middleware, customerRegister);
router.post('/customer/verifyOTP', VerifyOTPValidator.middleware, customerVerifyOTP);
router.post('/customer/CustomerLogin', LoginValidator.middleware, customerLogin);
router.patch('/customer/update/:id', CustomerAuthMiddleware, updateCustomerProfile);
router.delete('/customer/delete/:id', CustomerAuthMiddleware, deleteCustomer);
router.get('/customer/all', CustomerAuthMiddleware, getAllCustomers);
router.get('/customer/:id', CustomerAuthMiddleware, getCustomerById);
router.post('/customer/logout', CustomerAuthMiddleware, customerLogout);

export default router;