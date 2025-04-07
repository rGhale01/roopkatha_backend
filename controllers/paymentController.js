import ServiceModel from '../model/Service.js';
import BookingModel from '../model/Booking.js';
import PaymentModel from '../model/paymentModel.js';
import { initializeKhaltiPayment, verifyKhaltiPayment } from '../khalti.js';
import axios from 'axios';

// Controller functions

export const initializeKhalti = async (req, res) => {
    try {
        const { customerID, artistID, serviceID, availabilityID, totalPrice, website_url } = req.body;

        // Log the incoming data for debugging
        console.log("Received data:", { customerID, artistID, serviceID, availabilityID, totalPrice, website_url });

        // Check if all required fields are present
        if (!customerID || !artistID || !serviceID || !availabilityID || !totalPrice || !website_url) {
            return res.status(400).send({
                success: false,
                message: "Missing required fields",
            });
        }

        // Fetching service data
        const serviceData = await ServiceModel.findOne({
            _id: serviceID,
            price: Number(totalPrice),
        });

        // Check if service data is found
        if (!serviceData) {
            console.log("Service not found for ID:", serviceID);
            return res.status(400).send({
                success: false,
                message: "Service not found",
            });
        }

        // Log service data for debugging
        console.log("Service Data:", serviceData);

        // Creating a booking document to store booking info
        const bookingData = await BookingModel.create({
            customerID: customerID,
            artistID: artistID,
            serviceID: serviceID,
            availabilityID: availabilityID,
            paymentMethod: "Khalti",
            price: totalPrice * 100, // Converting to paisa (multiplying by 100)
        });

        // Initiating payment with Khalti
        const paymentInitiate = await initializeKhaltiPayment({
            amount: totalPrice * 100, // Amount should be in paisa (Rs * 100)
            purchase_order_id: bookingData._id, // purchase_order_id to verify later
            purchase_order_name: serviceData.name,
            return_url: `${process.env.BACKEND_URI}/api/payment/complete-khalti-payment`, // Updated return_url path
            website_url,
        });

        res.json({
            success: true,
            bookingID: bookingData._id,
            payment: paymentInitiate,
        });
    } catch (error) {
        console.error("Error during Khalti payment initialization:", error.message || error);
        res.status(500).json({
            success: false,
            error: error.message || error,
        });
    }
};

export const completeKhaltiPayment = async (req, res) => {
    try {
        const {
            pidx,
            txnId,
            amount,
            mobile,
            purchase_order_id,
            purchase_order_name,
            transaction_id,
        } = req.query;

        // Step 1: Verify payment from Khalti
        const url = "https://a.khalti.com/api/v2/epayment/lookup/";
        const payload = { pidx: pidx };
        const khaltiResponse = await axios.post(url, payload, {
            headers: {
                Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            },
        });

        const paymentInfo = khaltiResponse.data;
        console.log("Khalti Payment Info:", paymentInfo);

        // Step 2: Validate the payment status
        if (paymentInfo.status !== "Completed") {
            console.log("Payment not completed yet");
            return res.status(400).json({
                success: false,
                message: "Payment is not completed",
            });
        }

        // Step 3: Fetch the booking data
        const bookingData = await BookingModel.findOne({
            _id: purchase_order_id,
            price: amount, // Verify the amount too (optional but recommended)
        });

        if (!bookingData) {
            console.log("Booking not found for ID:", purchase_order_id);
            return res.status(400).json({
                success: false,
                message: "Booking not found",
            });
        }

        const { availabilityID, customerID, artistID } = bookingData; // 🛑 Correctly get from bookingData

        // Step 4: Update the booking status
        await BookingModel.findByIdAndUpdate(purchase_order_id, {
            $set: {
                bookingStatus: "Completed",
                paymentStatus: "Completed",
            },
        });

        // Step 5: Create a payment record
        const paymentData = await PaymentModel.create({
            pidx,
            transactionId: transaction_id,
            bookingID: purchase_order_id,
            availabilityID: availabilityID,
            customerID: customerID,
            artistID: artistID,
            amount,
            dataFromVerificationReq: paymentInfo,
            apiQueryFromUser: req.query,
            paymentGateway: "Khalti",
            status: "success",
        });

        console.log("Payment and booking updated successfully.");

        return res.status(200).json({
            success: true,
            message: "Payment completed successfully",
            paymentData,
        });

    } catch (error) {
        console.error("Error completing Khalti payment:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred",
            error: error.message || error,
        });
    }
};