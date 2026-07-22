/**
 * Fixtures de SLA Analytics (relatórios) — distinto do cadastro `/cadastros/sla`.
 */

import type { TrendPoint } from '../../types/domain'
import type { StackedSeriesPoint } from '../../types/dashboard-reversa'

export type SlaDimension = 'customer' | 'state' | 'support_point' | 'transporter'
export type SlaMode = 'by-date' | 'by-entity'

export type SlaReportVariant =
  | 'cliente-por-data'
  | 'estado-por-data'
  | 'pa-por-data'
  | 'transportador-por-data'
  | 'por-cliente'
  | 'por-estado'
  | 'por-pa'
  | 'por-transportador'

export interface SlaEntityRow extends Record<string, unknown> {
  id: string
  entityLabel: string
  entitySecondary?: string
  attended: number
  expired: number
  completed: number
  withOccurrence: number
  total: number
  attendedPct: string
  expiredPct: string
}

export interface SlaDateRow extends Record<string, unknown> {
  id: string
  dateLabel: string
  entityLabel: string
  attended: number
  expired: number
  total: number
  attendedPct: string
  expiredPct: string
}

export const slaAccountOptions = [
  { label: 'Todas as contas', value: 'all' },
  { label: 'Casas Bahia · Nacional', value: 'acc-1' },
  { label: 'Renner · Sul', value: 'acc-2' },
  { label: 'Amazon BR · Reversa', value: 'acc-3' }
]

export const slaPeriodOptions = [
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Mês atual', value: 'month' }
]

export const slaOperationOptions = [
  { label: 'Todas as operações', value: 'all' },
  { label: 'Logística Reversa', value: 'logistica-reversa' },
  { label: 'Coleta agendada', value: 'coleta-agendada' }
]

export const slaVariantMeta: Record<
  SlaReportVariant,
  { title: string; mode: SlaMode; dimension: SlaDimension; entityColumn: string }
> = {
  'cliente-por-data': {
    title: 'SLA por Cliente (Data)',
    mode: 'by-date',
    dimension: 'customer',
    entityColumn: 'Cliente'
  },
  'estado-por-data': {
    title: 'SLA por Estado (Data)',
    mode: 'by-date',
    dimension: 'state',
    entityColumn: 'Estado'
  },
  'pa-por-data': {
    title: 'SLA por PA (Data)',
    mode: 'by-date',
    dimension: 'support_point',
    entityColumn: 'Ponto de apoio'
  },
  'transportador-por-data': {
    title: 'SLA por Transportador (Data)',
    mode: 'by-date',
    dimension: 'transporter',
    entityColumn: 'Transportador'
  },
  'por-cliente': {
    title: 'SLA por Cliente',
    mode: 'by-entity',
    dimension: 'customer',
    entityColumn: 'Cliente'
  },
  'por-estado': {
    title: 'SLA por Estado',
    mode: 'by-entity',
    dimension: 'state',
    entityColumn: 'Estado'
  },
  'por-pa': {
    title: 'SLA por PA',
    mode: 'by-entity',
    dimension: 'support_point',
    entityColumn: 'Ponto de apoio'
  },
  'por-transportador': {
    title: 'SLA por Transportador',
    mode: 'by-entity',
    dimension: 'transporter',
    entityColumn: 'Transportador'
  }
}

export const slaPercentTrend: TrendPoint[] = [
  { label: '12/07', value: 78 },
  { label: '13/07', value: 81 },
  { label: '14/07', value: 76 },
  { label: '15/07', value: 84 },
  { label: '16/07', value: 82 },
  { label: '17/07', value: 87 },
  { label: '18/07', value: 85 }
]

