import React from "react";
import { useSelector } from "react-redux";
import SubmenuComponent from "../SubmenuComponent";

type CollapseToggleComponentProps = {
  menuName: string;
  submenu: any;
  menuController: string;
};

const CollapseToggleComponent = React.forwardRef<
  HTMLDivElement,
  CollapseToggleComponentProps
>(({ menuName, submenu, menuController }, ref) => {
  const expanded = useSelector((state: any) => state.sidebarToggle.data);

  return (
    <div
      ref={ref}
      className={`${expanded ? "hidden" : "absolute z-10"} left-16 top-0`}
    >
      <div className="min-w-40 bg-white shadow-lg py-2 px-0 rounded-md">
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
});

CollapseToggleComponent.displayName = "CollapseToggleComponent";

export default CollapseToggleComponent;
