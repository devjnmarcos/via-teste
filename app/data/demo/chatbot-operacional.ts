/**
 * Fixtures de Chatbot operacional (disparo, monitor, Mileto backfill).
 */

import type { TrendPoint } from '../../types/domain'

export interface ChatbotQueueRow extends Record<string, unknown> {
  id: string
  queue: string
  waiting: number
  processing: number
  failed: number
  latencyMs: number
}

export interface MiletoBackfillJob extends Record<string, unknown> {
  id: string
  rangeLabel: string
  progress: number
  status: 'idle' | 'running' | 'done' | 'error'
  statusLabel: string
  processed: number
  total: number
  startedAtLabel: string
}

export const chatbotMonitorQueues: ChatbotQueueRow[] = [
  {
    id: 'q-1',
    queue: 'dispatch.whatsapp',
    waiting: 18,
    processing: 4,
    failed: 2,
    latencyMs: 420
  },
  {
    id: 'q-2',
    queue: 'dispatch.sms',
    waiting: 7,
    processing: 1,
    failed: 0,
    latencyMs: 310
  },
  {
    id: 'q-3',
    queue: 'umbler.webhook',
    waiting: 3,
    processing: 2,
    failed: 1,
    latencyMs: 580
  },
  {
    id: 'q-4',
    queue: 'chatbot.retry',
    waiting: 12,
    processing: 0,
    failed: 5,
    latencyMs: 890
  }
]

export const chatbotHealthTrend: TrendPoint[] = [
  { label: '08h', value: 92 },
  { label: '09h', value: 95 },
  { label: '10h', value: 88 },
  { label: '11h', value: 97 },
  { label: '12h', value: 91 },
  { label: '13h', value: 94 },
  { label: '14h', value: 96 }
]

export const miletoBackfillState = {
  jobs: [
    {
      id: 'bf-1',
      rangeLabel: '01/07 → 07/07',
      progress: 100,
      status: 'done' as const,
      statusLabel: 'Concluído',
      processed: 4200,
      total: 4200,
      startedAtLabel: '17/07 22:10'
    },
    {
      id: 'bf-2',
      rangeLabel: '08/07 → 14/07',
      progress: 62,
      status: 'running' as const,
      statusLabel: 'Em execução',
      processed: 1860,
      total: 3000,
      startedAtLabel: '18/07 06:00'
    },
    {
      id: 'bf-3',
      rangeLabel: '15/07 → 18/07',
      progress: 0,
      status: 'idle' as const,
      statusLabel: 'Na fila',
      processed: 0,
      total: 1100,
      startedAtLabel: '—'
    }
  ] as MiletoBackfillJob[]
}

export function startMiletoBackfill(jobId: string): boolean {
  const job = miletoBackfillState.jobs.find((item) => item.id === jobId)
  if (!job || job.status === 'running' || job.status === 'done') return false
  job.status = 'running'
  job.statusLabel = 'Em execução'
  job.startedAtLabel = '18/07 11:20'
  job.progress = Math.max(job.progress, 5)
  return true
}
