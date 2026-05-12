import { getUserBio, updateBio, updateUserField } from "@/controller/user.controller";
import { uploadCloudinary } from "@/handler/UploadCloudinary";
import { getAuthUserId } from "@/lib/getAuthUser";
import { editProfileSchema } from "@/zodschemas/authSchema";

export async function GET(req,context){
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const params=await context.params;
        const id=params.id;

        if (id !== authUserId) {
            return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

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
        const authUserId = await getAuthUserId();
        if (!authUserId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const params = await context.params;
        const id = params.id;

        if (id !== authUserId) {
            return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const formData = await req.formData();

        const rawData = {
            name: formData.get("name"),
            username: formData.get("username"),
            bio: formData.get("bio"),
            image: formData.get("image"),
        };

        //  ZOD VALIDATION
        const result = editProfileSchema.safeParse(rawData);

        if (!result.success) {
        return Response.json(
            {
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
        }

        const { name, username, bio, image } = result.data;

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
