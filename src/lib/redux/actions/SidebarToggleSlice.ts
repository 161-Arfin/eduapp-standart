import { createSlice } from "@reduxjs/toolkit";

const sidebarToggle = createSlice({
  name: "sidebarToggle",
  initialState: {
    data: false,
  },
  reducers: {
    setSidebarToggle: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setSidebarToggle } = sidebarToggle.actions;
export default sidebarToggle.reducer;
