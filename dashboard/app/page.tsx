"use client";

import { useState, useEffect, useRef } from "react";
import { getState, setState } from "@/lib/blob";
import IncidentList from "@/components/IncidentList";
import AlertSourceHealth from "@/components/AlertSourceHealth";
import LastUpdated from "@/components/LastUpdated";

type DashboardState = {
  incidents: { id: string; title: string; severity: string; status: string; service: string; source: string; runbook: string; createdAt: string }[];
  generatedAt: string | null;
  sources: { name: string; healthy: boolean; lastChecked: string | null }[];
};

const EMPTY: DashboardState = {
  incidents: [],
  generatedAt: null,
  sources: [
    { name: "Prometheus", healthy: false, lastChecked: null },
    { name: "Grafana", healthy: false, lastChecked: null },
    { name: "CloudWatch", healthy: false, lastChecked: null },
    { name: "GCP Monitoring", healthy: false, lastChecked: null },
  ],
};

const POLL_INTERVAL_MS = 30_000;

export default function Page() {
  const [state, setState] = useState<DashboardState>(EMPTY);
  const [stale, setStale] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const runFetch = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const res = await fetch("/api/incidents", { cache: "no-store" });
        const incidents = res.ok ? (await res.json()) : null;
        if (!mounted) return;
        setFresh(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        if (incidents === null) {
          const fallback = await getState<DashboardState>(EMPTY);
          setState(fallback);
          setStale(true);
        } else {
          const now = new Date().toISOString();
          const sources: DashboardState["sources"] = [
            { name: "Prometheus", healthy: true, lastChecked: now },
            { name: "Grafana", healthy: true, lastChecked: now },
            { name: "CloudWatch", healthy: true, lastChecked: now },
            { name: "GCP Monitoring", healthy: true, lastChecked: now },
          ];
          const newState: DashboardState = {
            incidents: incidents.incidents ?? [],
            generatedAt: incidents.generatedAt ?? null,
            sources,
          };
          try {
            await setState(newState);
          } catch {
            // Blob not configured locally
          }
          setState(newState);
          setStale(false);
        }
      } catch {
        if (!mounted) return;
        const fallback = await getState<DashboardState>(EMPTY);
        setState(fallback);
        setStale(true);
      }
    };

    void fetchAll();
    runFetch.current = fetchAll;
    const interval = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-[24px]">
      <div className="title-row">
        <div>
          <h1 className="text-[#ffffff]">DR &amp; Incident Command</h1>
          <p className="muted text-[11px] mt-1">Live incidents, alert sources, ack / resolve / escalate</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-outline" onClick={() => runFetch.current?.()}>Refresh</button>
          <span className="muted text-[11px]">Updated {fresh ?? "—"}</span>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Incidents</span>
          <button className="btn btn-outline">View all</button>
        </div>
        <div className="flat-card">
          <IncidentList incidents={state.incidents} />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Alert sources</span>
          <button className="btn btn-outline">View all</button>
        </div>
        <div className="flat-card">
          <AlertSourceHealth sources={state.sources} />
        </div>
      </div>

      <div className="flex justify-between items-end mt-4">
        <LastUpdated timestamp={state.generatedAt ?? null} />
        {stale && (
          <span className="inline-flex items-center gap-2">
            <span className="dot dot-bad"></span>
            <span className="muted text-[11px]">Showing stale state — some APIs unreachable.</span>
          </span>
        )}
      </div>
    </div>
  );
}
