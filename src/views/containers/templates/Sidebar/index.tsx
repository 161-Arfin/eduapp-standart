import { menuSettingItem } from "@/utils/data/static";
import SidebarItemCollapseComponent from "@/views/components/atoms/SidebarItemCollapseComponent";
import SidebarItemSingleComponent from "@/views/components/atoms/SidebarItemSingleComponent";
import SidebarElement from "@/views/components/molecules/SidebarElement";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { FiArchive, FiBookmark, FiFileText, FiUsers } from "react-icons/fi";
import { HiOutlineBuildingLibrary } from "react-icons/hi2";
import { IoTrailSignOutline } from "react-icons/io5";
import { LuInbox, LuNotebookText } from "react-icons/lu";
import { MdOutlineLockPerson } from "react-icons/md";
import { RiBuilding4Line } from "react-icons/ri";
import { TbUserEdit } from "react-icons/tb";
import { TfiLocationPin } from "react-icons/tfi";
import { useSelector } from "react-redux";

interface Data {
  id: number;
  menuName: string;
  menuController: string;
  menuFunction: string;
  menuIcon: string;
  isActive: boolean;
  dataTarget: string;
  submenu: any;
}

interface SubmenuData {
  id: number;
  submenuName: string;
  submenuFunction: string;
}

const Sidebar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [listMenu, setListMenu] = useState<any>();
  const { data }: any = useSession();
  const expanded = useSelector((state: any) => state.sidebarToggle.data);

  const icon: any = {
    dashboard: <AiOutlineDashboard size={20} />,
    FaRegEdit: <FaRegEdit size={20} />,
    GoArchive: <FiArchive size={20} />,
    TbBuilding: <RiBuilding4Line size={20} />,
    FaRegBookmark: <FiBookmark size={20} />,
    FaRegFileAlt: <FiFileText size={20} />,
    GoInbox: <LuInbox size={20} />,
    LuNotebookText: <LuNotebookText size={20} />,
    IoTrailSignOutline: <IoTrailSignOutline size={20} />,
    TfiLocationPin: <TfiLocationPin size={20} />,
    HiOutlineBuildingLibrary: <HiOutlineBuildingLibrary size={20} />,
    FiUsers: <FiUsers size={20} />,
    TbUserEdit: <TbUserEdit size={20} />,
    MdOutlineLockPerson: <MdOutlineLockPerson size={20} />,
  };

  function createData(
    id: number,
    menuName: string,
    menuController: string,
    menuFunction: string,
    menuIcon: string,
    isActive: boolean,
    dataTarget: string,
    submenu: any
  ): Data {
    return {
      id,
      menuName,
      menuController,
      menuFunction,
      menuIcon,
      isActive,
      dataTarget,
      submenu,
    };
  }

  function createSubmenuData(
    id: number,
    submenuName: string,
    submenuFunction: string
  ): SubmenuData {
    return {
      id,
      submenuName,
      submenuFunction,
    };
  }

  const getMenu = async () => {
    try {
      const response = await fetch(`/api/menu/${data?.user.usertypeId}`, {
        method: "GET",
      });

      if (!response.ok) {
        setListMenu([]);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Oops, we haven't got JSON!");
      }

      const responseJson = await response.json();

      if (responseJson.status === false) {
        setListMenu([]);
      } else if (responseJson.data?.length > 0) {
        const result = responseJson.data.map((data: any) => {
          const submenu = data.submenu.map((submenu: any) => {
            return createSubmenuData(
              submenu.id_submenu,
              submenu.submenu_name,
              submenu.submenu_function
            );
          });

          return createData(
            data.id_menu,
            data.menu_name,
            data.menu_controller,
            data.menu_function,
            data.menu_icon,
            data.is_active,
            data.menu_controller,
            submenu
          );
        });

        setListMenu(result);
        localStorage.setItem(`menuFeatures_${data?.user.usertypeId}`, JSON.stringify(result));
      } else {
        setListMenu([]);
      }
    } catch (err) {
      setListMenu([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkMenu = async () => {
    if (!data?.user?.usertypeId) {
      setListMenu([]);
      setIsLoading(false);
      return;
    }

    const menuFeatures = localStorage.getItem(`menuFeatures_${data?.user.usertypeId}`);

    if (menuFeatures === "undefined" || menuFeatures === null) {
      await getMenu();
    } else {
      setListMenu(JSON.parse(menuFeatures));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

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
        className={`pt-0 pb-2 px-3 text-xs text-gray-400 text-left font-weight-semibold uppercase tracking-widest ${expanded ? "" : "hidden"
          }`}
      >
        Features
      </div>
      {listMenu?.map(
        (
          {
            menuName,
            menuController,
            menuFunction,
            menuIcon,
            isActive,
            dataTarget,
            submenu,
          }: any,
          index: number
        ) => {
          return isActive ? (
            submenu.length > 0 ? (
              <SidebarItemCollapseComponent
                key={index}
                icon={icon[menuIcon]}
                text={menuName}
                dataTarget={dataTarget}
                submenu={submenu}
                menuController={menuController}
              />
            ) : (
              <SidebarItemSingleComponent
                key={index}
                icon={icon[menuIcon]}
                text={menuName}
                menuController={menuController}
                menuFunction={menuFunction}
              />
            )
          ) : null;
        }
      )}
      <hr className="my-3 border-gray-100" />
      <div
        className={`pt-0 pb-2 px-3 text-xs text-gray-400 text-left font-weight-semibold uppercase tracking-widest ${expanded ? "" : "hidden"
          }`}
      >
        Settings
      </div>
      {menuSettingItem.map(
        (
          {
            menuName,
            menuController,
            menuFunction,
            menuIcon,
            isActive,
            dataTarget,
            submenu,
          }: any,
          index: number
        ) => {
          return isActive ? (
            submenu.length > 0 ? (
              data?.user.usertypeId == 5 ||
                data?.user.usertypeId == 1 ||
                data?.user.usertypeId == 2 ? (
                <SidebarItemCollapseComponent
                  key={index}
                  icon={icon[menuIcon]}
                  text={menuName}
                  dataTarget={dataTarget}
                  submenu={submenu}
                  menuController={menuController}
                />
              ) : null
            ) : (
              <SidebarItemSingleComponent
                key={index}
                icon={icon[menuIcon]}
                text={menuName}
                menuController={menuController}
                menuFunction={menuFunction}
              />
            )
          ) : null;
        }
      )}
    </SidebarElement>
  );
};

export default Sidebar;

