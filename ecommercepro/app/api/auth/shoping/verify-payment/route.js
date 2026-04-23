import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/services/mongodb";
import { Payment } from "@/lib/database";
import { User } from "@/lib/database";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Verify Signature 
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update Payment in DB
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        status: "success",
      },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // auto request to admin
    await User.findByIdAndUpdate(userId, {
      verificationStatus: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified, waiting for admin approval",
    }, { status: 200 });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

