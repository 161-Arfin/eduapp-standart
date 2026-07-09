import { genderOption, phoneRegExp, usernameRegExp } from "@/utils/data/static";
import ButtonComponent from "@/views/components/atoms/ButtonComponent";
import CardContainerComponent from "@/views/components/atoms/CardContainerComponent";
import FileInputComponent from "@/views/components/atoms/FileInputComponent";
import SelectComponent from "@/views/components/atoms/SelectComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import TextInputComponent from "@/views/components/atoms/TextInputComponent";
import TextInputGroupComponent from "@/views/components/atoms/TextInputGroupComponent";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";

const UpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const { data }: any = useSession();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [genderSelected, setGenderSelected] = useState({});
  const [profileUserId, setProfileUserId] = useState<string>("");
  const profilePhotoFieldName = "file";

  const getValidPhotoFile = (file: unknown): File | null => {
    if (!(file instanceof File)) {
      return null;
    }

    if (file.name.trim() === "") {
      return null;
    }

    return file;
  };

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
  });

  const formik = useFormik<{
    fullName: string;
    gender?: number;
    birthPlace?: string;
    birthDate?: string;
    phone: string;
    address: string;
    username: string;
    email: string;
    photoProfile?: File;
    photoProfileName?: string;
    photoProfileUrl?: string;
  }>({
    initialValues: {
      fullName: "",
      phone: "",
      address: "",
      username: "",
      email: "",
    },
    onSubmit: async (values: any) => {
      setIsSaveLoading(true);
      try {
        const value = {
          name: values.fullName,
          gender: values.gender,
          phone: values.phone,
          address: values.address,
          username: values.username,
          email: values.email,
        };

        const result = await fetch(`/api/user/update-profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(value),
        });
        const resultJson = await result.json();

        if (!result.ok || resultJson.status === false) {
          throw new Error(resultJson.message || "Data user gagal disimpan.");
        }

        console.log("[UpdateProfile] update-profile response", resultJson);

        const uploadUserId = String(
          resultJson.data?.id_users ||
            resultJson.data?.id ||
            profileUserId ||
            "",
        );

        console.log("[UpdateProfile] upload user id decision", {
          resultIdUsers: resultJson.data?.id_users,
          resultId: resultJson.data?.id,
          profileUserId,
          uploadUserId,
        });

        if (uploadUserId) {
          setProfileUserId(uploadUserId);
        }

        const photoFile = getValidPhotoFile(values.photoProfile);

        if (values.photoProfile && !photoFile) {
          throw new Error("File foto profil tidak valid.");
        }

        if (photoFile && uploadUserId) {
          const formData = new FormData();
          formData.append(profilePhotoFieldName, photoFile, photoFile.name);
          const formDataEntries = Array.from(formData.entries()).map(
            ([key, value]) => ({
              key,
              value:
                value instanceof File
                  ? {
                      name: value.name,
                      size: value.size,
                      type: value.type,
                    }
                  : value,
            }),
          );

          console.log("[UpdateProfile] upload-photo request", {
            uploadUserId,
            fieldName: profilePhotoFieldName,
            fileName: photoFile.name,
            fileSize: photoFile.size,
            fileType: photoFile.type,
            formDataEntries,
          });

          const photoResponse = await fetch(
            `/api/user/update-photo-profile/${uploadUserId}`,
            {
              method: "PUT",
              body: formData,
            },
          );
          const photoJson = await photoResponse.json();

          if (!photoResponse.ok || photoJson.status === false) {
            throw new Error(
              photoJson.message || "Foto profil gagal diperbarui.",
            );
          }
        }

        await getUserData();
        setPreviewUrl(null);
        formik.setFieldValue("photoProfile", undefined);

        toast.success("Data user berhasil disimpan.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } catch (error: any) {
        toast.error(error.message || "Data user gagal disimpan.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } finally {
        setIsSaveLoading(false);
      }
    },
    validationSchema: schema,
  });

  // Get data user
  const getUserData = async () => {
    if (!data?.user?.id) {
      return;
    }

    try {
      const response = await fetch(`/api/user/update-profile`, {
        method: "GET",
      });
      const user = await response.json();

      if (!response.ok || user.status === false) {
        throw new Error(user.message || "Gagal mengambil data user.");
      }

      if (user.data) {
        console.log("[UpdateProfile] getUserData response", user.data);
        setProfileUserId(String(user.data.id_users || user.data.id || ""));
        formik.setValues({
          fullName: user.data.name || "",
          gender: user.data?.gender,
          birthPlace: user.data?.birthplace || "",
          birthDate: user.data?.birthdate || "",
          phone: user.data?.phone || "",
          address: user.data?.address || "",
          username: user.data?.username || "",
          email: user.data?.email || "",
          photoProfile: undefined,
          photoProfileName: user.data?.photo,
          photoProfileUrl: user.data?.photo_thumb,
        });
        setGenderSelected(
          genderOption.filter((item: any) => item.id == user.data.gender)[0] ||
            {},
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data user.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data?.user?.id) {
      getUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user?.id]);

  return (
    <>
      {/* Toast */}
      <ToastContainer />
      {/* Row */}
      <div className="flex flex-wrap mt-0 mb-3 mx-0">
        {isLoading == false ? (
          <div className="flex-2 w-full max-w-full px-0 mt-0">
            {/* Form */}
            <form onSubmit={formik.handleSubmit}>
              {/* Card */}
              <CardContainerComponent
                title="Personal"
                actionButtonCard={() => null}
              >
                {/* Col */}
                <div className="flex-2 w-full max-w-full px-0 mt-0">
                  {/* Row */}
                  <div className="mx-0 mb-0 grid grid-cols-1 gap-x-0 md:mx-2 md:grid-cols-2 md:gap-x-0">
                    {/* Col */}
                    <div className="mb-3 w-full px-0 md:px-3">
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
                    <div className="mb-3 w-full px-0 md:px-3">
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
                  <div className="mx-0 mb-0 grid grid-cols-1 gap-x-0 md:mx-2 md:grid-cols-2 md:gap-x-0">
                    {/* Col */}
                    <div className="mb-3 w-full px-0 md:px-3">
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
                    <div className="mb-3 w-full px-0 md:px-3">
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
                  <div className="mx-0 mb-0 grid grid-cols-1 md:mx-2">
                    {/* Col */}
                    <div className="mb-3 w-full px-0 md:px-3">
                      <FileInputComponent
                        label="Foto Profil"
                        name="photoProfile"
                        onChange={(e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            formik.setFieldValue("photoProfile", file);
                            setPreviewUrl(URL.createObjectURL(file));
                          } else {
                            formik.setFieldValue("photoProfile", undefined);
                            setPreviewUrl(null);
                          }
                        }}
                        previewUrl={previewUrl}
                        currentImage={formik.values.photoProfileUrl}
                      />
                    </div>
                  </div>
                </div>
              </CardContainerComponent>
              {/* Card */}
              <CardContainerComponent
                title="Authentication"
                actionButtonCard={() => null}
              >
                {/* Col */}
                <div className="flex-2 w-full max-w-full px-0 mt-0">
                  {/* Row */}
                  <div className="mx-0 mb-0 grid grid-cols-1 gap-x-0 md:mx-2 md:grid-cols-2 md:gap-x-0">
                    {/* Col */}
                    <div className="mb-3 w-full px-0 md:px-3">
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
                    <div className="mb-3 w-full px-0 md:px-3">
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
                  <div className="mx-0 mb-0 grid grid-cols-1 md:mx-2">
                    {/* Col */}
                    <div className="mb-3 w-full px-0 md:px-3">
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

export default UpdateProfile;
