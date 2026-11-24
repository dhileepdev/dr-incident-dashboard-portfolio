// Storage abstraction for runbooks and other content.
// Supports multiple backends: local (hardcoded), Vercel Blob, or custom HTTP endpoint.

export type StorageProvider = "local" | "vercel-blob" | "custom";

export type StorageConfig = {
  provider: StorageProvider;
  /** Custom endpoint URL (for "custom" provider) */
  endpoint?: string;
  /** API key / token for authenticated endpoints */
  apiKey?: string;
  /** Vercel Blob token (for "vercel-blob" provider) */
  blobToken?: string;
};

const DEFAULT_CONFIG: StorageConfig = {
  provider: "local",
};

export function getStorageConfig(): StorageConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("storage-config");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  // Server-side: check env vars
  const provider = (process.env.STORAGE_PROVIDER as StorageProvider) || "local";
  return {
    provider,
    endpoint: process.env.STORAGE_ENDPOINT,
    apiKey: process.env.STORAGE_API_KEY,
    blobToken: process.env.BLOB_READ_WRITE_TOKEN,
  };
}

export function setStorageConfig(config: StorageConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("storage-config", JSON.stringify(config));
  }
}

export const PROVIDER_LABELS: Record<StorageProvider, string> = {
  local: "Local (built-in)",
  "vercel-blob": "Vercel Blob",
  custom: "Custom HTTP endpoint",
};

export const PROVIDER_DESCRIPTIONS: Record<StorageProvider, string> = {
  local: "Runbooks are served from the application bundle. No external dependencies.",
  "vercel-blob": "Runbooks are stored in Vercel Blob storage. Requires a Blob read/write token.",
  custom: "Runbooks are fetched from a custom HTTP endpoint. Supports any REST API.",
};
