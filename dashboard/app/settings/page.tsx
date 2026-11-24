"use client";

import { useState, useEffect } from "react";
import { getStorageConfig, setStorageConfig, PROVIDER_LABELS, PROVIDER_DESCRIPTIONS, type StorageConfig, type StorageProvider } from "@/lib/storage";

type SourceConfig = {
  id: string;
  name: string;
  type: "prometheus" | "grafana" | "cloudwatch" | "gcp" | "custom";
  endpoint: string;
  apiKey: string;
  interval: number;
  enabled: boolean;
};

const DEFAULT_SOURCES: SourceConfig[] = [
  { id: "1", name: "Prometheus", type: "prometheus", endpoint: "http://localhost:9090", apiKey: "", interval: 30, enabled: true },
  { id: "2", name: "Grafana", type: "grafana", endpoint: "http://localhost:3000", apiKey: "", interval: 30, enabled: true },
  { id: "3", name: "CloudWatch", type: "cloudwatch", endpoint: "https://monitoring.us-east-1.amazonaws.com", apiKey: "", interval: 60, enabled: true },
  { id: "4", name: "GCP Monitoring", type: "gcp", endpoint: "https://monitoring.googleapis.com", apiKey: "", interval: 60, enabled: true },
];

const TYPE_LABELS: Record<SourceConfig["type"], string> = {
  prometheus: "Prometheus",
  grafana: "Grafana",
  cloudwatch: "AWS CloudWatch",
  gcp: "GCP Monitoring",
  custom: "Custom",
};

