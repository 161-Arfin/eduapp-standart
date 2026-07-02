import Image from "next/image";
import React, { useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarToggle } from "@/lib/redux/actions/SidebarToggleSlice";
import { setDarkModeToggle } from "@/lib/redux/actions/DarkModeToggleSlice";
import { setDropdownNavbar } from "@/lib/redux/actions/DropdownNavbarSlice";
import DropdownNavbarComponent from "@/views/components/atoms/DropdownNavbarComponent";
import { CSSTransition } from "react-transition-group";
import { useSession } from "next-auth/react";
import Link from "next/link";

type NavbarProps = {
  title: string;
};

const Navbar = ({ title }: NavbarProps) => {
  const { data }: any = useSession();
  const dispatch = useDispatch();
  const isToggled = useSelector((state: any) => state.sidebarToggle.data);
  const isToggledDropdownNavbar = useSelector(
    (state: any) => state.dropdownNavbar.data,
  );
  const dropdownRef = useRef(null);

  return (
    <div className="flex items-center gap-4 w-full py-3 px-4 sm:px-4 bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 bg-white shadow-md rounded-full sm:hidden">
        <GiHamburgerMenu
          size={22}
          className="text-gray-500 hover:text-gray-600 cursor-pointer"
          onClick={() => {
            dispatch(setSidebarToggle(!isToggled));
          }}
        />
      </div>

      {/* Center Title Pill */}
      <div className="flex-1 flex justify-center sm:justify-between items-center py-3 px-6 sm:px-12 rounded-full bg-white shadow-md min-w-0">
        <h4 className="font-semibold text-indigo-500 truncate text-lg">
          {title}
        </h4>
        <ol className="hidden sm:flex items-center whitespace-nowrap">
          <li className="inline-flex items-center">
            <Link
              className="flex items-center text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              href={"/home"}
            >
              Home
            </Link>
            <svg
              className="shrink-0 mx-2 size-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </li>
          <li
            className="inline-flex items-center text-sm font-medium text-gray-600 truncate"
            aria-current="page"
          >
            {title}
          </li>
        </ol>
      </div>

      {/* Profile Dropdown */}
      <div className="relative flex-shrink-0">
        <div
          onClick={() => dispatch(setDropdownNavbar(!isToggledDropdownNavbar))}
          className="h-12 w-12 flex justify-center items-center rounded-full bg-white shadow-md cursor-pointer overflow-hidden"
        >
          <div className="relative flex items-center justify-center h-full w-full">
            {data?.user.photoProfileUrl ? (
              <>
                <Image
                  width={48}
                  height={48}
                  className="h-10 w-10 object-cover rounded-full"
                  src={data?.user.photoProfileUrl}
                  alt="Avatar"
                />
                <span className="absolute top-1 right-1 block size-2.5 rounded-full bg-green-400 border-2 border-white"></span>
              </>
            ) : (
              <svg
                className="h-6 w-6 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        </div>
        <CSSTransition
          in={isToggledDropdownNavbar}
          timeout={300}
          classNames="dropdown-navbar"
          unmountOnExit
          nodeRef={dropdownRef}
          appear={true}
        >
          <DropdownNavbarComponent ref={dropdownRef} />
        </CSSTransition>
      </div>
    </div>
  );
};

export default Navbar;
