import Head from "next/head";
import React, { useEffect } from "react";
// import icon from "../../../../../public/assets/images/company/only_logo_eduarsip_transparant.png";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setDropdownNavbar } from "@/lib/redux/actions/DropdownNavbarSlice";
import { setDropdownMenu } from "@/lib/redux/actions/DropdownMenuSlice";

type AppShellFrontProps = {
  title: string;
  children: React.ReactNode;
};

const AppShellFront = ({ title, children }: AppShellFrontProps) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: any) => state.darkModeToggle.data);
  const isShowModal = useSelector((state: any) => state.showModal.data);
  const keys = Object.keys(isShowModal);
  const expanded = useSelector((state: any) => state.sidebarToggle.data);

  useEffect(() => {
    if (isShowModal[keys[0]]) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowModal]);

  return (
    <>
      <Head>
        <title>{`EduArsip | ${title}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={title} />
        {/* <link rel="icon" href={icon.src} />
        <link rel="apple-touch-icon" href={icon.src} /> */}
      </Head>
      {children}
      {isShowModal[keys[0]] && (
        <div className="hs-overlay-backdrop transition duration fixed inset-0 bg-gray-900 opacity-50 z-40"></div>
      )}
    </>
  );
};

export default AppShellFront;
