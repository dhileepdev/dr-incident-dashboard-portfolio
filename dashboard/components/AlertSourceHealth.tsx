type SourceHealth = {
  name: string;
  healthy: boolean;
  lastChecked: string | null;
};

export default function AlertSourceHealth({ sources }: { sources: SourceHealth[] }) {
  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <div key={source.name} className={`source-chip ${source.healthy ? "source-ok" : "source-bad"}`}>
          <span className="source-dot" style={{ backgroundColor: source.healthy ? "var(--positive)" : "var(--negative)" }}></span>
          <span>{source.name}</span>
          <span className="muted text-[11px] num" style={{ marginLeft: "auto" }}>
            {source.lastChecked ? new Date(source.lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
