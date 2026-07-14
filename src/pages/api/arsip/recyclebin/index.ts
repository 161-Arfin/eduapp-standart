import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
  data?: object;
  cursor?: string | number | null;
  hasMore?: boolean;
};

type UpstreamResponse = {
  success?: boolean;
  message?: string;
  data?: any[];
  nextCursor?: string | number | null;
  hasMore?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
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
    res.setHeader("Cache-Control", "no-store");
    const { data } = await fetchExternalJson<UpstreamResponse>(
      req,
      "/v1/auth/arsip/recyclebin/byinstansi",
      { method: "GET" }
    );

    if (data?.success === true && (data.data?.length ?? 0) > 0) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: data.message,
        data: data.data,
        cursor: null,
        hasMore: false,
      });
      return;
    }

    if (data?.success === true) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: data.message,
        data: [],
      });
      return;
    }

    res.status(404).json({
      status: false,
      statusCode: 404,
      message: data?.message || "Data not found",
    });
  } catch (error: unknown) {
    sendApiError(res, error);
  }
}
