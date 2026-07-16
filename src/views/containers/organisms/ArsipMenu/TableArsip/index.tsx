/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
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
import DatepickerComponent from "@/views/components/atoms/DatepickerComponent";
import MultipleFileInputComponent from "@/views/components/atoms/MultipleFileInputComponent";
import RadioComponent from "@/views/components/atoms/RadioComponent";
import { keteranganOptions, statusAksesOptions } from "@/utils/data/static";
import PreviewFileComponent from "@/views/components/atoms/PreviewFileComponent";
import { storage } from "@/lib/firebase/init";
import {
  getDefaultStatusFileByPackage,
  getKeteranganMeta,
} from "@/utils/arsip";
import { getPackageCapabilities } from "@/utils/packageCapabilities";
import { getDownloadURL, ref } from "firebase/storage";

interface Data {
  id: number;
  no_arsip: string;
  arsip_name: string;
  instansi_id: number;
  instansi_name: string;
  deskripsi_arsip: string;
  masa_retensi: string;
  masa_retensi_raw: string;
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
  masa_retensi: string;
  keterangan: number;
  status_file: string | number;
  modified_by: string;
};

const ALLOWED_ARCHIVE_FILE_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
];

const ALLOWED_ARCHIVE_FILE_ACCEPT = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
].join(",");

const MAX_ARCHIVE_FILE_SIZE_BYTES = 1024 * 1024 * 1024;

