import type { PackageCapabilities } from "./packageCapabilities";

export const getKeteranganMeta = (value: unknown) => {
  const numericValue = Number(value);
  const isMusnah = numericValue === 2 || value === true;

  return {
    id: isMusnah ? 2 : 1,
    label: isMusnah ? "Musnah" : "Permanen",
  };
};

export const getDefaultStatusFileByPackage = (canConfigureFileAccess: boolean) =>
  canConfigureFileAccess ? undefined : 2;

type AdditionalArsipPayloadOptions = {
  packageCapabilities: PackageCapabilities;
  masaRetensi?: string;
  jenisArsipId?: number[];
  includeDefaults?: boolean;
};

export const getRetentionStatus = (dateValue: string) => {
  const retentionDate = new Date(dateValue);
  retentionDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return retentionDate >= today ? 1 : 0;
};

export const getAdditionalArsipPayload = ({
  packageCapabilities,
  masaRetensi,
  jenisArsipId = [],
  includeDefaults = true,
}: AdditionalArsipPayloadOptions) => {
  const payload: {
    jenis_arsip_id?: number[];
    masa_retensi?: string;
    status_retensi?: number;
  } = {};

  const finalRetentionDate = packageCapabilities.canManageRetention
    ? masaRetensi
    : includeDefaults
      ? packageCapabilities.defaultRetentionDate
      : undefined;

  if (packageCapabilities.canManageClassification && jenisArsipId.length > 0) {
    payload.jenis_arsip_id = jenisArsipId;
  }

  if (finalRetentionDate) {
    payload.masa_retensi = finalRetentionDate;
    payload.status_retensi = getRetentionStatus(finalRetentionDate);
  }

  return payload;
};
