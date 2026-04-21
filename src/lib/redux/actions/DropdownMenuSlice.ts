import { createSlice } from "@reduxjs/toolkit";

const dropdownMenu = createSlice({
    name: "dropdownMenu",
    initialState: {
        data: {}
    },
    reducers: {
        setDropdownMenu: (state, action) => {
            state.data = action.payload
        },
    },
});

export const { setDropdownMenu } = dropdownMenu.actions;
export default dropdownMenu.reducer;