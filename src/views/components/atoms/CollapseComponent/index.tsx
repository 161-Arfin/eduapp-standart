import React from "react";
import { useSelector } from "react-redux";
import SubmenuComponent from "../SubmenuComponent";

type CollapseComponentProps = {
  menuName: string;
  submenu: any;
  menuController: string;
};

const CollapseComponent = React.forwardRef<HTMLDivElement, CollapseComponentProps>(
  ({ menuName, submenu, menuController }, ref) => {
    const expanded = useSelector((state: any) => state.sidebarToggle.data);

    return (
      <div
        ref={ref}
        className={`mt-0 mb-3 mx-4 ${expanded ? "relative" : "hidden"}`}
      >
        <div className="w-full bg-white shadow-md rounded-sm py-2 text-sm mb-4">
          <h6 className="py-2 px-6 text-gray-400 uppercase text-nowrap font-medium text-xs m-0">
            {menuName}
          </h6>
          {submenu.map(({ id, submenuName, submenuFunction }: any) => {
            return (
              <SubmenuComponent
                key={id}
                submenuName={submenuName}
                menuController={menuController}
                submenuFunction={submenuFunction}
              />
            );
          })}
        </div>
      </div>
    );
  }
);

CollapseComponent.displayName = "CollapseComponent";

export default CollapseComponent;