const customerEntities: SlaEntityRow[] = [
  {
    id: 'sla-c-1',
    entityLabel: 'Casas Bahia · Nacional',
    entitySecondary: 'acc-1',
    attended: 412,
    expired: 68,
    completed: 390,
    withOccurrence: 42,
    total: 480,
    attendedPct: '86%',
    expiredPct: '14%'
  },
  {
    id: 'sla-c-2',
    entityLabel: 'Renner · Sul',
    entitySecondary: 'acc-2',
    attended: 198,
    expired: 42,
    completed: 186,
    withOccurrence: 21,
    total: 240,
    attendedPct: '83%',
    expiredPct: '17%'
  },
  {
    id: 'sla-c-3',
    entityLabel: 'Amazon BR · Reversa',
    entitySecondary: 'acc-3',
    attended: 156,
    expired: 24,
    completed: 149,
    withOccurrence: 12,
    total: 180,
    attendedPct: '87%',
    expiredPct: '13%'
  },
  {
    id: 'sla-c-4',
    entityLabel: 'Magazine Luiza · Sudeste',
    entitySecondary: 'acc-4',
    attended: 94,
    expired: 31,
    completed: 88,
    withOccurrence: 18,
    total: 125,
    attendedPct: '75%',
    expiredPct: '25%'
  },
  {
    id: 'sla-c-5',
    entityLabel: 'Via Varejo · Express',
    entitySecondary: 'acc-5',
    attended: 71,
    expired: 19,
    completed: 66,
    withOccurrence: 9,
    total: 90,
    attendedPct: '79%',
    expiredPct: '21%'
  },
  {
    id: 'sla-c-6',
    entityLabel: 'Carrefour · Nacional',
    entitySecondary: 'acc-6',
    attended: 58,
    expired: 12,
    completed: 54,
    withOccurrence: 7,
    total: 70,
    attendedPct: '83%',
    expiredPct: '17%'
  }
]

const stateEntities: SlaEntityRow[] = [
  {
    id: 'sla-s-1',
    entityLabel: 'SP',
    entitySecondary: 'São Paulo',
    attended: 520,
    expired: 78,
    completed: 498,
    withOccurrence: 55,
    total: 598,
    attendedPct: '87%',
    expiredPct: '13%'
  },
  {
    id: 'sla-s-2',
    entityLabel: 'RJ',
    entitySecondary: 'Rio de Janeiro',
    attended: 210,
    expired: 48,
    completed: 198,
    withOccurrence: 28,
    total: 258,
    attendedPct: '81%',
    expiredPct: '19%'
  },
  {
    id: 'sla-s-3',
    entityLabel: 'MG',
    entitySecondary: 'Minas Gerais',
    attended: 168,
    expired: 32,
    completed: 159,
    withOccurrence: 19,
    total: 200,
    attendedPct: '84%',
    expiredPct: '16%'
  },
  {
    id: 'sla-s-4',
    entityLabel: 'PR',
    entitySecondary: 'Paraná',
    attended: 122,
    expired: 28,
    completed: 114,
    withOccurrence: 15,
    total: 150,
    attendedPct: '81%',
    expiredPct: '19%'
  },
  {
    id: 'sla-s-5',
    entityLabel: 'RS',
    entitySecondary: 'Rio Grande do Sul',
    attended: 98,
    expired: 22,
    completed: 91,
    withOccurrence: 11,
    total: 120,
    attendedPct: '82%',
    expiredPct: '18%'
  },
  {
    id: 'sla-s-6',
    entityLabel: 'BA',
    entitySecondary: 'Bahia',
    attended: 64,
    expired: 26,
    completed: 58,
    withOccurrence: 14,
    total: 90,
    attendedPct: '71%',
    expiredPct: '29%'
  }
]

const paEntities: SlaEntityRow[] = [
  {
    id: 'sla-p-1',
    entityLabel: 'PA Centro · SP',
    entitySecondary: 'São Paulo',
    attended: 186,
    expired: 24,
    completed: 178,
    withOccurrence: 16,
    total: 210,
    attendedPct: '89%',
    expiredPct: '11%'
  },
  {
    id: 'sla-p-2',
    entityLabel: 'PA Zona Sul · RJ',
    entitySecondary: 'Rio de Janeiro',
    attended: 142,
    expired: 38,
    completed: 132,
    withOccurrence: 22,
    total: 180,
    attendedPct: '79%',
    expiredPct: '21%'
  },
  {
    id: 'sla-p-3',
    entityLabel: 'PA Contagem · MG',
    entitySecondary: 'Minas Gerais',
    attended: 118,
    expired: 22,
    completed: 112,
    withOccurrence: 12,
    total: 140,
    attendedPct: '84%',
    expiredPct: '16%'
  },
  {
    id: 'sla-p-4',
    entityLabel: 'PA Curitiba · PR',
    entitySecondary: 'Paraná',
    attended: 96,
    expired: 24,
    completed: 90,
    withOccurrence: 10,
    total: 120,
    attendedPct: '80%',
    expiredPct: '20%'
  },
  {
    id: 'sla-p-5',
    entityLabel: 'PA Porto Alegre · RS',
    entitySecondary: 'Rio Grande do Sul',
    attended: 78,
    expired: 17,
    completed: 74,
    withOccurrence: 8,
    total: 95,
    attendedPct: '82%',
    expiredPct: '18%'
  },
  {
    id: 'sla-p-6',
    entityLabel: 'PA Salvador · BA',
    entitySecondary: 'Bahia',
    attended: 52,
    expired: 23,
    completed: 47,
    withOccurrence: 13,
    total: 75,
    attendedPct: '69%',
    expiredPct: '31%'
  }
]

