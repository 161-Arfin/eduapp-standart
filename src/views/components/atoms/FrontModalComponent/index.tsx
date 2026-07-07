import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FrontDetailComponent from "../FrontDetailComponent";
import FrontListComponent from "../FrontListComponent";
import { setShowModal } from "@/lib/redux/actions/ShowModalSlice";
import SpinLoadingComponent from "../SpinLoadingComponent";
import { toast } from "react-toastify";

type FrontModalComponentProps = {
  title: string;
  dataTarget: string;
  isLoading: boolean;
  rows: any;
  handleScroll?: any;
  isLoadingFetchMoreData?: boolean;
  totalData?: string;
  searchResultFrom?: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  onSearchSubmit?: () => void;
};

const FrontModalComponent = ({
  title,
  dataTarget,
  isLoading,
  rows,
  handleScroll,
  isLoadingFetchMoreData,
  totalData,
  searchResultFrom,
  searchValue = "",
  onSearchValueChange,
  onSearchSubmit,
}: FrontModalComponentProps) => {
  const dispatch = useDispatch();
  const [currentChildren, setCurrentChildren] = useState("");
  const [rowDetail, setRowDetail] = useState({});
  const [fileIsLoading, setFileIsLoading] = useState(false);
  const isShowModal = useSelector((state: any) => state.showModal.data);

  const getFileArsip = async (row: any) => {
    setFileIsLoading(true);
    const initialDetail = { ...row, arsip_files: [] };
    setRowDetail(initialDetail);

    try {
      const response = await fetch(`/api/arsip-files/byarsip/${row.id}`, {
        method: "GET",
        cache: "no-store",
      });
      const responseJson = await response.json();

      if (responseJson.status === false) {
        toast.error("Internal server error", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        setRowDetail(initialDetail);
        return;
      }

      const arsipFiles = Array.isArray(responseJson.data)
        ? responseJson.data
        : [];
      setRowDetail({ ...row, arsip_files: arsipFiles });
    } catch (e: any) {
      toast.error("Internal server error " + e.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setFileIsLoading(false);
    }
  };

  const handleDetail = (row: any) => {
    setCurrentChildren("detailComponent");
    getFileArsip(row);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit?.();
  };

  useEffect(() => {
    if (isShowModal[dataTarget] == true) {
      setCurrentChildren("listComponent");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowModal[dataTarget]]);

  return (
    <div
      id="hs-notifications"
      className={`hs-overlay size-full fixed top-0 start-0 z-50 overflow-x-hidden overflow-y-auto ${
        isShowModal[dataTarget] ? "open opened" : "hidden"
      }`}
      role="dialog"
      aria-labelledby="hs-notifications-label"
    >
      <div
        className={`duration-500 ease-out transition-all sm:max-w-5xl sm:w-full m-3 sm:mx-auto ${
          isShowModal[dataTarget] ? "mt-7 opacity-100" : "mt-0 opacity-0"
        }`}
      >
        <div className="relative flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl overflow-hidden">
          {/* Tombol close */}
          <div className="absolute top-2 end-2">
            <button
              type="button"
              className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Close"
              data-hs-overlay="#hs-notifications"
              onClick={() => dispatch(setShowModal({ [dataTarget]: false }))}
            >
              <span className="sr-only">Close</span>
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          {/* Tombol kembali */}
          {currentChildren == "detailComponent" ? (
            <div className="absolute top-2 start-2">
              <button
                type="button"
                className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Close"
                data-hs-overlay="#hs-notifications"
                onClick={() => setCurrentChildren("listComponent")}
              >
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 -960 960 960"
                  width="24"
                  fill="#1f2937"
                >
                  <path d="M560.67-240 320-480.67l240.67-240.66L608-674 414.67-480.67 608-287.33 560.67-240Z" />
                </svg>
                <span className="absolute top-1 start-10 text-gray-500">
                  Back
                </span>
              </button>
            </div>
          ) : null}

          <div className="p-4 sm:p-10">
            <div className="mb-6 text-center">
              <h3
                id="hs-notifications-label"
                className="mb-2 text-xl font-bold text-gray-800"
              >
                {currentChildren == "listComponent" ? title : "Detail Arsip"}
              </h3>
              {currentChildren == "listComponent" && isLoading == false ? (
                <p className="text-gray-500 text-sm">
                  {rows?.length > 0 ? (
                    <>
                      Ada <span className="font-semibold">{totalData}</span>{" "}
                      data ditemukan dari pencarian arsip pada{" "}
                      <span className="font-semibold">
                        {searchResultFrom == "getAll"
                          ? "semua instansi"
                          : searchResultFrom || "kata kunci yang dimasukkan"}
                      </span>
                    </>
                  ) : (
                    <>
                      Tidak ada data dari pencarian arsip pada{" "}
                      <span className="font-semibold">
                        {searchResultFrom == "getAll"
                          ? "semua instansi"
                          : searchResultFrom || "kata kunci yang dimasukkan"}
                      </span>
                    </>
                  )}
                </p>
              ) : null}
            </div>

            {currentChildren == "listComponent" ? (
              <form
                className="mb-5"
                onSubmit={(event) => handleSearchSubmit(event)}
              >
                <div className="flex gap-x-3 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="w-full">
                    <label htmlFor="modal-search-arsip" className="sr-only">
                      Cari arsip
                    </label>
                    <input
                      id="modal-search-arsip"
                      type="text"
                      className="py-2.5 px-3 block w-full border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Cari arsip lain"
                      value={searchValue ?? ""}
                      onChange={(event) =>
                        onSearchValueChange?.(event.target.value)
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="size-10 inline-flex justify-center items-center rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={isLoading}
                    aria-label="Cari arsip"
                  >
                    <svg
                      className="shrink-0 size-5"
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
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </button>
                </div>
              </form>
            ) : null}

            {/* Untuk tampilan detail */}
            {currentChildren == "detailComponent" ? (
              <FrontDetailComponent row={rowDetail} isLoading={fileIsLoading} />
            ) : null}
            {/* End untuk tampilan detail */}

            {/* Untuk tampilan daftar pencarian arsip */}
            {currentChildren == "listComponent" ? (
              isLoading == false ? (
                <FrontListComponent
                  item={rows}
                  handleScroll={(e: any) => handleScroll(e)}
                  isLoadingFetchMoreData={isLoadingFetchMoreData}
                  handleDetail={(row: any) => handleDetail(row)}
                />
              ) : (
                <div className="w-full h-[400px] flex justify-center items-center">
                  <SpinLoadingComponent />
                </div>
              )
            ) : null}
            {/* End untuk tampilan daftar pencarian arsip */}
          </div>

          <div className="flex justify-end items-center gap-x-2 py-3 px-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50"
              data-hs-overlay="#hs-notifications"
              onClick={() => dispatch(setShowModal({ [dataTarget]: false }))}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontModalComponent;
