# DR + Incident Command Dashboard

Standalone portfolio project: AWS Terraform landing zone, DR health checks,
synthetic alert aggregation, and a Next.js dashboard on Vercel showing live
incidents with runbooks and an incident-commander view (ack/resolve/escalate).

## What it demonstrates

- **Terraform landing zone**: VPC, public/private subnets, IAM role, internet
  gateway, route tables — provisioned with Terraform in AWS ap-southeast-2.
- **DR health checks & drift detection**: GitHub Actions runs `terraform validate`
  on branches, `plan` on PRs, `apply` via manual `workflow_dispatch`, and drift
  detection on a 6-hour schedule.
- **Synthetic alert aggregation**: CI generates sanitized demo incidents with
  severity, status, service, source, and runbook links — no real observability
  credentials needed.
- **Incident dashboard** (Vercel): polls GitHub API every 30s, shows incident
  list with severity/status cards, alert-source health, and an incident-detail
  page with runbook links.
- **Incident commander**: Acknowledge / Resolve / Escalate via a protected
  server-side API route (`/api/incidents/[id]` PATCH) that persists to Vercel
  Blob — no client-side token exposure.

## Repository layout

```
terraform/
  main.tf           # VPC, subnets, IAM, IGW, route tables
  variables.tf      # input variables
  outputs.tf        # vpc_id, subnet_ids, health_check_url, backend_bucket, dynamodb_table
  versions.tf       # AWS provider (ap-southeast-2)
  backend.hcl.example # state backend example (Floci local emulator)
.github/
  workflows/
    terraform.yml   # CI/CD: validate → plan → apply (manual) → drift
scripts/
  generate-alerts.sh    # CI: generate synthetic alert incidents
  validate-alerts.sh    # CI: validate alert schema
alerts/
  last-run.json         # Synthetic incidents (committed by CI)
runbooks/
  incident-response.md  # Sanitized incident response runbook
  high-severity.md      # Sanitized P1 runbook
dashboard/              # Next.js dashboard (App Router, Tailwind v4)
  app/
    page.tsx            # Server-rendered shell with polling
    api/
      incidents/route.ts          # GET: read alerts/last-run.json from GitHub
      incidents/[id]/route.ts     # PATCH: update incident status via Vercel Blob
  components/
    IncidentList.tsx
    IncidentCard.tsx
    IncidentActions.tsx   # Acknowledge / Resolve / Escalate
    RunbookLink.tsx
    AlertSourceHealth.tsx
    LastUpdated.tsx
  lib/
    blob.ts         # getState/setState via Vercel Blob
    poll.ts         # startPoll: 30s polling with stale fallback
  e2e/
    smoke.test.ts   # Playwright: incident list renders
README.md
```

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.0
- [Floci](https://floci.io/) (local AWS emulator) — `floci 0.4.0`
- [Node.js](https://nodejs.org/) >= 20

## Local development

### 1. Terraform landing zone (against Floci, no real AWS)

```bash
# Start the Floci AWS emulator (port 4566)
floci start

# Create the state bucket locally
aws --endpoint-url http://localhost:4566 s3 mb s3://dr-terraform-state --region ap-southeast-2

# Initialize and validate Terraform
cd terraform
cp backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform validate
```

### 2. Generate synthetic alerts locally

```bash
bash scripts/generate-alerts.sh
bash scripts/validate-alerts.sh
```

### 3. Dashboard (Next.js)

```bash
cd dashboard
cp .env.example .env.local   # fill in GITHUB_PAT, BLOB_READ_WRITE_TOKEN
npm install
npm run dev                  # http://localhost:3000
npm run build                # production build
npm test                     # vitest unit tests
npx playwright test          # Playwright e2e smoke test
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, add a new project and set the **root directory** to `dashboard/`.
3. Add these environment variables in Vercel project settings:

| Variable | Purpose |
|----------|---------|
| `GITHUB_PAT` | GitHub personal access token (`repo` scope) for reading the Actions API and repo contents |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token for state persistence |
| `GITHUB_REPOSITORY` | Set automatically by Vercel when connected to GitHub |

4. Deploy. The dashboard polls every 30s and deploys on every push to `dashboard/`.

## GitHub Secrets (for CI/CD)

Add these to your GitHub repository Settings → Secrets and variables → Actions:

| Secret | Purpose |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | Terraform apply credentials (manual `workflow_dispatch` only) |
| `AWS_SECRET_ACCESS_KEY` | Terraform apply credentials (manual `workflow_dispatch` only) |
| `GITHUB_TOKEN` | Auto-provided by GitHub for drift workflow commits |

The `apply` job runs only on manual `workflow_dispatch` to `main` — it never runs
automatically on push or PR.

## E2E smoke test

```bash
cd dashboard
npx playwright install chromium   # one-time browser install
npx playwright test               # runs e2e/smoke.test.ts
```

The smoke test loads the dashboard and asserts the incident list and alert
source health sections render.

## License

MIT