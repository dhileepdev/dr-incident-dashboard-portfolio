"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Runbook = {
  slug: string;
  title: string;
  service?: string;
  source?: string;
  lastUpdated?: string;
  content: string;
};

export default function RunbookDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [runbook, setRunbook] = useState<Runbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchRunbook() {
      try {
        // Check if custom storage is configured
        let url = `/api/runbooks/${slug}`;
        const headers: Record<string, string> = {};

        const storageConfig = localStorage.getItem("storage-config");
        if (storageConfig) {
          const config = JSON.parse(storageConfig);
          if (config.provider === "custom" && config.endpoint) {
            url = `${config.endpoint}/runbooks/${slug}`;
            if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
          }
        }

        const res = await fetch(url, { headers, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setRunbook({
            slug: data.slug || slug,
            title: data.title || slug,
            service: data.service,
            source: data.source,
            lastUpdated: data.lastUpdated || data.updatedAt || data.updated_at,
            content: data.content || "",
          });
        } else {
          // Fall back to local API
          const fallback = await fetch(`/api/runbooks/${slug}`, { cache: "no-store" });
          if (fallback.ok) {
            const data = await fallback.json();
            setRunbook({
              slug: data.slug || slug,
              title: data.title || slug,
              service: data.service,
              source: data.source,
              lastUpdated: data.lastUpdated,
              content: data.content || "",
            });
          } else {
            setNotFound(true);
          }
        }
      } catch {
        // Fall back to local API
        try {
          const fallback = await fetch(`/api/runbooks/${slug}`, { cache: "no-store" });
          if (fallback.ok) {
            const data = await fallback.json();
            setRunbook({
              slug: data.slug || slug,
              title: data.title || slug,
              service: data.service,
              source: data.source,
              lastUpdated: data.lastUpdated,
              content: data.content || "",
            });
          } else {
            setNotFound(true);
          }
        } catch {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    void fetchRunbook();
  }, [slug]);

  if (loading) {
    return (
      <main className="shell-content">
        <p className="muted">Loading runbook…</p>
      </main>
    );
  }

  if (notFound || !runbook) {
    return (
      <main className="shell-content">
        <div className="panel">
          <h1>Runbook Not Found</h1>
          <p className="muted">Runbook "{slug}" could not be found.</p>
          <a href="/runbooks" className="btn btn-outline mt-[var(--space-4)]">← Back to runbooks</a>
        </div>
      </main>
    );
  }

  // Simple markdown-to-HTML rendering
  const lines = runbook.content.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h1 class="text-[var(--step-3)] font-semibold text-[var(--ink)] mt-[var(--space-6)] mb-[var(--space-3)]">${trimmed.slice(2)}</h1>`);
    } else if (trimmed.startsWith("## ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h2 class="text-[var(--step-2)] font-semibold text-[var(--ink)] mt-[var(--space-5)] mb-[var(--space-2)]">${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) { html.push('<ul class="list-disc pl-[var(--space-5)] space-y-[var(--space-1)]">'); inList = true; }
      html.push(`<li class="text-[var(--step-0)] text-[var(--ink-2)]">${trimmed.slice(2)}</li>`);
    } else if (trimmed.startsWith("```")) {
      // skip code fences
    } else if (trimmed === "") {
      if (inList) { html.push("</ul>"); inList = false; }
    } else {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<p class="text-[var(--step-0)] text-[var(--ink-2)] mb-[var(--space-3)] leading-relaxed">${trimmed}</p>`);
    }
  }
  if (inList) html.push("</ul>");

  return (
    <main className="shell-content">
      <div className="title-row mb-[var(--space-5)]">
        <div>
          <h1 className="text-[var(--step-4)]">{runbook.title}</h1>
          <p className="muted">
            {runbook.service && `${runbook.service} · `}
            {runbook.source && `${runbook.source} · `}
            {runbook.lastUpdated && `Last updated ${new Date(runbook.lastUpdated).toLocaleDateString()}`}
          </p>
        </div>
        <a href="/runbooks" className="btn btn-outline">← Back</a>
      </div>

      <div className="panel">
        <div dangerouslySetInnerHTML={{ __html: html.join("\n") }} />
      </div>
    </main>
  );
}
