/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import FrontModalComponent from "../../atoms/FrontModalComponent";
import { useDispatch, useSelector } from "react-redux";
import { setShowModal } from "@/lib/redux/actions/ShowModalSlice";
import { getKeteranganMeta } from "@/utils/arsip";

interface DataOption {
  id: string;
  name: string;
}

interface Data {
  id: number;
  no_arsip: string;
  arsip_name: string;
  instansi_id?: number;
  instansi_name?: string;
  deskripsi_arsip: string;
  masa_retensi?: string;
  status_file_id: number;
  status_file: React.JSX.Element;
  status_retensi?: React.JSX.Element | null;
  keterangan_id: number;
  keterangan: string;
  created_at: string;
  created_by: string;
  user_name?: string;
  user_id?: number;
}

const FrontHeroBody = () => {
  const { data }: any = useSession();
  const dispatch = useDispatch();
  const [optionButton, setOptionButton] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingFetchMore, setIsLoadingFetchMore] = useState(false);
  const [onChangeValue, setOnChangeValue] = useState<string>("");
  const [rows, setRows] = useState<any>();
  const [lastDoc, setLastDoc] = useState([]);
  const [arrData, setArrData] = useState([]);
  const [totalData, setTotalData] = useState("");
  const [searchResultFrom, setSearchResultFrom] = useState("");
  const [idSearchResultFrom, setIdSearchResultFrom] = useState<string>();
  const isShowModal = useSelector((state: any) => state.showModal.data);

  // Struktur Data Option
  function createDataOption(id: string, name: string): DataOption {
    return {
      id: id,
      name: name,
    };
  }

  // Set struktur data arsip
  function createData(
    id_arsip: number,
    no_arsip: string,
    arsip_name: string,
    instansi_id: number | undefined,
    instansi_name: string | undefined,
    deskripsi_arsip: string,
    masa_retensi: string | undefined,
    status_file_id: number,
    status_file: React.JSX.Element,
    status_retensi: React.JSX.Element | null,
    keterangan_id: number,
    keterangan: string,
    created_at: string,
    created_by: string,
    user_name: string | undefined,
    user_id: number | undefined,
  ): Data {
    return {
      id: id_arsip,
      no_arsip,
      arsip_name,
      instansi_id,
      instansi_name,
      deskripsi_arsip,
      masa_retensi,
      status_file_id,
      status_file,
      status_retensi,
      keterangan_id,
      keterangan,
      created_at,
      created_by,
      user_name,
      user_id,
    };
  }

  const createRetentionBadge = (statusRetensi: unknown) => {
    const hasStatus =
      statusRetensi === true ||
      statusRetensi === false ||
      statusRetensi === 1 ||
      statusRetensi === 0 ||
      statusRetensi === "1" ||
      statusRetensi === "0" ||
      statusRetensi === "true" ||
      statusRetensi === "false";

    if (!hasStatus) {
      return null;
    }

    const isActive =
      statusRetensi === true ||
      statusRetensi === 1 ||
      statusRetensi === "1" ||
      statusRetensi === "true";

    return isActive ? (
      <span className="inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Inactive
      </span>
    );
  };

  const createStatusAccessBadge = (statusFile: unknown) =>
    Number(statusFile) === 1 ? (
      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Private
      </span>
    ) : (
      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
        Public
      </span>
    );

  const getInstansi = async () => {
    if (data?.user.usertypeId != undefined) {
      const response = await fetch(
        `../../api/company/${data.user.usertypeId}`,
        {
          method: "GET",
        },
      );
      const responseJson = await response.json();

      if (responseJson.status === false) {
        toast.error("Internal server error: " + responseJson.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setOptionButton([]);
      }

      if (responseJson.data && responseJson.data.length > 0) {
        const result = responseJson.data.map((data: any) => {
          return createDataOption(data.id_instansi, data.instansi_name);
        });

        setOptionButton(result);
      }
    }
  };

  useEffect(() => {
    if (data?.user.usertypeId) {
      if (data?.user.usertypeId === 5) {
        getInstansi();
      } else {
        setOptionButton([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user.usertypeId, data]);

  // Search Arsip
  const handleSearch = async (
    searchQuery: string,
    resultFrom = searchResultFrom,
    resultFromId = idSearchResultFrom,
  ) => {
    setIsLoadingSearch(true);
    try {
      const keyword = searchQuery.trim() || "null";
      const link =
        resultFrom == "getAll"
          ? `../../api/arsip/keyword/${encodeURIComponent(keyword)}`
          : `../../api/arsip/keyword/${encodeURIComponent(keyword)}/${resultFromId}`;

      const dataArsip = await fetch(link, {
        method: "GET",
      });

      const dataArsipJson = await dataArsip.json();

      if (dataArsipJson.status === false) {
        toast.error(dataArsipJson.message || "Pencarian arsip gagal", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setRows([]);
        setTotalData("0");
        return;
      }

      if (dataArsipJson.data?.length > 0) {
        const result = dataArsipJson.data.map((data: any) => {
          const statusAccess = createStatusAccessBadge(data.status_file);

          const statusRetensi = createRetentionBadge(data.status_retensi);

          // Format masa retensi
          const formatMasaRetensi = (value?: string) => {
            if (!value) return "-";

            const parsedDate = new Date(value);
            if (Number.isNaN(parsedDate.getTime())) return "-";

            const months = [
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ];

            const date = parsedDate.getDate();
            const month = months[parsedDate.getMonth()];
            const year = parsedDate.getFullYear();

            return `${date} ${month} ${year}`;
          };

          // Keterangan
          const keteranganMeta = getKeteranganMeta(data.keterangan);
          const keterangan = keteranganMeta.label;
          const keteranganId = keteranganMeta.id;

          // Created At
          let created_at: Date;
          let createdAt: string = "";
          if (data.created_at) {
            created_at = new Date(data.created_at);
            const months = [
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ];

            const year = created_at.getFullYear();
            const month = months[created_at.getMonth()];
            const date = created_at.getDate();

            createdAt = date + " " + month + " " + year;
          }
          console.log("data", data);
          return createData(
            data.id_arsip,
            data.no_arsip,
            data.arsip_name,
            data.instansi_id,
            data.instansi_name,
            data.deskripsi_arsip,
            formatMasaRetensi(data.masa_retensi),
            data.status_file,
            statusAccess,
            statusRetensi,
            keteranganId,
            keterangan,
            createdAt,
            data.created_by,
            data.user_name,
            data.user_id,
          );
        });
        const finalResult = result.sort((a: any, b: any) => b.id - a.id);

        setRows(finalResult);
        setLastDoc(dataArsipJson.cursor);
        setTotalData(String(dataArsipJson.total ?? finalResult.length));
      } else {
        setRows([]);
        setTotalData("0");
      }
    } catch (error: any) {
      toast.error("Internal server error. Error: " + error.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setRows([]);
      setTotalData("0");
    } finally {
      setArrData([]);
      setIsLoadingSearch(false);
    }
  };

  // Fetch more data when scroll to bottom
  const fetchMoreDataInSearchCondition = async () => {
    let moreData: any = arrData;
    if (lastDoc && moreData.includes(lastDoc) == false) {
      setIsLoadingFetchMore(true);
      moreData.push(lastDoc);
      setArrData(moreData);

      try {
        let link = "";
        if (searchResultFrom == "getAll") {
          if (onChangeValue == "") {
            link = `../../api/arsip/fetchmore/keyword/null/${lastDoc}`;
          } else {
            link = `../../api/arsip/fetchmore/keyword/${onChangeValue}/${lastDoc}`;
          }
        } else {
          if (onChangeValue == "") {
            link = `../../api/arsip/fetchmore/keyword/null/${lastDoc}/${idSearchResultFrom}`;
          } else {
            link = `../../api/arsip/fetchmore/keyword/${onChangeValue}/${lastDoc}/${idSearchResultFrom}`;
          }
        }

        const result = await fetch(link, {
          method: "GET",
        });
        const resultJson: any = await result.json();

        if (resultJson.status === false) {
          toast.error(resultJson.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setRows([]);
        }

        if (resultJson.data.length > 0 && resultJson.cursor != 0) {
          const result = resultJson.data.map((data: any) => {
            const statusAccess = createStatusAccessBadge(data.status_file);

            const statusRetensi = createRetentionBadge(data.status_retensi);

            // Format masa retensi
            const formatMasaRetensi = (value?: string) => {
              if (!value) return "-";

              const parsedDate = new Date(value);
              if (Number.isNaN(parsedDate.getTime())) return "-";

              const months = [
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ];

              const date = parsedDate.getDate();
              const month = months[parsedDate.getMonth()];
              const year = parsedDate.getFullYear();

              return `${date} ${month} ${year}`;
            };

            // Keterangan
            const keteranganMeta = getKeteranganMeta(data.keterangan);
            const keterangan = keteranganMeta.label;
            const keteranganId = keteranganMeta.id;

            // Created At
            let created_at: Date;
            let createdAt: string = "";
            if (data.created_at) {
              created_at = new Date(data.created_at);
              const months = [
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ];

              const year = created_at.getFullYear();
              const month = months[created_at.getMonth()];
              const date = created_at.getDate();

              createdAt = date + " " + month + " " + year;
            }

            return createData(
              data.id_arsip,
              data.no_arsip,
              data.arsip_name,
              data.instansi_id,
              data.instansi_name,
              data.deskripsi_arsip,
              formatMasaRetensi(data.masa_retensi),
              data.status_file,
              statusAccess,
              statusRetensi,
              keteranganId,
              keterangan,
              createdAt,
              data.created_by,
              data.user_name,
              data.user_id,
            );
          });
          const finalResult = result.sort((a: any, b: any) => b.id - a.id);

          setRows((rows: any) => [...rows, ...finalResult]);
          setLastDoc(resultJson.cursor);
        }
      } catch (error: any) {
        toast.error("Internal server error. Error: " + error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
      setIsLoadingFetchMore(false);
    }
  };

  const handleScroll = async (scroll: any) => {
    if (scroll.current) {
      let triggerHeight =
        scroll.current.scrollTop + scroll.current.offsetHeight;
      if (triggerHeight >= scroll.current.scrollHeight) {
        if (rows.length > 0) {
          fetchMoreDataInSearchCondition();
        }
      }
    }
  };

  const openSearchModal = () => {
    dispatch(setShowModal({ searchArsipModal: true }));
    setSearchResultFrom("getAll");
    setIdSearchResultFrom(undefined);
    handleSearch(onChangeValue, "getAll", undefined);
  };

  const submitSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    openSearchModal();
  };

  const submitSearchInModal = () => {
    handleSearch(onChangeValue, searchResultFrom, idSearchResultFrom);
  };

  useEffect(() => {
    setArrData([]);
  }, [data?.user]);

  useEffect(() => {
    if (isShowModal["searchArsipModal"] == false) {
      setSearchResultFrom("");
      setRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowModal["searchArsipModal"]]);

  return (
    <>
      {/* Toast */}
      <ToastContainer />

      {/* Modal Component */}
      <FrontModalComponent
        title="Hasil Pencarian Arsip"
        dataTarget="searchArsipModal"
        isLoading={isLoadingSearch}
        rows={rows}
        handleScroll={(e: any) => handleScroll(e)}
        isLoadingFetchMoreData={isLoadingFetchMore}
        totalData={totalData}
        searchResultFrom={searchResultFrom}
        searchValue={onChangeValue}
        onSearchValueChange={setOnChangeValue}
        onSearchSubmit={submitSearchInModal}
      />

      <div
        className={`opacity-100 transition-opacity duration-1000 relative overflow-hidden`}
      >
        <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-800">
              EduArsip
            </h1>

            <p className="mt-3 text-gray-600">
              Selamat datang di halaman utama EduArsip. Silahkan cari arsip anda
              disini.
            </p>

            <div className="mt-7 sm:mt-12 mx-auto max-w-xl relative">
              {/* <!-- Form --> */}
              <form onSubmit={(event) => submitSearch(event)}>
                <div className="relative z-10 flex gap-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-lg shadow-gray-100">
                  <div className="w-full">
                    <label className="block text-sm text-gray-700 font-medium">
                      <span className="sr-only">Cari arsip</span>
                    </label>
                    <input
                      type="text"
                      name="hs-search-article-1"
                      id="hs-search-article-1"
                      className="py-2.5 px-4 block w-full border-transparent rounded-lg focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Cari arsip"
                      value={onChangeValue ?? ""}
                      onChange={(e) => setOnChangeValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="size-11 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
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
                </div>
              </form>
              {/* <!-- End Form --> */}

              {/* <!-- SVG Element --> */}
              <div className="hidden md:block absolute top-0 inset-e-0 -translate-y-12 translate-x-20">
                <svg
                  className="w-16 h-auto text-orange-500"
                  width="121"
                  height="135"
                  viewBox="0 0 121 135"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 16.4754C11.7688 27.4499 21.2452 57.3224 5 89.0164"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M33.6761 112.104C44.6984 98.1239 74.2618 57.6776 83.4821 5"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50.5525 130C68.2064 127.495 110.731 117.541 116 78.0874"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {/* <!-- End SVG Element --> */}

              {/* <!-- SVG Element --> */}
              <div className="hidden md:block absolute bottom-0 inset-s-0 translate-y-10 -translate-x-32">
                <svg
                  className="w-40 h-auto text-cyan-500"
                  width="347"
                  height="188"
                  viewBox="0 0 347 188"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 82.4591C54.7956 92.8751 30.9771 162.782 68.2065 181.385C112.642 203.59 127.943 78.57 122.161 25.5053C120.504 2.2376 93.4028 -8.11128 89.7468 25.5053C85.8633 61.2125 130.186 199.678 180.982 146.248L214.898 107.02C224.322 95.4118 242.9 79.2851 258.6 107.02C274.299 134.754 299.315 125.589 309.861 117.539L343 93.4426"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {/* <!-- End SVG Element --> */}
            </div>

            <p className="text-sm mt-14 text-gray-600">
              Cari arsip dengan kata kunci di atas.
            </p>

            {optionButton.length > 0 ? (
              <div className="mt-10 sm:mt-5 mx-auto max-w-4xl">
                {optionButton.map((option: DataOption) => (
                  <a
                    key={option.id}
                    className="m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:text-white hover:bg-blue-700 focus:outline-hidden focus:text-white focus:bg-blue-700 transition-colors duration-500"
                    href="#"
                    onClick={() => {
                      dispatch(setShowModal({ searchArsipModal: true }));
                      setSearchResultFrom(option.name);
                      setIdSearchResultFrom(option.id);
                      handleSearch(onChangeValue, option.name, option.id);
                    }}
                  >
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
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    {option.name}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default FrontHeroBody;