const transporterEntities: SlaEntityRow[] = [
  {
    id: 'sla-t-1',
    entityLabel: 'Loggi Express',
    entitySecondary: 'tr-01',
    attended: 168,
    expired: 28,
    completed: 159,
    withOccurrence: 14,
    total: 196,
    attendedPct: '86%',
    expiredPct: '14%'
  },
  {
    id: 'sla-t-2',
    entityLabel: 'Total Express',
    entitySecondary: 'tr-02',
    attended: 124,
    expired: 36,
    completed: 116,
    withOccurrence: 19,
    total: 160,
    attendedPct: '78%',
    expiredPct: '22%'
  },
  {
    id: 'sla-t-3',
    entityLabel: 'Jadlog Urbano',
    entitySecondary: 'tr-03',
    attended: 98,
    expired: 22,
    completed: 92,
    withOccurrence: 11,
    total: 120,
    attendedPct: '82%',
    expiredPct: '18%'
  },
  {
    id: 'sla-t-4',
    entityLabel: 'Motoboy Rede SP',
    entitySecondary: 'tr-04',
    attended: 72,
    expired: 18,
    completed: 68,
    withOccurrence: 8,
    total: 90,
    attendedPct: '80%',
    expiredPct: '20%'
  },
  {
    id: 'sla-t-5',
    entityLabel: 'Correios PAC Reversa',
    entitySecondary: 'tr-05',
    attended: 54,
    expired: 26,
    completed: 49,
    withOccurrence: 12,
    total: 80,
    attendedPct: '68%',
    expiredPct: '32%'
  },
  {
    id: 'sla-t-6',
    entityLabel: 'Flash Courier',
    entitySecondary: 'tr-06',
    attended: 41,
    expired: 9,
    completed: 38,
    withOccurrence: 5,
    total: 50,
    attendedPct: '82%',
    expiredPct: '18%'
  }
]

