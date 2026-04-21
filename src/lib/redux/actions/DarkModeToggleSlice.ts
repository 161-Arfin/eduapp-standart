import { createSlice } from "@reduxjs/toolkit";

const darkModeToggle = createSlice({
  name: "darkModeToggle",
  initialState: {
    data: false,
  },
  reducers: {
    setDarkModeToggle: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setDarkModeToggle } = darkModeToggle.actions;
export default darkModeToggle.reducer;
