/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
import { setAlertMessage } from "@/lib/redux/actions/alertMessageSlice";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import TableComponent from "@/views/components/atoms/TableComponent";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { getKeteranganMeta } from "@/utils/arsip";

interface Data {
  id: number;
  no_arsip: string;
  arsip_name: string;
  instansi_id: number;
  instansi_name: string;
  deskripsi_arsip: string;
  masa_retensi: string;
  status_file_id: number;
  status_file: React.JSX.Element;
  status_retensi: React.JSX.Element;
  keterangan_id: number;
  keterangan: string;
  created_at: string;
  created_by: string;
  user_name: string;
  user_id: number;
}

interface Column {
  id:
    | "no_arsip"
    | "arsip_name"
    | "is_available"
    | "status_file"
    | "status_retensi"
    | "masa_retensi"
    | "keterangan"
    | "action";
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
  actionButton?: any;
}

const RecyclebinArsip = () => {
  const { data }: any = useSession();
  const [rows, setRows] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const alertMessage = useSelector((state: any) => state.alertMessage?.data);
  const [lastDoc, setLastDoc] = useState([]);
  const [arrData, setArrData] = useState([]);
  const [isLoadingFetchMore, setIsLoadingFetchMore] = useState(false);

  // Set notifikasi
  useEffect(() => {
    if (alertMessage) {
      if (alertMessage.status === true) {
        toast.success(alertMessage.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        dispatch(setAlertMessage({}));
      } else if (alertMessage.status === false) {
        toast.error(alertMessage.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        dispatch(setAlertMessage({}));
      }
    }
  }, [dispatch, alertMessage]);

  // set columns table
  const columns: readonly Column[] = [
    { id: "no_arsip", label: "No. Arsip", minWidth: 100 },
    { id: "arsip_name", label: "Nama Arsip", minWidth: 150 },
    { id: "status_file", label: "Status Akses", minWidth: 100 },
    { id: "status_retensi", label: "Status Retensi", minWidth: 100 },
    { id: "keterangan", label: "Keterangan", minWidth: 100 },
    {
      id: "action",
      label: "Action",
      minWidth: 50,
      align: "right",
      actionButton: [
        {
          id: "restore",
          title: "Restore",
          icon: "restore",
          action: async (id: string) => handleRestore(id),
        },
        {
          id: "forceDelete",
          title: "Hapus Permanen",
          icon: "forceDelete",
          action: (id: string) => handleForceDelete(id),
        },
      ],
    },
  ];

  // Set struktur data arsip
  function createData(
    id_arsip: number,
    no_arsip: string,
    arsip_name: string,
    instansi_id: number,
    instansi_name: string,
    deskripsi_arsip: string,
    masa_retensi: string,
    status_file_id: number,
    status_file: React.JSX.Element,
    status_retensi: React.JSX.Element,
    keterangan_id: number,
    keterangan: string,
    created_at: string,
    created_by: string,
    user_name: string,
    user_id: number,
  ): Data {
    return {
      id: id_arsip,
      no_arsip,
      arsip_name,
      instansi_id,
      instansi_name,
      deskripsi_arsip,
      masa_retensi,
      status_file_id,
      status_file,
      status_retensi,
      keterangan_id,
      keterangan,
      created_at,
      created_by,
      user_name,
      user_id,
    };
  }

  const getStatusAccessBadge = (statusFile: number) =>
    statusFile == 1 ? (
      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Private
      </span>
    ) : (
      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
        Public
      </span>
    );

  const formatMasaRetensi = (value?: string) => {
    if (!value) return "-";

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "-";

    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const date = parsedDate.getDate();
    const month = months[parsedDate.getMonth()];
    const year = parsedDate.getFullYear();

    return `${date} ${month} ${year}`;
  };

  // Get data for recycle bin table
  const getData = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      try {
        const response = await fetch(`/api/arsip/recyclebin`, {
          method: "GET",
          cache: "no-store",
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
          setRows([]);
          setIsLoading(false);
          return;
        }

        if (responseJson.data && responseJson.data.length > 0) {
          const result = responseJson.data.map((data: any) => {
            const statusAccess = getStatusAccessBadge(data.status_file);

            // Status retensi
            let statusRetensi: React.JSX.Element;
            if (data.status_retensi == true) {
              statusRetensi = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
                  Active
                </span>
              );
            } else {
              statusRetensi = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-red-500 text-red-500">
                  Inactive
                </span>
              );
            }

            // Keterangan
            const keteranganMeta = getKeteranganMeta(data.keterangan);
            const keterangan = keteranganMeta.label;
            const keteranganId = keteranganMeta.id;

            // Created At
            let created_at: Date;
            let createdAt: string = "";
            if (data.created_at) {
              created_at = new Date(data.created_at);
              const months = [
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ];

              const year = created_at.getFullYear();
              const month = months[created_at.getMonth()];
              const date = created_at.getDate();

              createdAt = date + " " + month + " " + year;
            }

            return createData(
              data.id_arsip,
              data.no_arsip,
              data.arsip_name,
              data.instansi_id,
              data.instansi_name,
              data.deskripsi_arsip,
              formatMasaRetensi(data.masa_retensi),
              data.status_file,
              statusAccess,
              statusRetensi,
              keteranganId,
              keterangan,
              createdAt,
              data.created_by,
              data.user_name,
              data.user_id,
            );
          });
          const finalResult = result.sort((a: any, b: any) => b.id - a.id);
          setRows(finalResult);
          setLastDoc(responseJson.cursor);
        } else if (responseJson.data && responseJson.data.length == 0) {
          setRows([]);
        }
        setIsLoading(false);
      } catch {
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
        setRows([]);
        setIsLoading(false);
      }
    }
  };

  // First Rendering
  useEffect(() => {
    getData();
    setArrData([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

  // Handle Delete
  const handleForceDelete = async (id: any) => {
    Swal.fire({
      title: "Apakah anda yakin?",
      text: "Data ini akan dihapus permanen beserta file-nya!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Delete file from Firebase Storage
        const deletedArsipFile = await fetch(
          `../api/arsip-files/delete/${id}`,
          {
            method: "DELETE",
          },
        );
        const deletedArsipFileJson = await deletedArsipFile
          .json()
          .catch(() => null);

        // Forcedelete Data
        const response = await fetch(`../api/arsip/force-delete/${id}`, {
          method: "DELETE",
        });
        const responseJson = await response.json().catch(() => null);

        if (
          response.ok &&
          responseJson?.status !== false &&
          deletedArsipFile.ok &&
          deletedArsipFileJson?.status !== false
        ) {
          toast.success(
            responseJson?.message || "Data arsip berhasil di hapus Permanen",
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            },
          );

          setRows((currentRows: any) =>
            Array.isArray(currentRows)
              ? currentRows.filter((row: any) => row.id !== Number(id))
              : currentRows,
          );
          getData();
        } else {
          toast.error(
            responseJson?.message || "Data arsip gagal di hapus permanen",
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            },
          );
        }
      }
    });
  };

  // Handle Restore
  const handleRestore = async (id: any) => {
    const response = await fetch(`/api/arsip/restore/${id}`, {
      method: "PATCH",
    });
    const responseJson = await response.json().catch(() => null);

    if (response.ok && responseJson?.status !== false) {
      toast.success(
        responseJson?.message || "Data arsip berhasil di kembalikan",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        },
      );

      setRows((currentRows: any) =>
        Array.isArray(currentRows)
          ? currentRows.filter((row: any) => row.id !== Number(id))
          : currentRows,
      );
      getData();
    } else {
      toast.error(responseJson?.message || "Data arsip gagal di kembalikan", {
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

  // Fetch more data when scroll to bottom
  const fetchMoreData = async () => {
    let moreData: any = arrData;
    if (lastDoc && moreData.includes(lastDoc) == false) {
      setIsLoadingFetchMore(true);
      moreData.push(lastDoc);
      setArrData(moreData);

      try {
        const result = await fetch(
          `../../api/arsip/recyclebin/fetchmore/${lastDoc}`,
          {
            method: "GET",
          },
        );
        const resultJson: any = await result.json();

        if (resultJson.status === false) {
          toast.error(resultJson.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setRows([]);
        }

        if (resultJson.data.length > 0 && resultJson.cursor != 0) {
          const result = resultJson.data.map((data: any) => {
            const statusAccess = getStatusAccessBadge(data.status_file);

            // Status retensi
            let statusRetensi: React.JSX.Element;
            if (data.status_retensi == true) {
              statusRetensi = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
                  Active
                </span>
              );
            } else {
              statusRetensi = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-red-500 text-red-500">
                  Inactive
                </span>
              );
            }

            // Keterangan
            const keteranganMeta = getKeteranganMeta(data.keterangan);
            const keterangan = keteranganMeta.label;
            const keteranganId = keteranganMeta.id;

            // Created At
            let created_at: Date;
            let createdAt: string = "";
            if (data.created_at) {
              created_at = new Date(data.created_at);
              const months = [
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ];

              const year = created_at.getFullYear();
              const month = months[created_at.getMonth()];
              const date = created_at.getDate();

              createdAt = date + " " + month + " " + year;
            }

            return createData(
              data.id_arsip,
              data.no_arsip,
              data.arsip_name,
              data.instansi_id,
              data.instansi_name,
              data.deskripsi_arsip,
              formatMasaRetensi(data.masa_retensi),
              data.status_file,
              statusAccess,
              statusRetensi,
              keteranganId,
              keterangan,
              createdAt,
              data.created_by,
              data.user_name,
              data.user_id,
            );
          });
          const finalResult = result.sort((a: any, b: any) => b.id - a.id);

          setRows((rows: any) => [...rows, ...finalResult]);
          setLastDoc(resultJson.cursor);
        }
      } catch (error: any) {
        toast.error("Internal server error. Error: " + error.message, {
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
      setIsLoadingFetchMore(false);
    }
  };

  const handleScroll = async (scroll: any) => {
    if (scroll.current) {
      let triggerHeight =
        scroll.current.scrollTop + scroll.current.offsetHeight;
      if (triggerHeight >= scroll.current.scrollHeight) {
        fetchMoreData();
      }
    }
  };

  return (
    <>
      {/* Toast */}
      <ToastContainer />
      {/* Row */}
      <div className="flex flex-wrap mt-0 mb-3 mx-0">
        {isLoading == false ? (
          <div className="flex-2 w-full max-w-full px-0 mt-0">
            <div className="w-full bg-white shadow-sm border border-gray-100 rounded-md h-full flex flex-col p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h6 className="text-[#6777ef] leading-tight font-medium">
                  Recycle Bin
                </h6>
              </div>
              <div className="w-full dark:[&_thead]:bg-white! dark:[&_th]:text-gray-500! dark:[&_td]:text-gray-800! dark:[&_table]:divide-gray-200! dark:[&_tbody]:divide-gray-200! dark:[&_button]:shadow-none!">
                <TableComponent
                  data={rows}
                  columns={columns}
                  dataSession={data.user}
                  handleScroll={(e: any) => handleScroll(e)}
                  isLoadingFetchMore={isLoadingFetchMore}
                  emptyMessage="Tidak ada arsip yang dihapus"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-100 flex justify-center items-center">
            <SpinLoadingComponent />
          </div>
        )}
      </div>
    </>
  );
};

export default RecyclebinArsip;
