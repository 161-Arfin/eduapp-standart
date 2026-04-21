import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import FrontModalComponent from "../../atoms/FrontModalComponent";
import { useDispatch, useSelector } from "react-redux";
import { setShowModal } from "@/lib/redux/actions/ShowModalSlice";
import { getKeteranganMeta } from "@/utils/arsip";
import { getPackageCapabilities } from "@/utils/packageCapabilities";

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
  cabang_id?: number;
  cabang_name?: string;
  divisi_id?: number;
  divisi_name?: string;
  deskripsi_arsip: string;
  lokasi_name?: string;
  lokasi_id?: number;
  rak_name?: string;
  rak_id?: string;
  baris_name?: string;
  baris_id?: string;
  box_name?: string;
  box_id?: string;
  map_name?: string;
  map_id?: string;
  masa_retensi?: string;
  is_available: React.JSX.Element;
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
  const packageCapabilities = getPackageCapabilities(data?.user?.usertypeId);
  const isRegularPackage = packageCapabilities.key === "regular";
  const [optionButton, setOptionButton] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingFetchMore, setIsLoadingFetchMore] = useState(false);
  const [onChangeValue, setOnChangeValue] = React.useState("");
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
    cabang_id: number | undefined,
    cabang_name: string | undefined,
    divisi_id: number | undefined,
    divisi_name: string | undefined,
    deskripsi_arsip: string,
    lokasi_name: string | undefined,
    lokasi_id: number | undefined,
    rak_name: string | undefined,
    rak_id: string | undefined,
    baris_name: string | undefined,
    baris_id: string | undefined,
    box_name: string | undefined,
    box_id: string | undefined,
    map_name: string | undefined,
    map_id: string | undefined,
    masa_retensi: string | undefined,
    is_available: React.JSX.Element,
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
      cabang_id,
      cabang_name,
      divisi_id,
      divisi_name,
      deskripsi_arsip,
      lokasi_name,
      lokasi_id,
      rak_name,
      rak_id,
      baris_name,
      baris_id,
      box_name,
      box_id,
      map_name,
      map_id,
      masa_retensi,
      is_available,
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
        const result = responseJson.data.map((data: any, index: number) => {
          return createDataOption(data.id_instansi, data.instansi_name);
        });

        setOptionButton(result);
      }
      setIsLoading(false);
    }
  };

  const getCabang = async () => {
    if (data?.user.instansiId != undefined) {
      const response = await fetch(
        `../../api/branch/bycompany/${data.user.instansiId}`,
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
        const result = responseJson.data.map((data: any, index: number) => {
          return createDataOption(data.id_cabang, data.cabang_name);
        });

        setOptionButton(result);
      }
      setIsLoading(false);
    }
  };

  const getDivisi = async () => {
    if (data?.user.cabangId != undefined) {
      const response = await fetch(
        `../../api/division/bybranch/${data.user.cabangId}`,
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
        const result = responseJson.data.map((data: any, index: number) => {
          return createDataOption(data.id_divisi, data.divisi_name);
        });

        setOptionButton(result);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data?.user.usertypeId) {
      if (isRegularPackage) {
        setOptionButton([]);
        setIsLoading(false);
      } else if (data?.user.usertypeId === 5) {
        getInstansi();
      } else if (data?.user.usertypeId === 1) {
        getCabang();
      } else {
        if (data?.user.cabangId != undefined) {
          getDivisi();
        } else {
          setIsLoading(false);
        }
      }
    } else if (data === null) {
      // If session is definitely null (not loading), stop loading spinner
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user.usertypeId, data, isRegularPackage]);

  // Search Arsip
  const handleSearch = async (searchQuery: any) => {
    setIsLoadingSearch(true);
    let link = "";
    if (searchResultFrom == "getAll") {
      if (searchQuery == "") {
        link = `../../api/arsip/keyword/null`;
      } else {
        link = `../../api/arsip/keyword/${searchQuery}`;
      }
    } else {
      if (searchQuery == "") {
        link = `../../api/arsip/keyword/null/${idSearchResultFrom}`;
      } else {
        link = `../../api/arsip/keyword/${searchQuery}/${idSearchResultFrom}`;
      }
    }

    const dataArsip = await fetch(link, {
      method: "GET",
    });

    const dataArsipJson = await dataArsip.json();

    if (dataArsipJson.data?.length > 0) {
      const result = dataArsipJson.data.map((data: any) => {
        // Status peminjaman
        let isAvailable: React.JSX.Element;
        if (data.is_available == true) {
          isAvailable = (
            <span className="inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
              Tersedia
            </span>
          );
        } else {
          isAvailable = (
            <span className="inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Dipinjam
            </span>
          );
        }

        // Status Akses
        let statusAccess: React.JSX.Element = <></>;
        if (data.status_file == 0) {
          statusAccess = (
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Private
            </span>
          );
        } else if (data.status_file == 1) {
          statusAccess = (
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
              Level Instansi
            </span>
          );
        } else if (data.status_file == 2) {
          statusAccess = (
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Level Cabang
            </span>
          );
        } else if (data.status_file == 3) {
          statusAccess = (
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Level Divisi
            </span>
          );
        }

        const statusRetensi = createRetentionBadge(data.status_retensi);

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
          data.cabang_id,
          data.cabang_name,
          data.divisi_id,
          data.divisi_name,
          data.deskripsi_arsip,
          data.lokasi_name,
          data.lokasi_id,
          data.rak_name,
          data.rak_id,
          data.baris_name,
          data.baris_id,
          data.box_name,
          data.box_id,
          data.map_name,
          data.map_id,
          data.masa_retensi,
          isAvailable,
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
      setTotalData(dataArsipJson.total);
    } else {
      setRows([]);
    }

    setArrData([]);
    setIsLoadingSearch(false);
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
            // Status peminjaman
            let isAvailable: React.JSX.Element;
            if (data.is_available == true) {
              isAvailable = (
                <span className="inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  Tersedia
                </span>
              );
            } else {
              isAvailable = (
                <span className="inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Dipinjam
                </span>
              );
            }

            // Status Akses
            let statusAccess: React.JSX.Element = <></>;
            if (data.status_file == 0) {
              statusAccess = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Private
                </span>
              );
            } else if (data.status_file == 1) {
              statusAccess = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  Level Instansi
                </span>
              );
            } else if (data.status_file == 2) {
              statusAccess = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Level Cabang
                </span>
              );
            } else if (data.status_file == 3) {
              statusAccess = (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Level Divisi
                </span>
              );
            }

            const statusRetensi = createRetentionBadge(data.status_retensi);

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
              data.cabang_id,
              data.cabang_name,
              data.divisi_id,
              data.divisi_name,
              data.deskripsi_arsip,
              data.lokasi_name,
              data.lokasi_id,
              data.rak_name,
              data.rak_id,
              data.baris_name,
              data.baris_id,
              data.box_name,
              data.box_id,
              data.map_name,
              data.map_id,
              data.masa_retensi,
              isAvailable,
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

  useEffect(() => {
    setArrData([]);
  }, [data?.user]);

  useEffect(() => {
    if (searchResultFrom != "") {
      handleSearch(onChangeValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResultFrom]);

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
      />

      <div
        className={`opacity-100 transition-opacity duration-1000 relative overflow-hidden`}
      >
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-24">
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
              <form>
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
                      onChange={(e) => setOnChangeValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <a
                      className="size-11 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                      href="#"
                      onClick={() => {
                        dispatch(setShowModal({ searchArsipModal: true }));
                        setSearchResultFrom("getAll");
                        // handleSearch(onChangeValue);
                      }}
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
                    </a>
                  </div>
                </div>
              </form>
              {/* <!-- End Form --> */}

              {/* <!-- SVG Element --> */}
              <div className="hidden md:block absolute top-0 end-0 -translate-y-12 translate-x-20">
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
              <div className="hidden md:block absolute bottom-0 start-0 translate-y-10 -translate-x-32">
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
              {isRegularPackage
                ? "Cari arsip dengan kata kunci di atas."
                : `Cari berdasarkan ${
                    data?.user.usertypeId == 5
                      ? "instansi"
                      : data?.user.usertypeId == 1
                        ? "cabang"
                        : "divisi"
                  } dengan kata kunci di atas.`}
            </p>

            {!isRegularPackage ? (
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
