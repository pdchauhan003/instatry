import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) return;    

        // await mongoose.connect(process.env.MONGODB_URI);
        await mongoose.connect("mongodb://127.0.0.1:27017/EcommercePro");
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