const dateBucketsByDimension: Record<SlaDimension, SlaDateRow[]> = {
  customer: [
    {
      id: 'd-c-1',
      dateLabel: '18/07',
      entityLabel: 'Casas Bahia · Nacional',
      attended: 62,
      expired: 9,
      total: 71,
      attendedPct: '87%',
      expiredPct: '13%'
    },
    {
      id: 'd-c-2',
      dateLabel: '18/07',
      entityLabel: 'Renner · Sul',
      attended: 28,
      expired: 6,
      total: 34,
      attendedPct: '82%',
      expiredPct: '18%'
    },
    {
      id: 'd-c-3',
      dateLabel: '17/07',
      entityLabel: 'Casas Bahia · Nacional',
      attended: 58,
      expired: 11,
      total: 69,
      attendedPct: '84%',
      expiredPct: '16%'
    },
    {
      id: 'd-c-4',
      dateLabel: '17/07',
      entityLabel: 'Amazon BR · Reversa',
      attended: 24,
      expired: 3,
      total: 27,
      attendedPct: '89%',
      expiredPct: '11%'
    },
    {
      id: 'd-c-5',
      dateLabel: '16/07',
      entityLabel: 'Magazine Luiza · Sudeste',
      attended: 18,
      expired: 7,
      total: 25,
      attendedPct: '72%',
      expiredPct: '28%'
    },
    {
      id: 'd-c-6',
      dateLabel: '16/07',
      entityLabel: 'Casas Bahia · Nacional',
      attended: 54,
      expired: 8,
      total: 62,
      attendedPct: '87%',
      expiredPct: '13%'
    },
    {
      id: 'd-c-7',
      dateLabel: '15/07',
      entityLabel: 'Renner · Sul',
      attended: 31,
      expired: 5,
      total: 36,
      attendedPct: '86%',
      expiredPct: '14%'
    },
    {
      id: 'd-c-8',
      dateLabel: '14/07',
      entityLabel: 'Via Varejo · Express',
      attended: 14,
      expired: 4,
      total: 18,
      attendedPct: '78%',
      expiredPct: '22%'
    }
  ],
  state: [
    {
      id: 'd-s-1',
      dateLabel: '18/07',
      entityLabel: 'SP',
      attended: 88,
      expired: 12,
      total: 100,
      attendedPct: '88%',
      expiredPct: '12%'
    },
    {
      id: 'd-s-2',
      dateLabel: '18/07',
      entityLabel: 'RJ',
      attended: 34,
      expired: 8,
      total: 42,
      attendedPct: '81%',
      expiredPct: '19%'
    },
    {
      id: 'd-s-3',
      dateLabel: '17/07',
      entityLabel: 'SP',
      attended: 76,
      expired: 14,
      total: 90,
      attendedPct: '84%',
      expiredPct: '16%'
    },
    {
      id: 'd-s-4',
      dateLabel: '17/07',
      entityLabel: 'MG',
      attended: 28,
      expired: 5,
      total: 33,
      attendedPct: '85%',
      expiredPct: '15%'
    },
    {
      id: 'd-s-5',
      dateLabel: '16/07',
      entityLabel: 'PR',
      attended: 22,
      expired: 6,
      total: 28,
      attendedPct: '79%',
      expiredPct: '21%'
    },
    {
      id: 'd-s-6',
      dateLabel: '16/07',
      entityLabel: 'BA',
      attended: 11,
      expired: 7,
      total: 18,
      attendedPct: '61%',
      expiredPct: '39%'
    },
    {
      id: 'd-s-7',
      dateLabel: '15/07',
      entityLabel: 'RS',
      attended: 19,
      expired: 4,
      total: 23,
      attendedPct: '83%',
      expiredPct: '17%'
    },
    {
      id: 'd-s-8',
      dateLabel: '14/07',
      entityLabel: 'RJ',
      attended: 30,
      expired: 9,
      total: 39,
      attendedPct: '77%',
      expiredPct: '23%'
    }
  ],
  support_point: [
    {
      id: 'd-p-1',
      dateLabel: '18/07',
      entityLabel: 'PA Centro · SP',
      attended: 32,
      expired: 4,
      total: 36,
      attendedPct: '89%',
      expiredPct: '11%'
    },
    {
      id: 'd-p-2',
      dateLabel: '18/07',
      entityLabel: 'PA Zona Sul · RJ',
      attended: 24,
      expired: 8,
      total: 32,
      attendedPct: '75%',
      expiredPct: '25%'
    },
    {
      id: 'd-p-3',
      dateLabel: '17/07',
      entityLabel: 'PA Contagem · MG',
      attended: 21,
      expired: 3,
      total: 24,
      attendedPct: '88%',
      expiredPct: '12%'
    },
    {
      id: 'd-p-4',
      dateLabel: '17/07',
      entityLabel: 'PA Centro · SP',
      attended: 28,
      expired: 5,
      total: 33,
      attendedPct: '85%',
      expiredPct: '15%'
    },
    {
      id: 'd-p-5',
      dateLabel: '16/07',
      entityLabel: 'PA Curitiba · PR',
      attended: 16,
      expired: 5,
      total: 21,
      attendedPct: '76%',
      expiredPct: '24%'
    },
    {
      id: 'd-p-6',
      dateLabel: '16/07',
      entityLabel: 'PA Salvador · BA',
      attended: 9,
      expired: 6,
      total: 15,
      attendedPct: '60%',
      expiredPct: '40%'
    },
    {
      id: 'd-p-7',
      dateLabel: '15/07',
      entityLabel: 'PA Porto Alegre · RS',
      attended: 14,
      expired: 3,
      total: 17,
      attendedPct: '82%',
      expiredPct: '18%'
    },
    {
      id: 'd-p-8',
      dateLabel: '14/07',
      entityLabel: 'PA Zona Sul · RJ',
      attended: 20,
      expired: 7,
      total: 27,
      attendedPct: '74%',
      expiredPct: '26%'
    }
  ],
  transporter: [
    {
      id: 'd-t-1',
      dateLabel: '18/07',
      entityLabel: 'Loggi Express',
      attended: 28,
      expired: 4,
      total: 32,
      attendedPct: '88%',
      expiredPct: '12%'
    },
    {
      id: 'd-t-2',
      dateLabel: '18/07',
      entityLabel: 'Total Express',
      attended: 18,
      expired: 7,
      total: 25,
      attendedPct: '72%',
      expiredPct: '28%'
    },
    {
      id: 'd-t-3',
      dateLabel: '17/07',
      entityLabel: 'Jadlog Urbano',
      attended: 16,
      expired: 3,
      total: 19,
      attendedPct: '84%',
      expiredPct: '16%'
    },
    {
      id: 'd-t-4',
      dateLabel: '17/07',
      entityLabel: 'Loggi Express',
      attended: 24,
      expired: 5,
      total: 29,
      attendedPct: '83%',
      expiredPct: '17%'
    },
    {
      id: 'd-t-5',
      dateLabel: '16/07',
      entityLabel: 'Motoboy Rede SP',
      attended: 12,
      expired: 4,
      total: 16,
      attendedPct: '75%',
      expiredPct: '25%'
    },
    {
      id: 'd-t-6',
      dateLabel: '16/07',
      entityLabel: 'Correios PAC Reversa',
      attended: 8,
      expired: 6,
      total: 14,
      attendedPct: '57%',
      expiredPct: '43%'
    },
    {
      id: 'd-t-7',
      dateLabel: '15/07',
      entityLabel: 'Flash Courier',
      attended: 9,
      expired: 2,
      total: 11,
      attendedPct: '82%',
      expiredPct: '18%'
    },
    {
      id: 'd-t-8',
      dateLabel: '14/07',
      entityLabel: 'Total Express',
      attended: 15,
      expired: 5,
      total: 20,
      attendedPct: '75%',
      expiredPct: '25%'
    }
  ]
}

