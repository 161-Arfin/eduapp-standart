import React from "react";

type FrontListComponentProps = {
  item: any;
  handleScroll?: any;
  isLoadingFetchMoreData?: boolean;
  handleDetail?: any;
};

const FrontListComponent = ({
  item,
  handleScroll,
  isLoadingFetchMoreData,
  handleDetail,
}: FrontListComponentProps) => {
  const scrollRef = React.useRef(null);

  return (
    <div
      className="space-y-4 h-screen overflow-y-auto"
      onScroll={() => handleScroll(scrollRef) || null}
      ref={scrollRef}
    >
      {/* <!-- Card --> */}
      {item?.map((row: any, index: number) => {
        return (
          <div
            key={index}
            className="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => handleDetail(row)}
          >
            <div className="flex justify-between gap-x-5 p-4 md:p-5">
              <span className="flex gap-x-5">
                <svg
                  className="shrink-0 mt-1 size-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 -960 960 960"
                  fill="#6b7280"
                >
                  <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z" />
                </svg>

                <span className="grow">
                  <span className="block font-medium text-gray-800">
                    {row.no_arsip}
                  </span>
                  <span className="block text-[.975rem]/[1.25rem] text-blue-600">
                    {row.arsip_name}
                  </span>
                  <span className="block mt-1 text-[.85rem]/[1rem] text-gray-500">
                    {row.deskripsi_arsip}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-2 mt-4">
                    {row.status_retensi || null}
                    {row.is_available}
                  </div>
                </span>
              </span>
            </div>
          </div>
        );
      })}
      {/* <!-- End Card --> */}
      {isLoadingFetchMoreData ? (
        <div className="flex flex-row justify-center items-center w-full">
          <p className="text-sm font-medium text-gray-500">Loading...</p>
        </div>
      ) : null}
    </div>
  );
};

export default FrontListComponent;
