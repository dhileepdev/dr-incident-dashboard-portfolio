export type RunbookContent = {
  slug: string;
  title: string;
  service: string;
  source: string;
  lastUpdated: string;
  content: string;
};

export const RUNBOOKS: RunbookContent[] = [
  {
    slug: "payment-service",
    title: "High Latency on Payment Service",
    service: "payment-service",
    source: "Prometheus",
    lastUpdated: "2026-11-20T14:30:00Z",
    content: `# High Latency on Payment Service

## Overview
Payment service is experiencing elevated response times (>500ms p99). This runbook covers diagnosis and mitigation steps.

## Symptoms
- P99 latency exceeding 500ms
- Increased error rate on /api/checkout endpoint
- Timeout warnings in upstream services

## Diagnosis
1. Check Prometheus dashboard for payment-service latency metrics
2. Review recent deployments in the last 2 hours
3. Check database connection pool utilization
4. Inspect slow query logs on db-primary

## Mitigation
1. **Immediate**: Scale payment-service replicas from 3 to 6
2. **Short-term**: Enable circuit breaker on downstream calls
3. **Long-term**: Review and optimize slow queries

## Escalation
- If latency persists > 1 hour, escalate to on-call lead
- If payment failures exceed 1%, escalate to incident commander

## Contacts
- On-call: #payment-oncall
- Slack: #incident-command
`,
  },
  {
    slug: "auth-api",
    title: "Auth Failure Runbook",
    service: "auth-api",
    source: "Grafana",
    lastUpdated: "2026-11-19T10:15:00Z",
    content: `# Auth Failure Runbook

## Overview
Authentication service is returning 401/403 errors at elevated rates. Users cannot log in or refresh tokens.

## Symptoms
- 401 Unauthorized responses increasing
- Token refresh failures
- Session validation timeouts

## Diagnosis
1. Check Grafana auth-api dashboard for error rates
2. Verify JWT signing key rotation schedule
3. Check Redis session store connectivity
4. Review recent auth-service deployments

## Mitigation
1. **Immediate**: Restart auth-api pods (rolling restart)
2. **Short-term**: Extend token TTL temporarily if key rotation is pending
3. **Long-term**: Implement token refresh retry logic

## Escalation
- If auth failures exceed 5%, escalate to security team
- If JWT key compromise suspected, rotate keys immediately

## Contacts
- On-call: #auth-oncall
- Security: #security-incidents
`,
  },
  {
    slug: "worker-nodes",
    title: "Memory Pressure on Worker Nodes",
    service: "worker-nodes",
    source: "CloudWatch",
    lastUpdated: "2026-11-18T08:45:00Z",
    content: `# Memory Pressure on Worker Nodes

## Overview
Worker nodes are approaching memory limits, risking OOM kills and job failures.

## Symptoms
- Memory utilization > 85% on worker nodes
- OOM kill events in CloudWatch
- Job queue backing up

## Diagnosis
1. Check CloudWatch memory metrics per node
2. Identify top memory-consuming processes
3. Review recent job submissions for memory-heavy workloads
4. Check for memory leaks in long-running processes

## Mitigation
1. **Immediate**: Drain and restart affected nodes
2. **Short-term**: Reduce concurrent job limit
3. **Long-term**: Add memory limits to job definitions

## Escalation
- If OOM kills occur, escalate to infrastructure team
- If memory leak confirmed, create bug ticket

## Contacts
- On-call: #infra-oncall
- Slack: #incident-command
`,
  },
  {
    slug: "db-primary",
    title: "Database Recovery Runbook",
    service: "db-primary",
    source: "GCP Monitoring",
    lastUpdated: "2026-11-17T16:20:00Z",
    content: `# Database Recovery Runbook

## Overview
Primary database is experiencing issues: slow queries, connection exhaustion, or replication lag.

## Symptoms
- Query latency > 2s
- Connection pool exhausted
- Replication lag > 30s
- High CPU on db-primary

## Diagnosis
1. Check GCP Monitoring for db-primary metrics
2. Review slow query log
3. Check connection count vs max_connections
4. Verify replication status

## Mitigation
1. **Immediate**: Kill long-running queries
2. **Short-term**: Increase connection pool size
3. **Long-term**: Add read replicas for heavy queries

## Escalation
- If database is unresponsive, failover to replica
- If data corruption suspected, contact DBA team

## Contacts
- On-call: #db-oncall
- DBA: #dba-team
`,
  },
  {
    slug: "api-gateway",
    title: "API Gateway Runbook",
    service: "api-gateway",
    source: "Prometheus",
    lastUpdated: "2026-11-16T12:00:00Z",
    content: `# API Gateway Runbook

## Overview
API gateway is experiencing issues: rate limiting, routing failures, or SSL certificate problems.

## Symptoms
- 502/503 errors increasing
- Rate limit exceeded responses
- SSL handshake failures

## Diagnosis
1. Check Prometheus api-gateway metrics
2. Review rate limit configuration
3. Check SSL certificate expiry
4. Verify upstream service health

## Mitigation
1. **Immediate**: Increase rate limits if legitimate traffic spike
2. **Short-term**: Restart gateway pods
3. **Long-term**: Review and tune rate limit policies

## Escalation
- If gateway is down, failover to backup
- If SSL cert expired, renew immediately

## Contacts
- On-call: #gateway-oncall
- Slack: #incident-command
`,
  },
  {
    slug: "cache-layer",
    title: "Cache Invalidation Runbook",
    service: "cache-layer",
    source: "Grafana",
    lastUpdated: "2026-11-15T09:30:00Z",
    content: `# Cache Invalidation Runbook

## Overview
Cache layer (Redis) is experiencing issues: high memory, eviction storms, or connection failures.

## Symptoms
- Cache hit rate dropping below 80%
- Redis memory > 90%
- Eviction rate spiking
- Connection timeouts

## Diagnosis
1. Check Grafana cache dashboard
2. Review memory usage and eviction policy
3. Check connection count
4. Identify cache key patterns with high churn

## Mitigation
1. **Immediate**: Flush stale cache keys
2. **Short-term**: Increase Redis memory allocation
3. **Long-term**: Implement cache warming strategy

## Escalation
- If Redis is down, failover to replica
- If data inconsistency, invalidate and rebuild cache

## Contacts
- On-call: #cache-oncall
- Slack: #incident-command
`,
  },
];

export function getRunbook(slug: string): RunbookContent | undefined {
  return RUNBOOKS.find((r) => r.slug === slug);
}
