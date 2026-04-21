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
  data?: object;
};

type UpstreamResponse = {
  data?: object;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json({
      status: false,
      statusCode: 405,
      message: "Method not allowed",
    });
    return;
  }

  try {
    const candidateEndpoints = [
      "/v1/auth/arsip-files",
      "/v1/arsip-files",
      "/v1/auth/arsip-files/create",
      "/v1/arsip-files/create",
    ];

    let responseJson: UpstreamResponse | undefined;
    let lastError: unknown;

    for (const endpoint of candidateEndpoints) {
      try {
        console.log("[arsip-files/create] trying endpoint", {
          endpoint,
          body: req.body,
        });
        const result = await fetchExternalJson<UpstreamResponse>(req, endpoint, {
          method: "POST",
          body: req.body,
        });
        responseJson = result.data;
        lastError = undefined;
        console.log("[arsip-files/create] success", {
          endpoint,
          responseJson,
        });
        break;
      } catch (error: unknown) {
        lastError = error;
        console.log("[arsip-files/create] failed", {
          endpoint,
          error,
        });
        if (!(error instanceof ExternalApiError) || error.statusCode !== 404) {
          throw error;
        }
      }
    }

    if (!responseJson) {
      throw lastError;
    }

    res.status(201).json({
      status: true,
      statusCode: 201,
      data: responseJson?.data,
    });
  } catch (error: unknown) {
    sendApiError(res, error);
  }
}
