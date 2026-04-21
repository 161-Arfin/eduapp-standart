import { setShowModal } from "@/lib/redux/actions/ShowModalSlice";
import { setAlertMessage } from "@/lib/redux/actions/alertMessageSlice";
import ButtonComponent from "@/views/components/atoms/ButtonComponent";
import ModalComponent from "@/views/components/atoms/ModalComponent";
import SearchComponent from "@/views/components/atoms/SearchComponent";
import SelectComponent from "@/views/components/atoms/SelectComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import TableComponent from "@/views/components/atoms/TableComponent";
import TextInputComponent from "@/views/components/atoms/TextInputComponent";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import Swal from "sweetalert2";
import DetailComponent from "@/views/components/atoms/DetailComponent";
import Link from "next/link";
import MultipleCheckboxComponent from "@/views/components/atoms/MultipleCheckboxComponent";
import DatepickerComponent from "@/views/components/atoms/DatepickerComponent";
import MultipleFileInputComponent from "@/views/components/atoms/MultipleFileInputComponent";
import RadioComponent from "@/views/components/atoms/RadioComponent";
import { keteranganOptions, statusAksesOptions } from "@/utils/data/static";
import PreviewFileComponent from "@/views/components/atoms/PreviewFileComponent";
import { storage } from "@/lib/firebase/init";
import { getPackageCapabilities } from "@/utils/packageCapabilities";
import {
  getAdditionalArsipPayload,
  getDefaultStatusFileByPackage,
  getKeteranganMeta,
} from "@/utils/arsip";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

interface Data {
  id: number;
  no_arsip: string;
  arsip_name: string;
  instansi_id: number;
  instansi_name: string;
  deskripsi_arsip: string;
  masa_retensi: string;
  is_available: React.JSX.Element;
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

interface DataOption {
  id: string;
  name: string;
}

interface Column {
  id:
    | "no_arsip"
    | "arsip_name"
    | "instansi_name"
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

interface Row {
  id:
    | "no_arsip"
    | "arsip_name"
    | "instansi_name"
    | "deskripsi_arsip"
    | "masa_retensi"
    | "created_at"
    | "created_by"
    | "user_name";
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
}

type BaseArsipPayload = {
  instansi_id: number;
  user_id: number;
  no_arsip: string;
  arsip_name: string;
  deskripsi_arsip: string;
  keterangan: number;
  status_file: string | number;
  modified_by: string;
};

type AdvancedArsipPayload = BaseArsipPayload & {
  jenis_arsip_id?: number[];
  masa_retensi: string;
  status_retensi: boolean;
};

const MAX_PDF_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const TableArsip = () => {
  const { data }: any = useSession();
  const [rows, setRows] = useState<any>();
  const [detailFileRows, setDetailFileRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fileIsLoading, setFileIsLoading] = useState(false);
  const dispatch = useDispatch();
  const alertMessage = useSelector((state: any) => state.alertMessage?.data);

  // Paket paling rendah: usertypeId = 3 (CRUD arsip basic).
  // Endpoint `/api/arsip/:usertypeId` dan `/api/jenis-arsip/:usertypeId` tidak tersedia â†’ jangan dipanggil.
  const packageCapabilities = getPackageCapabilities(data?.user?.usertypeId);
  const isPdfOnlyPackage = packageCapabilities.uploadMode === "pdf-only";
  const isRegularUser =
    data?.user?.usertypeId == 3 || data?.user?.usertypeId == 4;
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [schemaValidationInstansi, setSchemaValidationInstansi] =
    useState<any>();
  const [schemaValidationUser, setSchemaValidationUser] = useState<any>();
  const [companyOption, setCompanyOption] = useState([]);
  const [userOption, setUserOption] = useState<any>([]);
  const [companySelected, setCompanySelected] = useState({});
  const [userSelected, setUserSelected] = useState({});
  const [detail, setDetail] = useState<any>({});
  const [jenisArsip, setJenisArsip] = useState([]);
  const [arsipJenisIdSelected, setArsipJenisIdSelected] = useState([]);
  const [fileArsip, setFileArsip] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastDoc, setLastDoc] = useState([]);
  const [arrData, setArrData] = useState([]);
  const [isLoadingFetchMore, setIsLoadingFetchMore] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInSearchCondition, setIsInSearchCondition] = useState(false);
  const didMountSearchEffect = useRef(false);

