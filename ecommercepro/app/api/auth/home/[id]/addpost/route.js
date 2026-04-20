import { Post, User, Story } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
// import cloudinary from "@/lib/cloudinary";
// import { getImage } from "@/controller/image.stringconverter";
import { uploadCloudinary } from "@/handler/UploadCloudinary";

export async function POST(req, context) {
  await connectDB();
  const params = await context.params;
  const id = params.id;

  const formData = await req.formData();
  const image = formData.get("image");
  const caption = formData.get("caption");
  const option = formData.get('option');

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

  if (option === "story") {
    const story = await Story.create({
      story: uploaded.secure_url,
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
}
