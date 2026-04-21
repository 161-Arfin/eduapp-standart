import { setDropdownMenu } from "@/lib/redux/actions/DropdownMenuSlice";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { CSSTransition } from "react-transition-group";
import CollapseComponent from "../CollapseComponent";
import CollapseToggleComponent from "../CollapseToggleComponent";

type SidebarItemCollapseComponentProps = {
  icon: any;
  text: string;
  dataTarget: string;
  submenu: any;
  menuController: string;
};

const SidebarItemCollapseComponent = ({
  icon,
  text,
  dataTarget,
  submenu,
  menuController,
}: SidebarItemCollapseComponentProps) => {
  const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();

  const expanded = useSelector((state: any) => state.sidebarToggle.data);
  const isToggledDropdown: any = useSelector(
    (state: any) => state.dropdownMenu.data
  );
  const collapseToggleRef = useRef(null);
  const collapseRef = useRef(null);

  useEffect(() => {
    if (pathname && pathname.split("/")[1] === menuController) {
      if (!expanded) {
        dispatch(setDropdownMenu({ [dataTarget]: false }));
      } else {
        dispatch(setDropdownMenu({ [dataTarget]: true }));
      }
      setIsActive(true);
    } else {
      setIsActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (pathname && pathname.split("/")[1] === menuController) {
      if (expanded) {
        dispatch(setDropdownMenu({ [dataTarget]: true }));
      } else {
        dispatch(setDropdownMenu({ [dataTarget]: false }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  return (
    <li>
      <div
        onClick={() => {
          dispatch(
            setDropdownMenu({
              [dataTarget]: !isToggledDropdown[dataTarget],
            })
          );
        }}
        className={`relative flex items-center py-2 px-3 mt-1 font-medium rounded-md cursor-pointer transition-colors group ${isActive
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-500 hover:text-gray-600"
          } ${expanded ? "visible" : "invisible sm:visible"} ${isToggledDropdown[dataTarget]
            ? "bg-indigo-50 text-gray-600"
            : ""
          }`}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all text-sm ${expanded ? "w-52 ml-3" : "hidden"
            }`}
        >
          {text}
        </span>
        <div
          className={`absolute right-2 ${expanded ? "visible" : "invisible"}`}
        >
          {isToggledDropdown[dataTarget] ? (
            <IoIosArrowDown className="text-gray-400" />
          ) : (
            <IoIosArrowForward className="text-gray-400" />
          )}
        </div>
        {!expanded && !isToggledDropdown[dataTarget] && (
          <div className="absolute z-10 left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm -translate-x-3 invisible opacity-20 transition-all group-hover:translate-x-0 group-hover:visible group-hover:opacity-100 whitespace-nowrap">
            {text}
          </div>
        )}
        <CSSTransition
          in={isToggledDropdown[dataTarget]}
          timeout={300}
          classNames="collapsed"
          unmountOnExit
          nodeRef={collapseToggleRef}
        >
          <CollapseToggleComponent
            ref={collapseToggleRef}
            menuName={text}
            submenu={submenu}
            menuController={menuController}
          />
        </CSSTransition>
      </div>
      <CSSTransition
        in={isToggledDropdown[dataTarget]}
        timeout={300}
        classNames="collapsed"
        unmountOnExit
        nodeRef={collapseRef}
      >
        <CollapseComponent
          ref={collapseRef}
          menuName={text}
          submenu={submenu}
          menuController={menuController}
        />
      </CSSTransition>
    </li>
  );
};

export default SidebarItemCollapseComponent;
