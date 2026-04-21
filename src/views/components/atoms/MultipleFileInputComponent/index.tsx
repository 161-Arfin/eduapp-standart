import React from "react";

type MultipleFileInputComponentProps = {
  label?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  value?: string;
  fileInputRef?: React.Ref<HTMLInputElement>;
  accept?: string;
};

const MultipleFileInputComponent = ({
  label,
  onChange,
  name,
  value,
  fileInputRef,
  accept,
}: MultipleFileInputComponentProps) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      <div className="max-w-full space-y-1">
        <div className="relative">
          <label className="sr-only">Choose file</label>
          <input
            type="file"
            name={name}
            id={name}
            className="block w-full border border-gray-200 shadow-md rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-gray-100 file:border-0 file:me-4 file:py-2 file:px-4"
            onChange={(e) => onChange(e)}
            value={value}
            accept={accept}
            multiple
            ref={fileInputRef}
          />
        </div>
      </div>
    </div>
  );
};

export default MultipleFileInputComponent;
