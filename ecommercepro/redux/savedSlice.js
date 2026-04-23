import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  savedPost: {}
};
const savedReducer = createSlice({
  name: "savedSlice",
  initialState,
  reducers: {
    addPost: (state, action) => {
      const { userId, postId } = action.payload;
      if (!state.savedPost[userId]) {
        state.savedPost[userId] = [];
      }
      if (!state.savedPost[userId].includes(postId)) {
        state.savedPost[userId].push(postId);
      }
    },
    removePost: (state, action) => {
      const { userId, postId } = action.payload;
      if (!state.savedPost[userId]) return;
      state.savedPost[userId] = state.savedPost[userId].filter(
        (id) => id !== postId
      );
    }
  }
});

export const { addPost, removePost } = savedReducer.actions;
export default savedReducer.reducer;
