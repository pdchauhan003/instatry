export const searchApi=async(id,username)=>{
    try {
        const res = await fetch(`/api/auth/home/${id}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
          const data = await res.json();
          return data
    } catch (error) {
        console.error("Error in searchApi handler:", error);
        return { success: false, message: "Network error", error: error.message };
    }
}