import React from "react";
import SpinLoadingComponent from "../SpinLoadingComponent";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase/init";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

type FrontDetailComponentProps = {
  row: any;
  isLoading: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PRIVATE_STATUS_FILE = 1;
const PUBLIC_STATUS_FILE = 2;
const PRIVILEGED_USER_TYPES = [1, 2, 3, 5];

const FileIcon = () => (
  <svg
    className="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    className="shrink-0 size-4"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m8 12 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M12 16V4M19 17v.6c0 1.33-1.07 2.4-2.4 2.4H7.4C6.07 20 5 18.93 5 17.6V17"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
  </svg>
);

const FrontDetailComponent = ({
  row,
  isLoading,
}: FrontDetailComponentProps) => {
  const { data }: any = useSession();
  const statusFileId = Number(row?.status_file_id);
  const usertypeId = Number(data?.user?.usertypeId);
  const userId = Number(data?.user?.id);
  const isPrivilegedUser = PRIVILEGED_USER_TYPES.includes(usertypeId);
  const isOwner = Number(row?.user_id) === userId;
  const canViewFiles =
    statusFileId === PUBLIC_STATUS_FILE || isPrivilegedUser || isOwner;

  const relationParts = [
    row?.instansi_name ? `Instansi : ${row.instansi_name}` : null,
  ].filter(Boolean);

  const handleDownloadFile = async (fileName: string, instansiName: string) => {
    try {
      const fileRef = ref(
        storage,
        `EduArsipStandart/ArchieveFiles/${instansiName}/${fileName}`,
      );
      const url = await getDownloadURL(fileRef);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      toast.error("Gagal mengunduh file: " + error.message, {
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
  };

  const renderFiles = () => {
    if (!canViewFiles) {
      return (
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          File arsip bersifat private. Metadata tetap dapat dilihat, tetapi file
          tidak tersedia untuk dilihat atau diunduh.
        </div>
      );
    }

    if (!Array.isArray(row?.arsip_files) || row.arsip_files.length === 0) {
      return null;
    }

    return (
      <div className="mt-8">
        {row.arsip_files.map((item: any) => (
          <div
            key={item.id}
            className="p-2 pl-3 bg-white border border-solid border-gray-300 rounded-xl w-full mt-3"
          >
            <div className="mb-0 flex justify-between items-center">
              <div className="flex items-center gap-x-3 min-w-0">
                <span className="size-8 flex justify-center items-center border border-gray-200 text-gray-500 rounded-lg p-0.5 shrink-0">
                  <FileIcon />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.file_upload}
                  </p>
                  <p className="text-xs text-gray-500">
                    {`by ${item.created_by}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-blue-500 hover:text-blue-600 focus:outline-hidden shrink-0"
                onClick={() =>
                  handleDownloadFile(item.file_upload, row.instansi_name)
                }
                aria-label={`Download ${item.file_upload}`}
              >
                <DownloadIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return isLoading == false ? (
    <div className="space-y-4 h-auto overflow-x-auto overflow-hidden">
      <div className="group relative flex gap-x-5">
        <div className="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:inset-s-3 after:w-px after:-translate-x-[0.5px] after:bg-gray-200">
          <div className="relative z-10 size-6 flex justify-center items-center">
            <svg
              className="shrink-0 size-6 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              height="40px"
              viewBox="0 -960 960 960"
              width="40px"
              fill="#4b5563"
            >
              <path d="M186.67-120q-27.5 0-47.09-19.58Q120-159.17 120-186.67v-586.66q0-27.5 19.58-47.09Q159.17-840 186.67-840h192.66q7.67-35.33 35.84-57.67Q443.33-920 480-920t64.83 22.33Q573-875.33 580.67-840h192.66q27.5 0 47.09 19.58Q840-800.83 840-773.33v586.66q0 27.5-19.58 47.09Q800.83-120 773.33-120H186.67Zm0-66.67h586.66v-586.66H186.67v586.66ZM280-280h275.33v-66.67H280V-280Zm0-166.67h400v-66.66H280v66.66Zm0-166.66h400V-680H280v66.67Zm200-181.34q13.67 0 23.5-9.83t9.83-23.5q0-13.67-9.83-23.5t-23.5-9.83q-13.67 0-23.5 9.83t-9.83 23.5q0 13.67 9.83 23.5t23.5 9.83Zm-293.33 608v-586.66 586.66Z" />
            </svg>
          </div>
        </div>

        <div className="grow pb-8 group-last:pb-0">
          <h3 className="mb-1 text-xs text-gray-600">{row.no_arsip}</h3>
          <p className="font-semibold text-sm text-gray-800">
            {row.arsip_name}
          </p>
          <p className="mt-1 text-sm text-gray-600">{row.deskripsi_arsip}</p>
          <ul className="list-disc ms-6 mt-3 space-y-1.5">
            {relationParts.length > 0 ? (
              <li className="ps-1 text-sm text-gray-600">
                {relationParts.join(" | ")}
              </li>
            ) : null}
            {row?.masa_retensi ? (
              <li className="ps-1 text-sm text-gray-600">
                {`Masa Retensi : ${row.masa_retensi}`}
              </li>
            ) : null}
            {row?.created_by ? (
              <li className="ps-1 text-sm text-gray-600">
                {`Dibuat oleh : ${row.created_by}`}
              </li>
            ) : null}
            {row?.created_at ? (
              <li className="ps-1 text-sm text-gray-600">
                {`Dibuat pada : ${row.created_at}`}
              </li>
            ) : null}
          </ul>

          {renderFiles()}
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full h-100 flex justify-center items-center">
      <SpinLoadingComponent />
    </div>
  );
};

export default FrontDetailComponent;
