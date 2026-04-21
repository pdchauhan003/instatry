import { User, PendingUser } from '@/lib/database';
import { connectDB } from '@/lib/Connection';
import { uploadCloudinary } from '@/handler/UploadCloudinary';

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    // Find the pending registration
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return Response.json({
        success: false,
        message: 'Registration expired or not found. Please register again.',
      });
    }

    // Wrong OTP check
    if (pendingUser.otp !== otp) {
      return Response.json({ success: false, message: 'Invalid OTP' });
    }

    // Expiry check
    if (!pendingUser.otpExpiry || new Date() > new Date(pendingUser.otpExpiry)) {
      return Response.json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    // Check again that email/username aren't taken (race condition guard)
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: pendingUser.email }),
      User.findOne({ username: pendingUser.username }),
    ]);

    if (existingEmail) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return Response.json({ success: false, message: 'Email already registered.' });
    }
    if (existingUsername) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return Response.json({ success: false, message: 'Username already taken.' });
    }

    // Upload image to Cloudinary if present
    let imageUrl = '';
    if (pendingUser.imageBase64) {
      try {
        const buffer = Buffer.from(pendingUser.imageBase64, 'base64');
        const mimeType = pendingUser.imageMimeType || 'image/jpeg';

        // Create a File-like object for the uploadCloudinary handler
        const imageFile = {
          arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
          type: mimeType,
          size: buffer.length,
        };

        const uploadResult = await uploadCloudinary(imageFile);
        imageUrl = uploadResult?.secure_url || '';
      } catch (uploadErr) {
        console.error('Image upload failed during registration:', uploadErr);
        // Continue without image — don't block registration
      }
    }

    // Create the real User
    const newUser = new User({
      name: pendingUser.name,
      username: pendingUser.username,
      email: pendingUser.email,
      number: pendingUser.number,
      password: pendingUser.password,
      image: imageUrl,
    });
    await newUser.save();

    // Clean up the pending record
    await PendingUser.deleteOne({ _id: pendingUser._id });

    console.log('User registered successfully after OTP verification:', email);
    return Response.json({ success: true, message: 'Account created successfully!' });
  } catch (error) {
    console.error('Error in verify-otp (afterregister):', error);
    return Response.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}