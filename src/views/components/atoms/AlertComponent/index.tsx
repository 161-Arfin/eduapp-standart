import React from "react";

type AlertComponentProps = {
  message: string;
};
const AlertComponent = ({ message }: AlertComponentProps) => {
  return (
    <div
      className="bg-red-50 border-s-4 border-red-500 p-3"
      role="alert"
      aria-labelledby="hs-bordered-red-style-label"
    >
      <div className="flex items-center">
        <div className="shrink-0">
          {/* Icon */}
          <span className="inline-flex justify-center items-center size-8 rounded-full border-4 border-red-100 bg-red-200 text-red-800">
            <svg
              className="shrink-0 size-4"
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
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </span>
          {/* End Icon */}
        </div>
        <div className="ms-3">
          <p className="text-md text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertComponent;
