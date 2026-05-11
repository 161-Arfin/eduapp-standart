import { storage } from "@/lib/firebase/init";
import { setShowModal } from "@/lib/redux/actions/ShowModalSlice";
import { setAlertMessage } from "@/lib/redux/actions/alertMessageSlice";
import {
  genderOption,
  phoneRegExp,
  usernameRegExp,
  usertypeOption,
} from "@/utils/data/static";
import ButtonComponent from "@/views/components/atoms/ButtonComponent";
import CardContainerComponent from "@/views/components/atoms/CardContainerComponent";
import DatepickerComponent from "@/views/components/atoms/DatepickerComponent";
import FileInputComponent from "@/views/components/atoms/FileInputComponent";
import ModalComponent from "@/views/components/atoms/ModalComponent";
import SelectComponent from "@/views/components/atoms/SelectComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import TableComponent from "@/views/components/atoms/TableComponent";
import TextInputComponent from "@/views/components/atoms/TextInputComponent";
import TextInputGroupComponent from "@/views/components/atoms/TextInputGroupComponent";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import Swal from "sweetalert2";

interface Data {
  id: string;
  name: string;
  gender: number;
  birthplace: string;
  birthdate: string;
  phone: string;
  address: string;
  username: string;
  email: string;
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
  photo_thumb: string;
}

