import React from "react";

const SpinLoadingComponent = () => {
  return (
    <div
      className="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SpinLoadingComponent;
