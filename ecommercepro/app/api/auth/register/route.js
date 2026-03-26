import {User} from '@/lib/database';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/Connection';
import { uploadCloudinary } from '@/handler/UploadCloudinary';
export async function POST(req) {
  await connectDB()
  try {
    // const body = await req.json();
    // console.log("REQUEST BODY:", body);
    // const { name, email, password, number, username, image } = body;

    const data = await req.formData();
    const name = data.get("name");
    const email = data.get("email");
    const password = data.get("password");
    const number = data.get("number");
    const username = data.get("username");
    const image = data.get("image");

    if (!name || !email || !password || !number || !username || !image) {
      console.log("Validation Failedd");
      return Response.json({message:'Please fill all fields' });
    }
    // const findEmail = await User.findOne({ email });
    // const findUsername = await User.findOne({ username });
    const [findEmail, findUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);
    console.log("USER FOUND:", findEmail);
    if (findUsername) {
      return Response.json(
        { message: 'Usernmae already exists' }
        // { status: 409 }
      );
    }
    if (findEmail) {
      return Response.json(
        { message: 'Email already exists' }
        // { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10); //excryption of the password....
    console.log("Password Hashed");

    // const bytes = await image.arrayBuffer(); //convert in RowBytes(binary data)
    // const buffer = Buffer.from(bytes); // node js use buffer data not arrayBuffer then convert arrayBuffer to buffer

    // // Upload to Cloudinary
    // const uploadResult = await new Promise((resolve, reject) => {
    //   cloudinary.uploader.upload_stream(
    //     { folder: "next_users" },
    //     (error, result) => {
    //       if (error) reject(error);
    //       resolve(result);
    //     }
    //   ).end(buffer);
    // });

    const uploadResult=await uploadCloudinary(image)
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      number,
      username,
      image : uploadResult.secure_url,
    });
    await user.save();
    console.log("USER SAVED SUCCESSFULLY");
    return Response.json(
      {success:true}
    );
  } catch (error) {
    console.error("REGISTER ERROR FULL:", error);
    return Response.json(
      { message: 'Internal server error' },
    );
  }
}