export default function SettingsPage() {
  const [sources, setSources] = useState<SourceConfig[]>(DEFAULT_SOURCES);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<Record<string, "ok" | "fail" | null>>({});
  const [storage, setStorage] = useState<StorageConfig>({ provider: "local" });

  useEffect(() => {
    setStorage(getStorageConfig());
  }, []);

  function updateSource(id: string, patch: Partial<SourceConfig>) {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeSource(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  function addSource() {
    const newId = String(Date.now());
    setSources((prev) => [
      ...prev,
      { id: newId, name: "New Source", type: "custom", endpoint: "", apiKey: "", interval: 30, enabled: true },
    ]);
  }

  async function handleSave() {
    setSaving(true);
    setStorageConfig(storage);
    // Simulate save
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest(id: string) {
    setTesting((prev) => ({ ...prev, [id]: true }));
    setTestResult((prev) => ({ ...prev, [id]: null }));
    // Simulate connection test
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    setTesting((prev) => ({ ...prev, [id]: false }));
    setTestResult((prev) => ({ ...prev, [id]: Math.random() > 0.3 ? "ok" : "fail" }));
  }

  return (
    <div className="space-y-[var(--gap)]">
      <div className="title-row">
        <div>
          <h1>Settings</h1>
          <p className="muted">Configure alert sources, connections, and health checks</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} aria-busy={saving}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Runbook storage</span>
        </div>
        <div className="panel space-y-[var(--space-4)]">
          <div>
            <label className="block text-[var(--step--1)] text-[var(--ink-2)] mb-[var(--space-1)]">Storage provider</label>
            <select
              value={storage.provider}
              onChange={(e) => setStorage({ ...storage, provider: e.target.value as StorageProvider })}
              className="bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)] w-full max-w-[320px]"
            >
              {(Object.keys(PROVIDER_LABELS) as StorageProvider[]).map((key) => (
                <option key={key} value={key}>{PROVIDER_LABELS[key]}</option>
              ))}
            </select>
            <p className="muted text-[var(--step--1)] mt-[var(--space-1)]">
              {PROVIDER_DESCRIPTIONS[storage.provider]}
            </p>
          </div>

          {storage.provider === "custom" && (
            <>
              <div>
                <label className="block text-[var(--step--1)] text-[var(--ink-2)] mb-[var(--space-1)]">Endpoint URL</label>
                <input
                  type="url"
                  value={storage.endpoint || ""}
                  onChange={(e) => setStorage({ ...storage, endpoint: e.target.value })}
                  className="w-full bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)] font-mono"
                  placeholder="https://api.example.com"
                />
                <p className="muted text-[var(--step--1)] mt-[var(--space-1)]">
                  Expected: GET /runbooks (list) and GET /runbooks/:slug (detail)
                </p>
              </div>
              <div>
                <label className="block text-[var(--step--1)] text-[var(--ink-2)] mb-[var(--space-1)]">API Key / Token</label>
                <input
                  type="password"
                  value={storage.apiKey || ""}
                  onChange={(e) => setStorage({ ...storage, apiKey: e.target.value })}
                  className="w-full bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)] font-mono"
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {storage.provider === "vercel-blob" && (
            <div>
              <label className="block text-[var(--step--1)] text-[var(--ink-2)] mb-[var(--space-1)]">Blob Read/Write Token</label>
              <input
                type="password"
                value={storage.blobToken || ""}
                onChange={(e) => setStorage({ ...storage, blobToken: e.target.value })}
                className="w-full bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)] font-mono"
                placeholder="vercel_blob_rw_..."
              />
              <p className="muted text-[var(--step--1)] mt-[var(--space-1)]">
                Upload runbook .md files to the "runbooks/" prefix in your Vercel Blob store.
              </p>
            </div>
          )}

          <div className="flex items-center gap-[var(--space-3)] pt-[var(--space-2)]">
            <button
              className="btn btn-outline"
              onClick={() => {
                setStorageConfig(storage);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
            >
              Apply storage config
            </button>
            {saved && <span className="text-[var(--positive)] text-[var(--step--1)]">✓ Applied</span>}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Alert sources</span>
          <button className="btn btn-outline" onClick={addSource}>
            + Add source
          </button>
        </div>

        <div className="space-y-[var(--space-4)]">
          {sources.map((source) => (
            <div key={source.id} className="panel">
              <div className="flex items-center justify-between mb-[var(--space-4)]">
                <div className="flex items-center gap-[var(--space-3)]">
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) => updateSource(source.id, { name: e.target.value })}
                    className="bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] font-medium text-[var(--step-0)] w-[200px]"
                    placeholder="Source name"
                  />
                  <select
                    value={source.type}
                    onChange={(e) => updateSource(source.id, { type: e.target.value as SourceConfig["type"] })}
                    className="bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)]"
                  >
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-[var(--space-3)]">
                  <label className="flex items-center gap-[var(--space-2)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={(e) => updateSource(source.id, { enabled: e.target.checked })}
                      className="accent-[var(--accent)]"
                    />
                    <span className="text-[var(--step--1)] text-[var(--ink-2)]">Enabled</span>
                  </label>
                  <button
                    className="btn-text text-[var(--negative)]"
                    onClick={() => removeSource(source.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)]">
                <div>
                  <label className="block text-[var(--step--1)] text-[var(--ink-2)] mb-[var(--space-1)]">Endpoint URL</label>
                  <input
                    type="url"
                    value={source.endpoint}
                    onChange={(e) => updateSource(source.id, { endpoint: e.target.value })}
                    className="w-full bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)] font-mono"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[var(--step--1)] text-[var(--ink-2)] mb-[var(--space-1)]">API Key / Token</label>
                  <input
                    type="password"
                    value={source.apiKey}
                    onChange={(e) => updateSource(source.id, { apiKey: e.target.value })}
                    className="w-full bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)] font-mono"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[var(--step--1)] text-[var(--ink-2)] mb-[var(--space-1)]">Health check interval (seconds)</label>
                  <input
                    type="number"
                    value={source.interval}
                    onChange={(e) => updateSource(source.id, { interval: Number(e.target.value) })}
                    className="w-full bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)]"
                    min={10}
                    max={300}
                  />
                </div>
                <div className="flex items-end gap-[var(--space-3)]">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleTest(source.id)}
                    disabled={testing[source.id]}
                    aria-busy={testing[source.id]}
                  >
                    {testing[source.id] ? "Testing…" : "Test connection"}
                  </button>
                  {testResult[source.id] === "ok" && (
                    <span className="text-[var(--positive)] text-[var(--step--1)]">✓ Connected</span>
                  )}
                  {testResult[source.id] === "fail" && (
                    <span className="text-[var(--negative)] text-[var(--step--1)]">✗ Failed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Notifications</span>
        </div>
        <div className="panel space-y-[var(--space-4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--ink)] font-medium text-[var(--step-0)]">Email alerts</p>
              <p className="muted text-[var(--step--1)]">Receive email when an incident is created</p>
            </div>
            <label className="flex items-center gap-[var(--space-2)] cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[var(--accent)]" />
              <span className="text-[var(--step--1)] text-[var(--ink-2)]">Enabled</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--ink)] font-medium text-[var(--step-0)]">Slack webhook</p>
              <p className="muted text-[var(--step--1)]">Post incident updates to a Slack channel</p>
            </div>
            <input
              type="url"
              className="bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)] font-mono w-[320px]"
              placeholder="https://hooks.slack.com/..."
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--ink)] font-medium text-[var(--step-0)]">PagerDuty integration</p>
              <p className="muted text-[var(--step--1)]">Trigger PagerDuty incidents for critical severity</p>
            </div>
            <label className="flex items-center gap-[var(--space-2)] cursor-pointer">
              <input type="checkbox" className="accent-[var(--accent)]" />
              <span className="text-[var(--step--1)] text-[var(--ink-2)]">Enabled</span>
            </label>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Display</span>
        </div>
        <div className="panel space-y-[var(--space-4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--ink)] font-medium text-[var(--step-0)]">Poll interval</p>
              <p className="muted text-[var(--step--1)]">How often to refresh incident data</p>
            </div>
            <select defaultValue="30" className="bg-[var(--raised)] border border-[var(--border)] text-[var(--ink)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius)] text-[var(--step--1)]">
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--ink)] font-medium text-[var(--step-0)]">Show resolved incidents</p>
              <p className="muted text-[var(--step--1)]">Include resolved incidents in the list</p>
            </div>
            <label className="flex items-center gap-[var(--space-2)] cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[var(--accent)]" />
              <span className="text-[var(--step--1)] text-[var(--ink-2)]">Enabled</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
