/**
 * Métricas de roteirização, rotas e expedição.
 */

import type { Metric } from '../types/domain'
import type { RouteRow, ScriptingOrderRow } from '../data/demo/roteirizacao'
import type { ExpedicaoOrderRow } from '../data/demo/expedicao'
import type { CalendarEvent } from '../data/demo/calendario'

export function buildRoutesListMetrics(rows: RouteRow[]): Metric[] {
  const orders = rows.reduce((acc, row) => acc + row.ordersCount, 0)
  const weight = rows.reduce((acc, row) => acc + row.weightKg, 0)
  const open = rows.filter((row) => row.status === 'Aberta').length
  const mounting = rows.filter((row) => row.status === 'Em montagem').length
  const closed = rows.filter((row) => row.status === 'Fechada').length

  return [
    {
      label: 'Rotas',
      value: rows.length,
      note: 'no filtro',
      icon: 'i-lucide-map-pinned'
    },
    {
      label: 'Pedidos',
      value: orders,
      note: 'associados',
      icon: 'i-lucide-package'
    },
    {
      label: 'Peso (kg)',
      value: weight,
      note: 'soma das rotas',
      icon: 'i-lucide-weight'
    },
    {
      label: 'Abertas',
      value: open,
      note: 'disponíveis',
      icon: 'i-lucide-circle-dashed',
      tone: 'assigned'
    },
    {
      label: 'Em montagem',
      value: mounting,
      note: 'em edição',
      icon: 'i-lucide-hammer',
      tone: 'info'
    },
    {
      label: 'Fechadas',
      value: closed,
      note: 'finalizadas',
      icon: 'i-lucide-lock',
      tone: 'success'
    }
  ]
}

export function buildRoteirizacaoMetrics(
  orders: ScriptingOrderRow[],
  selectedIds: string[],
  openRoutes: number
): Metric[] {
  const selected = orders.filter((order) => selectedIds.includes(order.orderId))
  const weight = selected.reduce((acc, order) => acc + order.weightKg, 0)

  return [
    {
      label: 'Selecionados',
      value: selected.length,
      note: 'para a rota',
      icon: 'i-lucide-check-check',
      tone: selected.length > 0 ? 'assigned' : undefined
    },
    {
      label: 'Peso (kg)',
      value: weight,
      note: 'seleção atual',
      icon: 'i-lucide-weight'
    },
    {
      label: 'Elegíveis',
      value: orders.length,
      note: 'na listagem',
      icon: 'i-lucide-list-filter'
    },
    {
      label: 'Rotas abertas',
      value: openRoutes,
      note: 'já cadastradas',
      icon: 'i-lucide-map-pinned',
      tone: 'info'
    }
  ]
}

export function buildRouteDetailMetrics(
  ordersCount: number,
  weightKg: number,
  status: string
): Metric[] {
  return [
    {
      label: 'Pedidos',
      value: ordersCount,
      note: 'na rota',
      icon: 'i-lucide-package'
    },
    {
      label: 'Peso (kg)',
      value: weightKg,
      note: 'carga estimada',
      icon: 'i-lucide-weight'
    },
    {
      label: 'Status',
      value: status,
      note: 'situação atual',
      icon: 'i-lucide-info'
    }
  ]
}

export function buildExpedicaoMetrics(
  rows: ExpedicaoOrderRow[],
  selectedCount: number,
  printedToday: number
): Metric[] {
  const ready = rows.filter((row) => !row.printed).length
  const printed = rows.filter((row) => row.printed).length

  return [
    {
      label: 'Selecionados',
      value: selectedCount,
      note: 'para impressão',
      icon: 'i-lucide-check-check',
      tone: selectedCount > 0 ? 'assigned' : undefined
    },
    {
      label: 'Impressos hoje',
      value: printedToday,
      note: 'volume do dia',
      icon: 'i-lucide-printer',
      tone: 'success'
    },
    {
      label: 'Prontos',
      value: ready,
      note: 'elegíveis agora',
      icon: 'i-lucide-tag'
    },
    {
      label: 'Já impressos',
      value: printed,
      note: 'no filtro',
      icon: 'i-lucide-file-check'
    },
    {
      label: 'Na listagem',
      value: rows.length,
      note: 'após filtros',
      icon: 'i-lucide-list'
    }
  ]
}

export function buildCalendarioMetrics(
  events: CalendarEvent[],
  selectedDayEvents: number
): Metric[] {
  const accounts = new Set(events.map((event) => event.accountId)).size
  const days = new Set(events.map((event) => event.day)).size

  return [
    {
      label: 'Agendados',
      value: events.length,
      note: 'no mês filtrado',
      icon: 'i-lucide-calendar-check'
    },
    {
      label: 'Contas',
      value: accounts,
      note: 'com agendamento',
      icon: 'i-lucide-building-2'
    },
    {
      label: 'Dias ativos',
      value: days,
      note: 'com pedidos',
      icon: 'i-lucide-calendar-days'
    },
    {
      label: 'No dia',
      value: selectedDayEvents,
      note: 'seleção atual',
      icon: 'i-lucide-calendar-clock',
      tone: selectedDayEvents > 0 ? 'info' : undefined
    }
  ]
}
