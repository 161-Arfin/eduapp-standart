import { createSlice } from "@reduxjs/toolkit";

const showModal = createSlice({
  name: "showModal",
  initialState: {
    data: {},
  },
  reducers: {
    setShowModal: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setShowModal } = showModal.actions;
export default showModal.reducer;