export function entitiesForDimension(dimension: SlaDimension): SlaEntityRow[] {
  if (dimension === 'customer') return customerEntities
  if (dimension === 'state') return stateEntities
  if (dimension === 'transporter') return transporterEntities
  return paEntities
}

export function dateRowsForDimension(dimension: SlaDimension): SlaDateRow[] {
  return dateBucketsByDimension[dimension]
}

export function buildSlaStackedSeries(rows: SlaEntityRow[]): StackedSeriesPoint[] {
  return rows.slice(0, 6).map((row) => ({
    label: row.entityLabel.length > 18 ? `${row.entityLabel.slice(0, 16)}…` : row.entityLabel,
    vol: row.attended,
    invol: row.expired
  }))
}

export function isSlaReportVariant(value: string): value is SlaReportVariant {
  return value in slaVariantMeta
}

export type SlaConsolidatedTabId = 'ranking' | 'by-date'

export interface SlaConsolidatedTab {
  id: SlaConsolidatedTabId
  label: string
}

/**
 * Abas da página consolidada `/dashboards/sla` — substitui a divisão em
 * 8 arquivos (4 dimensões × 2 modos) por 1 filtro de dimensão + 2 abas.
 */
export const slaConsolidatedTabs: SlaConsolidatedTab[] = [
  { id: 'ranking', label: 'Ranking por entidade' },
  { id: 'by-date', label: 'Evolução por data' }
]

export interface SlaDimensionOption {
  value: SlaDimension
  label: string
  entityVariant: SlaReportVariant
  dateVariant: SlaReportVariant
}

/** Filtro de dimensão único da página consolidada. */
export const slaConsolidatedDimensions: SlaDimensionOption[] = [
  { value: 'customer', label: 'Cliente', entityVariant: 'por-cliente', dateVariant: 'cliente-por-data' },
  { value: 'state', label: 'Estado', entityVariant: 'por-estado', dateVariant: 'estado-por-data' },
  { value: 'support_point', label: 'Ponto de apoio', entityVariant: 'por-pa', dateVariant: 'pa-por-data' },
  { value: 'transporter', label: 'Transportador', entityVariant: 'por-transportador', dateVariant: 'transportador-por-data' }
]
