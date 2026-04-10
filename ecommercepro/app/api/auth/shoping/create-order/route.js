import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { connectDB } from "@/services/mongodb";
import Payment from "@/models/Payment";

export async function POST(req) {
  try {
    await connectDB();

    const { id } = await req.json();
    const userId = id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 🔹 Create Razorpay order
    const order = await razorpay.orders.create({
      amount: 100, // ₹1 (in paise)
      currency: "INR",
      receipt: "receipt_" + Date.now(),

      notes: {
        userId,
        purpose: "seller_verification",
      },
    });

    // 🔹 Save payment (initial state)
    await Payment.create({
      userId,
      orderId: order.id,
      amount: order.amount,
      status: "created",
      purpose: "seller_verification",
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}