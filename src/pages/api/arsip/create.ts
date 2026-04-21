import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message: string;
  data?: object;
};

type CreateResponse = {
  data?: object;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
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
    const { data: responseJson } = await fetchExternalJson<CreateResponse>(
      req,
      "/v1/auth/arsip",
      {
        method: "POST",
        body: req.body,
      },
    );

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Create success",
      data: responseJson?.data,
    });
  } catch (error: unknown) {
    sendApiError(res, error);
  }
}
