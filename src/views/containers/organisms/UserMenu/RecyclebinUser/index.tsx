import { storage } from "@/lib/firebase/init";
import { setAlertMessage } from "@/lib/redux/actions/alertMessageSlice";
import CardContainerComponent from "@/views/components/atoms/CardContainerComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import TableComponent from "@/views/components/atoms/TableComponent";
import { deleteObject, ref } from "firebase/storage";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";

interface Data {
  id: string;
  name: string;
  username: string;
  divisi_id: number;
  divisi_name: string;
  cabang_id: number;
  cabang_name: string;
  instansi_id: number;
  instansi_name: string;
  usertype_id: number;
  usertype: React.JSX.Element;
  is_active: React.JSX.Element;
  photo: string;
}

interface Column {
  id:
    | "name"
    | "username"
    | "divisi_name"
    | "cabang_name"
    | "instansi_name"
    | "usertype"
    | "is_active"
    | "action";
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
  actionButton?: any;
}

const RecyclebinUser = () => {
  const { data }: any = useSession();
  const [rows, setRows] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const alertMessage = useSelector((state: any) => state.alertMessage.data);
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
    { id: "name", label: "Nama", minWidth: 150 },
    { id: "username", label: "Username", minWidth: 100 },
    // { id: "divisi_name", label: "Divisi", minWidth: 100 },
    // { id: "cabang_name", label: "Cabang", minWidth: 100 },
    // { id: "instansi_name", label: "Instansi", minWidth: 100 },
    { id: "usertype", label: "Level User", minWidth: 150 },
    { id: "is_active", label: "Status", minWidth: 70 },
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

  // Set struktur data user
  function createData(
    id_users: string,
    name: string,
    username: string,
    divisi_id: number,
    divisi_name: string,
    cabang_id: number,
    cabang_name: string,
    instansi_id: number,
    instansi_name: string,
    usertype_id: number,
    usertype: React.JSX.Element,
    is_active: React.JSX.Element,
    photo: string,
  ): Data {
    return {
      id: id_users,
      name,
      username,
      divisi_id,
      divisi_name,
      cabang_id,
      cabang_name,
      instansi_id,
      instansi_name,
      usertype_id,
      usertype,
      is_active,
      photo,
    };
  }

  // Get data for recycle bin table
  const getData = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      try {
        const response = await fetch(`../../api/user/recyclebin`, {
          method: "GET",
          headers: {
            "auth-token": data?.user?.apiToken,
          },
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
        }

        if (responseJson.data && responseJson.data.length > 0) {
          const result = responseJson.data.map((data: any) => {
            let status: React.JSX.Element;
            if (data.is_active == true) {
              status = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
                  Aktif
                </span>
              );
            } else {
              status = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-red-500 text-red-500">
                  Tidak Aktif
                </span>
              );
            }

            // Level User Badge
            let usertypeName: React.JSX.Element = <></>;
            if (data.usertype_id == 1) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
                  Master Admin
                </span>
              );
            } else if (data.usertype_id == 2) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-500">
                  Super Admin
                </span>
              );
            } else if (data.usertype_id == 3) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500">
                  Administrator
                </span>
              );
            } else if (data.usertype_id == 4) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white">
                  Pegawai
                </span>
              );
            } else if (data.usertype_id == 5) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500">
                  Grand Admin
                </span>
              );
            }

            return createData(
              data.id_users,
              data.name,
              data.username,
              data.divisi_id,
              data.divisi_name,
              data.cabang_id,
              data.cabang_name,
              data.instansi_id,
              data.instansi_name,
              data.usertype_id,
              usertypeName,
              status,
              data.photo,
            );
          });
          const finalResult = result.sort((a: any, b: any) => b.id - a.id);
          setRows(finalResult);
          setLastDoc(responseJson.cursor);
        } else if (responseJson.data && responseJson.data.length == 0) {
          setRows([]);
        }
        setIsLoading(false);
      } catch (error: any) {
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
      text: "Data ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const dataSelected: any = rows.filter((data: any) => data.id === id);
        // Hapus image file
        if (dataSelected[0]?.photo && dataSelected[0].photo !== "noimage.jpg") {
          // Delete image
          const path = `eduarsip-app/photoProfile/${dataSelected[0].photo}`;

          const desertRef = ref(storage, path);
          deleteObject(desertRef);
        }

        // Forcedelete Data
        const response = await fetch(`../api/user/force-delete/${id}`, {
          method: "DELETE",
          headers: {
            "auth-token": data?.user?.apiToken,
          },
        });

        if (response.status === 200) {
          toast.success("Data user berhasil di hapus Permanen", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });

          getData();
        } else {
          toast.error("Data user gagal di hapus permanen", {
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
    });
  };

  // Handle Restore
  const handleRestore = async (id: any) => {
    const response = await fetch(`../api/user/restore/${id}`, {
      method: "PATCH",
      headers: {
        "auth-token": data?.user?.apiToken,
      },
    });

    if (response.status === 200) {
      toast.success("Data user berhasil di kembalikan", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      getData();
    } else {
      toast.error("Data user gagal di kembalikan", {
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
          `../../api/user/recyclebin/fetchmore/${lastDoc}`,
          {
            method: "GET",
            headers: {
              "auth-token": data?.user?.apiToken,
            },
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
            let status: React.JSX.Element;
            if (data.is_active == true) {
              status = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
                  Aktif
                </span>
              );
            } else {
              status = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-red-500 text-red-500">
                  Tidak Aktif
                </span>
              );
            }

            // Level User Badge
            let usertypeName: React.JSX.Element = <></>;
            if (data.usertype_id == 1) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
                  Master Admin
                </span>
              );
            } else if (data.usertype_id == 2) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-500">
                  Super Admin
                </span>
              );
            } else if (data.usertype_id == 3) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500">
                  Administrator
                </span>
              );
            } else if (data.usertype_id == 4) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white">
                  Pegawai
                </span>
              );
            } else if (data.usertype_id == 5) {
              usertypeName = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500">
                  Grand Admin
                </span>
              );
            }

            return createData(
              data.id_users,
              data.name,
              data.username,
              data.divisi_id,
              data.divisi_name,
              data.cabang_id,
              data.cabang_name,
              data.instansi_id,
              data.instansi_name,
              data.usertype_id,
              usertypeName,
              status,
              data.photo,
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
            {/* Card */}
            <CardContainerComponent
              title="Recycle Bin"
              actionButtonCard={() => null}
            >
              {/* Col */}
              <div className="flex-2 w-full max-w-full px-0 mt-0">
                {/* Content */}
                <TableComponent
                  data={rows}
                  columns={columns}
                  handleScroll={(e: any) => handleScroll(e)}
                  isLoadingFetchMore={isLoadingFetchMore}
                />
              </div>
            </CardContainerComponent>
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

export default RecyclebinUser;
