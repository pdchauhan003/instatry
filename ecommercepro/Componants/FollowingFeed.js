// FollowingFeed.js

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useQuery,useQueryClient,useMutation } from "@tanstack/react-query";
import { handleUnfollow } from "@/handler/UnFollowhandler";
import toast from "react-hot-toast";

function FollowingFeed({ id }) {

  // const { toast } = useToast();

  const fetchFollowings=async(id)=>{
    const res = await fetch(`/api/auth/followings/${id}`);
    if(!res.ok){
      throw new Error('failed to fetch followings')
    }
    const data=await res.json();
    return data.followings || [];
  }

  const{data:followings=[],isLoading,isError,error}=useQuery({
    queryFn:()=>fetchFollowings(id),
    queryKey:['followings',id],
    staleTime:1000*60*5,
    enabled:!!id, //only run when id exits
  })

  const queryClient=useQueryClient();
  // const unfollowMutation=useMutation({
  //   mutationFn:(friendId)=>handleUnfollow(id,friendId),
  //   onSuccess:()=>{
  //     queryClient.invalidateQueries.mutate(['followings',id]);
  //   }
  // })

  const unfollowMutation = useMutation({
    mutationFn: ({ friendId }) => handleUnfollow(id, friendId),
    onMutate: async ({ friendId }) => {
      await queryClient.cancelQueries({ queryKey: ['followings', id] });
      const previousFollowers = queryClient.getQueryData(['followings', id]);
      queryClient.setQueryData(['followings', id], (old = []) =>
        old.filter(f => f.follower._id !== friendId)
      );
      return { previousFollowers };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['followings', id], context.previousFollowers);
      toast.error("Failed to unfollow ❌");
    },
    onSuccess: () => {
      toast.success("Unfollowed successfully ✅");
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
  console.log('followings list in front',followings);
  return (
    <div className="max-h-96 overflow-y-auto px-4 py-2">
      {followings.length === 0 && (
        <p className="text-gray-400 text-sm text-center">No followings yet</p>
      )}
      {followings.map((f) => (
        <div key={f._id} className="flex items-center gap-3 py-2 border-b border-gray-700">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
            {f.following.image ? (
              <Image src={f.following.image} width={40} height={40} alt={f.following.username} className="object-cover w-full h-full"/>
            ) : (
              <div className="flex items-center justify-center w-full h-full text-sm text-gray-300">
                {f.following.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="font-medium">{f.following.username}</p>
          <Button className='ml-auto' onClick={()=>unfollowMutation.mutate({friendId:f.following._id})}>Unfollow</Button>
        </div>
      ))}
    </div>
  );
}

export default FollowingFeed;