import type { NextApiRequest, NextApiResponse } from "next";
import { fetchExternalJson } from "@/lib/api/external";

type EntityResponse = {
  data?: Record<string, any> | null;
};

type RelationMaps = {
  instansi_name: string;
  cabang_name: string;
  divisi_name: string;
  lokasi_name: string;
  rak_name: string;
  baris_name: string;
  box_name: string;
  map_name: string;
  user_name: string;
};

const isDeletedValue = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true";

const EMPTY_RELATIONS: RelationMaps = {
  instansi_name: "",
  cabang_name: "",
  divisi_name: "",
  lokasi_name: "",
  rak_name: "",
  baris_name: "",
  box_name: "",
  map_name: "",
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

// Utility untuk membatasi concurrency
async function promiseAllWithLimit<T>(
  promises: Promise<T>[],
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, promise] of promises.entries()) {
    const p = Promise.resolve(promise).then(
      (result) => {
        results[index] = result;
      },
      (error) => {
        results[index] = error;
      },
    );
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((promise) => promise),
        1,
      );
    }
  }

  await Promise.all(executing);
  return results;
}

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

  // Batasi concurrency untuk mencegah resource exhaustion
  // Process max 3 items secara bersamaan (9 fetch requests per item, jadi 27 max concurrent)
  const enrichedItems: any[] = [];
  const BATCH_SIZE = 3;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (item: any) => {
        const [
          dataInstansi,
          dataCabang,
          dataDivisi,
          dataLokasi,
          dataRak,
          dataBaris,
          dataBox,
          dataMap,
          dataUser,
        ] = await Promise.all([
          fetchEntity("instansi", item.instansi_id),
          fetchEntity("cabang", item.cabang_id),
          fetchEntity("divisi", item.divisi_id),
          fetchEntity("lokasi", item.lokasi_id),
          fetchEntity("rak", item.rak_id),
          fetchEntity("baris", item.baris_id),
          fetchEntity("box", item.box_id),
          fetchEntity("map", item.map_id),
          fetchEntity("user", item.user_id),
        ]);

        return {
          ...item,
          ...EMPTY_RELATIONS,
          instansi_name: dataInstansi?.instansi_name || "",
          cabang_name: dataCabang?.cabang_name || "",
          divisi_name: dataDivisi?.divisi_name || "",
          lokasi_name: dataLokasi?.lokasi_name || "",
          rak_name: dataRak?.rak_name || "",
          baris_name: dataBaris?.baris_name || "",
          box_name: dataBox?.box_name || "",
          map_name: dataMap?.map_name || "",
          user_name: dataUser?.name || "",
        };
      }),
    );
    enrichedItems.push(...results);
  }

  return enrichedItems;
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