const TableArsip = () => {
  const { data }: any = useSession();
  const [rows, setRows] = useState<any>();
  const [detailFileRows, setDetailFileRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fileIsLoading, setFileIsLoading] = useState(false);
  const dispatch = useDispatch();
  const alertMessage = useSelector((state: any) => state.alertMessage?.data);
  const packageCapabilities = getPackageCapabilities(data?.user?.usertypeId);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [schemaValidationInstansi, setSchemaValidationInstansi] =
    useState<any>();
  const [schemaValidationUser, setSchemaValidationUser] = useState<any>();
  const [companyOption, setCompanyOption] = useState([]);
  const [userOption, setUserOption] = useState<any>([]);
  const [companySelected, setCompanySelected] = useState({});
  const [userSelected, setUserSelected] = useState({});
  const [detail, setDetail] = useState<any>({});
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

  const hasOnlyAllowedFiles = (files: FileList | File[]) =>
    Array.from(files).every((file) => {
      const fileName = file.name.toLowerCase();
      return ALLOWED_ARCHIVE_FILE_EXTENSIONS.some((extension) =>
        fileName.endsWith(extension),
      );
    });

  const hasValidArchiveFileSize = (files: FileList | File[]) =>
    Array.from(files).every((file) => file.size <= MAX_ARCHIVE_FILE_SIZE_BYTES);

  const hasSelectedValue = (value: unknown) =>
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== "0" &&
    value !== 0;

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
    masa_retensi_raw: string,
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
      masa_retensi_raw,
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
          const result = responseJson.data.map((data: any) => {
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
    if (
      data?.user.usertypeId != undefined &&
      ((data.user?.usertypeId == 3 && data?.user.instansiId != undefined) ||
        (data.user?.usertypeId != 3 && data?.user.instansiId != undefined))
    ) {
      try {
        let response: Response;
        if (data.user?.usertypeId == 3) {
          response = await fetch(
            `../../api/user/user-options/${data.user.usertypeId}`,
            {
              method: "GET",
            },
          );
        } else {
          let instansiId;
          if (data?.user.usertypeId == 5) {
            instansiId = formik.values.instansiId;
          } else {
            instansiId = data.user.instansiId;
          }

          if (!hasSelectedValue(instansiId)) {
            setUserOption([{ id: 0, name: "- Pilih Instansi Dulu -" }]);
            return;
          }

          response = await fetch(
            `../../api/user/user-options/${data.user.usertypeId}/${instansiId}`,
            {
              method: "GET",
            },
          );
        }

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
          const result = responseJson.data.map((data: any) => {
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
    } else if (data?.user.usertypeId == 3) {
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
      masaRetensi: "",
      statusFile: "",
      keterangan: "",
    },
    onSubmit: async (values: any) => {
      setIsSaveLoading(true);

      if (values.fileArsip && !hasOnlyAllowedFiles(values.fileArsip)) {
        toast.error("File yang diizinkan hanya PDF, Word, Excel dan Gambar.", {
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
        return;
      }

      if (values.fileArsip && !hasValidArchiveFileSize(values.fileArsip)) {
        toast.error("Ukuran file maksimal 1 GB.", {
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
        return;
      }

      let instansiId: string = "";
      let userId: string = "";

      if (data?.user.usertypeId == 5) {
        instansiId = values.instansiId;
        userId = values.userId;
      } else {
        instansiId = data?.user.instansiId;
        userId = String(data?.user.id || "");
      }

      // Formating date masa_retensi
      const masaRetensi = new Date(values.masaRetensi).toISOString();

      const basePayload: BaseArsipPayload = {
        instansi_id: Number(instansiId),
        user_id: Number(userId),
        no_arsip: values.noArsip,
        arsip_name: values.arsipName,
        deskripsi_arsip: values.deskripsiArsip,
        masa_retensi: masaRetensi,
        keterangan: Number(values.keterangan),
        status_file: Number(values.statusFile),
        modified_by: data.user.username,
      };

      // Update arsip
      const resultUpdateArsip = await fetch(`../api/arsip/${values.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(basePayload),
      });

      // Tambah File Arsip
      if (values.fileArsip) {
        const filesCount = values.fileArsip.length;

        if (filesCount > 0) {
          const formData = new FormData();

          Array.from(values.fileArsip as FileList | File[]).forEach((file) => {
            formData.append("files", file);
          });

          const uploadResult = await fetch(
            `../api/arsip-files/upload/${values.id}/${instansiId}`,
            {
              method: "PUT",
              body: formData,
            },
          );

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
            toast.error("Data arsip gagal disimpan", {
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
          toast.error("Data arsip gagal disimpan", {
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

  useEffect(() => {
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
  }, [packageCapabilities.canConfigureFileAccess]);

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
              data.masa_retensi,
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
        setDetailFileRows(responseJson.data);
      } else {
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
    await getFileArsipByArsipId(id);
    if (filterResult.length > 0) {
      formik.setValues({
        id: filterResult[0].id,
        instansiId: filterResult[0].instansi_id,
        userId: filterResult[0].user_id,
        noArsip: filterResult[0].no_arsip,
        arsipName: filterResult[0].arsip_name,
        deskripsiArsip: filterResult[0].deskripsi_arsip,
        masaRetensi:
          filterResult[0].masa_retensi_raw ?? filterResult[0].masa_retensi,
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
    setArrData([]); // Reset array data
    if (data?.user.usertypeId == 5) {
      getDataInstansi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

  // Dropdown userId reference by instansiId
  useEffect(() => {
    if (formik.values.instansiId && formik.values.instansiId != "0") {
      getDataOwnerUser();
    } else {
      setUserOption([{ id: 0, name: "- Tidak ada user -" }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.instansiId]);

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
        // Get data "arsip_files" berdasarkan ID arsip_files untuk mendapatkan arsip_id
        const fileArsip = await fetch(`../api/arsip-files/${id}`, {
          method: "GET",
        });
        const responseJson = await fileArsip.json();

        if (responseJson.status !== true) {
          toast.error("Data file tidak ditemukan", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return;
        }

        // delete data di tabel "arsip_files"
        const responseDeleteArsipFilesData = await fetch(
          `../api/arsip-files/${id}`,
          {
            method: "DELETE",
          },
        );

        if (responseDeleteArsipFilesData.status === 200 && responseJson.data) {
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
              data.masa_retensi,
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
              data.masa_retensi,
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
          data.masa_retensi,
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
        `EduArsipStandart/ArchieveFiles/${instansiName}/${fileName}`,
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

                    formik.setFieldValue("userId", "");
                    setUserSelected({});
                    setUserOption([{ id: 0, name: "Memuat user..." }]);
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
            {data?.user.usertypeId == 5 ? (
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
          <div className="flex flex-wrap mx-2 mb-0">
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
            {/* Col */}
            <div className="mb-3 w-full flex-2 px-0 md:px-3">
              {fileArsip.length > 0 ? (
                <div className="flex flex-wrap mb-0">
                  <div className="mb-3 w-full flex-2">
                    <PreviewFileComponent
                      label="File Saat Ini"
                      data={fileArsip}
                    />
                  </div>
                </div>
              ) : null}
              <MultipleFileInputComponent
                label="Tambah File"
                name="fileArsip"
                onChange={(e: any) => {
                  const file = e.target.files;
                  if (file) {
                    if (!hasOnlyAllowedFiles(file)) {
                      toast.error(
                        "File yang diizinkan hanya PDF, Word, Excel dan Gambar.",
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
                      formik.setFieldValue("fileArsip", undefined);
                      e.target.value = "";
                      return;
                    }
                    if (!hasValidArchiveFileSize(file)) {
                      toast.error("Ukuran maksimal 1 GB per file.", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                      });
                      formik.setFieldValue("fileArsip", undefined);
                      e.target.value = "";
                      return;
                    }
                    formik.setFieldValue("fileArsip", file);
                  }
                }}
                fileInputRef={fileInputRef}
                accept={ALLOWED_ARCHIVE_FILE_ACCEPT}
              />
              <p className="text-sm text-gray-500">Maksimal ukuran file 1 GB</p>
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
                <h2 className="text-base font-bold text-gray-500">Catatan :</h2>
                <div className="mt-1 text-sm text-gray-500">
                  <ul className="list-disc list-inside">
                    <li>
                      Jenis File yang bisa di upload:
                      <br />
                      <span className="font-semibold pl-5">
                        PDF, Word, Excel dan Gambar
                      </span>
                    </li>
                    <li className="mt-1">
                      Ukuran file maksimal{" "}
                      <span className="font-semibold">1 GB</span>.
                    </li>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 w-10 align-top">
                File
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 w-2 align-top">
                :
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 align-top">
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
                <div className="dark:[&_input]:bg-gray-50! dark:[&_input]:border-gray-200! dark:[&_input]:text-gray-800! dark:[&_input]:placeholder-gray-400! dark:[&_svg]:text-gray-400!">
                  <SearchComponent
                    handleClick={(query: any) => handleSearch(query)}
                    changeValue={(query: any) => setSearchQuery(query)}
                    isLoading={isLoadingSearch}
                  />
                </div>
              </div>

              {/* Content (force light mode for table header/body) */}
              <div className="w-full dark:[&_thead]:bg-white! dark:[&_th]:text-gray-500! dark:[&_td]:text-gray-800! dark:[&_table]:divide-gray-200! dark:[&_tbody]:divide-gray-200!">
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
          <div className="w-full h-100 flex justify-center items-center">
            <SpinLoadingComponent />
          </div>
        )}
      </div>
    </>
  );
};

export default TableArsip;
