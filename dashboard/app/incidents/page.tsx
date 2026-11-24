"use client";

import { useState, useEffect } from "react";
import { simulateIncidents } from "@/lib/sim";
import IncidentList from "@/components/IncidentList";
import IncidentActions from "@/components/IncidentActions";

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  service: string;
  source: string;
  runbook: string;
  createdAt: string;
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(simulateIncidents());
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIncidents(simulateIncidents());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>Incidents</h1>
          <p className="muted">All active and resolved incidents</p>
        </div>
      </div>

      <div className="section">
        <div className="panel">
          <IncidentList incidents={incidents} />
        </div>
      </div>

      {selected && (
        <div className="section">
          <div className="section-head">
            <span className="section-title">Selected incident</span>
          </div>
          <div className="panel">
            <IncidentActions incident={selected} onUpdate={(updated) => {
              const mapped = incidents.find((i) => i.id === updated.id);
              if (mapped) {
                const merged = { ...mapped, status: updated.status };
                setIncidents((prev) => prev.map((i) => (i.id === updated.id ? merged : i)));
                setSelected(merged);
              }
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
