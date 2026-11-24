type SourceHealth = {
  name: string;
  healthy: boolean;
  lastChecked: string | null;
};

export default function AlertSourceHealth({ sources }: { sources: SourceHealth[] }) {
  return (
    <div className="space-y-[var(--space-3)]">
      {sources.map((source) => (
        <div key={source.name} className="source-row">
          <span
            className="dot"
            style={{ backgroundColor: source.healthy ? "var(--positive)" : "var(--negative)" }}
          ></span>
          <span className="source-name">{source.name}</span>
          <span className="source-time num">
            {source.lastChecked
              ? new Date(source.lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
