import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson, sendApiError } from "@/lib/api/external";

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

type UpdateProfilePayload = {
  name?: string;
  gender?: number;
  phone?: string;
  address?: string;
  username?: string;
  email?: string;
};

const normalizeUserProfile = (user: any) => {
  if (!user || typeof user !== "object") {
    return user;
  }

  return {
    ...user,
    id: user.id ?? user.id_users,
    fullName: user.fullName ?? user.name ?? "",
    instansiName: user.instansiName ?? user.instansi_name ?? "",
    photoProfileUrl: user.photoProfileUrl ?? user.photo_thumb ?? "",
    isActive: user.isActive ?? user.is_active ?? false,
    joinAt: user.joinAt ?? user.created_at ?? "",
  };
};

const sanitizeUpdateProfilePayload = (body: any): UpdateProfilePayload => {
  const payload: UpdateProfilePayload = {};

  if (body && typeof body === "object") {
    if (typeof body.name === "string") {
      payload.name = body.name.trim();
    }
    if (
      typeof body.gender === "number" ||
      (typeof body.gender === "string" && body.gender.trim() !== "")
    ) {
      const genderValue = Number(body.gender);
      if (!Number.isNaN(genderValue)) {
        payload.gender = genderValue;
      }
    }
    if (typeof body.phone === "string") {
      payload.phone = body.phone.trim();
    }
    if (typeof body.address === "string") {
      payload.address = body.address.trim();
    }
    if (typeof body.username === "string") {
      payload.username = body.username.trim();
    }
    if (typeof body.email === "string") {
      payload.email = body.email.trim();
    }
  }

  return payload;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    try {
      const { data } = await fetchExternalJson<UpstreamResponse>(
        req,
        "/v1/auth/user/profile",
        { method: "GET" }
      );

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: data?.message || "Request successful",
        data: normalizeUserProfile(data?.data),
      });
    } catch (error: unknown) {
      sendApiError(res, error);
    }
    return;
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const payload = sanitizeUpdateProfilePayload(req.body);
      const { data } = await fetchExternalJson<UpstreamResponse>(
        req,
        "/v1/auth/user/update",
        {
          method: "PUT",
          body: payload,
        }
      );

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: data?.message || "Update successful",
        data: normalizeUserProfile(data?.data),
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
