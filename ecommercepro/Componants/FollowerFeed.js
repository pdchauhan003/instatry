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
    <div className="max-h-96 overflow-y-auto px-1 py-2 no-scrollbar">
      {followers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
           <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
           </svg>
           <p className="text-sm">No followers yet</p>
        </div>
      ) : (
        followers.map((f) => (
          <div key={f._id} className="flex items-center gap-3 py-3 px-2 border-b border-gray-900 last:border-0 hover:bg-gray-900/40 transition-colors rounded-lg">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
              {f.follower?.image ? (
                <Image 
                  src={f.follower.image} 
                  width={44} 
                  height={44} 
                  alt={f.follower.username} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-sm font-bold text-gray-500">
                  {f.follower.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-sm tracking-tight">{f.follower.username}</p>
              <p className="text-xs text-gray-500">Follower</p>
            </div>
            <Button 
                variant="secondary" 
                size="sm"
                className="ml-auto rounded-xl text-xs font-bold h-8 px-4 bg-gray-800 hover:bg-gray-700 text-white" 
                onClick={() => unfollowMutation.mutate({ friendId: f.follower._id })}
            >
              Remove
            </Button>
          </div>
        ))
      )}
    </div>  
  );
}

export default FollowerFeed;