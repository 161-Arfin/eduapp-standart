import React, { useCallback } from "react";

type FormLoginProps = {
  title: string;
  placeholder?: string;
  name: string;
  formik: any;
  formikOnChange: any;
  type: string;
  errorMessage?: string;
  autofocus?: boolean;
};
const FormLogin = ({
  title,
  placeholder,
  name,
  formik,
  formikOnChange,
  type,
  errorMessage,
  autofocus,
}: FormLoginProps) => {
  const emailInput = useCallback((inputElement: any) => {
    if (inputElement && autofocus) {
      inputElement.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-3">
      <span className="block mb-2 text-md">{title}</span>
      <input
        type={type}
        className={`w-full p-2 border ${
          !!formik.errors[name]
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-300 focus:outline-none"
            : "border-gray-300"
        } rounded-md placeholder:font-light placeholder:text-gray-500`}
        name={name}
        id={name}
        value={formik.values[name]}
        onChange={formikOnChange}
        ref={emailInput}
      />
      {!!formik.errors[name] && (
        <p
          className="text-sm text-red-600 mt-2"
          id="hs-validation-name-error-helper"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormLogin;
