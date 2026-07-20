/**
 * Fixtures dos dashboards Indicadores / Loja / Loja TV (exceto Dashboard Reversa).
 */

import type { StatusKey, TrendPoint } from '../../types/domain'
import type { StackedSeriesPoint } from '../../types/dashboard-reversa'

export interface DashboardPaRow extends Record<string, unknown> {
  id: string
  name: string
  city: string
  invited: number
  assigned: number
  stock: number
  route: number
  done: number
  oldestHours: number
  productivity: string
}

export interface DashboardStoreOrderRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  statusLabel: string
  statusKey: StatusKey
  scheduledLabel: string
  waitingMinutes: number
  ticket: string
}

export const dashboardsAccountOptions = [
  { label: 'Todas as contas', value: 'all' },
  { label: 'Casas Bahia · Nacional', value: 'acc-1' },
  { label: 'Renner · Sul', value: 'acc-2' }
]

export const dashboardsPeriodOptions = [
  { label: 'Hoje', value: 'today' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Mês atual', value: 'month' }
]

export const dashboardsPaOptions = [
  { label: 'Todos os pontos de apoio', value: 'all' },
  { label: 'PA Centro · SP', value: 'pa-1' },
  { label: 'PA Zona Sul · RJ', value: 'pa-2' },
  { label: 'PA Contagem · MG', value: 'pa-3' }
]

export const indicadoresPaRows: DashboardPaRow[] = [
  {
    id: 'pa-1',
    name: 'PA Centro · SP',
    city: 'São Paulo',
    invited: 42,
    assigned: 38,
    stock: 24,
    route: 56,
    done: 71,
    oldestHours: 18,
    productivity: '82%'
  },
  {
    id: 'pa-2',
    name: 'PA Zona Sul · RJ',
    city: 'Rio de Janeiro',
    invited: 28,
    assigned: 22,
    stock: 19,
    route: 34,
    done: 41,
    oldestHours: 26,
    productivity: '74%'
  },
  {
    id: 'pa-3',
    name: 'PA Contagem · MG',
    city: 'Contagem',
    invited: 19,
    assigned: 17,
    stock: 12,
    route: 28,
    done: 36,
    oldestHours: 14,
    productivity: '79%'
  },
  {
    id: 'pa-4',
    name: 'PA Curitiba · PR',
    city: 'Curitiba',
    invited: 15,
    assigned: 14,
    stock: 9,
    route: 21,
    done: 29,
    oldestHours: 11,
    productivity: '81%'
  },
  {
    id: 'pa-5',
    name: 'PA Porto Alegre · RS',
    city: 'Porto Alegre',
    invited: 12,
    assigned: 11,
    stock: 8,
    route: 16,
    done: 22,
    oldestHours: 9,
    productivity: '77%'
  },
  {
    id: 'pa-6',
    name: 'PA Salvador · BA',
    city: 'Salvador',
    invited: 21,
    assigned: 16,
    stock: 14,
    route: 18,
    done: 19,
    oldestHours: 31,
    productivity: '68%'
  }
]

export const indicadoresProductivityTrend: TrendPoint[] = [
  { label: '12/07', value: 72 },
  { label: '13/07', value: 74 },
  { label: '14/07', value: 71 },
  { label: '15/07', value: 78 },
  { label: '16/07', value: 76 },
  { label: '17/07', value: 80 },
  { label: '18/07', value: 79 }
]

export const indicadoresStackedSeries: StackedSeriesPoint[] = [
  { label: 'Centro SP', vol: 71, invol: 18 },
  { label: 'Zona Sul RJ', vol: 41, invol: 16 },
  { label: 'Contagem', vol: 36, invol: 12 },
  { label: 'Curitiba', vol: 29, invol: 9 },
  { label: 'Porto Alegre', vol: 22, invol: 8 },
  { label: 'Salvador', vol: 19, invol: 14 }
]

export const lojaQueueRows: DashboardStoreOrderRow[] = [
  {
    id: 'lq-1',
    orderId: '48224',
    client: 'Ana Souza',
    statusLabel: 'Aguardando check-in',
    statusKey: 'assigned',
    scheduledLabel: '09:30',
    waitingMinutes: 12,
    ticket: 'A-12'
  },
  {
    id: 'lq-2',
    orderId: '48231',
    client: 'Bruno Lima',
    statusLabel: 'Em atendimento',
    statusKey: 'route',
    scheduledLabel: '09:45',
    waitingMinutes: 4,
    ticket: 'A-13'
  },
  {
    id: 'lq-3',
    orderId: '48240',
    client: 'Carla Mendes',
    statusLabel: 'Aguardando check-in',
    statusKey: 'assigned',
    scheduledLabel: '10:00',
    waitingMinutes: 0,
    ticket: 'A-14'
  },
  {
    id: 'lq-4',
    orderId: '48251',
    client: 'Diego Alves',
    statusLabel: 'Concluído',
    statusKey: 'done',
    scheduledLabel: '08:50',
    waitingMinutes: 0,
    ticket: 'A-09'
  },
  {
    id: 'lq-5',
    orderId: '48258',
    client: 'Elena Rocha',
    statusLabel: 'Ocorrência',
    statusKey: 'occurrence',
    scheduledLabel: '09:10',
    waitingMinutes: 38,
    ticket: 'A-10'
  },
  {
    id: 'lq-6',
    orderId: '48266',
    client: 'Fábio Nunes',
    statusLabel: 'Aguardando check-in',
    statusKey: 'assigned',
    scheduledLabel: '10:15',
    waitingMinutes: 0,
    ticket: 'A-15'
  },
  {
    id: 'lq-7',
    orderId: '48272',
    client: 'Gisele Prado',
    statusLabel: 'Em estoque',
    statusKey: 'stock',
    scheduledLabel: '10:30',
    waitingMinutes: 0,
    ticket: 'A-16'
  },
  {
    id: 'lq-8',
    orderId: '48280',
    client: 'Hugo Martins',
    statusLabel: 'Aguardando check-in',
    statusKey: 'assigned',
    scheduledLabel: '10:45',
    waitingMinutes: 0,
    ticket: 'A-17'
  }
]

export const lojaVolumeTrend: TrendPoint[] = [
  { label: '08h', value: 4 },
  { label: '09h', value: 11 },
  { label: '10h', value: 9 },
  { label: '11h', value: 7 },
  { label: '12h', value: 5 },
  { label: '13h', value: 8 },
  { label: '14h', value: 6 }
]

export function buildLojaStatusDistribution(
  rows: DashboardStoreOrderRow[]
): Array<{ status: StatusKey; value: number; label?: string }> {
  const counts: Partial<Record<StatusKey, number>> = {}
  for (const row of rows) {
    counts[row.statusKey] = (counts[row.statusKey] ?? 0) + 1
  }
  return (Object.entries(counts) as Array<[StatusKey, number]>).map(([status, value]) => ({
    status,
    value
  }))
}
