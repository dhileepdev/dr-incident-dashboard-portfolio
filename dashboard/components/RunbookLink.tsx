export default function RunbookLink({ runbook }: { runbook: string }) {
  const slug = runbook.replace("runbooks/", "").replace(".md", "");
  return (
    <a
      href={`/runbooks/${slug}`}
      className="runbook"
    >
      {slug}
    </a>
  );
}
