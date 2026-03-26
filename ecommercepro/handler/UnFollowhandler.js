  export const handleUnfollow=async(id,friendId)=>{
    const res=await fetch(`/api/auth/home/${id}/profile/remove`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({friendId})
    })
    const data=await res.json();
    return data;
  }