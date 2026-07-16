import React from "react";

type TextInputComponentProps = {
  label: string;
  value: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isPriority?: boolean;
};

const TextInputComponent = ({
  label,
  value,
  handleChange,
  isInvalid,
  errorMessage,
  isPriority,
}: TextInputComponentProps) => {
  return (
    <div className="mb-3">
      <label
        className={`block text-sm font-medium mb-2 ${
          isPriority && "after:content-['*'] after:ml-0.5 after:text-red-500"
        }`}
      >
        {label}
      </label>
      <div className="max-w-full space-y-1">
        <div className="relative">
          <input
            type="text"
            className={`py-2 px-3 block w-full border rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none ${
              isInvalid
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-blue-300 focus:ring-blue-300"
            }`}
            onChange={handleChange}
            value={value}
          />
          {isInvalid ? (
            <div className="absolute inset-y-0 inset-e-0 flex items-center pointer-events-none pe-3">
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

export default TextInputComponent;
