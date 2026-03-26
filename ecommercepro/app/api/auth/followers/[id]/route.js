import { checkFollowers } from "@/controller/follow.controller";
import { NextResponse } from "next/server";

export async function GET(req,context){
    const params=await context.params;
    const id=params.id;
    const followers=await checkFollowers(id);
    return NextResponse.json({followers})
}