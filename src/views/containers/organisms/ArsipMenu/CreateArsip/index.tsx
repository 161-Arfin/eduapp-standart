/* eslint-disable react-hooks/set-state-in-effect */
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { setAlertMessage } from "@/lib/redux/actions/alertMessageSlice";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import CardContainerComponent from "@/views/components/atoms/CardContainerComponent";
import TextInputComponent from "@/views/components/atoms/TextInputComponent";
import SelectComponent from "@/views/components/atoms/SelectComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import ButtonComponent from "@/views/components/atoms/ButtonComponent";
import DatepickerComponent from "@/views/components/atoms/DatepickerComponent";
import MultipleFileInputComponent from "@/views/components/atoms/MultipleFileInputComponent";
import RadioComponent from "@/views/components/atoms/RadioComponent";
import { keteranganOptions, statusAksesOptions } from "@/utils/data/static";
import { getRetentionStatus } from "@/utils/arsip";

interface Data {
  id: string;
  name: string;
}

type BaseArsipPayload = {
  instansi_id: number;
  user_id: number;
  no_arsip: string;
  arsip_name: string;
  deskripsi_arsip: string;
  keterangan: number;
  status_file: string | number;
  is_available: boolean;
  created_by: string;
  is_delete_arsip: boolean;
};

