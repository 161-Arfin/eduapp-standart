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
  message?: string;
  data?: object;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;

  if (id === undefined) {
    res.status(400).json({
      status: false,
      statusCode: 400,
      message: "ID is required",
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
    const { data } = await fetchExternalJson<UpstreamResponse>(
      req,
      `/api/v1/map/bycabang/${id}`,
      { method: "GET" }
    );

    if (data?.success === true) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: data.message,
        data: data.data,
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
