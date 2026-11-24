"use client";

import { useState, useEffect } from "react";
import RunbookLink from "@/components/RunbookLink";

type Runbook = {
  slug: string;
  title: string;
  service?: string;
  source?: string;
  lastUpdated?: string;
};

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRunbooks() {
      try {
        // Check if custom storage is configured
        const storageConfig = localStorage.getItem("storage-config");
        let url = "/api/runbooks";
        const headers: Record<string, string> = {};

        if (storageConfig) {
          const config = JSON.parse(storageConfig);
          if (config.provider === "custom" && config.endpoint) {
            url = `${config.endpoint}/runbooks`;
            if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
          }
        }

        const res = await fetch(url, { headers, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // Normalize response format
          const normalized = Array.isArray(data)
            ? data.map((rb: any) => ({
                slug: rb.slug || rb.id || rb.name,
                title: rb.title || rb.name || rb.slug,
                service: rb.service,
                source: rb.source,
                lastUpdated: rb.lastUpdated || rb.updatedAt || rb.updated_at,
              }))
            : data;
          setRunbooks(normalized);
        } else {
          // Fall back to local API
          const fallback = await fetch("/api/runbooks", { cache: "no-store" });
          if (fallback.ok) setRunbooks(await fallback.json());
        }
      } catch {
        // Fall back to local API
        try {
          const fallback = await fetch("/api/runbooks", { cache: "no-store" });
          if (fallback.ok) setRunbooks(await fallback.json());
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    }
    void fetchRunbooks();
  }, []);

  return (
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>Runbooks</h1>
          <p className="muted">Operational runbooks and recovery procedures</p>
        </div>
      </div>

      <div className="section">
        <div className="panel">
          {loading ? (
            <p className="muted">Loading runbooks…</p>
          ) : runbooks.length === 0 ? (
            <p className="muted">No runbooks found. Configure a storage provider in Settings.</p>
          ) : (
            <div className="space-y-[var(--space-3)]">
              {runbooks.map((rb) => (
                <div key={rb.slug} className="source-row">
                  <span className="dot dot-ok"></span>
                  <div className="flex flex-col gap-[var(--space-1)] min-w-0 flex-1">
                    <span className="source-name">{rb.title}</span>
                    {rb.service && (
                      <span className="muted text-[var(--step--1)]">
                        {rb.service} · {rb.source}
                      </span>
                    )}
                  </div>
                  <RunbookLink runbook={`runbooks/${rb.slug}.md`} />
                  {rb.lastUpdated && (
                    <span className="source-time num">
                      {new Date(rb.lastUpdated).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
