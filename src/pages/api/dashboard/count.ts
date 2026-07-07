import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";
import { filterActiveArsip } from "../arsip/_helpers";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
  data?: object;
};

type UpstreamResponse = {
  success?: boolean;
  data?: any[] | number;
};

const isTruthyValue = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "GET") {
    res.status(405).json({
      status: false,
      statusCode: 405,
      message: "Method not allowed",
    });
    return;
  }

  try {
    const { data: arsip } = await fetchExternalJson<UpstreamResponse>(
      req,
      "/v1/auth/arsip",
      {
        method: "GET",
      },
    );

    const activeItems = Array.isArray(arsip?.data)
      ? filterActiveArsip(arsip.data)
      : [];

    const dashboardData = {
      arsip: arsip?.success ? activeItems.length : 0,
      arsip_active: arsip?.success
        ? activeItems.filter((item) => isTruthyValue(item?.status_retensi))
            .length
        : 0,
      arsip_inactive: arsip?.success
        ? activeItems.filter((item) => !isTruthyValue(item?.status_retensi))
            .length
        : 0,
      peminjaman: 0,
      pengembalian: 0,
    };

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: dashboardData,
    });
  } catch (error: unknown) {
    sendApiError(res, error);
  }
}
