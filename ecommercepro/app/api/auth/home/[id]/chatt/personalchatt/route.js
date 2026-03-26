import { getUserImageAndUsername } from "@/controller/user.controller";

export async function POST(req){
    const {chatid}=await req.json();
    const userData=await getUserImageAndUsername(chatid);
    console.log('user daat is',userData);
    return Response.json({userData,success:true})
}