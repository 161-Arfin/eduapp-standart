import React, { useEffect } from "react";

type SearchComponentProps = {
  handleClick: (value: string) => void;
  changeValue: (value: string) => void;
  isLoading?: boolean;
};

const SearchComponent = ({
  handleClick,
  changeValue,
  isLoading,
}: SearchComponentProps) => {
  const [onChangeValue, setOnChangeValue] = React.useState("");

  useEffect(() => {
    changeValue(onChangeValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChangeValue]);

  return (
    <div>
      <label className="sr-only">Search</label>
      <div className="relative flex rounded-lg">
        <input
          type="text"
          id="hs-trailing-button-add-on-with-icon-and-button"
          name="hs-trailing-button-add-on-with-icon-and-button"
          className="py-1.5 sm:py-2 px-4 ps-11 block w-full bg-gray-50 border-gray-200 rounded-s-lg sm:text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          onChange={(e) => setOnChangeValue(e.target.value)}
        />
        <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-4">
          <svg
            className="shrink-0 size-4 text-gray-400 dark:text-neutral-500"
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
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>
        <button
          type="button"
          className="w-24 py-0 px-3 inline-flex justify-center items-center gap-x-2 text-xs font-normal rounded-e-md border border-transparent bg-blue-500 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => handleClick(onChangeValue)}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-full flex items-center justify-center gap-2">
              <div
                className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-gray-200 rounded-full dark:text-gray-100"
                role="status"
                aria-label="loading"
              >
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            "Search"
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchComponent;
