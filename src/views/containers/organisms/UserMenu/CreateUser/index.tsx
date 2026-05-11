import {
  genderOption,
  passwordRegExp,
  phoneRegExp,
  usernameRegExp,
  usertypeOption,
} from "@/utils/data/static";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/init";
import { useDispatch } from "react-redux";
import { setAlertMessage } from "@/lib/redux/actions/alertMessageSlice";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import CardContainerComponent from "@/views/components/atoms/CardContainerComponent";
import TextInputComponent from "@/views/components/atoms/TextInputComponent";
import SelectComponent from "@/views/components/atoms/SelectComponent";
import TextInputGroupComponent from "@/views/components/atoms/TextInputGroupComponent";
import TextInputPasswordComponent from "@/views/components/atoms/TextInputPasswordComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import FileInputComponent from "@/views/components/atoms/FileInputComponent";
import ButtonComponent from "@/views/components/atoms/ButtonComponent";
import DatepickerComponent from "@/views/components/atoms/DatepickerComponent";

interface Data {
  id: string;
  name: string;
}

const CreateUser = () => {
  const { data }: any = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const dispatch = useDispatch();
  const { push } = useRouter();
  const [companyOption, setCompanyOption] = useState([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const levelUserOption = useMemo(() => {
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

    return [{ id: "0", name: "- Pilih Level User -" }, ...levelUser];
  }, [data?.user.usertypeId]);

  function createData(id: string, name: string): Data {
    return {
      id: id,
      name: name,
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
        const result = responseJson.data.map((data: any) => {
          return createData(data.id_instansi, data.instansi_name);
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

  // Rendering Awal
  useEffect(() => {
    if (data?.user?.usertypeId == 5) {
      getDataInstansi();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

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
    password: yup
      .string()
      .required("Password harus diisi")
      .min(8, "Password minimal memiliki 8 karakter")
      .max(20, "Password maksimal memiliki 20 karakter")
      .matches(
        passwordRegExp,
        "Password harus mengandung huruf kecil, huruf besar, dan angka",
      ),
    confirmPassword: yup
      .string()
      .required("Konfirmasi password harus diisi")
      .oneOf([yup.ref("password"), ""], "Harus sama dengan password"),
    instansiId:
      data?.user.usertypeId == 5
        ? yup.string().required("Instansi harus diisi")
        : yup.string(),
    usertypeId: yup.number().required("User type harus diisi"),
  });

  // Handle formik
  const formik = useFormik<{
    fullName: string;
    gender?: number;
    birthPlace: string;
    birthDate: string;
    phone: string;
    address: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    instansiId: string;
    usertypeId?: string;
    photoProfile?: File;
    photoProfileUrl?: string;
  }>({
    initialValues: {
      fullName: "",
      phone: "",
      birthPlace: "",
      birthDate: "",
      address: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      instansiId: "",
    },
    onSubmit: async (values: any) => {
      setIsSaveLoading(true);

      const instansiId =
        data?.user.usertypeId == 5 ? values.instansiId : data?.user.instansiId;

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
        password: values.password,
        password_confirm: values.confirmPassword,
        instansi_id: instansiId,
        usertype_id: values.usertypeId,
        data_access_id: [1, 2, 3, 4, 5],
        photo: "noimage.jpg",
        photo_thumb: "",
      };

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

        await uploadBytes(imageRef, values.photoProfile)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref)
              .then(async (url) => {
                // Tambahkan data
                value.photo_thumb = url;

                // Create User
                const result = await fetch("../api/user/register", {
                  method: "POST",
                  headers: {
                    "auth-token": data?.user?.apiToken,
                  },
                  body: JSON.stringify(value),
                });

                if (result.status === 200) {
                  dispatch(
                    setAlertMessage({
                      status: true,
                      message: "Data user berhasil disimpan",
                    }),
                  );
                  push("/user");
                } else {
                  dispatch(
                    setAlertMessage({
                      status: false,
                      message: "Data user gagal disimpan",
                    }),
                  );
                  push("/user");
                }
              })
              .catch((error) => {
                dispatch(
                  setAlertMessage({
                    status: false,
                    message: "Data user gagal disimpan",
                  }),
                );
                setIsSaveLoading(false);
              });
          })
          .catch((error) => {
            dispatch(
              setAlertMessage({
                status: false,
                message: "Data user gagal disimpan",
              }),
            );
            setIsSaveLoading(false);
          });
      } else {
        // Create user
        const result = await fetch("../api/user/register", {
          method: "POST",
          headers: {
            "auth-token": data?.user?.apiToken,
          },
          body: JSON.stringify(value),
        });

        if (result.status === 200) {
          dispatch(
            setAlertMessage({
              status: true,
              message: "Data user berhasil disimpan",
            }),
          );
          push("/user");
        } else {
          dispatch(
            setAlertMessage({
              status: false,
              message: "Data user gagal disimpan",
            }),
          );
          push("/user");
        }
      }
    },
    validationSchema: schema,
  });

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
              <CardContainerComponent
                title="Personal"
                actionButtonCard={() => null}
              >
                {/* Col */}
                <div className="flex-2 w-full max-w-full px-0 mt-0">
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
                    <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
                      <TextInputPasswordComponent
                        label="Password"
                        value={formik.values.password}
                        handleChange={(e) =>
                          formik.setFieldValue("password", e.target.value)
                        }
                        isInvalid={!!formik.errors.password}
                        errorMessage={formik.errors.password}
                        isPriority
                      />
                    </div>
                    {/* Col */}
                    <div className="mb-3 w-full md:w-1/2 flex-2 px-0 md:px-3">
                      <TextInputPasswordComponent
                        label="Konfirmasi Password"
                        value={formik.values.confirmPassword}
                        handleChange={(e) =>
                          formik.setFieldValue(
                            "confirmPassword",
                            e.target.value,
                          )
                        }
                        isInvalid={!!formik.errors.confirmPassword}
                        errorMessage={formik.errors.confirmPassword}
                        isPriority
                      />
                    </div>
                  </div>
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
                          isInvalid={!!formik.errors.instansiId}
                          errorMessage={formik.errors.instansiId}
                        />
                      </div>
                    ) : null}
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
                </div>
              </CardContainerComponent>
            </form>
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

export default CreateUser;
