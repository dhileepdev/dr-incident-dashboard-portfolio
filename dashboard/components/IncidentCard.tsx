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

const SEVERITY_TEXT: Record<string, string> = {
  critical: "text-[#e5566f]",
  high: "text-[#e5566f]",
  medium: "text-[#d9a441]",
  low: "text-[#8a8c92]",
};

export default function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <div className="incident-card">
      <div className="incident-head">
        <span className={`incident-title ${SEVERITY_TEXT[incident.severity] || SEVERITY_TEXT.low}`}>
          {incident.title}
        </span>
        <span className={`status-chip ${incident.status === "firing" ? "chip-bad" : incident.status === "resolved" ? "chip-ok" : "chip-warn"}`}>
          {incident.status}
        </span>
      </div>
      <div className="incident-meta">{incident.service} &bull; {incident.source}</div>
      <a
        href={incident.runbook}
        target="_blank"
        rel="noreferrer"
        className="runbook"
      >
        Runbook &rarr;
      </a>
      <p className="muted text-[11px] mt-2">{new Date(incident.createdAt).toLocaleString()}</p>
    </div>
  );
}
