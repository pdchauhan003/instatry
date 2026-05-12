import { Post, User, Story } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { uploadCloudinary } from "@/handler/UploadCloudinary";
import { getAuthUserId } from "@/lib/getAuthUser";
import { addPostSchema } from "@/zodschemas/authSchema";

export async function POST(req, context) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const params = await context.params;
    const id = params.id;

    if (id !== authUserId) {
        return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const rawData = {
      image: formData.get("image"),
      caption: formData.get("caption"),
      option: formData.get("option"),
    };

    //ZOD VALIDATION
    const result = addPostSchema.safeParse(rawData);

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

    const { image, caption, option } = result.data;

    if (!image || typeof image === 'string' || image.size === 0) {
      return Response.json({ success: false, message: "Image required" });
    }
    const uploaded = await uploadCloudinary(image)

    if (!uploaded?.secure_url) {
      return Response.json({
        success: false,
        message: "Image upload failed"
      });
    }

    if (option == "story") {
      const story = await Story.create({
        image: uploaded.secure_url,
        author: id,
      });

      return Response.json({
        success: true,
        message: "Story added successfully",
        story,
      });
    }

    if (option === "post") {
      const post = await Post.create({
        post: uploaded.secure_url,
        caption,  
        author: id,
      });

      return Response.json({
        success: true,
        message: "Post added successfully",
        post,
      });
    }

    return Response.json({ success: false, message: "Invalid option" });
  } catch (error) {
    console.error("Error in addpost API:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}
