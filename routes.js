import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';

import {
    register as artistRegister,
    verifyOTP as artistVerifyOTP,
    login as artistLogin,
    updateProfile as updateArtistProfile,
    deleteArtist,
    getAllArtists,
    getArtistById,
    uploadKYC, 
    getUnverifiedArtists, 
    verifyArtist,
    getTotalVerifiedArtists,
    getTotalUnverifiedArtists,
    getVerifyArtistById,
    logout as artistLogout,
    updateBio
} from './controllers/artistAuthController.js';

import {
    register as customerRegister,
    verifyOTP as customerVerifyOTP,
    login as customerLogin,
    updateCustomerProfile,
    deleteCustomer,
    getAllCustomers,
    getCustomerById,
    getTotalCustomers,
    logout as customerLogout,
} from './controllers/customerController.js';

import {
    createAvailability,
    getAvailabilityByArtistId,
    getAvailabilityByServiceId,
    updateAvailability,
    deleteAvailability,
    getAllAvailability
} from './controllers/availabilityController.js';

import {
    createService,
    getAllServices,
    getServicesByArtistId,
    getServiceById,
    updateService,
    deleteService
} from './controllers/serviceController.js';

import {
    getAllBookings,
    getAvailableSlots,
    createBooking,
    updateBooking,
    deleteBooking,
    getAllBookingsForArtist,
    getBookingsForCustomer,
    getCanceledBookingsForCustomer
} from './controllers/bookingController.js';

import {
    initializeKhalti,
    completeKhaltiPayment
} from './controllers/paymentController.js';

import RegisterValidator from './validator/register-validator.js';
import LoginValidator from './validator/login-validator.js';
import VerifyOTPValidator from './validator/verify-otp-validator.js';
import KYCValidator from './validator/kycValidator.js';
import CustomerAuthMiddleware from './middleware/customerAuthMiddleware.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    console.log('MIME Type:', file.mimetype); // Keep debugging log
    // Note: image/jpg is not a standard MIME type, but some devices/apps might use it
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        // Return an error that will be properly caught
        return cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
};

// Create upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: fileFilter
});

// Error handling middleware for Multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({ error: err.message });
    } else if (err) {
        // An unknown error occurred when uploading
        return res.status(400).json({ error: err.message });
    }
    // No errors
    next();
};

// Artist routes
router.post('/artist/ArtistRegister', RegisterValidator.middleware, artistRegister);
router.post('/artist/verifyOTP', VerifyOTPValidator.middleware, artistVerifyOTP);
router.post('/artist/ArtistLogin', LoginValidator.middleware, artistLogin);
router.patch('/artist/update/:id', upload.single('profilePicture'), handleMulterError, updateArtistProfile);
router.delete('/artist/delete/:id', deleteArtist);
router.get('/artist/all', getAllArtists);
router.get('/artist/:id', getArtistById);
router.post('/artist/logout', artistLogout);
router.use('/artist/uploads', express.static('uploads'));
router.get('/artists/total-verified', getTotalVerifiedArtists);
router.get('/artists/total-unverified', getTotalUnverifiedArtists);
router.post('/upload-kyc/:id', upload.fields([
    { name: 'citizenship', maxCount: 1 }, 
    { name: 'pan', maxCount: 1 }
]), handleMulterError, KYCValidator.middleware, uploadKYC);
router.get('/unverified', getUnverifiedArtists);
router.put('/verify/:id', verifyArtist);
router.get('/Verify/:id', getVerifyArtistById);
router.patch('/artist/update-bio/:id', updateBio);

// Customer routes
router.post('/customer/CustomerRegister', RegisterValidator.middleware, customerRegister);
router.post('/customer/verifyOTP', VerifyOTPValidator.middleware, customerVerifyOTP);
router.post('/customer/CustomerLogin', LoginValidator.middleware, customerLogin);
router.put('/customer/update/:id', upload.single('profilePicture'), handleMulterError, updateCustomerProfile);
router.delete('/customer/delete/:id', CustomerAuthMiddleware, deleteCustomer);
router.get('/customer/all', CustomerAuthMiddleware, getAllCustomers);
router.get('/customer/:id', CustomerAuthMiddleware, getCustomerById);
router.post('/customer/logout', CustomerAuthMiddleware, customerLogout);
router.get('/customers/total', getTotalCustomers);

// Availability routes
router.post('/availability/create', createAvailability);
router.get('/availability/artist/:artistId', getAvailabilityByArtistId);
router.get('/availability/service/:serviceId', getAvailabilityByServiceId);
router.patch('/availability/update/:id', updateAvailability);
router.delete('/availability/delete/:id', deleteAvailability);
router.get('/availability/all', getAllAvailability);

// Service routes
router.post('/service/create', createService);
router.get('/service/all', getAllServices);
router.get('/service/artist/:artistId', getServicesByArtistId);
router.get('/service/:id', getServiceById);
router.patch('/service/update/:id', updateService);
router.delete('/service/delete/:id', deleteService);

// Booking routes
router.get('/bookings', getAllBookings);
router.get('/bookings/artist/:artistId', getAllBookingsForArtist);
router.get('/bookings/customer/:customerId', getBookingsForCustomer);
router.get('/available-slots', getAvailableSlots);
router.post('/newBooking', createBooking);
router.patch('/update/:id', updateBooking);
router.patch('/bookings/delete/:id', deleteBooking);
router.get('/bookings/customer/:customerId/canceled', getCanceledBookingsForCustomer);

// Payment routes
router.post('/payment/initialize-khalti', initializeKhalti);
router.get('/payment/complete-khalti-payment', completeKhaltiPayment);

export default router;