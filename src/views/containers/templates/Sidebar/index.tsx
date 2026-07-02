import { menuFeatureItem, menuSettingItem } from "@/utils/data/static";
import SidebarItemCollapseComponent from "@/views/components/atoms/SidebarItemCollapseComponent";
import SidebarItemSingleComponent from "@/views/components/atoms/SidebarItemSingleComponent";
import SidebarElement from "@/views/components/molecules/SidebarElement";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { FiArchive, FiBookmark, FiFileText } from "react-icons/fi";
import { MdOutlineLockPerson } from "react-icons/md";
import { RiBuilding4Line } from "react-icons/ri";
import { TbUserEdit } from "react-icons/tb";
import { useSelector } from "react-redux";

type AppSession = {
  user?: {
    usertypeId?: number | string | null;
  };
};

const Sidebar = () => {
  const { data: session } = useSession();
  const data = session as AppSession | null;
  const expanded = useSelector(
    (state: { sidebarToggle: { data: boolean } }) => state.sidebarToggle.data,
  );

  const icon: Record<string, ReactNode> = {
    dashboard: <AiOutlineDashboard size={20} />,
    FaRegEdit: <FaRegEdit size={20} />,
    GoArchive: <FiArchive size={20} />,
    TbBuilding: <RiBuilding4Line size={20} />,
    FaRegBookmark: <FiBookmark size={20} />,
    FaRegFileAlt: <FiFileText size={20} />,
    TbUserEdit: <TbUserEdit size={20} />,
    MdOutlineLockPerson: <MdOutlineLockPerson size={20} />,
  };

  return (
    <SidebarElement>
      <div className="my-4" />
      <SidebarItemSingleComponent
        icon={icon["dashboard"]}
        text="Dashboard"
        menuController="dashboard"
        menuFunction=""
      />
      <hr className="my-3 border-gray-100" />
      <div
        className={`pt-0 pb-2 px-3 text-xs text-gray-400 text-left font-weight-semibold uppercase tracking-widest ${
          expanded ? "" : "hidden"
        }`}
      >
        Features
      </div>
      {menuFeatureItem.map(
        ({
          id,
          menuName,
          menuController,
          menuFunction,
          menuIcon,
          isActive,
          dataTarget,
          submenu,
        }) => {
          return isActive ? (
            submenu.length > 0 ? (
              <SidebarItemCollapseComponent
                key={id}
                icon={icon[menuIcon]}
                text={menuName}
                dataTarget={dataTarget}
                submenu={submenu}
                menuController={menuController}
              />
            ) : (
              <SidebarItemSingleComponent
                key={id}
                icon={icon[menuIcon]}
                text={menuName}
                menuController={menuController}
                menuFunction={menuFunction}
              />
            )
          ) : null;
        },
      )}
      <hr className="my-3 border-gray-100" />
      <div
        className={`pt-0 pb-2 px-3 text-xs text-gray-400 text-left font-weight-semibold uppercase tracking-widest ${
          expanded ? "" : "hidden"
        }`}
      >
        Settings
      </div>
      {menuSettingItem.map(
        ({
          id,
          menuName,
          menuController,
          menuFunction,
          menuIcon,
          isActive,
          dataTarget,
          submenu,
        }) => {
          return isActive ? (
            submenu.length > 0 ? (
              Number(data?.user?.usertypeId) === 5 ||
              Number(data?.user?.usertypeId) === 1 ||
              Number(data?.user?.usertypeId) === 2 ||
              Number(data?.user?.usertypeId) === 3 ||
              Number(data?.user?.usertypeId) === 4 ? (
                <SidebarItemCollapseComponent
                  key={id}
                  icon={icon[menuIcon]}
                  text={menuName}
                  dataTarget={dataTarget}
                  submenu={submenu}
                  menuController={menuController}
                />
              ) : null
            ) : (
              <SidebarItemSingleComponent
                key={id}
                icon={icon[menuIcon]}
                text={menuName}
                menuController={menuController}
                menuFunction={menuFunction}
              />
            )
          ) : null;
        },
      )}
    </SidebarElement>
  );
};

export default Sidebar;
