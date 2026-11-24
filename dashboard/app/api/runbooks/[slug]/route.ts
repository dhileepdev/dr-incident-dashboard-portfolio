import { getRunbook } from "@/lib/runbooks";
import { getStorageConfig } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getStorageConfig();

  try {
    if (config.provider === "custom" && config.endpoint) {
      const res = await fetch(`${config.endpoint}/runbooks/${slug}`, {
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
      const { blobs } = await list({ ...blobOpts, prefix: `runbooks/${slug}` });
      const blob = blobs.find((b) => b.pathname === `runbooks/${slug}.md`);
      if (blob) {
        const res = await fetch(blob.url);
        const content = await res.text();
        return Response.json({ slug, title: slug, content });
      }
    }
  } catch {
    // Fall through to local
  }

  // Default: local hardcoded runbook
  const runbook = getRunbook(slug);
  if (!runbook) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(runbook);
}
