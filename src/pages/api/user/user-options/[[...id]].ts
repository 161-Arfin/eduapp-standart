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
    let response: any;
    if (id[0] === '5') {
      response = await fetchExternalJson<UpstreamResponse>(
        req,
        "/v1/auth/user/byinstansi/" + id[1],
        { method: "GET" }
      );
    } else if (id[0] === '3') {
      response = await fetchExternalJson<UpstreamResponse>(
        req,
        "/v1/auth/user/byinstansi",
        { method: "GET" }
      );
    }

    if (response.data.success === true) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        data: response.data.data,
      });
      return;
    }

    // Backend mengembalikan success: false → paket reguler tidak punya data.
    // Kembalikan 200 + data kosong, bukan 404.
    res.status(200).json({
      status: true,
      statusCode: 200,
      data: [],
    });
  } catch (error: unknown) {
    // fetchExternalJson melempar ExternalApiError saat backend return non-2xx.
    // Untuk paket reguler, /v1/user/option mungkin return 404 atau 500 karena
    // endpoint tidak tersedia — jangan teruskan ke browser, cukup data kosong.
    if (
      error instanceof ExternalApiError &&
      (error.statusCode === 404 || error.statusCode === 500)
    ) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        data: [],
      });
      return;
    }
    sendApiError(res, error);
  }
}
