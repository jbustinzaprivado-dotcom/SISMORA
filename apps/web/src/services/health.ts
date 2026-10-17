import { apiGet } from './api'

export interface Readiness {
  status: 'ok' | 'degraded'
  version: string
  environment: string
  database: { ok: boolean; latency_ms: number | null }
  server_time_utc: string
}

export const getReadiness = (signal?: AbortSignal) => apiGet<Readiness>('/health/ready', signal)
