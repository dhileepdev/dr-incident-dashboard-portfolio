"use client";

import { useState, useEffect, useRef } from "react";
import { getState, setState } from "@/lib/blob";
import { simulateSources, simulateIncidents } from "@/lib/sim";
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

    // Show simulated data immediately (client-only, avoids hydration mismatch)
    setState({
      incidents: simulateIncidents(),
      generatedAt: new Date().toISOString(),
      sources: simulateSources(),
    });
    setStale(true);

    const fetchAll = async () => {
      try {
        const res = await fetch("/api/incidents", { cache: "no-store" });
        const incidents = res.ok ? (await res.json()) : null;
        if (!mounted) return;
        setFresh(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        if (incidents === null || !incidents.incidents?.length) {
          // Use simulated data so the dashboard always shows realistic content
          const simSources = simulateSources();
          const simIncidents = simulateIncidents();
          const fallback: DashboardState = {
            incidents: simIncidents,
            generatedAt: new Date().toISOString(),
            sources: simSources,
          };
          setState(fallback);
          setStale(true);
        } else {
          const now = new Date().toISOString();
          const sources: DashboardState["sources"] = incidents.sources?.length
            ? incidents.sources
            : simulateSources();
          const newState: DashboardState = {
            incidents: incidents.incidents ?? [],
            generatedAt: incidents.generatedAt ?? now,
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
        const simSources = simulateSources();
        const simIncidents = simulateIncidents();
        setState({
          incidents: simIncidents,
          generatedAt: new Date().toISOString(),
          sources: simSources,
        });
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
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>DR &amp; Incident Command</h1>
          <p className="muted">Live incidents, alert sources, ack / resolve / escalate</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-outline" onClick={() => runFetch.current?.()}>
            Refresh
          </button>
          <span className="muted">Updated {fresh ?? "—"}</span>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Incidents</span>
          <button className="btn btn-outline">View all</button>
        </div>
        <div className="panel">
          <IncidentList incidents={state.incidents} />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Alert sources</span>
          <button className="btn btn-outline">View all</button>
        </div>
        <div className="panel">
          <AlertSourceHealth sources={state.sources} />
        </div>
      </div>

      <div className="flex justify-between items-end">
        <LastUpdated timestamp={state.generatedAt ?? null} />
        {stale && (
          <span className="inline-flex items-center gap-2">
            <span className="dot dot-bad"></span>
            <span className="muted">Showing stale state — some APIs unreachable.</span>
          </span>
        )}
      </div>
    </div>
  );
}
