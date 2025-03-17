import jwt from 'jsonwebtoken';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure blacklist.json exists
const blacklistFile = './blacklist.json';
if (!fs.existsSync(blacklistFile)) {
    fs.writeFileSync(blacklistFile, JSON.stringify([])); // Create an empty blacklist.json if missing
}

// Authentication middleware using JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send({ message: 'Please login again' });
    }

    try {
        // Read blacklist.json safely
        let blacklistedData = [];
        try {
            blacklistedData = JSON.parse(fs.readFileSync(blacklistFile, 'utf-8'));
        } catch (error) {
            console.error('Error reading blacklist.json:', error);
            blacklistedData = [];
        }

        // Check if token is blacklisted
        if (blacklistedData.includes(token)) {
            return res.status(401).send({ message: 'Please login again' });
        }

        // FIX: Use the correct JWT_SECRET from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            req.body.userID = decoded.customerID || decoded.artistID;
            next();
        } else {
            return res.status(401).send({ message: "Oops, You're NOT Authorized" });
        }
    } catch (error) {
        console.error('JWT Authentication Error:', error);
        return res.status(401).send({ message: "Invalid Token. Please login again." });
    }
};

export { authenticate };
