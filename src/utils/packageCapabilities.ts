export type PackageKey = "regular" | "advanced";

export type PackageCapabilities = {
  key: PackageKey;
  label: string;
  canManageRetention: boolean;
  canManageClassification: boolean;
  canConfigureFileAccess: boolean;
  canAccessRecycleBin: boolean;
  uploadMode: "pdf-only" | "all";
  defaultRetentionDate?: string;
  useDefaultClassification: boolean;
};

const PACKAGE_CAPABILITIES: Record<PackageKey, PackageCapabilities> = {
  regular: {
    key: "regular",
    label: "EduArsip Reguler",
    canManageRetention: false,
    canManageClassification: false,
    canConfigureFileAccess: false,
    canAccessRecycleBin: true,
    uploadMode: "pdf-only",
    defaultRetentionDate: "2099-12-31",
    useDefaultClassification: true,
  },
  advanced: {
    key: "advanced",
    label: "EduArsip Advanced",
    canManageRetention: true,
    canManageClassification: true,
    canConfigureFileAccess: true,
    canAccessRecycleBin: true,
    uploadMode: "all",
    useDefaultClassification: false,
  },
};

export const getPackageKeyByUsertype = (
  usertypeId?: number | null
): PackageKey => {
  if (usertypeId === 3 || usertypeId === 4) {
    return "regular";
  }

  return "advanced";
};

export const getPackageCapabilities = (
  usertypeId?: number | null
): PackageCapabilities => PACKAGE_CAPABILITIES[getPackageKeyByUsertype(usertypeId)];
