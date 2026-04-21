import { configureStore } from "@reduxjs/toolkit";
import sidebarToggleReducer from "./actions/SidebarToggleSlice";
import darkModeToggleReducer from "./actions/DarkModeToggleSlice";
import dropdownMenuReducer from "./actions/DropdownMenuSlice";
import dropdownNavbarReducer from "./actions/DropdownNavbarSlice";
import showModalReducer from "./actions/ShowModalSlice";
import alertMessageReducer from "./actions/alertMessageSlice";

const store = configureStore({
  reducer: {
    sidebarToggle: sidebarToggleReducer,
    darkModeToggle: darkModeToggleReducer,
    dropdownMenu: dropdownMenuReducer,
    dropdownNavbar: dropdownNavbarReducer,
    showModal: showModalReducer,
    alertMessage: alertMessageReducer,
  },
});

export default store;
