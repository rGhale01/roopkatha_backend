import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { customerRoute } from './routes/customerRoutes.js';
import { artistRoute } from './routes/artistRoutes.js';
import { bookingRoute } from './routes/bookingRoutes.js';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL;

mongoose.connect(MONGOURL).then(() => {
    console.log('Db connected');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    app.get('/', (req, res) => {
        res.send('this is home page');
    });
}).catch((error) => console.log(error));

// redirect routes
app.use('/customers', customerRoute);
app.use('/', artistRoute); // Instead of '/artists'
app.use('/bookings', bookingRoute);



// fetch artist by category
// app.get('/category' , async (req, res)=>{
//   const {category} = req.params;

//   try{
//     if(!category)
//       {
//         return res.status(400).json({msg: ' pelase fill all the fielsds'});
        
//       }
//     const artist = await artist.find({service:category});
    
//     if(artist.length ===0){
//       return res.status(400).json({msg: 'NO artist found in this categoty'});

//     } 
//     res.status(200).json({msg: artist});
//   }
//   catch(err){
//     res.status(500).json({msg: 'Server Error'});
//   }

// });


// booking route

// app.post('/bookAppointment', async (req, res)=>{
//   const {name} = req.body;

//   try {
//       if(!name){
//         return res.status(400).json({msg: 'Please fill all'});

//       }

//     const newBooking = new Booking({
//       cname,
//       ArtistName,
//       Service,
//       phone,
//       cId,
//       artistId,
//       status: "booked",
      
//     });
    
//     await newBooking.save();

//     res.status(200).json({msg: 'Success', Booking: newBooking});


//   }
//   catch(err){
//     res.status(400).json({msf: 'Server error' });
//   }

// });

//fetch by customer name
// app.get('/appointment:cID', async (req, res)=>{
//   const {cID} = req.params;

//   try {
//       if(!cID){
//         return res.status(400).json({msg: 'Please fill all'});

//       }

//     const bookings = await booking.find({cID, status: 'Booked'});

//     if (bookings.length ===0 ){
//       return res.status(400).json({msg: 'No Bookings Yet'});

//     }
//     res.status(200).json({msg: bookings});

//   }
//   catch(err){
//     res.status(400).json({msf: 'Server error' });
//   }

// });


//fetch by Artist name and ststus booked
// app.get('/appointment:artistId', async (req, res)=>{
//   const {artistId} = req.params;

//   try {
//       if(!artistId){
//         return res.status(400).json({msg: 'Please fill all'});

//       }

//     const bookings = await booking.find({artistId, status: 'Booked'});

//     if (bookings.length ===0 ){
//       return res.status(400).json({msg: 'No Bookings Yet'});

//     }
//     res.status(200).json({msg: bookings});

//   }
//   catch(err){
//     res.status(400).json({msf: 'Server error' });
//   }

// });

// update appointment to done
// app.put('/bookingStatus/_id', async(req, res)=>{

//   const {_id} = req.params;

//   try{
//       if(!_id)
//         {
//           return res.status(400).json({msg: 'Please fill all onorm'});
//         }
//       const bookings = await booking.findbyId(_id);
      
//       if (!bookings){
//         return res.status(400).json({msg:'Appoitnmeny not foiund'});
//       }

//       bookings.status = 'done';
//       await bookings.save();

//       res.status(200).json({msg: 'Success', updatedBooking:bookings});

//     }
//     catch(err){
//       res.status(500).json({msg: 'server error'});
//     }
// });








