/**
 * Agregações de métricas de SLA Analytics — funções puras sobre fixtures.
 */

import type { Metric } from '../types/domain'
import type { SlaDateRow, SlaEntityRow } from '../data/demo/sla-analytics'

function pct(part: number, total: number): string {
  if (total <= 0) return '—'
  return `${Math.round((part / total) * 100)}%`
}

export function buildSlaEntityMetrics(rows: SlaEntityRow[]): Metric[] {
  const attended = rows.reduce((acc, row) => acc + row.attended, 0)
  const expired = rows.reduce((acc, row) => acc + row.expired, 0)
  const completed = rows.reduce((acc, row) => acc + row.completed, 0)
  const withOccurrence = rows.reduce((acc, row) => acc + row.withOccurrence, 0)
  const total = rows.reduce((acc, row) => acc + row.total, 0)

  return [
    {
      label: '% Atendido',
      value: pct(attended, total),
      note: `${attended} no prazo`,
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: '% Expirado',
      value: pct(expired, total),
      note: `${expired} fora do prazo`,
      icon: 'i-lucide-timer-off',
      tone: expired > 0 ? 'danger' : undefined
    },
    {
      label: 'Volume',
      value: total,
      note: 'pedidos no filtro',
      icon: 'i-lucide-package'
    },
    {
      label: 'Concluídos',
      value: completed,
      note: 'finalizados',
      icon: 'i-lucide-flag',
      tone: 'success'
    },
    {
      label: 'Com ocorrência',
      value: withOccurrence,
      note: 'requerem tratativa',
      icon: 'i-lucide-triangle-alert',
      tone: withOccurrence > 0 ? 'warning' : undefined
    },
    {
      label: 'Entidades',
      value: rows.length,
      note: 'no ranking',
      icon: 'i-lucide-rows-3'
    }
  ]
}

export function buildSlaDateMetrics(rows: SlaDateRow[]): Metric[] {
  const attended = rows.reduce((acc, row) => acc + row.attended, 0)
  const expired = rows.reduce((acc, row) => acc + row.expired, 0)
  const total = rows.reduce((acc, row) => acc + row.total, 0)
  const days = new Set(rows.map((row) => row.dateLabel)).size

  return [
    {
      label: '% Atendido',
      value: pct(attended, total),
      note: `${attended} no prazo`,
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: '% Expirado',
      value: pct(expired, total),
      note: `${expired} fora do prazo`,
      icon: 'i-lucide-timer-off',
      tone: expired > 0 ? 'danger' : undefined
    },
    {
      label: 'Volume',
      value: total,
      note: `${days} dias no filtro`,
      icon: 'i-lucide-package'
    }
  ]
}
