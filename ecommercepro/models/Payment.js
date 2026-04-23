import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    orderId: String,
    paymentId: String,

    amount: Number,
    method: String, // upi, card

    status: {
      type: String,
      enum: ["created", "success", "failed"],
    },

    purpose: {
      type: String,
      default: "seller_verification",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
