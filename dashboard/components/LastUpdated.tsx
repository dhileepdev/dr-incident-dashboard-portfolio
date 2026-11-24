export default function LastUpdated({ timestamp }: { timestamp: string | null }) {
  return (
    <div className="last-updated">
      {timestamp ? `Last updated: ${new Date(timestamp).toLocaleString()}` : "Last updated: —"}
    </div>
  );
}
