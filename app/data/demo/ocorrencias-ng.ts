/**
 * Fixtures de Ocorrências NG (Mileto monitor).
 */

import type { StatusKey, TrendPoint } from '../../types/domain'

export type MiletoAlign = 'ok' | 'divergente' | 'pendente'

export interface OcorrenciaNgRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  viaStatus: string
  miletoStatus: string
  align: MiletoAlign
  alignLabel: string
  updatedAtLabel: string
  canResend: boolean
}

export const ocorrenciasNgFilterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Alinhados', value: 'ok' },
  { label: 'Divergentes', value: 'divergente' },
  { label: 'Pendentes', value: 'pendente' }
]

export const ocorrenciasNgState = {
  completed: 186,
  cancelled: 22,
  withOccurrence: 41,
  divergences: 17,
  rows: [
    {
      id: 'ng-1',
      orderId: '50101',
      client: 'Ana Souza',
      viaStatus: 'Concluído',
      miletoStatus: 'DELIVERED',
      align: 'ok' as const,
      alignLabel: 'Alinhado',
      updatedAtLabel: '18/07 08:10',
      canResend: false
    },
    {
      id: 'ng-2',
      orderId: '50102',
      client: 'Bruno Lima',
      viaStatus: 'Em rota',
      miletoStatus: 'IN_TRANSIT',
      align: 'ok' as const,
      alignLabel: 'Alinhado',
      updatedAtLabel: '18/07 08:22',
      canResend: false
    },
    {
      id: 'ng-3',
      orderId: '50103',
      client: 'Carla Mendes',
      viaStatus: 'Ocorrência',
      miletoStatus: 'DELIVERED',
      align: 'divergente' as const,
      alignLabel: 'Divergente',
      updatedAtLabel: '18/07 07:40',
      canResend: true
    },
    {
      id: 'ng-4',
      orderId: '50104',
      client: 'Diego Alves',
      viaStatus: 'Cancelado',
      miletoStatus: 'CANCELLED',
      align: 'ok' as const,
      alignLabel: 'Alinhado',
      updatedAtLabel: '17/07 19:05',
      canResend: false
    },
    {
      id: 'ng-5',
      orderId: '50105',
      client: 'Elena Rocha',
      viaStatus: 'Atribuído',
      miletoStatus: 'PENDING',
      align: 'pendente' as const,
      alignLabel: 'Pendente',
      updatedAtLabel: '18/07 09:01',
      canResend: true
    },
    {
      id: 'ng-6',
      orderId: '50106',
      client: 'Fábio Nunes',
      viaStatus: 'Concluído',
      miletoStatus: 'EXCEPTION',
      align: 'divergente' as const,
      alignLabel: 'Divergente',
      updatedAtLabel: '18/07 09:18',
      canResend: true
    },
    {
      id: 'ng-7',
      orderId: '50107',
      client: 'Gisele Prado',
      viaStatus: 'Em estoque',
      miletoStatus: 'WAREHOUSE',
      align: 'ok' as const,
      alignLabel: 'Alinhado',
      updatedAtLabel: '18/07 09:30',
      canResend: false
    },
    {
      id: 'ng-8',
      orderId: '50108',
      client: 'Hugo Martins',
      viaStatus: 'Ocorrência',
      miletoStatus: 'OCCURRENCE',
      align: 'ok' as const,
      alignLabel: 'Alinhado',
      updatedAtLabel: '18/07 10:02',
      canResend: false
    },
    {
      id: 'ng-9',
      orderId: '50109',
      client: 'Iris Castro',
      viaStatus: 'Em rota',
      miletoStatus: 'PENDING',
      align: 'pendente' as const,
      alignLabel: 'Pendente',
      updatedAtLabel: '18/07 10:15',
      canResend: true
    },
    {
      id: 'ng-10',
      orderId: '50110',
      client: 'João Pedro',
      viaStatus: 'Concluído',
      miletoStatus: 'IN_TRANSIT',
      align: 'divergente' as const,
      alignLabel: 'Divergente',
      updatedAtLabel: '18/07 10:40',
      canResend: true
    }
  ] as OcorrenciaNgRow[]
}

export const ocorrenciasNgTrend: TrendPoint[] = [
  { label: '12/07', value: 8 },
  { label: '13/07', value: 11 },
  { label: '14/07', value: 6 },
  { label: '15/07', value: 14 },
  { label: '16/07', value: 9 },
  { label: '17/07', value: 12 },
  { label: '18/07', value: 17 }
]

export function buildOcorrenciasNgDistribution(
  rows: OcorrenciaNgRow[]
): Array<{ status: StatusKey; value: number; label?: string }> {
  const counts: Record<MiletoAlign, number> = { ok: 0, divergente: 0, pendente: 0 }
  for (const row of rows) counts[row.align] += 1
  return [
    { status: 'done', value: counts.ok, label: 'Alinhados' },
    { status: 'occurrence', value: counts.divergente, label: 'Divergentes' },
    { status: 'assigned', value: counts.pendente, label: 'Pendentes' }
  ]
}

export function resendMiletoOccurrence(orderId: string): boolean {
  const row = ocorrenciasNgState.rows.find((item) => item.orderId === orderId)
  if (!row || !row.canResend) return false
  row.align = 'pendente'
  row.alignLabel = 'Pendente'
  row.miletoStatus = 'RESEND_QUEUED'
  row.updatedAtLabel = '18/07 11:10'
  row.canResend = false
  ocorrenciasNgState.divergences = ocorrenciasNgState.rows.filter(
    (item) => item.align === 'divergente'
  ).length
  return true
}
