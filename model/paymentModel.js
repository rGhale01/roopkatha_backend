import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true },
    pidx: { type: String, unique: true },
    bookingID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    amount: { type: Number, required: true },
    dataFromVerificationReq: { type: Object },
    apiQueryFromUser: { type: Object },
    paymentGateway: {
      type: String,
      enum: ["khalti", "Khalti"], // Allow both lower and upper case
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "pending",
    },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const paymentModel = mongoose.model("payment", paymentSchema);
export default paymentModel;
