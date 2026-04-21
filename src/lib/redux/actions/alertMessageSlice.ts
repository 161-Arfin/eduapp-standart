import { createSlice } from "@reduxjs/toolkit";

const alertMessage = createSlice({
  name: "alertMessage",
  initialState: {
    data: {},
  },
  reducers: {
    setAlertMessage: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setAlertMessage } = alertMessage.actions;
export default alertMessage.reducer;
