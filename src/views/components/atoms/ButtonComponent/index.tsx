import React from "react";

type ButtonComponentProps = {
  label: string;
  isLoading: boolean;
  handleClick?: any;
  color?: string;
};
const ButtonComponent = ({
  label,
  isLoading,
  handleClick,
  color,
}: ButtonComponentProps) => {
  return (
    <button
      type="submit"
      className={`w-full ${
        color == "info"
          ? "bg-blue-400 hover:bg-blue-600 text-white"
          : "bg-white hover:bg-gray-200 text-gray-600"
      } p-2 rounded-lg mb-0 transition-colors`}
      disabled={isLoading}
      onClick={handleClick}
    >
      {isLoading ? (
        <div className="flex justify-center items-center gap-2">
          <span
            className="animate-spin inline-block size-5 border-[3px] border-current border-t-transparent text-white rounded-full"
            role="status"
            aria-label="loading"
          ></span>{" "}
          Loading...
        </div>
      ) : (
        label
      )}
    </button>
  );
};

export default ButtonComponent;
