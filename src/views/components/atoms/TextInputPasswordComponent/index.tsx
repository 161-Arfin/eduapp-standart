import React, { useState } from "react";

type TextInputPasswordComponentProps = {
  label: string;
  value: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isPriority?: boolean;
};

const TextInputPasswordComponent = ({
  label,
  value,
  handleChange,
  isInvalid,
  errorMessage,
  isPriority,
}: TextInputPasswordComponentProps) => {
  const [passwordType, setPasswordType] = useState(true);
  return (
    <div className="mb-3">
      <label
        className={`mb-2 block text-sm font-medium text-gray-700 ${
          isPriority && "after:content-['*'] after:ml-0.5 after:text-red-500"
        }`}
      >
        {label}
      </label>
      <div className="max-w-full space-y-1">
        <div className="relative">
          <input
            type={passwordType ? "password" : "text"}
            className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition placeholder:text-gray-400 disabled:pointer-events-none disabled:opacity-50 ${
              isInvalid
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-blue-300 focus:ring-blue-300"
            }`}
            onChange={handleChange}
            value={value}
          />
          <button
            type="button"
            className="absolute inset-y-0 end-0 z-0 flex cursor-pointer items-center rounded-e-md px-3 text-gray-400 focus:outline-none focus:text-blue-600"
            onClick={() => setPasswordType(!passwordType)}
          >
            <svg
              className="shrink-0 size-3.5"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                className={passwordType ? "block" : "hidden"}
                d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
              ></path>
              <path
                className={passwordType ? "block" : "hidden"}
                d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
              ></path>
              <path
                className={passwordType ? "block" : "hidden"}
                d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
              ></path>
              <line
                className={passwordType ? "block" : "hidden"}
                x1="2"
                x2="22"
                y1="2"
                y2="22"
              ></line>
              <path
                className={passwordType ? "hidden" : "block"}
                d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
              ></path>
              <circle
                className={passwordType ? "hidden" : "block"}
                cx="12"
                cy="12"
                r="3"
              ></circle>
            </svg>
          </button>
          {isInvalid ? (
            <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-8">
              <svg
                className="shrink-0 size-4 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="8" y2="12"></line>
                <line x1="12" x2="12.01" y1="16" y2="16"></line>
              </svg>
            </div>
          ) : null}
        </div>
        {isInvalid ? (
          <p className="text-sm text-red-600 mt-1">
            {errorMessage ? errorMessage : "Invalid input"}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default TextInputPasswordComponent;
