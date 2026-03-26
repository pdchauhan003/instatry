export const searchApi=async(id,username)=>{
    const res = await fetch(`/api/auth/home/${id}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      return data
}