// Simulated monitoring data for local development and demos.
// Produces realistic source health and incident data without external dependencies.

export type SourceHealth = {
  name: string;
  healthy: boolean;
  lastChecked: string | null;
};

export type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  service: string;
  source: string;
  runbook: string;
  createdAt: string;
};

const SOURCES = ["Prometheus", "Grafana", "CloudWatch", "GCP Monitoring"];

const INCIDENT_TITLES = [
  "High latency on payment-service",
  "Elevated error rate in auth-api",
  "Memory pressure on worker nodes",
  "Disk space low on db-primary",
  "CPU spike on api-gateway",
  "Network timeout in cache-layer",
  "Queue backlog in message-broker",
  "Certificate expiring in 24h",
];

const SERVICES = ["payment-service", "auth-api", "worker-nodes", "db-primary", "api-gateway", "cache-layer", "message-broker", "edge-proxy"];
const SEVERITIES = ["critical", "high", "medium", "low"];
const STATUSES = ["firing", "acknowledged", "resolved", "escalated"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoMinutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

export function simulateSources(): SourceHealth[] {
  return SOURCES.map((name) => ({
    name,
    healthy: Math.random() > 0.25,
    lastChecked: isoMinutesAgo(Math.floor(Math.random() * 5)),
  }));
}

export function simulateIncidents(count = 6): Incident[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `inc-${String(i + 1).padStart(3, "0")}`,
    title: pick(INCIDENT_TITLES),
    severity: pick(SEVERITIES),
    status: pick(STATUSES),
    service: pick(SERVICES),
    source: pick(SOURCES),
    runbook: `runbooks/${pick(SERVICES)}.md`,
    createdAt: isoMinutesAgo(Math.floor(Math.random() * 120) + 5),
  }));
}

export function simulateDashboardState() {
  return {
    incidents: simulateIncidents(),
    generatedAt: new Date().toISOString(),
    sources: simulateSources(),
  };
}
