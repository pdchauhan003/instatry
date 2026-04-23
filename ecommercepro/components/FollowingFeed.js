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
      toast.error("Failed to unfollow ");
    },
    onSuccess: () => {
      toast.success("Unfollowed successfully ");
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
    <div className="max-h-96 overflow-y-auto px-1 py-1 no-scrollbar">
      {followings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <p className="text-sm">No followings yet</p>
        </div>
      ) : (
        followings.map((f) => (
          <div key={f._id} className="flex items-center gap-3 py-3 px-2 border-b border-gray-900 last:border-0 hover:bg-gray-900/40 transition-colors rounded-lg">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
              {f.following.image ? (
                <Image 
                  src={f.following.image} 
                  width={44} 
                  height={44} 
                  alt={f.following.username} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-sm font-bold text-gray-500">
                  {f.following.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <p className="font-bold text-sm tracking-tight truncate max-w-[120px]">
                {f.following.username}
              </p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              className="ml-auto rounded-xl text-xs font-bold h-8 px-4 bg-gray-100 hover:bg-gray-200 text-black border-none" 
              onClick={() => unfollowMutation.mutate({ friendId: f.following._id })}
            >
              Unfollow
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

export default FollowingFeed;
