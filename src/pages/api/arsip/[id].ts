import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
  data?: object;
  cursor?: string | number | null;
  hasMore?: boolean;
};

type ArsipListResponse = {
  success?: boolean;
  message?: string;
  data?: any[];
  nextCursor?: string | number | null;
  hasMore?: boolean;
};

type ArsipUpdateResponse = {
  message?: string;
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

  if (req.method === "GET") {
    try {
      res.setHeader("Cache-Control", "no-store");
      const { data } = await fetchExternalJson<ArsipListResponse>(
        req,
        id == 5 ? "/v1/auth/arsip" : `/v1/auth/arsip/byinstansi`,
        { method: "GET" },
      );

      if (data?.success === true) {
        res.status(200).json({
          status: true,
          statusCode: 200,
          message: "Success",
          data: data.data,
          cursor: null,
          hasMore: false,
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
    return;
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const { data: responseJson } =
        await fetchExternalJson<ArsipUpdateResponse>(
          req,
          `/v1/auth/arsip/${id}`,
          {
            method: "PUT",
            body: req.body,
          },
        );

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: responseJson?.message || "Update success",
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
