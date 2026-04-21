import Head from "next/head";
import React, { useEffect } from "react";
import icon from "../../../../../public/assets/images/company/only_logo_eduarsip_transparant.png";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setDropdownNavbar } from "@/lib/redux/actions/DropdownNavbarSlice";
import { setDropdownMenu } from "@/lib/redux/actions/DropdownMenuSlice";

type AppShellProps = {
  title: string;
  children: React.ReactNode;
};

const AppShell = ({ title, children }: AppShellProps) => {
  const dispatch = useDispatch();
  const isShowModal = useSelector((state: any) => state.showModal.data);
  const keys = Object.keys(isShowModal);
  const expanded = useSelector((state: any) => state.sidebarToggle.data);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <>
      <Head>
        <title>{`EduArsip | ${title}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={title} />
        <link rel="icon" href={icon.src} />
        <link rel="apple-touch-icon" href={icon.src} />
      </Head>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div
          className={`w-full ${expanded ? "lg:w-[80%]" : "lg:w-[95%]"
            } md:w-[91%] h-screen flex flex-col overflow-hidden transition-all bg-gray-50`}
        >
          <Navbar title={title} />
          <div
            onClick={() => {
              dispatch(setDropdownNavbar(false));
              dispatch(setDropdownMenu({}));
            }}
            className="flex-1 min-h-0 w-full px-3 sm:px-8 pt-6 bg-gray-50 text-gray-600 overflow-x-hidden overflow-y-auto"
          >
            <div className="flex-4">{children}</div>
          </div>
        </div>
      </div>
      {isShowModal[keys[0]] && (
        <div className="hs-overlay-backdrop transition duration fixed inset-0 bg-gray-900 opacity-50 z-[79]"></div>
      )}
    </>
  );
};

export default AppShell;
