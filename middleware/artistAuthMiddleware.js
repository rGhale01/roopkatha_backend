'use strict';

import jwt from 'jsonwebtoken';
import { ArtistModel } from '../model/Artist.js';

/**
 * Authenticate middleware
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function AuthMiddleware(req, res, next) {
    // get the authorization header
    const { authorization } = req.headers;

    // if not available return failure response
    if (!authorization) {
        console.error("No authorization header provided");
        return res.status(401).json({
            "message": "Unauthenticated: No authorization header provided!"
        });
    }

    // check if authorization header contains "Bearer"
    if (!authorization.startsWith('Bearer ')) {
        console.error("Invalid authorization format");
        return res.status(401).json({
            "message": "Unauthenticated: Invalid authorization format!"
        });
    }

    // get token from header
    const token = authorization.split(" ")[1];

    // try decoding the token
    try {
        const userData = await jwt.verify(token, process.env.APP_KEY);
        const user = await ArtistModel.findById(userData.id);

        // if cannot find user return unauthenticated
        if (!user) {
            console.error("User not found for the given token");
            return res.status(401).json({
                "message": "Unauthenticated: User not found!"
            });
        }

        // add user to request
        req.user = user;

        // perform next request
        return next();
    } catch (error) {
        console.error("Invalid token", error);
        // return unauthenticated
        return res.status(401).json({
            "message": "Unauthenticated: Invalid token!"
        });
    }
}

export default AuthMiddleware;