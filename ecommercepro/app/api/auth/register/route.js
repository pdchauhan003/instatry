import { NextResponse } from 'next/server';
import { User } from '@/lib/database';
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

    if (!name || !email || !password || !number || !username) {
      console.log("Validation Failedd");
      // if (!image) alert('image in not found');
      return NextResponse.json({ message: 'Please fill all fields' }, { status: 400 });
    }
    // const findEmail = await User.findOne({ email });
    // const findUsername = await User.findOne({ username });
    const [findEmail, findUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);
    console.log("USER FOUND:", findEmail);
    if (findUsername) {
      return NextResponse.json(
        { message: 'Usernmae already exists' },
        { status: 409 }
      );
    }
    if (findEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10); //excryption of the password....
    console.log("Password Hashed");

    let uploadResult = null;
    if (image && typeof image !== 'string' && image.size > 0) {
      uploadResult = await uploadCloudinary(image)
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      number,
      username,
      image: uploadResult?.secure_url || '',
    });
    await user.save();
    console.log("USER SAVED SUCCESSFULLY");
    return NextResponse.json(
      { success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR FULL:", error);
    return NextResponse.json(
      { message: `Server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
