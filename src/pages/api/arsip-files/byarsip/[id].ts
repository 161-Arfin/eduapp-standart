import type { NextApiRequest, NextApiResponse } from "next";
import {
  ExternalApiError,
  fetchExternalJson,
  sendApiError,
} from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
  data?: any;
};

type UpstreamResponse = {
  success?: boolean;
  message?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { id }: any = req.query;

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
    res.setHeader("Cache-Control", "no-store");
    const result: any = await fetchExternalJson<UpstreamResponse>(
      req,
      `/v1/auth/arsip-files/byarsip/${id}`,
      {
        method: "GET",
      },
    );

    if (result.data.success === true) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: result.data.message,
        data: result.data.data,
      });
      return;
    }

    res.status(404).json({
      status: false,
      statusCode: 404,
      message: result?.message || "Data not found",
    });
  } catch (error: unknown) {
    if (error instanceof ExternalApiError && error.statusCode === 404) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Data not found",
        data: [],
      });
      return;
    }

    sendApiError(res, error);
  }
}
