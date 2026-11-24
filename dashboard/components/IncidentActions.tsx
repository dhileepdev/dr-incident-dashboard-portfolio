import React from "react";

type Incident = {
  id: string;
  title: string;
  status: string;
};

type StatusAction = {
  status: string;
  label: string;
};

const STATUS_ACTIONS: StatusAction[] = [
  { status: "acknowledged", label: "Acknowledge" },
  { status: "resolved", label: "Resolve" },
  { status: "escalated", label: "Escalate" },
];

export default function IncidentActions({
  incident,
  onUpdate,
}: {
  incident: Incident;
  onUpdate: (updatedIncident: Incident) => void;
}) {
  const [updating, setUpdating] = React.useState<Set<string>>(new Set());

  async function handleStatusChange(newStatus: string) {
    if (updating.has(newStatus)) return;
    setUpdating((prev) => new Set([...prev, newStatus]));
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error("Failed to update incident status");
        return;
      }
      const data = await res.json();
      onUpdate(data.incident);
    } catch {
      console.error("Failed to update incident status");
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(newStatus);
        return next;
      });
    }
  }

  return (
    <div className="space-y-[var(--space-3)]">
      <p className="muted">
        Current status:{" "}
        <span className="text-[var(--ink)] font-medium">{incident.status}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {STATUS_ACTIONS.map((action) => {
          const isUpdating = updating.has(action.status);
          const isCurrent = incident.status === action.status;
          const disabled = isCurrent || isUpdating;
          return (
            <button
              key={action.status}
              onClick={() => (disabled ? undefined : handleStatusChange(action.status))}
              disabled={disabled}
              aria-busy={isUpdating}
              className="btn-text"
            >
              {isUpdating ? "…" : action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
