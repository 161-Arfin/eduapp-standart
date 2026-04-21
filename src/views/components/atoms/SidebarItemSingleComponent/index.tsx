import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { setDropdownMenu } from "@/lib/redux/actions/DropdownMenuSlice";
import { setSidebarToggle } from "@/lib/redux/actions/SidebarToggleSlice";

type SidebarItemSingleComponentProps = {
  icon: any;
  text: string;
  menuController: string;
  menuFunction: string;
};

const SidebarItemSingleComponent = ({
  icon,
  text,
  menuController,
  menuFunction,
}: SidebarItemSingleComponentProps) => {
  const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();
  const expanded = useSelector((state: any) => state.sidebarToggle.data);
  const dispatch = useDispatch();

  useEffect(() => {
    if (pathname && pathname.split("/")[1] === menuController) {
      setIsActive(true);
      if (!expanded) {
        dispatch(setDropdownMenu({}));
      } else {
        dispatch(setDropdownMenu({}));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (pathname && pathname.split("/")[1] === menuController) {
      dispatch(setDropdownMenu({}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  return (
    <li>
      <Link
        href={`/${menuController}/${menuFunction}`}
        onClick={() => {
          dispatch(setDropdownMenu({}));
          if (window.innerWidth <= 768) {
            dispatch(setSidebarToggle(false));
          }
        }}
        className={`relative flex items-center py-2 px-3 mt-1 font-medium rounded-md cursor-pointer transition-colors group ${isActive
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-500 hover:text-gray-600"
          } ${expanded ? "visible" : "invisible sm:visible"}`}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all text-sm ${expanded ? "w-52 ml-3" : "hidden"
            }`}
        >
          {text}
        </span>
        {!expanded && (
          <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm -translate-x-3 invisible opacity-20 transition-all group-hover:translate-x-0 group-hover:visible group-hover:opacity-100 whitespace-nowrap z-10">
            {text}
          </div>
        )}
      </Link>
    </li>
  );
};

export default SidebarItemSingleComponent;
