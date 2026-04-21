import Image from "next/image";
import React, { useState } from "react";
import { FaAnglesRight } from "react-icons/fa6";

type FileInputComponentProps = {
  label?: string;
  onChange: Function;
  name: string;
  previewUrl?: string | null;
  currentImage?: string | null;
  value?: string;
};

const FileInputComponent = ({
  label,
  onChange,
  name,
  previewUrl,
  currentImage,
  value,
}: FileInputComponentProps) => {
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileLabel =
    selectedFileName ||
    (value && value.trim() !== ""
      ? value.split("\\").pop() || value
      : "No file chosen");

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
      </label>
      <div className="flex flex-col items-center md:flex-row md:items-center">
        <div className="mb-3 flex w-full flex-2 justify-center px-0 md:w-[32%] md:justify-start md:px-2">
          {currentImage ? (
            <div className={`w-full max-w-[132px] sm:max-w-[150px] md:max-w-[180px] ${previewUrl && "blur-[2px]"}`}>
              <Image
                alt="file uploader preview"
                objectFit="cover"
                src={currentImage}
                width={180}
                height={180}
                layout="fixed"
                className="w-full mb-4 rounded-full"
              />
            </div>
          ) : (
            <div className={`w-full max-w-[132px] sm:max-w-[150px] md:max-w-[180px] ${previewUrl && "blur-[2px]"}`}>
              <Image
                alt="file uploader preview"
                objectFit="cover"
                src="/assets/images/noimage.jpg"
                width={180}
                height={180}
                layout="fixed"
                className="w-full mb-4 rounded-full"
              />
            </div>
          )}
        </div>
        {previewUrl ? (
          <>
            <div className="mb-2 flex w-full flex-2 justify-center px-0 pb-2 md:mb-3 md:w-[8%] md:pb-4">
              <FaAnglesRight
                className="rotate-90 md:rotate-0"
                style={{ fontSize: "32px", color: "gray" }}
              />
            </div>
            <div className="mb-3 flex w-full flex-2 justify-center px-0 md:w-[32%] md:justify-start md:px-2">
              <div className="w-full max-w-[132px] sm:max-w-[150px] md:max-w-[180px]">
                <Image
                  alt="file uploader preview"
                  objectFit="cover"
                  src={previewUrl}
                  width={180}
                  height={180}
                  layout="fixed"
                  className="w-full mb-4 rounded-full"
                />
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="max-w-full space-y-1">
        <div className="relative">
          <input
            type="file"
            name={name}
            id={name}
            className="sr-only"
            onChange={(e) => {
              const fileName = e.target.files?.[0]?.name || "";
              setSelectedFileName(fileName);
              onChange(e);
            }}
            value={value}
          />
          <div className="flex w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <label
              htmlFor={name}
              className="flex shrink-0 cursor-pointer items-center justify-center border-r border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Choose File
            </label>
            <div className="min-w-0 flex-1 px-3 py-2 text-sm text-gray-500">
              <span className="block truncate">{fileLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileInputComponent;
