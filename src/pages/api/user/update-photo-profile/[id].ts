import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getAuthSessionTokens } from "@/lib/auth/tokenStore";

type Data = {
  status: boolean;
  statusCode: number;
  message: string;
  data?: any;
};

type UpstreamResponse = {
  success?: boolean;
  message?: string;
  data?: any;
};

const getAuthToken = async (req: NextApiRequest): Promise<string | null> => {
  const authorizationHeader = req.headers.authorization;

  if (Array.isArray(authorizationHeader) && authorizationHeader[0]) {
    return authorizationHeader[0].replace(/^Bearer\s+/i, "");
  }

  if (authorizationHeader) {
    return authorizationHeader.replace(/^Bearer\s+/i, "");
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (typeof token?.authSessionKey === "string") {
    const sessionTokens = await getAuthSessionTokens(token.authSessionKey);
    if (typeof sessionTokens?.accessToken === "string") {
      return sessionTokens.accessToken;
    }
  }

  return null;
};

const readRequestBody = async (req: NextApiRequest): Promise<Buffer> => {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

const readUpstreamBody = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return { payload: undefined as UpstreamResponse | undefined, rawText: "" };
  }

  try {
    return {
      payload: JSON.parse(text) as UpstreamResponse,
      rawText: text,
    };
  } catch {
    return {
      payload: undefined as UpstreamResponse | undefined,
      rawText: text,
    };
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;

  if (typeof id !== "string" || id.trim() === "") {
    res.status(400).json({
      status: false,
      statusCode: 400,
      message: "ID is required",
    });
    return;
  }

  if (req.method !== "PUT") {
    res.status(405).json({
      status: false,
      statusCode: 405,
      message: "Method not allowed",
    });
    return;
  }

  if (!process.env.API_URL) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "API_URL is not configured",
    });
    return;
  }

  const authToken = await getAuthToken(req);
  if (!authToken) {
    res.status(401).json({
      status: false,
      statusCode: 401,
      message: "Unauthorized",
    });
    return;
  }

  try {
    const headers = new Headers();
    const contentType = req.headers["content-type"];

    if (typeof contentType === "string") {
      headers.set("Content-Type", contentType);
    }
    headers.set("Authorization", `Bearer ${authToken}`);

    const body = await readRequestBody(req);
    const upstreamUrl = `${process.env.API_URL}/v1/auth/user/update-photo/${id}`;

    console.log("[update-photo-profile] forwarding", {
      id,
      upstreamUrl,
      contentType,
      bodyLength: body.length,
    });

    const response = await fetch(upstreamUrl, {
      method: "PUT",
      headers,
      body: new Uint8Array(body),
    });

    const { payload, rawText } = await readUpstreamBody(response);

    console.log("[update-photo-profile] upstream result", {
      status: response.status,
      ok: response.ok,
      payload,
      rawText,
    });

    if (!response.ok) {
      res.status(response.status).json({
        status: false,
        statusCode: response.status,
        message:
          payload?.message ||
          rawText ||
          `External API request failed with status ${response.status}`,
        data: payload?.data ?? rawText ?? null,
      });
      return;
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: payload?.message || "Upload file successfully",
      data: payload?.data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown internal error";

    console.log("[update-photo-profile] internal error", { message, error });

    res.status(500).json({
      status: false,
      statusCode: 500,
      message: `Internal Server Error. ${message}`,
    });
  }
}
