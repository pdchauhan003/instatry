import cloudinary from '@/lib/cloudinary';
export const uploadCloudinary=async(image)=>{
    const bytes = await image.arrayBuffer(); //convert in RowBytes(binary data)
    const buffer = Buffer.from(bytes); // node js use buffer data not arrayBuffer then convert arrayBuffer to buffer

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "next_users" },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      ).end(buffer);
    });
    return uploadResult;
}