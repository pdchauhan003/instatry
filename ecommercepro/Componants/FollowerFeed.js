// FollowerFeed.js

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { handleUnfollow } from "@/handler/UnFollowhandler";
import {useMutation,useQueryClient} from "@tanstack/react-query";

function FollowerFeed({ id }) {

  const fetchFollowers=async(id)=>{
    const res = await fetch(`/api/auth/followers/${id}`);
    if(!res.ok){
      throw new Error("Failed to fetch followers");
    }
    const data=await res.json();
    return data.followers || [];
  }

  const {data:followers=[],isLoading,isError,error}=useQuery({
    queryKey:['followers',id],
    queryFn:()=>fetchFollowers(id),
    enabled:!!id,  //only run when id exits
    staleTime:1000*60*5
  })

  const queryClient=useQueryClient();

  const unfollowMutation = useMutation({
    mutationFn: ({ friendId }) => handleUnfollow(id, friendId),
    onMutate: async ({ friendId }) => {
      await queryClient.cancelQueries({ queryKey: ['followers', id] });
      const previousFollowers = queryClient.getQueryData(['followers', id]);
      queryClient.setQueryData(['followers', id], (old = []) =>
        old.filter(f => f.follower._id !== friendId)
      );
      return { previousFollowers };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['followers', id], context.previousFollowers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['followers', id] });
      queryClient.invalidateQueries({ queryKey: ['followings', id] });
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
    }
  });

  if (isLoading) {
    return <p className="text-gray-400 text-center">Loading...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-400 text-center">
        {error.message || "Something went wrong"}
      </p>
    );
  }

  console.log('followers data is ',followers);
  return (
    <div className="max-h-96 overflow-y-auto px-4 py-2">
      {followers.length === 0 && (
        <p className="text-gray-400 text-sm text-center">No followers yet</p>
      )}
      {followers.map((f) => (
        <div key={f._id} className="flex items-center gap-3 py-2 border-b border-gray-700">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
            {f.follower?.image ? (
              <Image src={f.follower.image} width={40} height={40} alt={f.follower.username} className="object-cover w-full h-full"/>
            ) : (
              <div className="flex items-center justify-center w-full h-full text-sm text-gray-300">
                {f.follower.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="font-medium">{f.follower.username}</p>
          <Button className='ml-auto' onClick={()=>unfollowMutation.mutate({friendId:f.follower._id})}>Unfollow</Button>
        </div>
      ))}
    </div>  
  );
}

export default FollowerFeed;