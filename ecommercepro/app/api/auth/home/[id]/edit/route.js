import { getUserBio, updateBio, updateUserField } from "@/controller/user.controller";
import { uploadCloudinary } from "@/handler/UploadCloudinary";

export async function GET(req,context){
    try {
        const params=await context.params;
        const id=params.id;
        const userInfo=await getUserBio(id)
        console.log('edit server is',userInfo)
        return Response.json(userInfo);
    } catch (error) {
        console.error("Error in edit account GET:", error);
        return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req, context) {
    try {
        const params = await context.params;
        const id = params.id;

        const formData = await req.formData();

        const name = formData.get("name");
        const username = formData.get("username");
        const bio = formData.get("bio");
        const image = formData.get("image");

        let updatedFields = [];

        if (name) {
            await updateUserField(id, "name", name);
            updatedFields.push("name");
        }

        if (username) {
            await updateUserField(id, "username", username);
            updatedFields.push("username");
        }

        if (image && typeof image !== 'string' && image.size > 0) {
            const uploadResult = await uploadCloudinary(image);
            await updateUserField(id, "image", uploadResult.secure_url);
            updatedFields.push("image");
        }

        if (bio) {
            await updateBio(id, bio);
            updatedFields.push("bio");
        }

        return Response.json({
            success: true,
            message: `${updatedFields.join(", ")} updated successfully`
        });
    } catch (error) {
        console.error("Error in edit account PUT:", error);
        return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}