interface DataOption {
  id: string;
  name: string;
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

const TableUser = () => {
  const { data }: any = useSession();
  const [rows, setRows] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const alertMessage = useSelector((state: any) => state.alertMessage.data);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [schemaValidationInstansi, setSchemaValidationInstansi] =
    useState<any>();
  const [schemaValidationCabang, setSchemaValidationCabang] = useState<any>();
  const [schemaValidationDivisi, setSchemaValidationDivisi] = useState<any>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [companyOption, setCompanyOption] = useState([]);
  const [cabangOption, setCabangOption] = useState<any>([]);
  const [divisiOption, setDivisiOption] = useState<any>([]);
  const [levelUserOption, setLevelUserOption] = useState<any>([]);
  const [genderSelected, setGenderSelected] = useState({});
  const [companySelected, setCompanySelected] = useState({});
  const [cabangSelected, setCabangSelected] = useState({});
  const [divisiSelected, setDivisiSelected] = useState({});
  const [usertypeSelected, setUsertypeSelected] = useState({});
  const isShowModal = useSelector((state: any) => state.showModal.data);
  const [lastDoc, setLastDoc] = useState([]);
  const [arrData, setArrData] = useState([]);
  const [isLoadingFetchMore, setIsLoadingFetchMore] = useState(false);

  function createDataOption(id: string, name: string): DataOption {
    return {
      id: id,
      name: name,
    };
  }

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
          id: "edit",
          title: "Edit",
          icon: "edit",
          action: async (id: string) => {
            await formik.resetForm();
            await setPreviewUrl(null);
            await setUsertypeSelected({});
            await getDetailById(id);
            await dispatch(setShowModal({ editUserModal: true }));
          },
        },
        {
          id: "delete",
          title: "Hapus",
          icon: "delete",
          action: (id: string) => handleDelete(id),
        },
      ],
    },
  ];

  // Set struktur data user
  function createData(
    id_users: string,
    name: string,
    gender: number,
    birthplace: string,
    birthdate: string,
    phone: string,
    address: string,
    username: string,
    email: string,
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
    photo_thumb: string,
  ): Data {
    return {
      id: id_users,
      name,
      gender,
      birthplace,
      birthdate,
      phone,
      address,
      username,
      email,
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
      photo_thumb,
    };
  }

  // Get Instansi Data Option
  const getDataInstansi = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      const response = await fetch(
        `../../api/company/${data.user.usertypeId}/${data.user.instansiId}`,
        {
          method: "GET",
          headers: {
            "auth-token": data.user.apiToken,
          },
        },
      );
      const responseJson = await response.json();

      if (responseJson.status === false) {
        toast.error("Internal server error: " + responseJson.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setCompanyOption([]);
      }

      if (responseJson.data && responseJson.data.length > 0) {
        const result = responseJson.data.map((data: any, index: number) => {
          return createDataOption(data.id_instansi, data.instansi_name);
        });
        const listOption: any = [
          { id: 0, name: "- Pilih Instansi -" },
          ...result,
        ];

        setCompanyOption(listOption);
      }
      setIsLoading(false);
    }
  };

  // Get Cabang Data Option
  const getDataCabang = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      let instansiId;
      if (data?.user.usertypeId == 5) {
        instansiId = formik.values.instansiId;
      } else if (data?.user.usertypeId == 1) {
        instansiId = data.user.instansiId;
      }

      const response = await fetch(`../../api/branch/bycompany/${instansiId}`, {
        method: "GET",
        headers: {
          "auth-token": data.user.apiToken,
        },
      });
      const responseJson = await response.json();

      if (responseJson.status === false) {
        toast.error("Internal server error: " + responseJson.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setCabangOption([]);
      }

      if (responseJson.data && responseJson.data.length > 0) {
        const result = responseJson.data.map((data: any, index: number) => {
          return createDataOption(data.id_cabang, data.cabang_name);
        });
        const listOption: any = [
          { id: 0, name: "- Pilih Cabang -" },
          ...result,
        ];

        setCabangOption(listOption);
      } else {
        setCabangOption([{ id: 0, name: "- Pilih Instansi Dulu -" }]);
      }
      setIsLoading(false);
    }
  };

  // Get Divisi Data Option
  const getDataDivisi = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      let cabangId;
      if (data?.user.usertypeId == 5 || data?.user.usertypeId == 1) {
        cabangId = formik.values.cabangId;
      } else if (data?.user.usertypeId == 2) {
        cabangId = data.user.cabangId;
      }

      const response = await fetch(`../../api/division/bybranch/${cabangId}`, {
        method: "GET",
        headers: {
          "auth-token": data.user.apiToken,
        },
      });
      const responseJson = await response.json();

      if (responseJson.status === false) {
        toast.error("Internal server error: " + responseJson.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setDivisiOption([]);
      }

      if (responseJson.data && responseJson.data.length > 0) {
        const result = responseJson.data.map((data: any, index: number) => {
          return createDataOption(data.id_divisi, data.divisi_name);
        });
        const listOption: any = [
          { id: 0, name: "- Pilih Divisi -" },
          ...result,
        ];

        setDivisiOption(listOption);
      } else {
        setDivisiOption([{ id: 0, name: "- Pilih Cabang Dulu -" }]);
      }
      setIsLoading(false);
    }
  };

  // Rendering awal auto fill
  useEffect(() => {
    if (divisiOption) {
      setDivisiSelected(
        divisiOption.filter(
          (item: any) => item.id == formik.values.divisiId,
        )[0],
      );
    }
    if (cabangOption) {
      setCabangSelected(
        cabangOption.filter(
          (item: any) => item.id == formik.values.cabangId,
        )[0],
      );
    }
    if (companyOption) {
      setCompanySelected(
        companyOption.filter(
          (item: any) => item.id == formik.values.instansiId,
        )[0],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisiOption, cabangOption, companyOption]);

  // Schema validation
  const schema = yup.object().shape({
    fullName: yup.string().required("Nama Lengkap harus diisi."),
    gender: yup.string().required("Jenis Kelamin harus diisi."),
    birthPlace: yup.string(),
    birthDate: yup.string(),
    phone: yup
      .string()
      .matches(phoneRegExp, "No telepon / HP tidak valid")
      .required("No telepon / HP harus diisi"),
    address: yup.string().required("Alamat lengkap harus diisi"),
    username: yup
      .string()
      .required("Username harus diisi")
      .matches(usernameRegExp, "Tanpa menggunakan spasi dan karakter khusus"),
    email: yup
      .string()
      .required("Email harus diisi")
      .email("Email tidak valid"),
    instansiId: schemaValidationInstansi,
    cabangId: schemaValidationCabang,
    divisiId: schemaValidationDivisi,
    usertypeId: yup.number().required("User type harus diisi"),
  });

  // Schema Validation Controling
  useEffect(() => {
    if (data?.user.usertypeId == 5) {
      setSchemaValidationInstansi(
        yup.string().required("Instansi harus diisi"),
      );
      setSchemaValidationCabang(yup.string().required("Cabang harus diisi"));
      setSchemaValidationDivisi(yup.string().required("Divisi harus diisi"));
    } else if (data?.user.usertypeId == 1) {
      setSchemaValidationInstansi(yup.string());
      setSchemaValidationCabang(yup.string().required("Cabang harus diisi"));
      setSchemaValidationDivisi(yup.string().required("Divisi harus diisi"));
    } else if (data?.user.usertypeId == 2) {
      setSchemaValidationInstansi(yup.string());
      setSchemaValidationCabang(yup.string());
      setSchemaValidationDivisi(yup.string().required("Divisi harus diisi"));
    } else {
      setSchemaValidationInstansi(yup.string().required());
      setSchemaValidationCabang(yup.string().required());
      setSchemaValidationDivisi(yup.string().required());
    }
  }, [data?.user.usertypeId]);

  // Handle formik
  const formik = useFormik<{
    id: string;
    fullName: string;
    gender?: number;
    birthPlace?: string;
    birthDate?: string;
    phone: string;
    address: string;
    username: string;
    email: string;
    instansiId: string;
    cabangId: string;
    divisiId: string;
    usertypeId?: string;
    photoProfile?: File;
    photoProfileName?: string;
    photoProfileUrl?: string;
  }>({
    initialValues: {
      id: "",
      fullName: "",
      phone: "",
      address: "",
      username: "",
      email: "",
      instansiId: "",
      cabangId: "",
      divisiId: "",
    },
    onSubmit: async (values: any) => {
      setIsSaveLoading(true);

      let instansiId: string = "";
      let cabangId: string = "";
      let divisiId: string = "";
      // Manajemen struktur instansi
      if (data?.user.usertypeId == 5) {
        instansiId = values.instansiId;
        cabangId = values.cabangId;
        divisiId = values.divisiId;
      } else if (data?.user.usertypeId == 1) {
        instansiId = data?.user.instansiId;
        cabangId = values.cabangId;
        divisiId = values.divisiId;
      } else if (data?.user.usertypeId == 2) {
        instansiId = data?.user.instansiId;
        cabangId = data?.user.cabangId;
        divisiId = values.divisiId;
      }

      // Deklarasi value
      const value = {
        name: values.fullName,
        gender: values.gender,
        birthplace: values.birthPlace,
        birthdate: values.birthDate,
        phone: values.phone,
        address: values.address,
        username: values.username,
        email: values.email,
        instansi_id: instansiId,
        cabang_id: cabangId,
        divisi_id: divisiId,
        usertype_id: values.usertypeId,
        data_access_id: [1, 2, 3, 4, 5],
        photo: values.photoProfileName,
        photo_thumb: values.photoProfileUrl,
      };

      // Ubah Foto Profile
      if (values.photoProfile) {
        // Deklarasi variabel untuk upload
        const photoProfile = `${values.username}-${Date.now()}`;
        // Nama baru di database
        value.photo = photoProfile;

        // Upload image to firebase
        const imageRef = await ref(
          storage,
          `eduarsip-app/photoProfile/${photoProfile}`,
        );

        // Hapus image lama
        if (values.photoProfileName !== "noimage.jpg") {
          // Delete image
          const path = `eduarsip-app/photoProfile/${values.photoProfileName}`;

          const desertRef = ref(storage, path);
          deleteObject(desertRef);
        }

        await uploadBytes(imageRef, values.photoProfile)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref)
              .then(async (url) => {
                // Tambahkan data
                value.photo_thumb = url;

                // Update User
                const result = await fetch(`../api/user/${values.id}`, {
                  method: "PATCH",
                  headers: {
                    "auth-token": data?.user?.apiToken,
                  },
                  body: JSON.stringify(value),
                });

                if (result.status === 200) {
                  toast.success("Data user berhasil disimpan", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                  });
                  dispatch(setShowModal({ editUserModal: false }));
                  setIsSaveLoading(false);
                  getData();
                } else {
                  toast.error("Data user gagal disimpan", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                  });
                  setIsSaveLoading(false);
                }
              })
              .catch((error) => {
                console.log(error.message);
              });
          })
          .catch((error) => {
            console.log(error.message);
          });
      } else {
        // Update user
        const result = await fetch(`../api/user/${values.id}`, {
          method: "PATCH",
          headers: {
            "auth-token": data?.user?.apiToken,
          },
          body: JSON.stringify(value),
        });

        if (result.status === 200) {
          toast.success("Data user berhasil disimpan", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          dispatch(setShowModal({ editUserModal: false }));
          setIsSaveLoading(false);
          getData();
        } else {
          toast.error("Data user gagal disimpan", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setIsSaveLoading(false);
        }
      }
    },
    validationSchema: schema,
  });

  // Get data for user table
  const getData = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      try {
        const response = await fetch(`../../api/user/${data.user.usertypeId}`, {
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
              data.gender,
              data.birthplace,
              data.birthdate,
              data.phone,
              data.address,
              data.username,
              data.email,
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
              data.photo_thumb,
            );
          });
          const finalResult = result.sort((a: any, b: any) => b.id - a.id);
          setRows(finalResult);
          setLastDoc(responseJson.cursor);
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

  // Get detail data selected
  const getDetailById = async (id: string) => {
    const filterResult: any = rows.filter((data: any) => data.id === id);

    if (filterResult.length > 0) {
      formik.setValues({
        id: filterResult[0].id,
        fullName: filterResult[0].name,
        gender: filterResult[0].gender,
        birthPlace: filterResult[0].birthplace || "",
        birthDate: filterResult[0].birthdate || "",
        phone: filterResult[0].phone,
        address: filterResult[0].address,
        username: filterResult[0].username,
        email: filterResult[0].email,
        instansiId: filterResult[0].instansi_id,
        cabangId: filterResult[0].cabang_id,
        divisiId: filterResult[0].divisi_id,
        usertypeId: filterResult[0].usertype_id,
        photoProfileName: filterResult[0].photo,
        photoProfileUrl: filterResult[0].photo_thumb,
      });
      setGenderSelected(
        genderOption.filter(
          (item: any) => item.id == filterResult[0].gender,
        )[0],
      );
      setUsertypeSelected(
        levelUserOption.filter(
          (item: any) => item.id == filterResult[0].usertype_id,
        )[0],
      );
    }
  };

  // First Rendering Instansi option
  useEffect(() => {
    if (data?.user.usertypeId == 5) {
      getDataInstansi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

  // First Rendering
  useEffect(() => {
    getData();
    setArrData([]); // Reset array data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

  // Dropdown reference by instansiId
  useEffect(() => {
    if (formik.values.instansiId != "0" && formik.values.instansiId != "") {
      getDataCabang();
    } else {
      setCabangOption([{ id: 0, name: "- Pilih instansi dulu -" }]);
    }
    setDivisiOption([{ id: 0, name: "- Pilih cabang dulu -" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.instansiId]);

  // Dropdown reference by cabangId
  useEffect(() => {
    if (formik.values.cabangId != "0" && formik.values.cabangId != "") {
      getDataDivisi();
    } else {
      setDivisiOption([{ id: 0, name: "- Pilih Cabang dulu -" }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.cabangId]);

  // Dropdown level user
  useEffect(() => {
    let levelUser: any = [];
    if (data?.user.usertypeId == 5) {
      levelUser = usertypeOption;
    } else if (data?.user.usertypeId == 1) {
      levelUser = usertypeOption.filter(
        (item: any) => item.id > 1 && item.id < 5,
      );
    } else if (data?.user.usertypeId == 2) {
      levelUser = usertypeOption.filter(
        (item: any) => item.id > 2 && item.id < 5,
      );
    }
    setLevelUserOption([
      { id: "0", name: "- Pilih Level User -" },
      ...levelUser,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user.usertypeId]);

  // Handle Delete
  const handleDelete = async (id: any) => {
    Swal.fire({
      title: "Apakah anda yakin?",
      text: "Data ini akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Softdelete Data
        const response = await fetch(`../api/user/softdelete/${id}`, {
          method: "DELETE",
          headers: {
            "auth-token": data?.user?.apiToken,
          },
        });

        if (response.status === 200) {
          toast.success("Data user berhasil di hapus", {
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
          toast.error("Data user gagal di hapus", {
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

  // Fetch more data when scroll to bottom
  const fetchMoreData = async () => {
    let moreData: any = arrData;
    if (lastDoc && moreData.includes(lastDoc) == false) {
      setIsLoadingFetchMore(true);
      moreData.push(lastDoc);
      setArrData(moreData);

      try {
        const result = await fetch(`../../api/user/fetchmore/${lastDoc}`, {
          method: "GET",
          headers: {
            "auth-token": data?.user?.apiToken,
          },
        });
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
              data.gender,
              data.birthplace,
              data.birthdate,
              data.phone,
              data.address,
              data.username,
              data.email,
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
              data.photo_thumb,
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
      {/* Detail Modal */}
      <ModalComponent title="Edit User" dataTarget="editUserModal">
        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          {/* Content */}
          <h6 className="text-[#6777ef] dark:text-indigo-300 leading-tight font-medium mx-5 mb-3">
            Personal
          </h6>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <TextInputComponent
                label="Nama"
                value={formik.values.fullName}
                handleChange={(e) =>
                  formik.setFieldValue("fullName", e.target.value)
                }
                isInvalid={!!formik.errors.fullName}
                errorMessage={formik.errors.fullName}
                isPriority
              />
            </div>
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <SelectComponent
                id="gender"
                label="Jenis Kelamin"
                options={genderOption}
                selectedValue={(e: any) => {
                  if (e.id != 0) {
                    formik.setFieldValue("gender", e.id);
                  } else {
                    formik.setFieldValue("gender", undefined);
                  }
                }}
                defaultValue={genderSelected}
                isInvalid={!!formik.errors.gender}
                errorMessage={formik.errors.gender}
                isPriority
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <TextInputComponent
                label="Tempat Lahir"
                value={formik.values.birthPlace || ""}
                handleChange={(e) =>
                  formik.setFieldValue("birthPlace", e.target.value)
                }
                isInvalid={!!formik.errors.birthPlace}
                errorMessage={formik.errors.birthPlace}
              />
            </div>
            {/* Col */}
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <DatepickerComponent
                label="Tanggal Lahir"
                name="birthDate"
                activeDateDefault={formik.values.birthDate || null}
                format="DD-MM-YYYY"
                formikOnChange={(newValue: any) => {
                  if (newValue) {
                    const date = new Date(newValue);
                    const valueDate = `${date.getFullYear()}-${
                      date.getMonth() + 1
                    }-${date.getDate()}`;
                    formik.setFieldValue("birthDate", valueDate);
                  } else if (newValue === null) {
                    formik.setFieldValue("birthDate", "");
                  }
                }}
                isInvalid={!!formik.errors.birthDate}
                errorMessage={formik.errors.birthDate}
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <TextInputGroupComponent
                label="No. Telepon"
                value={formik.values.phone}
                handleChange={(e) =>
                  formik.setFieldValue("phone", e.target.value)
                }
                isInvalid={!!formik.errors.phone}
                errorMessage={formik.errors.phone}
                isPriority
              />
            </div>
            {/* Col */}
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <TextInputComponent
                label="Alamat"
                value={formik.values.address}
                handleChange={(e) =>
                  formik.setFieldValue("address", e.target.value)
                }
                isInvalid={!!formik.errors.address}
                errorMessage={formik.errors.address}
                isPriority
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <FileInputComponent
                label="Foto Profil"
                name="photoProfile"
                onChange={(e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    formik.setFieldValue("photoProfile", file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                previewUrl={previewUrl}
                currentImage={formik.values.photoProfileUrl}
                value={previewUrl == null ? "" : undefined}
              />
            </div>
          </div>
          <hr className="my-3 dark:border-gray-700" />
          <h6 className="text-[#6777ef] dark:text-indigo-300 leading-tight font-medium mx-5 mb-3 mt-6">
            Authentication
          </h6>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <TextInputComponent
                label="Username"
                value={formik.values.username}
                handleChange={(e) =>
                  formik.setFieldValue("username", e.target.value)
                }
                isInvalid={!!formik.errors.username}
                errorMessage={formik.errors.username}
                isPriority
              />
            </div>
            {/* Col */}
            <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
              <TextInputComponent
                label="Email"
                value={formik.values.email}
                handleChange={(e) =>
                  formik.setFieldValue("email", e.target.value)
                }
                isInvalid={!!formik.errors.email}
                errorMessage={formik.errors.email}
                isPriority
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            {data?.user.usertypeId == 5 ? (
              <div className="mb-3 w-full md:w-1/3 flex-2 px-0 md:px-3">
                <SelectComponent
                  id="instansiId"
                  label="Instansi"
                  options={companyOption}
                  selectedValue={(e: any) => {
                    if (e.id != 0) {
                      formik.setFieldValue("instansiId", e.id);
                    } else {
                      formik.setFieldValue("instansiId", "");
                    }
                  }}
                  defaultValue={companySelected}
                  isInvalid={!!formik.errors.instansiId}
                  errorMessage={formik.errors.instansiId}
                  disabled={data?.user.usertypeId == 1 ? true : false}
                />
              </div>
            ) : null}
            {/* Col */}
            {data?.user.usertypeId == 5 || data?.user.usertypeId == 1 ? (
              <div
                className={`mb-3 w-full ${
                  data?.user.usertypeId == 5
                    ? "md:w-1/3"
                    : data?.user.usertypeId == 1
                      ? "md:w-1/2"
                      : ""
                } flex-2 px-0 md:px-3`}
              >
                <SelectComponent
                  id="cabangId"
                  label="Cabang"
                  options={cabangOption}
                  selectedValue={(e: any) => {
                    if (e.id != 0) {
                      formik.setFieldValue("cabangId", e.id);
                    } else {
                      formik.setFieldValue("cabangId", "");
                    }
                  }}
                  defaultValue={cabangSelected}
                  isInvalid={!!formik.errors.cabangId}
                  errorMessage={formik.errors.cabangId}
                  isPriority
                />
              </div>
            ) : null}
            {/* Col */}
            <div
              className={`mb-3 w-full ${
                data?.user.usertypeId == 5
                  ? "md:w-1/3"
                  : data?.user.usertypeId == 1
                    ? "md:w-1/2"
                    : data?.user.usertypeId == 2
                      ? "md:w-full"
                      : ""
              } flex-2 px-0 md:px-3`}
            >
              <SelectComponent
                id="divisiId"
                label="Divisi"
                options={divisiOption}
                selectedValue={(e: any) => {
                  if (e.id != 0) {
                    formik.setFieldValue("divisiId", e.id);
                  } else {
                    formik.setFieldValue("divisiId", "");
                  }
                }}
                defaultValue={divisiSelected}
                isInvalid={!!formik.errors.divisiId}
                errorMessage={formik.errors.divisiId}
                isPriority
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <SelectComponent
                id="usertypeId"
                label="Level User"
                options={levelUserOption}
                selectedValue={(e: any) => {
                  if (e.id != 0) {
                    formik.setFieldValue("usertypeId", e.id);
                  } else {
                    formik.setFieldValue("usertypeId", "");
                  }
                }}
                defaultValue={usertypeSelected}
                isInvalid={!!formik.errors.usertypeId}
                errorMessage={formik.errors.usertypeId}
                isPriority
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full md:w-full flex-2 px-0 md:px-3">
              <ButtonComponent
                label="Simpan"
                isLoading={isSaveLoading}
                color="info"
              />
            </div>
          </div>
        </form>
      </ModalComponent>
      {/* Row */}
      <div className="flex flex-wrap mt-0 mb-3 mx-0">
        {isLoading == false ? (
          <div className="flex-2 w-full max-w-full px-0 mt-0">
            {/* Card */}
            <CardContainerComponent
              title="Data User"
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

export default TableUser;
