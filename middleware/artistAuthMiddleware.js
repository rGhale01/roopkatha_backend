'use strict';

import jwt from 'jsonwebtoken';
import { ArtistModel } from '../model/Artist.js';

/**
 * Authenticate middleware for artists
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function ArtistAuthMiddleware(req, res, next) {
    // Get the authorization header
    const { authorization } = req.headers;

    // If not available, return failure response
    if (!authorization) {
        console.error("No authorization header provided");
        return res.status(401).json({
            "message": "Unauthenticated: No authorization header provided!"
        });
    }

    // Check if authorization header contains "Bearer"
    if (!authorization.startsWith('Bearer ')) {
        console.error("Invalid authorization format");
        return res.status(401).json({
            "message": "Unauthenticated: Invalid authorization format!"
        });
    }

    // Get the token from the header
    const token = authorization.split(" ")[1];

    // Try decoding the token
    try {
        const userData = await jwt.verify(token, process.env.APP_KEY);
        const user = await ArtistModel.findById(userData.id);

        // If user cannot be found, return unauthenticated
        if (!user) {
            console.error("User not found for the given token");
            return res.status(401).json({
                "message": "Unauthenticated: User not found!"
            });
        }

        // Add the user to the request
        req.user = user;

        // Proceed to the next middleware
        return next();
    } catch (error) {
        console.error("Invalid token", error);
        // Return unauthenticated
        return res.status(401).json({
            "message": "Unauthenticated: Invalid token!"
        });
    }
}

export default ArtistAuthMiddleware;