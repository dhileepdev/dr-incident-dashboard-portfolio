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

const SEVERITY_CLASS: Record<string, string> = {
  critical: "sev-critical",
  high: "sev-high",
  medium: "sev-medium",
  low: "sev-low",
};

const STATUS_CHIP: Record<string, string> = {
  firing: "chip-firing",
  resolved: "chip-resolved",
  escalated: "chip-escalated",
};

export default function IncidentCard({ incident }: { incident: Incident }) {
  const severityCls = SEVERITY_CLASS[incident.severity] || SEVERITY_CLASS.low;
  const chipCls = STATUS_CHIP[incident.status] || "chip-escalated";

  return (
    <div className="incident" role="listitem" tabIndex={-1}>
      <div className="incident-main">
        <div className="incident-title">{incident.title}</div>
        <span className={`incident-severity ${severityCls}`}>{incident.severity}</span>
        <div className="incident-meta">
          <span className="num">{incident.service}</span>
          <span>&bull;</span>
          <span>{incident.source}</span>
        </div>
      </div>

      <span className={`status-chip ${chipCls}`}>{incident.status}</span>

      <div className="incident-actions">
        {incident.runbook && (
          <a
            href={incident.runbook}
            target="_blank"
            rel="noreferrer"
            className="runbook"
          >
            Runbook &rarr;
          </a>
        )}
      </div>

      <p className="incident-time">
        {new Date(incident.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
