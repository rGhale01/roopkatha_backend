import express from 'express';
import ServiceModel from '../model/Service.js';
import BookingModel from '../model/Booking.js';
import PaymentModel from '../model/paymentModel.js';
import { initializeKhaltiPayment, verifyKhaltiPayment } from '../khalti.js'; // Adjust this import as needed

const paymentRoute = express.Router(); // This defines the route

// Initialize Khalti payment route
paymentRoute.post("/initialize-khalti", async (req, res) => {
  try {
    const { serviceID, totalPrice, website_url } = req.body;

    // Log the incoming data for debugging
    console.log("Received data:", { serviceID, totalPrice, website_url });

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
      serviceID: serviceID,
      paymentMethod: "Khalti",
      price: totalPrice * 100, // Converting to paisa (multiplying by 100)
    });

    // Initiating payment with Khalti
    const paymentInitiate = await initializeKhaltiPayment({
      amount: totalPrice * 100, // Amount should be in paisa (Rs * 100)
      purchase_order_id: bookingData._id, // purchase_order_id to verify later
      purchase_order_name: serviceData.name,
      return_url: `${process.env.BACKEND_URI}/payment/complete-khalti-payment`, // Updated return_url path
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
});

// Route to verify and complete Khalti payment
paymentRoute.get("/complete-khalti-payment", async (req, res) => {
  const { pidx, txnId, amount, mobile, purchase_order_id, purchase_order_name, transaction_id } = req.query;

  try {
    console.log("Received payment verification data:", req.query);

    const paymentInfo = await verifyKhaltiPayment(pidx);

    // Validate the payment information
    if (
      paymentInfo?.status !== "Completed" ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      console.log("Payment verification failed:", paymentInfo);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Incomplete or mismatched information.",
        paymentInfo,
      });
    }

    // Fetch the booking data associated with the purchase_order_id
    const bookingData = await BookingModel.findOne({
      _id: purchase_order_id,
      price: amount, // Convert back from paisa
    });

    if (!bookingData) {
      console.log("Booking data not found for ID:", purchase_order_id);
      return res.status(400).json({
        success: false,
        message: "Booking data not found",
      });
    }

    // Update the booking status to "Completed" after successful payment
    await BookingModel.findByIdAndUpdate(purchase_order_id, {
      $set: {
        bookingStatus: "Completed",
        paymentStatus: "Completed",
      },
    });

    // Creating a payment record in the PaymentModel
    const paymentData = await PaymentModel.create({
      pidx,
      transactionId: transaction_id,
      bookingID: purchase_order_id,
      amount,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: "Khalti",
      status: "success",
    });

    res.json({
      success: true,
      message: "Payment Successful",
      paymentData,
    });
  } catch (error) {
    console.error("Error verifying Khalti payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message || error,
    });
  }
});

export { paymentRoute }; // This exports the defined paymentRoute