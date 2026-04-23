import mongoose from "mongoose";

const termsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    accepted: {
      type: Boolean,
      default: false,
    },

    acceptedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Terms || mongoose.model("Terms", termsSchema);
