import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson } from "@/lib/api/external";

type EntityResponse = {
  data?: Record<string, any> | null;
};

type RelationMaps = {
  instansi_name: string;
  user_name: string;
};

const isDeletedValue = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true";

const EMPTY_RELATIONS: RelationMaps = {
  instansi_name: "",
  user_name: "",
};

const isValidRelationId = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  value !== "undefined" &&
  value !== "null" &&
  value !== 0 &&
  value !== "0";

const createEntityFetcher = (req: NextApiRequest) => {
  const cache = new Map<string, EntityResponse["data"]>();

  return async (resource: string, id: unknown) => {
    if (!isValidRelationId(id)) {
      return null;
    }

    const cacheKey = `${resource}:${String(id)}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) ?? null;
    }

    try {
      const { data: responseJson } = await fetchExternalJson<{
        data?: Record<string, any>;
      }>(req, `/v1/${resource}/${id}`, {
        method: "GET",
      });

      const data = responseJson?.data ?? null;
      cache.set(cacheKey, data);
      return data;
    } catch {
      cache.set(cacheKey, null);
      return null;
    }
  };
};

export async function enrichArsipRelations(
  items: any[],
  req: NextApiRequest,
): Promise<any[]> {
  const fetchEntity = createEntityFetcher(req);
  const enrichedItems: any[] = [];
  const batchSize = 3;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (item: any) => {
        const [dataInstansi, dataUser] = await Promise.all([
          fetchEntity("instansi", item.instansi_id),
          fetchEntity("user", item.user_id),
        ]);

        return {
          ...item,
          ...EMPTY_RELATIONS,
          instansi_name: dataInstansi?.instansi_name || "",
          user_name: dataUser?.name || "",
        };
      }),
    );
    enrichedItems.push(...results);
  }

  return enrichedItems;
}

export function normalizeArsipRows(items: any[]): any[] {
  return items.map((item) => ({
    ...item,
    instansi_name: item?.instansi_name || "",
    user_name: item?.user_name || item?.created_by || "",
  }));
}

export function filterActiveArsip(items: any[]): any[] {
  return items.filter((item) => !isDeletedValue(item?.is_delete_arsip));
}

export function filterDeletedArsip(items: any[]): any[] {
  return items.filter((item) => isDeletedValue(item?.is_delete_arsip));
}

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(405).json({
    status: false,
    statusCode: 405,
    message: "Method not allowed",
  });
}
