/* eslint-disable react/display-name */
import { setDropdownNavbar } from "@/lib/redux/actions/DropdownNavbarSlice";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { FaRegUser } from "react-icons/fa";
import { MdLogout, MdOutlineLockPerson } from "react-icons/md";
import { useDispatch } from "react-redux";

const DropdownNavbarComponent = React.forwardRef<HTMLDivElement, any>(
  (props, ref) => {
    const dispatch = useDispatch();
    const { data }: any = useSession();

    return (
      <div
        ref={ref}
        className="absolute z-30 block top-14 right-0 text-xs shadow-lg min-w-70 w-auto rounded-lg border-gray-300 border"
      >
        <div className="py-3 px-6 mt-0 bg-gray-200 rounded-t-md">
          <p className="text-sm text-gray-500 mb-1">Signed in as</p>
          <p className="text-sm font-medium text-gray-800">
            {data?.user.username} ({data?.user.usertypeName})
          </p>
          <p className="text-xs font-medium text-gray-500">
            {data?.user?.instansiName}
          </p>
        </div>
        <div className="py-2 px-0 mt-0 text-gray-500 bg-white rounded-b-md">
          <Link
            href="/auth/profile"
            onClick={() => dispatch(setDropdownNavbar(false))}
            className="py-2 px-6 text-gray-600 flex gap-3 items-center w-full no-underline text-nowrap bg-transparent hover:bg-gray-100 border-none rounded-md text-sm"
          >
            <FaRegUser color="#abb2b9" />
            Profile
          </Link>
          <Link
            href="/auth/change-password"
            onClick={() => dispatch(setDropdownNavbar(false))}
            className="py-2 px-6 text-gray-600 flex gap-3 items-center w-full no-underline text-nowrap bg-transparent hover:bg-gray-100 border-none rounded-md text-sm"
          >
            <MdOutlineLockPerson color="#abb2b9" />
            Ubah Password
          </Link>
          <a
            href="#"
            onClick={() => {
              signOut();
              localStorage.removeItem("menuFeatures");
              localStorage.removeItem("instansiUser");
            }}
            className="py-2 px-6 text-gray-600 flex gap-3 items-center w-full no-underline text-nowrap bg-transparent hover:bg-gray-100 border-none rounded-md text-sm"
          >
            <MdLogout color="#abb2b9" />
            Logout
          </a>
        </div>
      </div>
    );
  },
);

export default DropdownNavbarComponent;
