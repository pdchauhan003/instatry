// export const runtime = "nodejs";
// // import { cookies } from "next/headers";
// import jwt from 'jsonwebtoken';
// import mg from 'mongoose'

// export async function GET(req){
//     // const cookieStore=await cookies();
//     const accessToken = req.cookies.get("accessToken")?.value;
//     console.log('token in first page',accessToken)
//     if(!accessToken){
//         console.log('token is not provided in route file of auth')
//         return Response.json({message:'token is expiredd',success:false})
//     }
//     try{
//         console.log('decode token is before')
//         console.log('process sec is',process.env.ACCESS_SECRET)
//         const decode= jwt.verify(accessToken,process.env.ACCESS_SECRET);
//         console.log('decoded token is in route file of auth',decode)
//         if(!decode){
//             console.log('error in decode in auth route')
//         }
//         // const userid=new mg.Types.ObjectId(decode.id)
//         return Response.json({message:'token is verified',success:true,userId:decode.userId});
//     }
//     catch(error){
//         console.log('error in jwt verify')
//         return Response.json({message:'token is not verifieed',success:false})
//     }
// }


import jwt from "jsonwebtoken";

export async function GET(req) {
  const accessToken = req.cookies.get("accessToken")?.value;

  //Try access token
  if (accessToken) {
    try {
      const decode = jwt.verify(accessToken, process.env.JWT_SECRET);

      return Response.json({
        success: true,
        userId: decode.userId,
      });

    } catch {
      console.log("Access expired → trying refresh...");
    }
  }

  // Call refresh API
  try {
    const refreshRes = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    const data = await refreshRes.json();

    if (!data.success) {
      return Response.json({ success: false });
    }

    // Directly use returned userId
    return Response.json({
      success: true,
      userId: data.userId,
    });

  } catch (error) {
    return Response.json({ success: false });
  }
}