import { Comment } from "@/lib/database";

export async function POST(req,context){
    const params=await context.params;
    const id=params.id;
    const {postid,comment}=await req.json();
    const commentAdd=await Comment.create({
        text:comment,
        post:postid,
        author:id
    })
    if(!commentAdd){
        return Response.json({message:'error in add comment',success:false})
    }
    return Response.json({message:'Added comment',success:true});
}