import React, { useEffect, useState } from "react";
import { LuChevronFirst, LuChevronLast } from "react-icons/lu";
import { setSidebarToggle } from "@/lib/redux/actions/SidebarToggleSlice";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { useSession } from "next-auth/react";
import defaultLogo from "../../../../../public/assets/images/company/only_logo_eduarsip_transparant.png";

type SidebarElementProps = {
  children: React.ReactNode;
};

const SidebarElement = ({ children }: SidebarElementProps) => {
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();
  const isToggled = useSelector((state: any) => state.sidebarToggle.data);
  const { data }: any = useSession();

  useEffect(() => {
    setExpanded(isToggled);
  }, [isToggled]);

  return (
    <div
      className={`transition-all overflow-visible min-h-screen ${expanded ? "w-64 sm:w-64" : "w-0 sm:w-16"
        }`}
    >
      <div className="h-full flex flex-col bg-white border-r border-gray-100 shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src={defaultLogo}
              width={100}
              height={100}
              className={`overflow-hidden transition-all object-contain ${expanded ? "w-8" : "w-0"}`}
              alt="instansi-logo"
            />
            <h6
              className={`text-sm text-gray-600 font-bold ml-2 ${expanded ? "" : "hidden"
                }`}
            >
              {data?.user?.instansiName || "EduArsip"}
            </h6>
          </div>
          <button
            onClick={() => {
              setExpanded(!expanded);
              dispatch(setSidebarToggle(!isToggled));
            }}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 invisible sm:visible sm:w-auto"
          >
            {expanded ? <LuChevronFirst /> : <LuChevronLast />}
          </button>
        </div>
        <ul className="flex-1 px-3">{children}</ul>

        <div className="sm:border-none flex p-3">
          <div className={`w-10 h-10`}></div>
        </div>
      </div>
    </div>
  );
};

export default SidebarElement;
