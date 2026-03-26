const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    isSeen:{type:Boolean,default:false},
  },
  { timestamps: true }
);
messageSchema.index({ from: 1, to: 1, createdAt: 1 });
messageSchema.index({ to: 1, from: 1, createdAt: 1 });
module.exports = mongoose.model("Message", messageSchema);
