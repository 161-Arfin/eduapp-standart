import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
};

type UpstreamResponse = {
  success?: boolean;
  message?: string;
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

  if (req.method !== "DELETE") {
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
      `/v1/auth/arsip/softdelete/${id}`,
      {
        method: "DELETE",
      }
    );

    if (data?.success === false) {
      res.status(400).json({
        status: false,
        statusCode: 400,
        message: data.message || "Delete failed",
      });
      return;
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: data?.message || "Delete success",
    });
  } catch (error: unknown) {
    sendApiError(res, error);
  }
}
