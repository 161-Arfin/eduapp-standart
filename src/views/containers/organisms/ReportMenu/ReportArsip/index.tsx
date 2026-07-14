/* eslint-disable react-hooks/set-state-in-effect */
import CardContainerComponent from "@/views/components/atoms/CardContainerComponent";
import SpinLoadingComponent from "@/views/components/atoms/SpinLoadingComponent";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";

type ArsipRow = {
  id_arsip?: number | string;
  id?: number | string;
  no_arsip?: string;
  arsip_name?: string;
  deskripsi_arsip?: string;
  instansi_name?: string;
  user_name?: string;
  masa_retensi?: string;
  status_retensi?: string | number | boolean;
  keterangan?: string | number;
  created_at?: string;
};

const isRetentionActive = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true";

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getKeteranganLabel = (value: unknown) => {
  const numericValue = Number(value);
  return numericValue === 2 || value === true ? "Musnah" : "Permanen";
};

const ReportArsip = () => {
  const { data }: any = useSession();
  const [rows, setRows] = useState<ArsipRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportTypeLoading, setExportTypeLoading] = useState<string | null>(
    null,
  );

  const summary = useMemo(() => {
    const active = rows.filter((item) =>
      isRetentionActive(item.status_retensi),
    ).length;
    const inactive = rows.length - active;

    return {
      all: rows.length,
      active,
      inactive,
    };
  }, [rows]);

  const getData = async () => {
    if (data?.user?.usertypeId === undefined) return;

    try {
      setIsLoading(true);

      const headers: HeadersInit = data?.user?.apiToken
        ? { "auth-token": data.user.apiToken }
        : {};

      const response = await fetch(`/api/arsip/${data.user.usertypeId}`, {
        method: "GET",
        headers,
      });
      const responseJson = await response.json();

      if (responseJson.status === false) {
        toast.error(responseJson.message || "Gagal memuat data arsip", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
        setRows([]);
        return;
      }

      setRows(Array.isArray(responseJson.data) ? responseJson.data : []);
    } catch {
      toast.error("Gagal memuat data arsip", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user?.usertypeId]);

  const getExportRows = (type: "all" | "active" | "inactive") => {
    if (type === "active") {
      return rows.filter((item) => isRetentionActive(item.status_retensi));
    }

    if (type === "inactive") {
      return rows.filter((item) => !isRetentionActive(item.status_retensi));
    }

    return rows;
  };

  const exportExcel = (type: "all" | "active" | "inactive") => {
    const selectedRows = getExportRows(type);

    if (selectedRows.length === 0) {
      toast.error("Data laporan kosong", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }

    setExportTypeLoading(type);

    const titleMap = {
      all: "Laporan Arsip Keseluruhan",
      active: "Laporan Arsip Aktif",
      inactive: "Laporan Arsip Inaktif",
    };

    const fileMap = {
      all: "laporan-arsip-keseluruhan",
      active: "laporan-arsip-aktif",
      inactive: "laporan-arsip-inaktif",
    };

    const excelRows = selectedRows.map((item, index) => ({
      No: index + 1,
      "No Arsip": item.no_arsip || "-",
      "Nama Arsip": item.arsip_name || "-",
      Deskripsi: item.deskripsi_arsip || "-",
      Instansi: item.instansi_name || "-",
      "Pemilik Arsip": item.user_name || "-",
      "Masa Retensi": formatDate(item.masa_retensi),
      "Status Retensi": isRetentionActive(item.status_retensi)
        ? "Aktif"
        : "Inaktif",
      Keterangan: getKeteranganLabel(item.keterangan),
      "Dibuat Pada": formatDate(item.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Arsip");

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 35 },
      { wch: 45 },
      { wch: 28 },
      { wch: 28 },
      { wch: 20 },
      { wch: 18 },
      { wch: 16 },
      { wch: 20 },
    ];

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `${fileMap[type]}-${date}.xlsx`);

    toast.success(`${titleMap[type]} berhasil diexport`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });

    setExportTypeLoading(null);
  };

  const reportCards = [
    {
      key: "all",
      title: "Arsip Keseluruhan",
      count: summary.all,
      description: "Semua data arsip tersimpan.",
      button: "Export",
    },
    {
      key: "active",
      title: "Arsip Aktif",
      count: summary.active,
      description: "Arsip yang masih aktif.",
      button: "Export",
    },
    {
      key: "inactive",
      title: "Arsip Inaktif",
      count: summary.inactive,
      description: "Arsip yang tidak aktif.",
      button: "Export",
    },
  ] as const;

  return (
    <>
      <ToastContainer />
      <div className="flex flex-wrap mt-0 mb-16 mx-0">
        {isLoading ? (
          <div className="w-full h-100 flex justify-center items-center">
            <SpinLoadingComponent />
          </div>
        ) : (
          <div className="flex-2 w-full max-w-full px-0 mt-0">
            <CardContainerComponent
              title="Export Laporan Arsip"
              actionButtonCard={() => null}
            >
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                {reportCards.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-md border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">
                        {item.title}
                      </p>
                      <p className="mt-1 text-3xl font-semibold leading-tight text-gray-800">
                        {item.count}
                      </p>
                      <p className="mt-2 min-h-10 text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => exportExcel(item.key)}
                      disabled={exportTypeLoading === item.key}
                      title={item.button}
                      aria-label={item.button}
                      className="flex w-full items-center justify-center rounded-lg bg-blue-400 p-2 text-white transition-colors hover:bg-blue-600 disabled:pointer-events-none disabled:opacity-60"
                    >
                      {exportTypeLoading === item.key ? (
                        "Loading..."
                      ) : (
                        <FiDownload className="text-xl" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </CardContainerComponent>
          </div>
        )}
      </div>
    </>
  );
};

export default ReportArsip;
