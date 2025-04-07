// import express from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import fs from 'fs';
// import dotenv from 'dotenv';
// import { CustomerModel } from '../model/Customer.js';
// import { authorise } from '../authorize.js';

// dotenv.config();

// const customerRoute = express.Router();
// customerRoute.use(express.json());

// // to register customer and then hashing password using Bcrypt
// customerRoute.post('/register', async (req, res) => {
//     const { name, email, password, role } = req.body;
//     const customerFound = await CustomerModel.findOne({ email });
//     if (customerFound) {
//         res.status(409).send({ message: 'Already customer registered' });
//     } else {
//         try {
//             bcrypt.hash(password, 5, async function (err, hash) {
//                 if (err) {
//                     res.status(500).send({ ERROR: err });
//                 } else {
//                     const data = new CustomerModel({ name, email, password: hash, role });
//                     await data.save();
//                     res.status(201).send({ message: 'Customer Registered' });
//                 }
//             });
//         } catch (err) {
//             res.status(500).send({ ERROR: err });
//         }
//     }
// });

// // to let customer login and then create and send token as response
// customerRoute.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     let data = await CustomerModel.findOne({ email });
//     if (!data) {
//         return res.status(401).send({ message: 'No user found' });
//     }
//     try {
//         bcrypt.compare(password, data.password, function (err, result) {
//             if (result) {
//                 var token = jwt.sign({ customerID: data._id }, process.env.JWT_SECRET);
//                 var refreshtoken = jwt.sign({ customerID: data._id }, process.env.JWT_SECRET, { expiresIn: 60 * 1000 });
//                 res.status(200).send({
//                     message: 'Validation done',
//                     token: token,
//                     refresh: refreshtoken,
//                     name: data.name,
//                     id: data._id
//                 });
//             } else {
//                 res.status(401).send({ message: 'INVALID credentials' });
//             }
//         });
//     } catch (err) {
//         res.status(500).send({ ERROR: err });
//     }
// });

// customerRoute.get('/name/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const customer = await CustomerModel.findById(id);
//         if (!customer) {
//             return res.status(404).send({ message: 'Customer not found' });
//         }
//         res.status(200).send({ name: customer.name });
//     } catch (err) {
//         res.status(500).send({ error: err });
//     }
// });

// // implementation of Role based authorization - either Customer or Admin can only modify changes in their information
// customerRoute.patch('/update/:id', authorise(['customer', 'admin']), async (req, res) => {
//     const ID = req.params.id;
//     const payload = req.body;
//     try {
//         await CustomerModel.findByIdAndUpdate({ _id: ID }, payload);
//         res.send({ message: 'Database modified' });
//     } catch (err) {
//         console.log(err);
//         res.send({ message: 'error' });
//     }
// });

// // implementation of Role based authorization - either Customer or Admin can only modify changes in their information
// customerRoute.delete('/delete/:id', authorise(['customer', 'admin']), async (req, res) => {
//     const ID = req.params.id;
//     try {
//         await CustomerModel.findByIdAndDelete({ _id: ID });
//         res.send({ message: 'Particular data has been deleted' });
//     } catch (err) {
//         console.log(err);
//         res.send({ message: 'error' });
//     }
// });

// customerRoute.get('/all', async (req, res) => {
//     try {
//         let data = await CustomerModel.find();
//         res.status(200).send({ Customers: data });
//     } catch (err) {
//         res.status(500).send({ ERROR: err });
//     }
// });

// customerRoute.post('/logout', async (req, res) => {
//     const token = req.headers.authorization;
//     if (token) {
//         const blacklistedData = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
//         blacklistedData.push(token);

//         fs.writeFileSync('./blacklist.json', JSON.stringify(blacklistedData));
//         res.send({ message: 'Logout done successfully' });
//     } else {
//         res.send({ message: 'Please login' });
//     }
// });

// export { customerRoute };