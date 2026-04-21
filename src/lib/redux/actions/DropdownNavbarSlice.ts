import { createSlice } from "@reduxjs/toolkit";

const dropdownNavbar = createSlice({
  name: "dropdownNavbar",
  initialState: {
    data: false,
  },
  reducers: {
    setDropdownNavbar: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setDropdownNavbar } = dropdownNavbar.actions;
export default dropdownNavbar.reducer;
