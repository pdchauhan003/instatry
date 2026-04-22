import mongoose from 'mongoose';
import User from '../models/User.js'; // Need to make sure paths are correct
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkDB() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected!");

        const userCount = await User.countDocuments();
        console.log("Total users:", userCount);

        const pendingSellers = await User.find({ verificationStatus: "pending" });
        console.log("Pending sellers count:", pendingSellers.length);

        const approvedSellers = await User.find({
            $or: [
                { verificationStatus: "approved" },
                { verificationStatus: "seller" },
                { isVerifiedSeller: true },
                { role: "seller" },
            ]
        });
        console.log("Approved/Active sellers count:", approvedSellers.length);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkDB();
