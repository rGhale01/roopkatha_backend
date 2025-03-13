import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import fs from 'fs';
import dotenv from 'dotenv';
import { ArtistModel } from '../model/Artist.js';
import { authenticate } from '../middleware/auth.js';
import { authorise } from '../authorize.js';

dotenv.config();

const artistRoute = express.Router();
artistRoute.use(express.json());

// to register artist and then hashing password using Bcrypt
artistRoute.post('/register', async (req, res) => {
    const { name, email, password, role, specialization, image, videoCall } = req.body;
    const artistFound = await ArtistModel.findOne({ email });
    if (artistFound) {
        res.status(409).send({ message: 'Artist already registered' });
    } else {
        try {
            let dateFormat = moment().format('D-MM-YYYY');

            bcrypt.hash(password, 5, async function (err, hash) {
                const data = new ArtistModel({ name, email, password: hash, image, registeredDate: dateFormat, role, specialization, videoCall });
                await data.save();
                res.status(201).send({ message: 'Artist Registered' });
            });
        } catch (err) {
            res.status(500).send({ ERROR: err });
        }
    }
});

// to let artist login and then create and send token as response
artistRoute.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let data = await ArtistModel.findOne({ email });
    if (!data) {
        return res.send({ message: 'No artist found' });
    }
    try {
        bcrypt.compare(password, data.password, function (err, result) {
            if (result) {
                var token = jwt.sign({ artistID: data._id }, process.env.key);
                var refreshtoken = jwt.sign({ artistID: data._id }, process.env.key, { expiresIn: 60 * 1000 });
                res.status(201).send({
                    message: 'Validation done',
                    token: token,
                    refresh: refreshtoken,
                    name: data.name,
                    id: data._id
                });
            } else {
                res.status(401).send({ message: 'INVALID credentials' });
            }
        });
    } catch (err) {
        res.status(500).send({ ERROR: err });
    }
});

artistRoute.patch('/update/:id', authorise(['artist', 'admin']), async (req, res) => {
    const ID = req.params.id;
    const payload = req.body;
    try {
        await ArtistModel.findByIdAndUpdate({ _id: ID }, payload);
        res.send({ message: 'Database modified' });
    } catch (err) {
        console.log(err);
        res.send({ message: 'error' });
    }
});

artistRoute.delete('/delete/:id', authorise(['artist', 'admin']), async (req, res) => {
    const ID = req.params.id;

    try {
        await ArtistModel.findByIdAndDelete({ _id: ID });
        res.send({ message: 'Particular data has been deleted' });
    } catch (err) {
        console.log(err);
        res.send({ message: 'error' });
    }
});

artistRoute.get('/all', async (req, res) => {
    try {
        let data = await ArtistModel.find();
        res.status(200).send({ Artists: data });
    } catch (err) {
        res.status(500).send({ ERROR: err });
    }
});

artistRoute.get('/getartist/:id', async (req, res) => {
    const id = req.params.id;
    try {
        let data = await ArtistModel.findOne({ _id: id });
        res.status(200).send({ Artist: data });
    } catch (err) {
        res.status(500).send({ ERROR: err });
    }
});

artistRoute.use(authenticate);

artistRoute.post('/logout', async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const blacklistedData = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
        blacklistedData.push(token);

        fs.writeFileSync('./blacklist.json', JSON.stringify(blacklistedData));
        res.send({ message: 'Logout done successfully' });
    } else {
        res.send({ message: 'Please login' });
    }
});

export { artistRoute };