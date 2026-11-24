import { RUNBOOKS } from "@/lib/runbooks";
import { getStorageConfig } from "@/lib/storage";

export async function GET() {
  const config = getStorageConfig();

  try {
    if (config.provider === "custom" && config.endpoint) {
      const res = await fetch(`${config.endpoint}/runbooks`, {
        headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return Response.json(data);
      }
    }

    if (config.provider === "vercel-blob") {
      const blobOpts = config.blobToken ? { token: config.blobToken } : {};
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ ...blobOpts, prefix: "runbooks/" });
      const runbooks = await Promise.all(
        blobs.map(async (blob) => {
          const res = await fetch(blob.url);
          const content = await res.text();
          const slug = blob.pathname.replace("runbooks/", "").replace(".md", "");
          return { slug, title: slug, content, url: blob.url };
        })
      );
      return Response.json(runbooks);
    }
  } catch {
    // Fall through to local
  }

  // Default: local hardcoded runbooks
  return Response.json(
    RUNBOOKS.map((rb) => ({
      slug: rb.slug,
      title: rb.title,
      service: rb.service,
      source: rb.source,
      lastUpdated: rb.lastUpdated,
    }))
  );
}
