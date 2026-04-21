import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
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
    await fetchExternalJson(req, "/v1/firebase", {
      method: "POST",
      body: req.body,
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Create success",
    });
  } catch (error: unknown) {
    sendApiError(res, error);
  }
}
