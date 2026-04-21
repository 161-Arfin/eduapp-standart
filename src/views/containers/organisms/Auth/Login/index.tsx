import Image from "next/image";
import React, { useState } from "react";
import logoImage from "../../../../../../public/assets/images/logo_edu.jpg";
import FormLogin from "@/views/components/molecules/FormLogin";
import { useFormik } from "formik";
import * as yup from "yup";
import CheckboxComponent from "@/views/components/atoms/CheckboxComponent";
import ButtonComponent from "@/views/components/atoms/ButtonComponent";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import AlertComponent from "@/views/components/atoms/AlertComponent";

const Login = () => {
  const [checked, setChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { push, query } = useRouter();
  const callbackUrl: any = query.callbackUrl || "/home";

  const schema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
  });

  const formik = useFormik<{
    username: string;
    password: string;
  }>({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: async (values: any) => {
      setIsLoading(true);
      setErrorMessage("");
      // Deklarasi value
      const value = {
        redirect: false,
        username: values.username,
        password: values.password,
        callbackUrl,
      };

      try {
        const res = await signIn("credentials", value);

        if (!res?.error) {
          push(callbackUrl);
        } else {
          setIsLoading(false);
          setErrorMessage("Username atau password Anda salah.");
        }
      } catch (error: any) {
        setIsLoading(false);
        setErrorMessage(error.message);
      }
    },
    validationSchema: schema,
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('/assets/images/bgLogin.jpg')] bg-no-repeat bg-cover">
      <div className="relative flex flex-col w-full max-w-[95%] space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:max-w-none md:w-auto md:mx-6">
        <div className="flex flex-col justify-center p-8 md:p-11">
          <span className="mb-3 text-2xl md:text-3xl font-bold">
            Selamat Datang di EduArsip
          </span>
          <span className="font-light text-gray-400 mb-8 text-md">
            Masukkan username dan password untuk masuk ke sistem
          </span>
          {errorMessage && <AlertComponent message={errorMessage} />}
          <form onSubmit={formik.handleSubmit}>
            <FormLogin
              title="Username"
              name="username"
              type="text"
              formik={formik}
              formikOnChange={(e: any) =>
                formik.setFieldValue("username", e.target.value)
              }
              errorMessage="Username harus diisi"
              autofocus
            />
            <FormLogin
              title="Password"
              name="password"
              type={checked ? "text" : "password"}
              formik={formik}
              formikOnChange={(e: any) =>
                formik.setFieldValue("password", e.target.value)
              }
              errorMessage="Password harus diisi"
            />
            <CheckboxComponent
              label="Tampilkan Password"
              name="showPass"
              onChecked={() => setChecked(!checked)}
            />
            <ButtonComponent label="Login" isLoading={isLoading} color="info" />
          </form>
        </div>
        <div className="relative">
          <Image
            src={logoImage}
            alt="bgImage"
            className="w-[400px] h-full hidden rounded-r-2xl md:block object-contain"
            width={500}
            height={500}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
