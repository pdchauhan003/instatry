import { NextResponse } from "next/server";
import { User } from '@/lib/database';
import { connectDB } from '@/lib/Connection';
import bcrypt from 'bcryptjs';
import { getAuthUserId } from "@/lib/getAuthUser";

export async function POST(req, context) {
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        await connectDB();
        const params = await context.params;
        const id = params.id;

        if (id !== authUserId) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const { oldpassword, password } = await req.json();
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const confirmpass = await bcrypt.compare(oldpassword, user.password);
        if (!confirmpass) {
            return NextResponse.json({ success: false, message: 'old password is wrong' }, { status: 401 });
        }

        const hashedPass = await bcrypt.hash(password, 10);
        user.password = hashedPass;
        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/auth/home/[id]/setting/passchange:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