type AdvancedArsipPayload = BaseArsipPayload & {
  jenis_arsip_id?: number[];
  masa_retensi: string;
  status_retensi: boolean;
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

const CreateArsip = () => {
  const { data }: any = useSession();
  const isRegularUser =
    data?.user?.usertypeId == 3 || data?.user?.usertypeId == 4;
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnerUserLoading, setIsOwnerUserLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const dispatch = useDispatch();
  const { push } = useRouter();
  const [schemaValidationInstansi, setSchemaValidationInstansi] =
    useState<any>();
  const [schemaValidationUser, setSchemaValidationUser] = useState<any>();
  const [companyOption, setCompanyOption] = useState([]);
  const [userOption, setUserOption] = useState<any>([]);
  const [companySelected, setCompanySelected] = useState({});
  const [userSelected, setUserSelected] = useState({});

  function createDataOption(id: string, name: string): Data {
    return {
      id: id,
      name: name,
    };
  }

  const formatMasaRetensiPayload = (value: any) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}T00:00:00+07:00`;
  };

  const hasOnlyAllowedFiles = (files: FileList | File[]) =>
    Array.from(files).every((file) => {
      const fileName = file.name.toLowerCase();
      return ALLOWED_ARCHIVE_FILE_EXTENSIONS.some((extension) =>
        fileName.endsWith(extension),
      );
    });

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
        },
      );
      const responseJson = await response.json();

      if (responseJson.status === false) {
        if (data?.user?.usertypeId != 3) {
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
        }
        setCompanyOption([]);
      }

      if (responseJson.data && responseJson.data.length > 0) {
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
    }
  };

  // Get Owner Archive Data Option
  const getDataOwnerUser = async () => {
    const instansiId =
      data?.user.usertypeId == 5
        ? formik.values.instansiId
        : data?.user.instansiId;

    if (data?.user.usertypeId != undefined && instansiId) {
      try {
        setIsOwnerUserLoading(true);
        setUserOption([{ id: 0, name: "Memuat user..." }]);

        const response = await fetch(
          `../../api/user/user-options/${data.user.usertypeId}/${instansiId}`,
          {
            method: "GET",
          },
        );
        const responseJson = await response.json();

        if (responseJson.status === false) {
          if (data?.user?.usertypeId != 3) {
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
          }
          setUserOption([{ id: 0, name: "- Gagal memuat user -" }]);
          return;
        }

        if (responseJson.data && responseJson.data.length > 0) {
          const result = responseJson.data.map((data: any) => {
            return createDataOption(data.id_users, data.name);
          });

          const shouldAutoSelectSingleUser = result.length === 1;
          const listOption: any = shouldAutoSelectSingleUser
            ? result
            : [{ id: 0, name: "- Pilih User -" }, ...result];

          setUserOption(listOption);
          if (!formik.values.userId || shouldAutoSelectSingleUser) {
            const currentUserOption =
              result.find((item: any) => item.id == data?.user?.id) ??
              result[0];
            if (currentUserOption) {
              formik.setFieldValue("userId", String(currentUserOption.id));
              setUserSelected(currentUserOption);
            }
          }
        } else {
          setUserOption([{ id: 0, name: "- Tidak ada user -" }]);
          setUserSelected({ id: 0, name: "- Tidak ada user -" });
        }
      } catch {
        setUserOption([{ id: 0, name: "- Gagal memuat user -" }]);
        setUserSelected({ id: 0, name: "- Gagal memuat user -" });
      } finally {
        setIsOwnerUserLoading(false);
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
      setSchemaValidationInstansi(yup.string());
      setSchemaValidationUser(
        yup.string().required("Kepemilikan arsip harus diisi"),
      );
    }
  }, [data?.user.usertypeId]);

  useEffect(() => {
    if (data?.user?.usertypeId == 5) {
      getDataInstansi();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

  // Handle formik
  const formik = useFormik<{
    instansiId: string;
    userId: string;
    noArsip: string;
    arsipName: string;
    deskripsiArsip: string;
    masaRetensi: string;
    statusFile: string | number;
    keterangan: string;
    fileArsip?: FileList;
  }>({
    initialValues: {
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
        toast.error("File yang diizinkan hanya PDF, Word, Excel, dan gambar.", {
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

      try {
        const instansiId =
          data?.user.usertypeId == 5
            ? values.instansiId
            : data?.user.instansiId;
        const userId =
          data?.user.usertypeId == 3 || data?.user.usertypeId == 4
            ? data?.user.id
            : values.userId;

        const basePayload: BaseArsipPayload = {
          instansi_id: Number(instansiId),
          user_id: Number(userId),
          no_arsip: values.noArsip,
          arsip_name: values.arsipName,
          deskripsi_arsip: values.deskripsiArsip,
          keterangan: Number(values.keterangan),
          status_file: Number(values.statusFile),
          is_available: true,
          created_by: data?.user?.username || data?.user?.name || "",
          is_delete_arsip: false,
        };

        const masaRetensiPayload = formatMasaRetensiPayload(values.masaRetensi);

        const valueArsip: BaseArsipPayload | AdvancedArsipPayload = {
          ...basePayload,
          masa_retensi: masaRetensiPayload,
          status_retensi: getRetentionStatus(masaRetensiPayload),
        };

        // Create arsip
        const result = await fetch("/api/arsip/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(valueArsip),
        });
        const resultArsip = await result.json();

        if (result.status !== 201) {
          toast.error(resultArsip.message || "Data arsip gagal disimpan", {
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

        // Tambah File Arsip
        if (values.fileArsip && values.fileArsip.length > 0) {
          const formData = new FormData();

          Array.from(values.fileArsip as FileList).forEach((file) => {
            formData.append("files", file);
          });

          const uploadResult = await fetch(
            `/api/arsip-files/upload/${resultArsip.data.id_arsip}/${instansiId}`,
            {
              method: "PUT",
              body: formData,
            },
          );
          const uploadResultJson = await uploadResult.json().catch(() => null);

          if (!uploadResult.ok) {
            dispatch(
              setAlertMessage({
                status: false,
                message:
                  uploadResultJson?.message ||
                  "Data arsip berhasil dibuat, tetapi file gagal diupload",
              }),
            );
            await push("/arsip");
            return;
          }
        }

        dispatch(
          setAlertMessage({
            status: true,
            message: "Data arsip berhasil disimpan",
          }),
        );
        await push("/arsip");
      } catch (error: any) {
        toast.error(error?.message || "Data arsip gagal disimpan", {
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
    },
    validationSchema: schema,
  });

  useEffect(() => {
    // Fetch user options for fixed instansi users and regular users
    if (data?.user?.instansiId != undefined) {
      if (isRegularUser || data?.user?.usertypeId != 5) {
        getDataOwnerUser();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isRegularUser,
    data?.user?.id,
    data?.user?.instansiId,
    data?.user?.usertypeId,
  ]);

  useEffect(() => {
    if (!isRegularUser && data?.user.usertypeId == 5) {
      if (formik.values.instansiId != "0" && formik.values.instansiId != "") {
        getDataOwnerUser();
      } else {
        setUserOption([{ id: 0, name: "- Pilih Instansi dulu -" }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.instansiId, isRegularUser, data?.user.usertypeId]);

  return (
    <>
      {/* Toast */}
      <ToastContainer />
      {/* Row */}
      <div className="flex flex-wrap mt-0 mb-16 mx-0">
        {isLoading == false ? (
          <div className="flex-2 w-full max-w-full px-0 mt-0">
            {/* Form */}
            <form onSubmit={formik.handleSubmit}>
              {/* Card */}
              <CardContainerComponent actionButtonCard={() => null}>
                {/* Col */}
                <div className="flex-2 w-full max-w-full px-0 mt-0">
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
                          isPriority
                        />
                      </div>
                    ) : null}
                    {/* Col */}
                  </div>
                  {/* Row */}
                  <div className="flex flex-wrap mx-2 mb-0">
                    {/* Col */}
                    {data?.user.usertypeId == 5 ? (
                      <div
                        className={`mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3`}
                      >
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
                          disabled={isOwnerUserLoading}
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
                            formik.setFieldValue(
                              "masaRetensi",
                              formatMasaRetensiPayload(valueDate),
                            );
                          } else {
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
                    <div className="mb-4 w-full flex-2 px-0 md:px-3">
                      <MultipleFileInputComponent
                        label="Tambah File"
                        name="fileArsip"
                        onChange={(e: any) => {
                          const file = e.target.files;
                          if (file) {
                            if (!hasOnlyAllowedFiles(file)) {
                              toast.error(
                                "File yang diizinkan hanya PDF, Word, Excel, dan gambar.",
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
                            formik.setFieldValue("fileArsip", file);
                          }
                        }}
                        accept={ALLOWED_ARCHIVE_FILE_ACCEPT}
                      />
                      <p className="text-sm text-gray-500">
                        Maksimal ukuran file 1 GB.
                      </p>
                    </div>
                  </div>
                  {/* Row */}
                  <div className="flex flex-wrap mx-2 mb-0">
                    <div className="mb-3 w-full flex-2 px-0 md:px-3">
                      <RadioComponent
                        label="Status Akses File"
                        name="status_file"
                        options={statusAksesOptions}
                        lengthOptions="md:grid-cols-2"
                        formikOnChange={(e: any) =>
                          formik.setFieldValue("statusFile", e)
                        }
                        formikValue={String(formik.values.statusFile)}
                        isPriority
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
                        formikValue={String(formik.values.keterangan)}
                        isPriority
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
                        <h2 className="text-base font-bold text-gray-500">
                          Catatan :
                        </h2>
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
                </div>
              </CardContainerComponent>
            </form>
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

export default CreateArsip;
