import CardDashboardComponent from "@/views/components/atoms/CardDashboardComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import Image from "next/image";
import React, { useState } from "react";
import { AiFillDatabase } from "react-icons/ai";
import { CiCircleAlert } from "react-icons/ci";
import { FaRegEdit, FaRegUserCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import heroImage from "../../../../../public/assets/images/landscape-logo.png";
import {
  FiArchive,
  FiBookmark,
  FiCheckCircle,
  FiFileText,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { RiBuilding4Line } from "react-icons/ri";
import { LuInbox, LuNotebookText } from "react-icons/lu";
import { IoTrailSignOutline } from "react-icons/io5";
import { TfiLocationPin, TfiMenuAlt } from "react-icons/tfi";
import { HiOutlineBuildingLibrary } from "react-icons/hi2";
import { TbUserShield } from "react-icons/tb";
import CounterDashboard from "@/views/components/molecules/CounterDashboard";
import { useSession } from "next-auth/react";

const DashboardContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useSession();

  const icon: any = {
    database: <AiFillDatabase className="text-[#00a65a] font-black text-3xl" />,
    FaRegEdit: <FaRegEdit className="text-blue-600 font-black text-3xl" />,
    FiArchive: <FiArchive className="text-[#d81b60] font-black text-3xl" />,
    FiCheckCircle: (
      <FiCheckCircle className="text-green-600 font-black text-3xl" />
    ),
    FiXCircle: <FiXCircle className="text-red-600 font-black text-3xl" />,

    TbBuilding: (
      <RiBuilding4Line className="text-[#00a65a] font-black text-3xl" />
    ),
    GoInbox: <LuInbox className="text-teal-600 font-black text-3xl" />,
    LuNotebookText: (
      <LuNotebookText className="text-teal-600 font-black text-3xl" />
    ),
    FiUsers: <FiUsers className="text-red-600 font-black text-3xl" />,
    TfiMenuAlt: <TfiMenuAlt className="text-orange-600 font-black text-3xl" />,
    TbUserShield: (
      <TbUserShield className="text-yellow-600 font-black text-3xl" />
    ),
  };

  return (
    <>
      {/* Toast */}
      <ToastContainer />
      {/* Row */}
      <div className="flex flex-wrap mt-0 mb-3 mx-0">
        {isLoading == false ? (
          <div className="flex-2 w-full max-w-full px-0 mt-0">
            {/* Row */}
            <div className="flex flex-wrap mb-3">
              {/* Col */}
              <div className="mb-3 w-full flex-2 px-0">
                <div className="block border border-gray-200 rounded-lg hover:shadow-2xs focus:outline-hidden bg-white">
                  <div className="relative flex items-center overflow-hidden">
                    <div className="grow p-8 ms-0 sm:ms-0">
                      <div className="min-h-24 flex flex-col justify-center">
                        <h3 className="font-semibold text-sm text-gray-800">
                          Halo, {data?.user?.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Selamat Datang di Halaman Dashboard Sistem EduArsip!
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Saat ini Anda sedang login dan dapat mengelola data
                          yang ada pada EduArsip.
                        </p>
                        <hr className="my-3 border-gray-100" />
                        <p className="mt-1 text-xs text-gray-400 font-medium">
                          <CiCircleAlert className="h-5 w-5 inline-block text-red-500 mr-1" />
                          Harap Menggunakan Aplikasi Ini Sebijak Mungkin Karena
                          Tindakan Yang Anda Lakukan Akan Tercatat Oleh Sistem.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Row */}
            <CounterDashboard icon={icon} />
          </div>
        ) : (
          <div className="w-full h-[400px] flex justify-center items-center">
            <SpinLoadingComponent />
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardContent;
