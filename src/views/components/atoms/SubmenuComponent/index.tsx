import { setSidebarToggle } from "@/lib/redux/actions/SidebarToggleSlice";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type SubmenuComponentProps = {
  submenuName: string;
  menuController: string;
  submenuFunction: string;
};

const SubmenuComponent = ({
  submenuName,
  menuController,
  submenuFunction,
}: SubmenuComponentProps) => {
  const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      pathname &&
      pathname.split("/")[1] === menuController &&
      pathname.split("/")[2] === submenuFunction
    ) {
      setIsActive(true);
    } else if (`${pathname}/` === `/${menuController}/${submenuFunction}`) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Link
      href={`/${menuController}/${submenuFunction}`}
      className={`py-2 px-4 my-0 mx-2 block text-gray-600 ${isActive ? "bg-gray-100" : "bg-white"
        } hover:bg-gray-100 no-underline rounded-md text-nowrap text-xs transition-colors duration-500 ease-in-out`}
      onClick={() => {
        if (window.innerWidth <= 768) {
          dispatch(setSidebarToggle(false));
        }
      }}
    >
      {submenuName}
    </Link>
  );
};

export default SubmenuComponent;
