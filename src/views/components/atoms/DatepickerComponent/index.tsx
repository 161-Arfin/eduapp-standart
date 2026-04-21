import React from "react";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type DatepickerComponentProps = {
  label: string;
  name: string;
  activeDateDefault: string | null;
  formikOnChange: any;
  format: string;
  isInvalid?: boolean;
  errorMessage?: string;
  isPriority?: boolean;
};

const DatepickerComponent = ({
  label,
  name,
  activeDateDefault,
  formikOnChange,
  format,
  isInvalid,
  errorMessage,
  isPriority,
}: DatepickerComponentProps) => {
  return (
    <div className="mb-3">
      <label
        className={`block text-sm font-medium mb-2 text-gray-700 ${
          isPriority && "after:content-['*'] after:ml-0.5 after:text-red-500"
        }`}
      >
        {label}
      </label>
      <div className="max-w-full space-y-1">
        <div className="relative">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {activeDateDefault ? (
              <MobileDatePicker
                name={name}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: isInvalid,
                    placeholder: format,
                  },
                  openPickerButton: {
                    sx: {
                      display: "none",
                    },
                  },
                  inputAdornment: {
                    sx: {
                      display: "none",
                    },
                  },
                }}
                defaultValue={dayjs(activeDateDefault)}
                onChange={formikOnChange}
                format={format}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.5rem",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "#6b7280",
                    padding: "11.5px 14px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isInvalid ? "#ef4444" : "#e5e7eb",
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: isInvalid ? "#ef4444" : "#d1d5db",
                    },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: isInvalid ? "#ef4444" : "#93c5fd",
                    },
                }}
                className="rounded-lg"
              />
            ) : null}
            {activeDateDefault === null ? (
              <MobileDatePicker
                name={name}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: isInvalid,
                    placeholder: format,
                  },
                  openPickerButton: {
                    sx: {
                      display: "none",
                    },
                  },
                  inputAdornment: {
                    sx: {
                      display: "none",
                    },
                  },
                }}
                onChange={formikOnChange}
                format={format}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.5rem",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "#6b7280",
                    padding: "11.5px 14px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isInvalid ? "#ef4444" : "#e5e7eb",
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: isInvalid ? "#ef4444" : "#d1d5db",
                    },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: isInvalid ? "#ef4444" : "#93c5fd",
                    },
                }}
                className="rounded-lg"
              />
            ) : null}
          </LocalizationProvider>
          {isInvalid ? (
            <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
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

export default DatepickerComponent;

