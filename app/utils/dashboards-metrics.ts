/**
 * Métricas dos dashboards Indicadores / Loja / Loja TV.
 */

import type { Metric } from '../types/domain'
import type { DashboardPaRow, DashboardStoreOrderRow } from '../data/demo/dashboards'

export function buildIndicadoresMetrics(rows: DashboardPaRow[]): Metric[] {
  const invited = rows.reduce((acc, row) => acc + row.invited, 0)
  const assigned = rows.reduce((acc, row) => acc + row.assigned, 0)
  const stock = rows.reduce((acc, row) => acc + row.stock, 0)
  const route = rows.reduce((acc, row) => acc + row.route, 0)
  const done = rows.reduce((acc, row) => acc + row.done, 0)
  const oldest = rows.reduce((acc, row) => Math.max(acc, row.oldestHours), 0)
  const total = invited + assigned + stock + route + done
  const productivity =
    total > 0 ? `${Math.round((done / Math.max(total, 1)) * 100)}%` : '—'

  return [
    {
      label: 'Convidados / atribuídos',
      value: `${invited} / ${assigned}`,
      note: 'fila de convite',
      icon: 'i-lucide-user-plus',
      tone: 'assigned'
    },
    {
      label: 'Em estoque',
      value: stock,
      note: 'aguardando saída',
      icon: 'i-lucide-warehouse'
    },
    {
      label: 'Em rota',
      value: route,
      note: 'em campo',
      icon: 'i-lucide-truck',
      tone: 'info'
    },
    {
      label: 'Concluídos',
      value: done,
      note: 'no período',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Produtividade',
      value: productivity,
      note: 'concluídos / total',
      icon: 'i-lucide-gauge'
    },
    {
      label: 'Mais antigo',
      value: `${oldest}h`,
      note: 'maior idade na fila',
      icon: 'i-lucide-hourglass',
      tone: oldest > 24 ? 'warning' : undefined
    }
  ]
}

export function buildLojaMetrics(rows: DashboardStoreOrderRow[]): Metric[] {
  const waiting = rows.filter((row) => row.statusKey === 'assigned').length
  const inService = rows.filter((row) => row.statusKey === 'route').length
  const done = rows.filter((row) => row.statusKey === 'done').length
  const occurrences = rows.filter((row) => row.statusKey === 'occurrence').length
  const avgWait =
    waiting > 0
      ? Math.round(
          rows
            .filter((row) => row.statusKey === 'assigned')
            .reduce((acc, row) => acc + row.waitingMinutes, 0) / waiting
        )
      : 0

  return [
    {
      label: 'Na fila',
      value: waiting,
      note: 'aguardando check-in',
      icon: 'i-lucide-list-ordered',
      tone: waiting > 0 ? 'assigned' : undefined
    },
    {
      label: 'Em atendimento',
      value: inService,
      note: 'agora',
      icon: 'i-lucide-store',
      tone: 'info'
    },
    {
      label: 'Concluídos',
      value: done,
      note: 'hoje',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Ocorrências',
      value: occurrences,
      note: 'abertas',
      icon: 'i-lucide-triangle-alert',
      tone: occurrences > 0 ? 'danger' : undefined
    },
    {
      label: 'Espera média',
      value: `${avgWait} min`,
      note: 'na fila atual',
      icon: 'i-lucide-timer'
    },
    {
      label: 'Tickets',
      value: rows.length,
      note: 'visíveis no painel',
      icon: 'i-lucide-ticket'
    }
  ]
}
