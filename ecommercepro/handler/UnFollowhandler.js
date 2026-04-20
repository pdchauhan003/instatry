export const handleUnfollow = async (id, friendId) => {
  try {
    const res = await fetch(`/api/auth/home/${id}/profile/remove`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in handleUnfollow handler:", error);
    return { success: false, message: "Network error", error: error.message };
  }
};