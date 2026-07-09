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
  data?: any[] | number;
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
    // Total arsip
    const { data: arsip } = await fetchExternalJson<UpstreamResponse>(
      req,
      "/v1/auth/arsip/count/byinstansi",
      {
        method: "GET",
      },
    );

    // Total arsip aktif
    const { data: arsipAktif } = await fetchExternalJson<UpstreamResponse>(
      req,
      "/v1/auth/arsip/count-active/byinstansi",
      {
        method: "GET",
      },
    );
    
    // Total arsip inaktif
    const { data: arsipInaktif } = await fetchExternalJson<UpstreamResponse>(
      req,
      "/v1/auth/arsip/count-inactive/byinstansi",
      {
        method: "GET",
      },
    );

    const dashboardData = {
      arsip: arsip?.success ? arsip.data : 0,
      arsip_active: arsipAktif?.success
        ? arsipAktif.data
        : 0,
      arsip_inactive: arsipInaktif?.success
        ? arsipInaktif.data
        : 0,
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
