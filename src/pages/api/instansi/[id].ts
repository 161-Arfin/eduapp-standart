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
  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (
    id === undefined ||
    id === null ||
    id === "" ||
    id === "undefined" ||
    id === "null"
  ) {
    res.status(400).json({
      status: false,
      statusCode: 400,
      message: "Valid ID is required",
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
    const { data: instansi } = await fetchExternalJson<UpstreamResponse>(
      req,
      `/v1/instansi/${id}`,
      { method: "GET" }
    );

    if (instansi?.success === true) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        data: instansi.data,
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
