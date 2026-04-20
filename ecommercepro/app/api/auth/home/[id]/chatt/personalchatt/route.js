import { getUserImageAndUsername } from "@/controller/user.controller";

export async function POST(req) {
    try {
        const { chatid } = await req.json();
        const userData = await getUserImageAndUsername(chatid);
        console.log('user daat is', userData);
        return Response.json({ userData, success: true })
    } catch (error) {
        console.error("Error in personalchatt API:", error);
        return Response.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
    }
}