  // Reset file input form
  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset semua input di form
    }
  };

  // Struktur Data Option
  function createDataOption(id: string, name: string): DataOption {
    return {
      id: id,
      name: name,
    };
  }

  const hasOnlyPdfFiles = (files: FileList | File[]) =>
    Array.from(files).every((file) => file.name.toLowerCase().endsWith(".pdf"));

  const hasValidPdfFileSize = (files: FileList | File[]) =>
    Array.from(files).every((file) => file.size <= MAX_PDF_FILE_SIZE_BYTES);

  const hasSelectedValue = (value: unknown) =>
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== "0" &&
    value !== 0;

  const resolveInstansiName = (
    instansiId?: string | number,
    arsipId?: string | number,
  ) => {
    if (hasSelectedValue(arsipId) && Array.isArray(rows)) {
      const row = rows.find((item: any) => item.id == arsipId);
      if (row?.instansi_name) {
        return row.instansi_name;
      }
    }

    if (hasSelectedValue(instansiId) && Array.isArray(companyOption)) {
      const selectedInstansi = (companyOption as any[]).find(
        (item: any) => item.id == instansiId,
      );
      if (selectedInstansi?.name) {
        return selectedInstansi.name;
      }
    }

    if (detail?.instansi_name) {
      return detail.instansi_name;
    }

    return data?.user?.instansiName || "EduArsip";
  };

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
    { id: "masa_retensi", label: "Masa Retensi", minWidth: 100 },
    { id: "keterangan", label: "Keterangan", minWidth: 100 },
    {
      id: "action",
      label: "Action",
      minWidth: 50,
      align: "right",
      actionButton: [
        {
          id: "detail",
          title: "Detail",
          icon: "detail",
          action: async (id: string) => {
            await getDetailById(id);
            await dispatch(setShowModal({ detailArsipModal: true }));
          },
        },
        {
          id: "edit",
          title: "Edit",
          icon: "edit",
          action: async (id: string) => {
            await setFileArsip([]);
            await formik.resetForm();
            await getDataByIdForEdit(id);
            await dispatch(setShowModal({ editArsipModal: true }));
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

  // set row detail
  const rowDetail: readonly Row[] = [
    { id: "no_arsip", label: "No. Arsip", minWidth: 100 },
    { id: "arsip_name", label: "Nama Arsip", minWidth: 150 },
    { id: "deskripsi_arsip", label: "Deskripsi", minWidth: 100 },
    { id: "masa_retensi", label: "Masa Retensi", minWidth: 100 },
    { id: "created_at", label: "Dibuat pada", minWidth: 100 },
    { id: "created_by", label: "Dibuat oleh", minWidth: 100 },
    { id: "user_name", label: "Pemilik Arsip", minWidth: 100 },
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
    is_available: React.JSX.Element,
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
      is_available,
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
        Publis
      </span>
    );

  // Get Instansi Data Option
  const getDataInstansi = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      try {
        const response = await fetch(
          `../../api/company/${data.user.usertypeId}/${data.user.instansiId}`,
          {
            method: "GET",
          },
        );

        // Paket rendah bisa saja tidak punya endpoint ini â†’ jangan tampilkan popup
        if (!response.ok) {
          setCompanyOption([]);
          setIsLoading(false);
          return;
        }

        let responseJson: any = null;
        try {
          responseJson = await response.json();
        } catch {
          setCompanyOption([]);
          setIsLoading(false);
          return;
        }

        if (responseJson?.status === false) {
          // kalau backend memang error, baru notif
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

        if (responseJson?.data && responseJson.data.length > 0) {
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
      } catch {
        // Silent fallback untuk paket rendah / endpoint tidak tersedia
        setCompanyOption([]);
        setIsLoading(false);
      }
    }
  };

  // Get Owner Archive Data Option
  const getDataOwnerUser = async () => {
    if (data?.user.usertypeId != undefined) {
      try {
        const response = await fetch(
          `../../api/user/user-options/${data.user.usertypeId}`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          setUserOption([{ id: 0, name: "- Tidak tersedia -" }]);
          setIsLoading(false);
          return;
        }

        let responseJson: any = null;
        try {
          responseJson = await response.json();
        } catch {
          setUserOption([{ id: 0, name: "- Tidak tersedia -" }]);
          setIsLoading(false);
          return;
        }

        if (responseJson?.status === false) {
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
          setUserOption([{ id: 0, name: "- Gagal memuat user -" }]);
        }

        if (responseJson?.data && responseJson.data.length > 0) {
          const result = responseJson.data.map((data: any, index: number) => {
            return createDataOption(data.id_users, data.name);
          });
          const listOption: any =
            result.length === 1
              ? result
              : [{ id: 0, name: "- Pilih User -" }, ...result];

          setUserOption(listOption);
        } else {
          setUserOption([{ id: 0, name: "- Tidak ada user -" }]);
        }
        setIsLoading(false);
      } catch {
        setUserOption([{ id: 0, name: "- Tidak tersedia -" }]);
        setIsLoading(false);
      }
    }
  };

  // Rendering awal auto fill
  useEffect(() => {
    if (userOption) {
      setUserSelected(
        userOption.filter((item: any) => item.id == formik.values.userId)[0],
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
  }, [companyOption, userOption]);

  // Schema validation
  const schema = yup.object().shape({
    instansiId: schemaValidationInstansi,
    userId: schemaValidationUser,
    noArsip: yup.string().required("Nomor Arsip harus diisi"),
    arsipName: yup.string().required("Nama Arsip harus diisi"),
    deskripsiArsip: yup.string().required("Deskripsi Arsip harus diisi"),
    masaRetensi: yup.string().required("Masa Retensi harus diisi"),
    statusFile: yup.string().required("Status akses file harus diisi"),
    keterangan: yup.string().required("Keterangan harus diisi"),
  });

  // Schema Validation Controling
  useEffect(() => {
    if (data?.user.usertypeId == 5) {
      setSchemaValidationInstansi(
        yup.string().required("Instansi harus diisi"),
      );
      setSchemaValidationUser(
        yup.string().required("Kepemilikan arsip harus diisi"),
      );
    } else if (data?.user.usertypeId == 1) {
      setSchemaValidationInstansi(yup.string());
      setSchemaValidationUser(
        yup.string().required("Kepemilikan arsip harus diisi"),
      );
    } else if (data?.user.usertypeId == 2) {
      setSchemaValidationInstansi(yup.string());
      setSchemaValidationUser(
        yup.string().required("Kepemilikan arsip harus diisi"),
      );
    } else if (data?.user.usertypeId == 3 || data?.user.usertypeId == 4) {
      setSchemaValidationInstansi(yup.string());
      setSchemaValidationUser(yup.string());
    } else {
      setSchemaValidationInstansi(yup.string().required());
      setSchemaValidationUser(yup.string().required());
    }
  }, [data?.user.usertypeId]);

  // Handle formik
  const formik = useFormik<{
    id: string;
    instansiId: string;
    userId: string;
    noArsip: string;
    arsipName: string;
    deskripsiArsip: string;
    jenisArsipId: Array<number>;
    masaRetensi: string;
    statusFile: string;
    keterangan: string;
    fileArsip?: File;
  }>({
    initialValues: {
      id: "",
      instansiId: "",
      userId: "",
      noArsip: "",
      arsipName: "",
      deskripsiArsip: "",
      jenisArsipId: [],
      masaRetensi: "",
      statusFile: "",
      keterangan: "",
    },
    onSubmit: async (values: any) => {
      setIsSaveLoading(true);

      if (
        isPdfOnlyPackage &&
        values.fileArsip &&
        !hasOnlyPdfFiles(values.fileArsip)
      ) {
        dispatch(
          setAlertMessage({
            status: false,
            message: "Pada paket regular, file yang diizinkan hanya PDF.",
          }),
        );
        setIsSaveLoading(false);
        return;
      }

      if (
        isPdfOnlyPackage &&
        values.fileArsip &&
        !hasValidPdfFileSize(values.fileArsip)
      ) {
        dispatch(
          setAlertMessage({
            status: false,
            message: "Ukuran file PDF maksimal 2 MB per file.",
          }),
        );
        setIsSaveLoading(false);
        return;
      }

      let instansiId: string = "";
      let userId: string = "";

      if (data?.user.usertypeId == 5) {
        instansiId = values.instansiId;
        userId = values.userId;
      } else if (data?.user.usertypeId == 1) {
        instansiId = data?.user.instansiId;
        userId = values.userId;
      } else if (data?.user.usertypeId == 2) {
        instansiId = data?.user.instansiId;
        userId = values.userId;
      } else {
        instansiId = data?.user.instansiId;
        userId = String(data?.user.id || "");
      }

      const basePayload: BaseArsipPayload = {
        instansi_id: Number(instansiId),
        user_id: Number(userId),
        no_arsip: values.noArsip,
        arsip_name: values.arsipName,
        deskripsi_arsip: values.deskripsiArsip,
        keterangan: Number(values.keterangan),
        status_file: Number(values.statusFile),
        modified_by: data.user.username,
      };

      const valueArsip: BaseArsipPayload | AdvancedArsipPayload = {
        ...basePayload,
        ...getAdditionalArsipPayload({
          packageCapabilities,
          masaRetensi: values.masaRetensi,
          jenisArsipId: values.jenisArsipId,
          includeDefaults: false,
        }),
      };

      // Update arsip
      const resultUpdateArsip = await fetch(`../api/arsip/${values.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(valueArsip),
      });
      const resultUpdateArsipJson = await resultUpdateArsip
        .json()
        .catch(() => null);

      // Tambah File Arsip
      if (values.fileArsip) {
        const filesCount = values.fileArsip.length;

        if (filesCount > 0) {
          if (isPdfOnlyPackage) {
            const formData = new FormData();

            Array.from(values.fileArsip as FileList | File[]).forEach(
              (file) => {
                formData.append("files", file);
              },
            );

            const uploadResult = await fetch(
              `../api/arsip-files/upload/${values.id}/${instansiId}`,
              {
                method: "PUT",
                body: formData,
              },
            );
            const uploadResultJson = await uploadResult.json();

            if (resultUpdateArsip.status === 200 && uploadResult.ok) {
              toast.success("Data arsip berhasil disimpan", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
              handleReset();
              dispatch(setShowModal({ editArsipModal: false }));
              setIsSaveLoading(false);
              getData();
            } else {
              toast.error(
                uploadResultJson.message ||
                  "Data arsip berhasil diperbarui, tetapi file PDF gagal diupload",
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
              setIsSaveLoading(false);
            }
          } else {
            const instansiName = resolveInstansiName(instansiId, values.id);
            let resultStatus: any = [];
            for (let i = 0; i < filesCount; i++) {
              const fileName =
                "(" +
                new Date().getDate() +
                "-" +
                (new Date().getMonth() + 1) +
                "-" +
                new Date().getFullYear() +
                " " +
                new Date().getHours() +
                ":" +
                new Date().getMinutes() +
                ":" +
                new Date().getSeconds() +
                ") " +
                values.fileArsip[i].name;

              const imageRef = await ref(
                storage,
                `eduarsip-app/fileArsip/${instansiName}/${fileName}`,
              );

              await uploadBytes(imageRef, values.fileArsip[i])
                .then(async (snapshot) => {
                  await getDownloadURL(snapshot.ref)
                    .then(async (url) => {
                      const valueArsipFiles = {
                        arsip_id: values.id,
                        file_upload: fileName,
                      };

                      const resultArsipFiles = await fetch(
                        "../api/arsip-files/create",
                        {
                          method: "POST",
                          body: JSON.stringify(valueArsipFiles),
                        },
                      );
                      const responseResult = await resultArsipFiles.json();

                      if (resultArsipFiles.status === 201) {
                        const valueFirebase = {
                          arsip_files_id: responseResult.data.id,
                          link: url,
                        };

                        const resultFirebase = await fetch(
                          "../api/firebase/create",
                          {
                            method: "POST",
                            body: JSON.stringify(valueFirebase),
                          },
                        );

                        if (resultFirebase.status === 201) {
                          resultStatus.push(true);
                        } else {
                          resultStatus.push(false);
                        }
                      } else {
                        dispatch(
                          setAlertMessage({
                            status: false,
                            message: "Data user gagal disimpan",
                          }),
                        );
                        setIsSaveLoading(false);
                      }
                    })
                    .catch(() => {
                      dispatch(
                        setAlertMessage({
                          status: false,
                          message: "Data user gagal disimpan",
                        }),
                      );
                      setIsSaveLoading(false);
                    });
                })
                .catch(() => {
                  dispatch(
                    setAlertMessage({
                      status: false,
                      message: "Data user gagal disimpan",
                    }),
                  );
                  setIsSaveLoading(false);
                });
            }

            if (resultUpdateArsip.status === 200 && resultStatus.length > 0) {
              const errorHandler = resultStatus.filter(
                (status: boolean) => status == false,
              );

              if (errorHandler.length == 0) {
                toast.success("Data arsip berhasil disimpan", {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: true,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
                handleReset();
                dispatch(setShowModal({ editArsipModal: false }));
                setIsSaveLoading(false);
                getData();
              }
            } else {
              toast.error(
                resultUpdateArsipJson?.message || "Data arsip gagal disimpan",
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
              setIsSaveLoading(false);
            }
          }
        }
      } else {
        if (resultUpdateArsip.status === 200) {
          toast.success("Data arsip berhasil disimpan", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          dispatch(setShowModal({ editArsipModal: false }));
          setIsSaveLoading(false);
          getData();
        } else {
          toast.error(
            resultUpdateArsipJson?.message || "Data arsip gagal disimpan",
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
          setIsSaveLoading(false);
        }
      }
    },
    validationSchema: schema,
  });

  useEffect(() => {
    if (
      isRegularUser &&
      data?.user?.id &&
      formik.values.userId !== String(data.user.id)
    ) {
      formik.setFieldValue("userId", String(data.user.id), false);
    }

    const defaultStatusFile = getDefaultStatusFileByPackage(
      packageCapabilities.canConfigureFileAccess,
    );

    if (
      defaultStatusFile !== undefined &&
      formik.values.statusFile !== String(defaultStatusFile)
    ) {
      formik.setFieldValue("statusFile", String(defaultStatusFile), false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isRegularUser,
    data?.user?.id,
    packageCapabilities.canConfigureFileAccess,
  ]);

  // Get data for arsip table
  const getData = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `../../api/arsip/${data.user.usertypeId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );
        console.log("Response status:", response);

        // Paket rendah: endpoint /api/arsip/... bisa tidak ada (404) â†’ jangan popup
        if (!response.ok) {
          setRows([]);
          setIsLoading(false);
          return;
        }

        let responseJson: any = null;
        try {
          responseJson = await response.json();
        } catch {
          setRows([]);
          setIsLoading(false);
          return;
        }

        if (responseJson.status === false) {
          if (packageCapabilities.canManageRetention) {
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
          setRows([]);
        }

        if (responseJson.data && responseJson.data.length > 0) {
          const result = responseJson.data.map((data: any) => {
            // Status peminjaman
            let isAvailable: React.JSX.Element;
            if (data.is_available == true) {
              isAvailable = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
                  Tersedia
                </span>
              );
            } else {
              isAvailable = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-red-500 text-red-500">
                  Dipinjam
                </span>
              );
            }

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

            // Format masa retensi
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
              isAvailable,
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
        setRows([]);
        setIsLoading(false);
      }
    }
  };

  const getJenisArsip = async () => {
    if (!packageCapabilities.canManageClassification) {
      setJenisArsip([]);
      return;
    }
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      try {
        const response = await fetch(
          `../../api/jenis-arsip/${data.user.usertypeId}`,
          {
            method: "GET",
          },
        );
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
          setJenisArsip([]);
        }

        if (responseJson.data && responseJson.data.length > 0) {
          const finalResult = responseJson.data.sort(
            (a: any, b: any) => b.id_jenis - a.id_jenis,
          );
          setJenisArsip(finalResult);
        } else if (responseJson.data && responseJson.data.length == 0) {
          setJenisArsip([]);
        }
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

  const getArsipJenisByArsipId = async (id: any) => {
    if (!packageCapabilities.canManageClassification) {
      setArsipJenisIdSelected([]);
      return [];
    }

    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined &&
      id != undefined
    ) {
      try {
        const response = await fetch(`../../api/arsip-jenis/byarsip/${id}`, {
          method: "GET",
        });
        const responseJson = await response.json();

        if (responseJson.status === false) {
          if (responseJson.statusCode === 404) {
            setArsipJenisIdSelected([]);
            return [];
          }

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
          setArsipJenisIdSelected([]);
          return [];
        }

        if (Array.isArray(responseJson.data) && responseJson.data.length > 0) {
          const arsipJenisId = responseJson.data.map(
            (item: any) => item.jenis_arsip_id,
          );
          setArsipJenisIdSelected(arsipJenisId);
          return arsipJenisId;
        } else {
          setArsipJenisIdSelected([]);
          return [];
        }
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
        setArsipJenisIdSelected([]);
        return [];
      }
    }

    return [];
  };

  const getFileArsipByArsipId = async (id: any) => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined &&
      id != undefined
    ) {
      try {
        const response = await fetch(`../../api/arsip-files/byarsip/${id}`, {
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
          setFileArsip([]);
          return;
        }

        if (Array.isArray(responseJson.data) && responseJson.data.length > 0) {
          const resultJson = responseJson.data.map((item: any) => {
            return {
              ...item,
              action: (id: string) => handleDeleteFile(id),
            };
          });
          setFileArsip(resultJson);
        } else {
          setFileArsip([]);
        }
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

  const getFileArsip = async (id: string) => {
    setFileIsLoading(true);
    try {
      const response = await fetch(`/api/arsip-files/byarsip/${id}`, {
        method: "GET",
        cache: "no-store",
      });
      const responseJson = await response.json();
      console.log("Response FILE:", responseJson);

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
        setDetailFileRows([]);
        return;
      }

      if (Array.isArray(responseJson.data) && responseJson.data.length > 0) {
        console.log("Response FILE DATA:", responseJson.data);
        setDetailFileRows(responseJson.data);
      } else {
        console.log("Response FILE DATA EMPTY:", responseJson.data);
        setDetailFileRows([]);
      }
    } catch (e: any) {
      toast.error("Internal server error " + e.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setDetailFileRows([]);
    } finally {
      setFileIsLoading(false);
    }
  };

  // Detail Arsip
  const getDetailById = async (id: string) => {
    const filterResult = rows.filter((data: any) => data.id === id);
    setDetail(filterResult[0]);
    getFileArsip(id);
  };

  // Get edit data selected
  const getDataByIdForEdit = async (id: string) => {
    const filterResult: any = rows.filter((data: any) => data.id === id);
    // Get by arsip_id tabel arsip_jenis
    const arsipJenisSelected = packageCapabilities.canManageClassification
      ? await getArsipJenisByArsipId(id)
      : [];
    await getFileArsipByArsipId(id);

    // Lokasi belum muncul di dropdown edit arsip
    if (filterResult.length > 0) {
      formik.setValues({
        id: filterResult[0].id,
        instansiId: filterResult[0].instansi_id,
        userId: filterResult[0].user_id,
        noArsip: filterResult[0].no_arsip,
        arsipName: filterResult[0].arsip_name,
        deskripsiArsip: filterResult[0].deskripsi_arsip,
        jenisArsipId: arsipJenisSelected,
        masaRetensi: filterResult[0].masa_retensi,
        statusFile: filterResult[0].status_file_id,
        keterangan: filterResult[0].keterangan_id,
      });
    }
  };

  // First Rendering Instansi option
  useEffect(() => {
    if (
      data?.user?.usertypeId == undefined ||
      data?.user?.instansiId == undefined
    ) {
      return;
    }

    getData();
    if (packageCapabilities.canManageClassification) {
      getJenisArsip();
    } else {
      setJenisArsip([]);
    }
    setArrData([]); // Reset array data
    if (data?.user.usertypeId == 5) {
      getDataInstansi();
    }
    if (!isRegularUser) {
      getDataOwnerUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user, isRegularUser]);

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
        const response = await fetch(`../api/arsip/softdelete/${id}`, {
          method: "DELETE",
        });
        const responseJson = await response.json().catch(() => null);

        if (response.ok && responseJson?.status !== false) {
          toast.success(
            responseJson?.message || "Data arsip berhasil di hapus",
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

          if (searchQuery) {
            handleSearch(searchQuery);
          } else {
            getData();
          }
        } else {
          toast.error(responseJson?.message || "Data arsip gagal di hapus", {
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

  // Handle Delete
  const handleDeleteFile = async (id: any) => {
    Swal.fire({
      title: "Apakah anda yakin?",
      text: "File ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Ambil data dari tabel "arsip_files"
        const fileArsip = await fetch(`../api/arsip-files/${id}`, {
          method: "GET",
        });
        const responseJson = await fileArsip.json();

        // Ambil data dari tabel "arsip" berdasarkan arsip_id
        const dataArsip = await fetch(
          `../api/arsip/detail/${responseJson.data.arsip_id}`,
          {
            method: "GET",
          },
        );
        const responseJsonArsip = await dataArsip.json();
        const instansiName = resolveInstansiName(
          responseJsonArsip?.data?.instansi_id,
          responseJson.data.arsip_id,
        );

        // Untuk hapus file di firebase
        const desertRef = ref(
          storage,
          `eduarsip-app/fileArsip/${instansiName}/${responseJson.data.file_upload}`,
        );
        deleteObject(desertRef);

        // delete data di tabel "firebase" by arsip_files
        const responseDeleteFirebaseData = await fetch(
          `../api/firebase/delete-byarsip-files/${id}`,
          {
            method: "DELETE",
          },
        );

        // delete data di tabel "arsip_files"
        const responseDeleteArsipFilesData = await fetch(
          `../api/arsip-files/${id}`,
          {
            method: "DELETE",
          },
        );

        if (
          responseDeleteFirebaseData.status === 200 &&
          responseDeleteArsipFilesData.status === 200
        ) {
          toast.success("Data file berhasil di hapus", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          getFileArsipByArsipId(responseJson.data.arsip_id);
        } else {
          toast.error("Data file gagal di hapus", {
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
        const result = await fetch(`../../api/arsip/fetchmore/${lastDoc}`, {
          method: "GET",
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
            // Status peminjaman
            let isAvailable: React.JSX.Element;
            if (data.is_available == true) {
              isAvailable = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
                  Tersedia
                </span>
              );
            } else {
              isAvailable = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-red-500 text-red-500">
                  Dipinjam
                </span>
              );
            }

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

            // Format masa retensi
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
              isAvailable,
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

  // Fetch more data when scroll to bottom
  const fetchMoreDataInSearchCondition = async () => {
    let moreData: any = arrData;
    if (lastDoc && moreData.includes(lastDoc) == false) {
      setIsLoadingFetchMore(true);
      moreData.push(lastDoc);
      setArrData(moreData);

      try {
        const result = await fetch(
          `../../api/arsip/fetchmore/keyword/${searchQuery}/${lastDoc}`,
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
        console.log(resultJson);
        if (resultJson.data.length > 0 && resultJson.cursor != 0) {
          const result = resultJson.data.map((data: any) => {
            // Status peminjaman
            let isAvailable: React.JSX.Element;
            if (data.is_available == true) {
              isAvailable = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
                  Tersedia
                </span>
              );
            } else {
              isAvailable = (
                <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-red-500 text-red-500">
                  Dipinjam
                </span>
              );
            }

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

            // Format masa retensi
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
              isAvailable,
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
        if (isInSearchCondition) {
          fetchMoreDataInSearchCondition();
        } else {
          fetchMoreData();
        }
      }
    }
  };

  // Search Arsip
  const handleSearch = async (searchQuery: any) => {
    setIsLoadingSearch(true);
    setRows([]);
    setIsInSearchCondition(true);
    const dataArsip = await fetch(`../../api/arsip/keyword/${searchQuery}`, {
      method: "GET",
      cache: "no-store",
    });

    const dataArsipJson = await dataArsip.json();

    if (dataArsipJson.data?.length > 0) {
      const result = dataArsipJson.data.map((data: any) => {
        // Status peminjaman
        let isAvailable: React.JSX.Element;
        if (data.is_available == true) {
          isAvailable = (
            <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-green-500 text-green-500">
              Tersedia
            </span>
          );
        } else {
          isAvailable = (
            <span className="inline-flex items-center gap-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-red-500 text-red-500">
              Dipinjam
            </span>
          );
        }

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

        // Format masa retensi
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
          isAvailable,
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
      setLastDoc(dataArsipJson.cursor);
    } else {
      setRows([]);
    }

    setArrData([]);
    setIsLoadingSearch(false);
  };

  useEffect(() => {
    if (!didMountSearchEffect.current) {
      didMountSearchEffect.current = true;
      return;
    }
    if (
      searchQuery == "" &&
      data?.user?.usertypeId != undefined &&
      data?.user?.instansiId != undefined
    ) {
      getData();
      setArrData([]);
      setIsInSearchCondition(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, data?.user?.usertypeId, data?.user?.instansiId]);

  const handleDownloadFile = async (fileName: string, instansiName: string) => {
    try {
      const fileRef = ref(
        storage,
        `eduarsip-app/fileArsip/${instansiName}/${fileName}`,
      );
      const url = await getDownloadURL(fileRef);

      // Membuat elemen <a> untuk trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // nama file yang akan terunduh
      link.target = "_blank"; // membuka di tab baru
      link.rel = "noopener noreferrer"; // keamanan tambahan
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

  return (
    <>
      {/* Toast */}
      <ToastContainer />
      {/* Detail Modal */}
      <ModalComponent
        title="Edit Arsip"
        dataTarget="editArsipModal"
        fileInputReset={() => handleReset()}
      >
        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          {/* Content */}
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            {data?.user.usertypeId == 5 ? (
              <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
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
                  isPriority
                />
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap mx-2 mb-0">
            {data?.user.usertypeId == 5 ||
            data?.user.usertypeId == 1 ||
            data?.user.usertypeId == 2 ? (
              <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
                <SelectComponent
                  id="userId"
                  label="Kepemilikan Arsip"
                  options={userOption}
                  selectedValue={(e: any) => {
                    if (e.id != 0) {
                      formik.setFieldValue("userId", e.id);
                    } else {
                      formik.setFieldValue("userId", "");
                    }
                  }}
                  defaultValue={userSelected}
                  isInvalid={!!formik.errors.userId}
                  errorMessage={formik.errors.userId}
                  isPriority
                />
              </div>
            ) : null}
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <TextInputComponent
                label="Nomor Arsip"
                value={formik.values.noArsip}
                handleChange={(e) =>
                  formik.setFieldValue("noArsip", e.target.value)
                }
                isInvalid={!!formik.errors.noArsip}
                errorMessage={formik.errors.noArsip}
                isPriority
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <TextInputComponent
                label="Nama Arsip"
                value={formik.values.arsipName}
                handleChange={(e) =>
                  formik.setFieldValue("arsipName", e.target.value)
                }
                isInvalid={!!formik.errors.arsipName}
                errorMessage={formik.errors.arsipName}
                isPriority
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <TextInputComponent
                label="Deskripsi"
                value={formik.values.deskripsiArsip}
                handleChange={(e) =>
                  formik.setFieldValue("deskripsiArsip", e.target.value)
                }
                isInvalid={!!formik.errors.deskripsiArsip}
                errorMessage={formik.errors.deskripsiArsip}
                isPriority
              />
            </div>
          </div>
          {/* Row */}
          {packageCapabilities.canManageClassification ? (
            <div className="flex flex-wrap mx-2 mb-0">
              {/* Col */}
              <div className="mb-3 w-full flex-2 px-0 md:px-3">
                <MultipleCheckboxComponent
                  label="Jenis Arsip"
                  options={jenisArsip}
                  defaultValue={arsipJenisIdSelected}
                  formikOnChange={(e: any) =>
                    formik.setFieldValue("jenisArsipId", e)
                  }
                  lengthCheckboxOptions="md:grid-cols-5"
                />
              </div>
            </div>
          ) : null}
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <DatepickerComponent
                label="Masa Retensi"
                name="masaRetensi"
                activeDateDefault={formik.values.masaRetensi || null}
                format="DD-MM-YYYY"
                formikOnChange={(newValue: any) => {
                  if (newValue) {
                    const date = new Date(newValue);
                    const valueDate = `${date.getFullYear()}-${
                      date.getMonth() + 1
                    }-${date.getDate()}`;
                    formik.setFieldValue("masaRetensi", valueDate);
                  } else if (newValue === null) {
                    formik.setFieldValue("masaRetensi", "");
                  }
                }}
                isInvalid={!!formik.errors.masaRetensi}
                errorMessage={formik.errors.masaRetensi}
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* view current file */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <PreviewFileComponent label="File Saat Ini" data={fileArsip} />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <MultipleFileInputComponent
                label="Tambah File"
                name="fileArsip"
                onChange={(e: any) => {
                  const file = e.target.files;
                  if (file) {
                    if (isPdfOnlyPackage && !hasOnlyPdfFiles(file)) {
                      dispatch(
                        setAlertMessage({
                          status: false,
                          message:
                            "Pada paket regular, file yang diizinkan hanya PDF.",
                        }),
                      );
                      handleReset();
                      return;
                    }
                    if (isPdfOnlyPackage && !hasValidPdfFileSize(file)) {
                      dispatch(
                        setAlertMessage({
                          status: false,
                          message: "Ukuran file PDF maksimal 2 MB per file.",
                        }),
                      );
                      handleReset();
                      return;
                    }
                    formik.setFieldValue("fileArsip", file);
                  }
                }}
                fileInputRef={fileInputRef}
                accept={isPdfOnlyPackage ? ".pdf,application/pdf" : undefined}
              />
              {isPdfOnlyPackage ? (
                <p className="mt-2 text-sm text-gray-500">
                  Maksimal ukuran file PDF 2 MB per file.
                </p>
              ) : null}
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <RadioComponent
                label="Status Akses File"
                name="status_file"
                options={statusAksesOptions}
                lengthOptions="md:grid-cols-2"
                formikOnChange={(e: any) =>
                  formik.setFieldValue("statusFile", e)
                }
                formikValue={formik.values.statusFile}
              />
            </div>
          </div>
          {/* Row */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              <RadioComponent
                label="Keterangan"
                name="keterangan"
                options={keteranganOptions}
                lengthOptions="md:grid-cols-2"
                formikOnChange={(e: any) =>
                  formik.setFieldValue("keterangan", e)
                }
                formikValue={formik.values.keterangan}
              />
            </div>
          </div>
          <hr className="my-3 dark:border-gray-700" />
          {/* Row */}
          {/* Catatan */}
          <div className="flex flex-wrap mx-2 mb-0">
            {/* Col */}
            <div className="mb-3 w-full md:w-full flex-2 px-0 md:px-3">
              <div>
                <h2 className="text-base font-bold text-gray-500 dark:text-neutral-200">
                  Catatan :
                </h2>
                <div className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                  <ul className="list-disc list-inside">
                    {isPdfOnlyPackage ? (
                      <li>
                        Jenis file yang boleh diupload:{" "}
                        <span className="font-semibold">PDF</span>.
                      </li>
                    ) : null}
                    {isPdfOnlyPackage ? (
                      <li>
                        Ukuran file PDF maksimal{" "}
                        <span className="font-semibold">2 MB</span> per file.
                      </li>
                    ) : (
                      <>
                        <li>
                          Jenis File yang boleh diupload:
                          <br />
                          <span className="font-semibold pl-5">TEXT</span>: txt,
                          pdf, ppt, pptx, xls, xlsx, doc, docx.
                          <br />
                          <span className="font-semibold pl-5">AUDIO</span>:
                          mp3, flac, wav, m4a.
                          <br />
                          <span className="font-semibold pl-5">VIDEO</span>:
                          mp4, flv.
                          <br />
                          <span className="font-semibold pl-5">FOTO</span>: jpg,
                          jpeg, png.
                          <br />
                          <span className="font-semibold pl-5">
                            COMPRESSION
                          </span>
                          : zip, rar.
                        </li>
                        <li>
                          Disarankan kalau filenya banyak, lebih baik buat dalam
                          format <span className="font-semibold">zip</span> atau{" "}
                          <span className="font-semibold">rar</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <hr className="my-3 dark:border-gray-700" />
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
      {/* Detail Modal */}
      <ModalComponent title="Detail Arsip" dataTarget="detailArsipModal">
        {/* Content */}
        <DetailComponent data={detail} row={rowDetail}>
          {/* Additional Component */}
          {fileIsLoading ? (
            <tr>
              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="w-full h-auto flex justify-center items-center">
                  <SpinLoadingComponent />
                </div>
              </td>
            </tr>
          ) : (
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 w-10 align-top">
                File
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 w-2 align-top">
                :
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-neutral-200 align-top">
                {detailFileRows.map((data: any, index: number) => (
                  <div className="mb-3" key={index}>
                    {data.file_upload}{" "}
                    <Link
                      href="#"
                      // target="_blank"
                      className="inline-flex items-center gap-x-1.5 py-1 px-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1"
                      onClick={() =>
                        handleDownloadFile(
                          data.file_upload,
                          detail.instansi_name,
                        )
                      }
                    >
                      Download
                    </Link>
                  </div>
                ))}
              </td>
            </tr>
          )}
        </DetailComponent>
      </ModalComponent>
      {/* Row */}
      <div className="flex flex-wrap mt-0 mb-3 mx-0">
        {isLoading == false ? (
          <div className="flex-2 w-full max-w-full px-0 mt-0">
            {/* Card (match Dashboard style + force light only on this page) */}
            <div className="w-full bg-white shadow-sm border border-gray-100 rounded-md h-full flex flex-col p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <h6 className="text-[#6777ef] leading-tight font-medium">
                  Data Arsip
                </h6>

                {/* Force light mode for search input (override dark:* classes inside) */}
                <div className="dark:[&_input]:!bg-gray-50 dark:[&_input]:!border-gray-200 dark:[&_input]:!text-gray-800 dark:[&_input]:!placeholder-gray-400 dark:[&_svg]:!text-gray-400">
                  <SearchComponent
                    handleClick={(query: any) => handleSearch(query)}
                    changeValue={(query: any) => setSearchQuery(query)}
                    isLoading={isLoadingSearch}
                  />
                </div>
              </div>

              {/* Content (force light mode for table header/body) */}
              <div className="w-full dark:[&_thead]:!bg-white dark:[&_th]:!text-gray-500 dark:[&_td]:!text-gray-800 dark:[&_table]:!divide-gray-200 dark:[&_tbody]:!divide-gray-200">
                <TableComponent
                  data={rows}
                  columns={columns}
                  handleScroll={(e: any) => handleScroll(e)}
                  isLoadingFetchMore={isLoadingFetchMore}
                  emptyMessage="Belum ada data arsip"
                />
              </div>
            </div>
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

export default TableArsip;
