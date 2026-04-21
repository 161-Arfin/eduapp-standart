import type { NextApiRequest, NextApiResponse } from "next";
type Data = {
  status: boolean;
  statusCode: number;
  message?: string;
  data?: object;
  cursor?: string | number | null;
  hasMore?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    res.status(405).json({
      status: false,
      statusCode: 405,
      message: "Method not allowed",
    });
    return;
  }

  res.status(200).json({
    status: true,
    statusCode: 200,
    message: "Pagination is not supported by the upstream arsip API",
    data: [],
    cursor: null,
    hasMore: false,
  });
}
