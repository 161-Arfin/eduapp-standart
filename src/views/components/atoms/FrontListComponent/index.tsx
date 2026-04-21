import React from "react";
import { useSession } from "next-auth/react";
import { getPackageCapabilities } from "@/utils/packageCapabilities";

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
  const { data }: any = useSession();
  const packageCapabilities = getPackageCapabilities(data?.user?.usertypeId);

  return (
    <div
      className="space-y-4 h-screen overflow-y-auto"
      onScroll={() => handleScroll(scrollRef) || null}
      ref={scrollRef}
    >
      {/* <!-- Card --> */}
      {item?.map((row: any, index: number) => {
        const locationParts = [
          row.lokasi_name ? `Lokasi ${row.lokasi_name}` : null,
          row.rak_name ? `Rak ${row.rak_name}` : null,
          row.baris_name ? `Baris ${row.baris_name}` : null,
          row.box_name ? `Box ${row.box_name}` : null,
          row.map_name ? `Map ${row.map_name}` : null,
        ].filter(Boolean);

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
                    {locationParts.length > 0 ? (
                      <p className="mt-1 text-xs text-gray-500">
                        {locationParts.join(" | ")}
                      </p>
                    ) : null}
                    {row.status_retensi || null}
                    {row.is_available}
                  </div>
                </span>
              </span>

              {packageCapabilities.canManageRetention && row.divisi_name ? (
                <div>
                  <span className="py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-xs text-gray-800 bg-gray-100 hover:text-cyan-700 rounded-lg focus:outline-hidden focus:text-cyan-700 max-w-52 uppercase">
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      width="20"
                      viewBox="0 -960 960 960"
                      fill="#1f2937"
                    >
                      <path d="M240-144v-600q0-29.7 21.15-50.85Q282.3-816 312-816h336q29.7 0 50.85 21.15Q720-773.7 720-744v600l-240-96-240 96Zm72-107 168-67 168 67v-493H312v493Zm0-493h336-336Z" />
                    </svg>
                    {row.divisi_name}
                  </span>
                </div>
              ) : null}
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
