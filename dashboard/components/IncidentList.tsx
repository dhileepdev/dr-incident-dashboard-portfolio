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

const SEVERITY_ORDER: { key: string; label: string; chip: string }[] = [
  { key: "critical", label: "Critical", chip: "chip-bad" },
  { key: "high", label: "High", chip: "chip-bad" },
  { key: "medium", label: "Medium", chip: "chip-warn" },
  { key: "low", label: "Low", chip: "chip-neutral" },
];

export default function IncidentList({ incidents }: { incidents: Incident[] }) {
  const bySeverity = incidents.reduce(
    (acc, inc) => ({ ...acc, [inc.severity]: (acc[inc.severity] || 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="num text-[#ffffff] text-xl font-600">{incidents.length}</span>
        <span className="muted text-[12px]">incidents</span>
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
        <p className="muted text-[12px] mt-2">No active incidents</p>
      ) : (
        <>
          {incidents.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
        </>
      )}
    </div>
  );
}
