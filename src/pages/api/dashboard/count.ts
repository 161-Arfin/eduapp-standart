import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
  data?: object;
};

type UpstreamResponse = {
  success?: boolean;
  data?: number;
};

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
    const [{ data: arsip }, { data: arsipActive }, { data: arsipInactive }] =
      await Promise.all([
        fetchExternalJson<UpstreamResponse>(
          req,
          "/v1/auth/arsip/count/byinstansi",
          {
            method: "GET",
          },
        ),
        fetchExternalJson<UpstreamResponse>(
          req,
          "/v1/auth/arsip/count-active/byinstansi",
          {
            method: "GET",
          },
        ),
        fetchExternalJson<UpstreamResponse>(
          req,
          "/v1/auth/arsip/count-inactive/byinstansi",
          {
            method: "GET",
          },
        ),
      ]);

    const dashboardData = {
      arsip: arsip?.success ? (arsip.data ?? 0) : 0,
      arsip_active: arsipActive?.success ? (arsipActive.data ?? 0) : 0,
      arsip_inactive: arsipInactive?.success ? (arsipInactive.data ?? 0) : 0,
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
