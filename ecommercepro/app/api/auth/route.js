export const runtime = "nodejs";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
export async function GET(req){
    const cookieStore=await cookies();
    const token = cookieStore.get("token")?.value;
    if(!token){
        console.log('token is not provided in route file of auth')
        return Response.json({message:'token is expiredd',success:false})
    }
    try{
        const decode=jwt.verify(token,process.env.JWT_SECRET);
        console.log('decoded token is in route file of auth',decode)
        if(!decode){
            console.log('error in decode in auth route')
        }
        return Response.json({message:'token is verified',success:true,userId:decode.id});
    }
    catch(error){
        return Response.json({message:'token is not verifieed',success:false})
    }
}