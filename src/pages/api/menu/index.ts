import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
  data?: object;
};

type UpstreamResponse = {
  data?: object;
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
    const { data: menu } = await fetchExternalJson<UpstreamResponse>(
      req,
      "/api/v1/menu",
      { method: "GET" }
    );

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: menu?.data ?? {},
    });
  } catch (error: unknown) {
    sendApiError(res, error);
  }
}
