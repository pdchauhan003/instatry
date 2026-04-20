import cloudinary from "@/lib/cloudinary";

export const getImage=async(image)=>{
    try {
        // Convert file to buffer
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
      
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "next_users" }, (err, result) => {
              if (err) reject(err);
              resolve(result);
            })
            .end(buffer);
        });
        return uploadResult;
    } catch (error) {
        console.error("Error in getImage controller:", error);
        throw error;
    }
}