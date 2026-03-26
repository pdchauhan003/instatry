import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
export async function POST(req, context) {
  await connectDB();
  const { username } = await req.json();
  const params = await context.params;
  const id = params.id;
  if (!username || username.trim() === "") {
    return Response.json({ users: [] });
  }
  const user = await User.findOne({ _id: id });
  const userData = await User.find(
    { username: { $regex: username, $options: "i" } },
    { username: 1, _id: 1, image:1 },
  )
    .limit(10)
    .lean();

  return Response.json({ users: userData, user: user });
}
