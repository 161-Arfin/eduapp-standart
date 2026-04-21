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

const normalizeArsipFiles = (items: any[] = []) =>
  items.map((item: any, index: number) => ({
    ...item,
    id:
      item.id ??
      item.ID ??
      item.id_arsip_files ??
      item.ArsipFilesID ??
      item.FileID ??
      `${item.ArsipID ?? item.arsip_id ?? "file"}-${index}`,

    file_upload:
      item.file_upload ??
      item.FileUpload ??
      item.FileName ??
      item.filename ??
      item.name ??
      "",

    link: item.link ?? item.FileURL ?? item.file_url ?? "",
    created_by: item.created_by ?? item.CreatedBy ?? "",
    created_at: item.created_at ?? item.CreatedAt ?? null,
  }));

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
    const candidateEndpoints = [
      `/v1/auth/arsip-files/byarsip/${id}`,
      `/v1/arsip-files/byarsip/${id}`,
    ];

    let data: UpstreamResponse | undefined;
    let lastError: unknown;

    for (const endpoint of candidateEndpoints) {
      console.log("ENDPOINT DICOBA:", endpoint);
      try {
        const result = await fetchExternalJson<UpstreamResponse>(
          req,
          endpoint,
          {
            method: "GET",
          },
        );
        console.log("RESPONSE DARI BACKEND:", result);
        data = result.data;
        lastError = undefined;
        break;
      } catch (error: unknown) {
        lastError = error;
        if (!(error instanceof ExternalApiError) || error.statusCode !== 404) {
          throw error;
        }
      }
    }

    if (!data) {
      throw lastError;
    }

    const hasArrayData = Array.isArray(data?.data);

    if (data?.success === true || hasArrayData) {
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: data?.message,
        data: normalizeArsipFiles(hasArrayData ? data.data : []),
      });
      return;
    }

    res.status(404).json({
      status: false,
      statusCode: 404,
      message: data?.message || "Data not found",
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
