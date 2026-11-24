"use client";

import { useState, useEffect } from "react";
import { simulateSources } from "@/lib/sim";
import AlertSourceHealth from "@/components/AlertSourceHealth";

type SourceHealth = {
  name: string;
  healthy: boolean;
  lastChecked: string | null;
};

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceHealth[]>(simulateSources());

  useEffect(() => {
    const interval = setInterval(() => {
      setSources(simulateSources());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const healthy = sources.filter((s) => s.healthy).length;
  const unhealthy = sources.filter((s) => !s.healthy).length;

  return (
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>Sources</h1>
          <p className="muted">Alert source health and connection status</p>
        </div>
      </div>

      <div className="section">
        <div className="panel">
          <div className="flex items-baseline gap-[var(--space-4)] mb-[var(--space-5)]">
            <span className="incident-list-count">
              <span className="num">{healthy}</span>
              <span className="label">healthy</span>
            </span>
            <span className="incident-list-count">
              <span className="num" style={{ color: unhealthy > 0 ? "var(--negative)" : "var(--ink)" }}>{unhealthy}</span>
              <span className="label">unhealthy</span>
            </span>
          </div>
          <AlertSourceHealth sources={sources} />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Connection details</span>
        </div>
        <div className="panel">
          <div className="space-y-[var(--space-3)]">
            {sources.map((source) => (
              <div key={source.name} className="source-row">
                <span
                  className="dot"
                  style={{ backgroundColor: source.healthy ? "var(--positive)" : "var(--negative)" }}
                ></span>
                <span className="source-name">{source.name}</span>
                <span className="muted text-[var(--step--1)]">
                  {source.healthy ? "Connected" : "Disconnected"}
                </span>
                <span className="source-time num">
                  {source.lastChecked
                    ? new Date(source.lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
