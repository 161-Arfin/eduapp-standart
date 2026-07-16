import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
  data?: object;
  cursor?: any;
  hasMore?: boolean;
  total?: number;
};

type UpstreamResponse = {
  success?: boolean;
  message?: string;
  data?: any[];
  nextCursor?: string | number | null;
  hasMore?: boolean;
  total?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id }: any = req.query;

  if (id === undefined) {
    res.status(400).json({
      status: false,
      statusCode: 400,
      message: "Query params are required",
    });
    return;
  }

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
    const keyword = id?.[0] ? String(id[0]) : "";
    const endpoint =
      keyword && keyword !== "null"
        ? `/v1/auth/arsip/search/${encodeURIComponent(keyword)}`
        : "/v1/auth/arsip/search/null";

    const { data: arsip } = await fetchExternalJson<UpstreamResponse>(req, endpoint, {
      method: "GET",
    });

    if (arsip?.success === true) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        data: arsip.data,
        cursor: null,
        hasMore: false,
        total: arsip.data?.length ?? 0,
      });
      return;
    }

    res.status(404).json({
      status: false,
      statusCode: 404,
      message: "Data not found",
    });
  } catch (error: unknown) {
    sendApiError(res, error);
  }
}
