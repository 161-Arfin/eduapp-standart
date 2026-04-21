import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type AuthSessionTokens = {
  accessToken: string;
  refreshToken?: string | null;
  storedAt: number;
};

type PersistedRecord = {
  sealed: string;
  updatedAt: number;
};

type PersistedStore = {
  version: 1;
  records: Record<string, PersistedRecord>;
};

const STORE_VERSION = 1;
const STORE_RETENTION_MS = 5 * 24 * 60 * 60 * 1000;
const STORE_DIR = path.join(process.cwd(), ".auth-store");
const STORE_FILE = path.join(STORE_DIR, "session-tokens.json");

let storeQueue: Promise<unknown> = Promise.resolve();

const getStoreSecret = () => {
  const secret = process.env.AUTH_TOKEN_STORE_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_TOKEN_STORE_SECRET or NEXTAUTH_SECRET must be configured",
    );
  }
  return createHash("sha256").update(secret).digest();
};

const seal = (value: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getStoreSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    authTag.toString("base64url"),
  ].join(".");
};

const unseal = (sealedValue: string) => {
  const [ivValue, encryptedValue, authTagValue] = sealedValue.split(".");
  if (!ivValue || !encryptedValue || !authTagValue) {
    throw new Error("Invalid token store record");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getStoreSecret(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

const createEmptyStore = (): PersistedStore => ({
  version: STORE_VERSION,
  records: {},
});

const pruneStore = (store: PersistedStore) => {
  const cutoff = Date.now() - STORE_RETENTION_MS;
  let changed = false;

  for (const [sessionKey, record] of Object.entries(store.records)) {
    if (record.updatedAt < cutoff) {
      delete store.records[sessionKey];
      changed = true;
    }
  }

  return changed;
};

const readStore = async (): Promise<PersistedStore> => {
  try {
    const rawStore = await readFile(STORE_FILE, "utf8");
    const parsedStore = JSON.parse(rawStore) as Partial<PersistedStore>;

    return {
      version: STORE_VERSION,
      records: parsedStore.records ?? {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyStore();
    }
    throw error;
  }
};

const writeStore = async (store: PersistedStore) => {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store), "utf8");
};

const withStoreLock = async <T>(operation: () => Promise<T>): Promise<T> => {
  const nextOperation = storeQueue.then(operation, operation);
  storeQueue = nextOperation.then(
    () => undefined,
    () => undefined,
  );
  return nextOperation;
};

export const createAuthSessionKey = () => randomBytes(32).toString("hex");

export const saveAuthSessionTokens = async (
  sessionKey: string,
  tokens: AuthSessionTokens,
) => {
  await withStoreLock(async () => {
    const store = await readStore();
    pruneStore(store);
    store.records[sessionKey] = {
      sealed: seal(JSON.stringify(tokens)),
      updatedAt: Date.now(),
    };
    await writeStore(store);
  });
};

export const getAuthSessionTokens = async (
  sessionKey: string,
): Promise<AuthSessionTokens | null> => {
  return withStoreLock(async () => {
    const store = await readStore();
    const didPruneStore = pruneStore(store);
    const record = store.records[sessionKey];

    if (!record) {
      if (didPruneStore) {
        await writeStore(store);
      }
      return null;
    }

    try {
      return JSON.parse(unseal(record.sealed)) as AuthSessionTokens;
    } catch {
      delete store.records[sessionKey];
      await writeStore(store);
      return null;
    }
  });
};

export const deleteAuthSessionTokens = async (sessionKey: string) => {
  await withStoreLock(async () => {
    const store = await readStore();
    if (!(sessionKey in store.records)) {
      return;
    }

    delete store.records[sessionKey];
    await writeStore(store);
  });
};
