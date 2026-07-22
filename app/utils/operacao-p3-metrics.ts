/**
 * Métricas das telas P3 (tratativas, ocorrências NG, chatbot, check-in, configs).
 */

import type { Metric } from '../types/domain'
import type { TratativaOrderRow } from '../data/demo/tratativas'
import type { OcorrenciaNgRow } from '../data/demo/ocorrencias-ng'
import type { ChatbotQueueRow, MiletoBackfillJob } from '../data/demo/chatbot-operacional'

export function buildTratativasMetrics(
  rows: TratativaOrderRow[],
  contactsToday: number,
  workedToday: number,
  selectedCount: number
): Metric[] {
  const pending = rows.filter((row) => row.status === 'pendente').length
  const failed = rows.filter((row) => row.status === 'falha').length

  return [
    {
      label: 'Contatos hoje',
      value: contactsToday,
      note: 'canal chatbot',
      icon: 'i-lucide-messages-square',
      tone: 'info'
    },
    {
      label: 'Trabalhados',
      value: workedToday,
      note: 'no dia',
      icon: 'i-lucide-check-check',
      tone: 'success'
    },
    {
      label: 'Pendentes',
      value: pending,
      note: 'na listagem',
      icon: 'i-lucide-clock-3',
      tone: pending > 0 ? 'warning' : undefined
    },
    {
      label: 'Falhas',
      value: failed,
      note: 'no filtro',
      icon: 'i-lucide-triangle-alert',
      tone: failed > 0 ? 'danger' : undefined
    },
    {
      label: 'Selecionados',
      value: selectedCount,
      note: 'para disparo',
      icon: 'i-lucide-list-checks',
      tone: selectedCount > 0 ? 'assigned' : undefined
    },
    {
      label: 'Na listagem',
      value: rows.length,
      note: 'após filtros',
      icon: 'i-lucide-list',
      tone: 'info'
    }
  ]
}

export function buildOcorrenciasNgMetrics(
  rows: OcorrenciaNgRow[],
  completed: number,
  cancelled: number,
  withOccurrence: number,
  divergences: number
): Metric[] {
  const pending = rows.filter((row) => row.align === 'pendente').length

  return [
    {
      label: 'Concluídos',
      value: completed,
      note: 'Mileto / Via',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Cancelados',
      value: cancelled,
      note: 'sincronizados',
      icon: 'i-lucide-ban',
      tone: cancelled > 0 ? 'danger' : undefined
    },
    {
      label: 'Com ocorrência',
      value: withOccurrence,
      note: 'monitorados',
      icon: 'i-lucide-radar',
      tone: 'warning'
    },
    {
      label: 'Divergências',
      value: divergences,
      note: 'pedido × Mileto',
      icon: 'i-lucide-git-compare',
      tone: divergences > 0 ? 'danger' : undefined
    },
    {
      label: 'Pendentes',
      value: pending,
      note: 'na listagem',
      icon: 'i-lucide-hourglass',
      tone: pending > 0 ? 'info' : undefined
    },
    {
      label: 'Na listagem',
      value: rows.length,
      note: 'após filtros',
      icon: 'i-lucide-list',
      tone: 'info'
    }
  ]
}

export function buildChatbotMonitorMetrics(queues: ChatbotQueueRow[]): Metric[] {
  const waiting = queues.reduce((acc, row) => acc + row.waiting, 0)
  const processing = queues.reduce((acc, row) => acc + row.processing, 0)
  const failed = queues.reduce((acc, row) => acc + row.failed, 0)
  const avgLatency = queues.length
    ? Math.round(queues.reduce((acc, row) => acc + row.latencyMs, 0) / queues.length)
    : 0

  return [
    {
      label: 'Aguardando',
      value: waiting,
      note: 'todas as filas',
      icon: 'i-lucide-inbox',
      tone: waiting > 0 ? 'info' : undefined
    },
    {
      label: 'Processando',
      value: processing,
      note: 'agora',
      icon: 'i-lucide-loader-circle',
      tone: 'assigned'
    },
    {
      label: 'Falhas',
      value: failed,
      note: 'nas filas',
      icon: 'i-lucide-octagon-alert',
      tone: failed > 0 ? 'danger' : undefined
    },
    {
      label: 'Latência média',
      value: `${avgLatency} ms`,
      note: 'filas ativas',
      icon: 'i-lucide-gauge',
      tone: 'info'
    },
    {
      label: 'Filas',
      value: queues.length,
      note: 'monitoradas',
      icon: 'i-lucide-layers',
      tone: 'info'
    }
  ]
}

export function buildMiletoBackfillMetrics(jobs: MiletoBackfillJob[]): Metric[] {
  const running = jobs.filter((job) => job.status === 'running').length
  const done = jobs.filter((job) => job.status === 'done').length
  const processed = jobs.reduce((acc, job) => acc + job.processed, 0)
  const total = jobs.reduce((acc, job) => acc + job.total, 0)

  return [
    {
      label: 'Em execução',
      value: running,
      note: 'jobs ativos',
      icon: 'i-lucide-play',
      tone: running > 0 ? 'info' : undefined
    },
    {
      label: 'Concluídos',
      value: done,
      note: 'jobs',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Processados',
      value: processed,
      note: 'registros',
      icon: 'i-lucide-database',
      tone: 'info'
    },
    {
      label: 'Total planejado',
      value: total,
      note: 'no backfill',
      icon: 'i-lucide-hard-drive',
      tone: 'info'
    },
    {
      label: 'Jobs',
      value: jobs.length,
      note: 'na fila',
      icon: 'i-lucide-list',
      tone: 'info'
    }
  ]
}

