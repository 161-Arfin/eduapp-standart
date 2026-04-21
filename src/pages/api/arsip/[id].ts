import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";
import { enrichArsipRelations, filterActiveArsip } from "./_helpers";

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
        "/v1/auth/arsip",
        { method: "GET" },
      );
      // const { data } = await fetch(
      //   `${process.env.API_URL}/v1/auth/arsip/byinstasi`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VycyI6MTM3LCJpbnN0YW5zaV9pZCI6MSwidXNlcm5hbWUiOiJyaWRhcm1hc3RlciIsImV4cCI6MTc3NjMxNzE3OX0.yqFulAqnt581u4dNlSSYd647LCGwgL3_HWuEOn5xfPk`,
      //     },
      //   },
      // );

      // const response: any = await fetch(
      //   `${process.env.API_URL}/v1/auth/arsip/byinstasi`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //       "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VycyI6MTM3LCJpbnN0YW5zaV9pZCI6MSwidXNlcm5hbWUiOiJyaWRhcm1hc3RlciIsImV4cCI6MTc3NjMyMDI2OX0.2cV5BnT1cQV-gITHcM494qox2S_rAN7wIyWm3dDNHXM`,
      //     },
      //   },
      // );

      // console.log("Response:", response);

      if (data?.success === true) {
        const activeItems = filterActiveArsip(data.data ?? []);
        const resultData = await enrichArsipRelations(activeItems, req);

        res.status(200).json({
          status: true,
          statusCode: 200,
          message: "Success",
          data: resultData,
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
