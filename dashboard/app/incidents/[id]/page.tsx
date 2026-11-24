import IncidentCard from "@/components/IncidentCard";
import IncidentActions from "@/components/IncidentActions";
import RunbookLink from "@/components/RunbookLink";

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

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(
    `https://api.github.com/repos/owner/repo/contents/alerts/last-run.json`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_PAT ? { Authorization: `Bearer ${process.env.GITHUB_PAT}` } : {}),
      },
      cache: "no-store",
    },
  );

  let incident: Incident | null = null;

  if (res.ok) {
    const data = await res.json();
    const contentBase64 = data.content as string;
    if (contentBase64) {
      const decoded = Buffer.from(contentBase64, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      incident = parsed.incidents?.find((i: Incident) => i.id === id) ?? null;
    }
  }

  if (!incident) {
    return (
      <main className="shell-content">
        <div className="panel">
          <h1>Incident Not Found</h1>
          <p className="muted">Incident "{id}" could not be found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="shell-content">
      <h1>Incident {incident.id}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-5)] mb-[var(--gap)]">
        <div className="panel">
          <h2 className="section-title">Details</h2>
          <dl className="space-y-[var(--space-3)]">
            <div className="flex justify-between">
              <dt className="muted">Title</dt>
              <dd className="text-[var(--ink)]">{incident.title}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="muted">Service</dt>
              <dd className="text-[var(--ink)]">{incident.service}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="muted">Source</dt>
              <dd className="text-[var(--ink)]">{incident.source}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="muted">Created</dt>
              <dd className="text-[var(--ink)]">{new Date(incident.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="panel">
          <h2 className="section-title">Status & Severity</h2>
          <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-4)]">
            <span
              className={`px-[var(--space-2)] py-[var(--space-1)] border border-[var(--border-width)] rounded-[var(--radius-control)] text-[var(--step--1)] font-medium`}
              style={{
                color: incident.severity === "critical" || incident.severity === "high" ? "var(--negative)" : incident.severity === "medium" ? "var(--warning)" : "var(--ink-2)",
                borderColor: incident.severity === "critical" || incident.severity === "high" ? "var(--negative)" : incident.severity === "medium" ? "var(--warning)" : "var(--border)",
              }}
            >
              {incident.severity}
            </span>
            <span
              className={`px-[var(--space-2)] py-[var(--space-1)] border border-[var(--border-width)] rounded-[var(--radius-control)] text-[var(--step--1)] font-medium`}
              style={{
                color:
                  incident.status === "firing"
                    ? "var(--negative)"
                    : incident.status === "resolved"
                      ? "var(--positive)"
                      : "var(--warning)",
                borderColor:
                  incident.status === "firing"
                    ? "var(--negative)"
                    : incident.status === "resolved"
                      ? "var(--positive)"
                      : "var(--warning)",
              }}
            >
              {incident.status}
            </span>
          </div>
          <div>
            <RunbookLink runbook={incident.runbook} />
          </div>
        </div>
      </div>

      <div className="panel">
        <IncidentCard incident={incident} />
      </div>

      <div className="panel mt-[var(--space-5)]">
        <IncidentActions
          incident={incident}
          onUpdate={() => {
            // PATCH response updates locally; re-fetch would be needed for full sync.
          }}
        />
      </div>
    </main>
  );
}
