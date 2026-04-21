import { passwordRegExp } from "@/utils/data/static";
import ButtonComponent from "@/views/components/atoms/ButtonComponent";
import CardContainerComponent from "@/views/components/atoms/CardContainerComponent";
import SelectComponent from "@/views/components/atoms/SelectComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import TextInputPasswordComponent from "@/views/components/atoms/TextInputPasswordComponent";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";

interface Data {
  id: number;
  name: string;
}

const ChangePassword = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [schemaValidationUserId, setSchemaValidationUserId] = useState<any>();
  const [userOption, setUserOption] = useState([]);
  const { data }: any = useSession();

  function createData(id: number, name: string): Data {
    return {
      id: id,
      name: name,
    };
  }

  const getUserData = async () => {
    if (
      data?.user.usertypeId != undefined &&
      data?.user.instansiId != undefined
    ) {
      const userData = await fetch(
        `/api/user/user-options/${data.user.usertypeId}/${data.user.instansiId}`,
        {
          method: "GET",
        },
      );
      const userDataJson = await userData.json();

      if (userDataJson.status === false) {
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
        setUserOption([]);
      }

      if (userDataJson.data && userDataJson.data.length > 0) {
        const result = userDataJson.data.map((data: any) => {
          return createData(data.id_users, data.name);
        });
        const listOption: any = [{ id: 0, name: "- Pilih User -" }, ...result];

        setUserOption(listOption);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      data?.user.usertypeId == 1 ||
      data?.user.usertypeId == 5 ||
      data?.user.usertypeId == 2
    ) {
      getUserData();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

  useEffect(() => {
    if (data?.user.usertypeId == 5) {
      setSchemaValidationUserId(
        yup.string().required("Pilih user terlebih dahulu"),
      );
    } else if (data?.user.usertypeId == 1) {
      setSchemaValidationUserId(
        yup.string().required("Pilih user terlebih dahulu"),
      );
    } else if (data?.user.usertypeId == 2) {
      setSchemaValidationUserId(
        yup.string().required("Pilih user terlebih dahulu"),
      );
    } else {
      setSchemaValidationUserId(yup.string());
    }
  }, [data?.user.usertypeId]);

  const schema = yup.object().shape({
    userId: schemaValidationUserId,
    password: yup
      .string()
      .required("Password harus diisi")
      .min(8, "Password minimal memiliki 8 karakter")
      .max(20, "Password maksimal memiliki 20 karakter")
      .matches(
        passwordRegExp,
        "Password harus mengandung huruf kecil, huruf besar, dan angka",
      ),
    confirm_password: yup
      .string()
      .required("Konfirmasi password harus diisi")
      .oneOf([yup.ref("password"), ""], "Harus sama dengan password"),
  });

  const formik = useFormik<{
    userId: string;
    password: string;
    confirm_password: string;
  }>({
    initialValues: {
      userId: "",
      password: "",
      confirm_password: "",
    },
    onSubmit: async (values: any) => {
      setIsSaveLoading(true);

      if (
        data?.user.usertypeId != 2 &&
        data?.user.usertypeId != 1 &&
        data?.user.usertypeId != 5
      ) {
        values.userId = data?.user.id;
      }

      // Deklarasi value
      const value = {
        password: values.password,
        confirm_password: values.confirm_password,
      };

      const result = await fetch(`/api/user/change-password/${values.userId}`, {
        method: "PUT",
        body: JSON.stringify(value),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (result.status === 200) {
        toast.success("Password berhasil disimpan.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        formik.resetForm();
      } else {
        toast.error("Password gagal disimpan.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        formik.resetForm();
      }
      setIsSaveLoading(false);
    },
    validationSchema: schema,
  });

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
                title="Silahkan Ganti Password Anda"
                actionButtonCard={() => null}
              >
                {/* Col */}
                <div className="flex-2 w-full max-w-full px-0 mt-0">
                  {/* Row */}
                  <div className="mx-0 mb-0 grid grid-cols-1 md:mx-2">
                    {data?.user.usertypeId == 1 ||
                    data?.user.usertypeId == 5 ||
                    data?.user.usertypeId == 2 ? (
                      <div className="mb-3 w-full px-0 md:px-3">
                        <SelectComponent
                          id="userId"
                          label="Pilih User"
                          options={userOption}
                          selectedValue={(e: any) => {
                            if (e.id != 0) {
                              formik.setFieldValue("userId", e.id);
                            } else {
                              formik.setFieldValue("userId", "");
                            }
                          }}
                          isInvalid={!!formik.errors.userId}
                          errorMessage={formik.errors.userId}
                          isPriority
                        />
                      </div>
                    ) : null}
                  </div>
                  {/* Row */}
                  <div className="mx-0 mb-0 grid grid-cols-1 gap-x-0 md:mx-2 md:grid-cols-2">
                    <div className="mb-3 w-full px-0 md:px-3">
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
                    <div className="mb-3 w-full px-0 md:px-3">
                      <TextInputPasswordComponent
                        label="Konfirmasi Password"
                        value={formik.values.confirm_password}
                        handleChange={(e) =>
                          formik.setFieldValue(
                            "confirm_password",
                            e.target.value,
                          )
                        }
                        isInvalid={!!formik.errors.confirm_password}
                        errorMessage={formik.errors.confirm_password}
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
          <div className="w-full h-[400px] flex justify-center items-center">
            <SpinLoadingComponent />
          </div>
        )}
      </div>
    </>
  );
};

export default ChangePassword;
