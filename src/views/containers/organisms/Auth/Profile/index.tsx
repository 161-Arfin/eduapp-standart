import CardContainerComponent from "@/views/components/atoms/CardContainerComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import defaultAvatar from "../../../../../../public/assets/images/avatars/default-photo.jpeg";
import Link from "next/link";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dataUser, setDataUser] = useState<any>({});
  const { data }: any = useSession();

  const getUser = async () => {
    if (data?.user.id != undefined) {
      try {
        const response = await fetch(`/api/user/update-profile`, {
          method: "GET",
        });
        const responseJson = await response.json();

        if (responseJson.status === false) {
          toast.error("Internal server error", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setDataUser({});
        }

        if (responseJson.status === true) {
          setDataUser(responseJson.data);
        }
        setIsLoading(false);
      } catch (error: any) {
        toast.error("Internal server error. " + error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };

  useEffect(() => {
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

  const profileCompany =
    dataUser.instansiName ||
    dataUser.instansi_name ||
    data?.user?.instansiName ||
    "-";
  const avatarSrc =
    dataUser?.photoProfileUrl || dataUser?.photo_thumb || defaultAvatar;

  return (
    <>
      {/* Toast */}
      <ToastContainer />
      {/* Row */}
      <div className="flex flex-col mt-0 mb-3 mx-0">
        {isLoading == false ? (
          <>
            <div className="flex-2 w-full max-w-full px-0 mt-0">
              {/* Card */}
              <CardContainerComponent actionButtonCard={() => null}>
                {/* Col */}
                <div className="flex-2 w-full max-w-full px-0 mt-0">
                  <div className="flex items-start gap-x-4">
                    <div className="shrink-0">
                      <Image
                        className="shrink-0 size-15 rounded-full object-cover"
                        src={avatarSrc}
                        alt="Avatar"
                        width={150}
                        height={150}
                      />
                    </div>
                    <div className="grow pt-1">
                      <div className="flex items-center gap-x-3">
                        <h1 className="text-[1.05rem] font-medium leading-tight text-gray-800">
                          {dataUser.fullName || dataUser.name || data?.user?.name || "-"}
                        </h1>
                        <div className="flex items-center">
                          <FaCircle
                            size={7}
                            style={
                              (dataUser.isActive ?? dataUser.is_active)
                                ? {
                                    marginRight: "0.25rem",
                                    color: "green",
                                    opacity: "0.5",
                                  }
                                : {
                                    marginRight: "0.25rem",
                                    color: "red",
                                    opacity: "0.4",
                                  }
                            }
                          />
                          <p className="text-xs font-normal text-gray-400">
                            {(dataUser.isActive ?? dataUser.is_active)
                              ? "Active"
                              : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {data?.user.usertypeName || "-"} | {profileCompany}
                      </p>
                    </div>
                    <Link
                      href={`/update-profile`}
                      className="flex size-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                    >
                      <svg
                        className="shrink-0 size-5"
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 -960 960 960"
                        width="24"
                        fill="#1f2937"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                      </svg>
                    </Link>
                  </div>
                  <div className="mt-6">
                    <ul className="flex flex-col gap-y-4">
                      <li className="flex items-center gap-x-2.5">
                        <svg
                          className="shrink-0 size-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <a
                          className="text-sm text-gray-600 underline decoration-gray-300 underline-offset-2 hover:text-gray-800"
                          href="#"
                        >
                          {dataUser.email || "-"}
                        </a>
                      </li>

                      <li className="flex items-center gap-x-2.5">
                        <FiPhone
                          className="shrink-0 text-slate-500"
                          size={16}
                        />
                        <a
                          className="text-sm text-gray-600 hover:text-gray-800"
                          href="#"
                        >
                          {dataUser.phone ? `+62 ${dataUser.phone}` : "-"}
                        </a>
                      </li>

                      <li className="flex items-center gap-x-2.5">
                        <svg
                          className="shrink-0 size-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          height="24"
                          viewBox="0 -960 960 960"
                          width="24"
                          fill="#4b5563"
                        >
                          <path d="M600-160v-80H440v-200h-80v80H80v-240h280v80h80v-200h160v-80h280v240H600v-80h-80v320h80v-80h280v240H600Zm80-80h120v-80H680v80ZM160-440h120v-80H160v80Zm520-200h120v-80H680v80Zm0 400v-80 80ZM280-440v-80 80Zm400-200v-80 80Z" />
                        </svg>
                        <a
                          className="text-sm text-gray-600 hover:text-gray-800"
                          href="#"
                        >
                          {profileCompany}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContainerComponent>
            </div>
            <div className="flex-2 w-full max-w-full px-0 mt-0">
              {/* Card */}
              <CardContainerComponent actionButtonCard={() => null}>
                {/* Col */}
                <div className="flex-2 w-full max-w-full px-0 mt-0">
                  <div className="space-y-5">
                    <dl className="flex flex-col gap-1 sm:flex-row sm:items-start">
                      <dt className="min-w-52">
                        <span className="block text-sm text-gray-500">
                          Username
                        </span>
                      </dt>
                      <dd>
                        <div className="me-1 inline-flex items-center text-sm font-medium text-gray-800">
                          {dataUser.username || "-"}
                        </div>
                      </dd>
                    </dl>
                    <dl className="flex flex-col gap-1 sm:flex-row sm:items-start">
                      <dt className="min-w-52">
                        <span className="block text-sm text-gray-500">
                          Alamat
                        </span>
                      </dt>
                      <dd>
                        <div className="me-1 inline-flex items-center text-sm font-medium text-gray-800">
                          {dataUser.address || "-"}
                        </div>
                      </dd>
                    </dl>
                    <dl className="flex flex-col gap-1 sm:flex-row sm:items-start">
                      <dt className="min-w-52">
                        <span className="block text-sm text-gray-500">
                          Jenis Kelamin
                        </span>
                      </dt>
                      <dd>
                        <div className="me-1 inline-flex items-center text-sm font-medium text-gray-800">
                          {dataUser.gender == 1
                            ? "Laki - laki"
                            : dataUser.gender == 2
                              ? "Perempuan"
                              : "-"}
                        </div>
                      </dd>
                    </dl>
                    <dl className="flex flex-col gap-1 sm:flex-row sm:items-start">
                      <dt className="min-w-52">
                        <span className="block text-sm text-gray-500">
                          Level User
                        </span>
                      </dt>
                      <dd>
                        <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
                          {data?.user.usertypeName}
                        </span>
                      </dd>
                    </dl>
                    <dl className="flex flex-col gap-1 sm:flex-row sm:items-start">
                      <dt className="min-w-52">
                        <span className="block text-sm text-gray-500">
                          Tanggal Bergabung
                        </span>
                      </dt>
                      <dd>
                        <div className="me-1 inline-flex items-center text-sm font-medium text-gray-800">
                          {dataUser.joinAt || dataUser.created_at || "-"}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContainerComponent>
            </div>
          </>
        ) : (
          <div className="w-full h-[400px] flex justify-center items-center">
            <SpinLoadingComponent />
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;


