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

  if (req.method === "GET") {
    try {
      const { data: arsipFile } = await fetchExternalJson<UpstreamResponse>(
        req,
        `/v1/auth/arsip-files/${id}`,
        { method: "GET" }
      );

      if (arsipFile?.success === true) {
        res.status(200).json({
          status: true,
          statusCode: 200,
          data: arsipFile.data,
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
    return;
  }

  if (req.method === "DELETE") {
    try {
      await fetchExternalJson(req, `/v1/auth/arsip-files/${id}`, {
        method: "DELETE",
      });

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Delete success",
      });
    } catch (error: unknown) {
      sendApiError(res, error);
    }
    return;
  }

  res.status(405).json({
    status: false,
    statusCode: 405,
    message: "Method not allowed",
  });
}
