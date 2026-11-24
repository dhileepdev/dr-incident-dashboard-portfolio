import IncidentCard from "./IncidentCard";

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

const SEVERITY_ORDER: { key: string; label: string; chip: string; cls: string }[] = [
  { key: "critical", label: "Critical", chip: "chip-firing", cls: "sev-critical" },
  { key: "high", label: "High", chip: "chip-firing", cls: "sev-high" },
  { key: "medium", label: "Medium", chip: "chip-escalated", cls: "sev-medium" },
  { key: "low", label: "Low", chip: "chip-resolved", cls: "sev-low" },
];

export default function IncidentList({ incidents }: { incidents: Incident[] }) {
  const bySeverity = incidents.reduce(
    (acc, inc) => ({ ...acc, [inc.severity]: (acc[inc.severity] || 0) + 1 }),
    {} as Record<string, number>,
  );

  const total = incidents.length;

  return (
    <div className="space-y-[var(--space-5)]">
      <div className="flex items-baseline gap-3">
        <span className="incident-list-count">
          <span className="num">{total}</span>
          <span className="label">incidents</span>
        </span>
      </div>

      <div className="severity-list">
        {SEVERITY_ORDER.map((s) => {
          const count = bySeverity[s.key] || 0;
          return (
            <div key={s.key} className={`sev-chip ${s.chip}`}>
              <span className="sev-name">{s.label}</span>
              <span className="sev-count num">{count}</span>
            </div>
          );
        })}
      </div>

      {incidents.length === 0 ? (
        <div className="empty-state">
          <span className="dot dot-ok"></span>
          <p>No active incidents</p>
        </div>
      ) : (
        incidents.map((inc) => <IncidentCard key={inc.id} incident={inc} />)
      )}
    </div>
  );
}
