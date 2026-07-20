/**
 * Fixtures de Tratativas (orders_totals_chatbot).
 */

import type { StatusKey, TrendPoint } from '../../types/domain'

export type TratativaStatus = 'pendente' | 'trabalhado' | 'disparado' | 'falha'

export interface TratativaOrderRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  accountName: string
  channel: string
  status: TratativaStatus
  statusLabel: string
  lastContactLabel: string
  attempts: number
}

export const tratativaStatusOptions = [
  { label: 'Todos os status', value: 'all' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Trabalhado', value: 'trabalhado' },
  { label: 'Disparado', value: 'disparado' },
  { label: 'Falha', value: 'falha' }
]

export const tratativasState = {
  contactsToday: 128,
  workedToday: 74,
  pending: 42,
  failed: 9,
  orders: [
    {
      id: 'tr-1',
      orderId: '49101',
      client: 'Ana Souza',
      accountName: 'Casas Bahia · Nacional',
      channel: 'WhatsApp',
      status: 'pendente' as const,
      statusLabel: 'Pendente',
      lastContactLabel: '—',
      attempts: 0
    },
    {
      id: 'tr-2',
      orderId: '49102',
      client: 'Bruno Lima',
      accountName: 'Casas Bahia · Nacional',
      channel: 'WhatsApp',
      status: 'trabalhado' as const,
      statusLabel: 'Trabalhado',
      lastContactLabel: '18/07 08:40',
      attempts: 1
    },
    {
      id: 'tr-3',
      orderId: '49103',
      client: 'Carla Mendes',
      accountName: 'Renner · Sul',
      channel: 'SMS',
      status: 'disparado' as const,
      statusLabel: 'Disparado',
      lastContactLabel: '18/07 09:12',
      attempts: 1
    },
    {
      id: 'tr-4',
      orderId: '49104',
      client: 'Diego Alves',
      accountName: 'Amazon BR · Reversa',
      channel: 'WhatsApp',
      status: 'falha' as const,
      statusLabel: 'Falha',
      lastContactLabel: '18/07 07:55',
      attempts: 2
    },
    {
      id: 'tr-5',
      orderId: '49105',
      client: 'Elena Rocha',
      accountName: 'Casas Bahia · Nacional',
      channel: 'WhatsApp',
      status: 'pendente' as const,
      statusLabel: 'Pendente',
      lastContactLabel: '—',
      attempts: 0
    },
    {
      id: 'tr-6',
      orderId: '49106',
      client: 'Fábio Nunes',
      accountName: 'Renner · Sul',
      channel: 'WhatsApp',
      status: 'trabalhado' as const,
      statusLabel: 'Trabalhado',
      lastContactLabel: '17/07 16:20',
      attempts: 1
    },
    {
      id: 'tr-7',
      orderId: '49107',
      client: 'Gisele Prado',
      accountName: 'Amazon BR · Reversa',
      channel: 'WhatsApp',
      status: 'pendente' as const,
      statusLabel: 'Pendente',
      lastContactLabel: '—',
      attempts: 0
    },
    {
      id: 'tr-8',
      orderId: '49108',
      client: 'Hugo Martins',
      accountName: 'Casas Bahia · Nacional',
      channel: 'SMS',
      status: 'disparado' as const,
      statusLabel: 'Disparado',
      lastContactLabel: '18/07 10:05',
      attempts: 1
    },
    {
      id: 'tr-9',
      orderId: '49109',
      client: 'Iris Castro',
      accountName: 'Renner · Sul',
      channel: 'WhatsApp',
      status: 'pendente' as const,
      statusLabel: 'Pendente',
      lastContactLabel: '—',
      attempts: 0
    },
    {
      id: 'tr-10',
      orderId: '49110',
      client: 'João Pedro',
      accountName: 'Amazon BR · Reversa',
      channel: 'WhatsApp',
      status: 'falha' as const,
      statusLabel: 'Falha',
      lastContactLabel: '18/07 09:48',
      attempts: 3
    }
  ] as TratativaOrderRow[]
}

export const tratativasVolumeTrend: TrendPoint[] = [
  { label: '12/07', value: 96 },
  { label: '13/07', value: 112 },
  { label: '14/07', value: 88 },
  { label: '15/07', value: 134 },
  { label: '16/07', value: 121 },
  { label: '17/07', value: 105 },
  { label: '18/07', value: 128 }
]

export function buildTratativasDistribution(
  rows: TratativaOrderRow[]
): Array<{ status: StatusKey; value: number; label?: string }> {
  const counts: Record<TratativaStatus, number> = {
    pendente: 0,
    trabalhado: 0,
    disparado: 0,
    falha: 0
  }
  for (const row of rows) counts[row.status] += 1

  return [
    { status: 'assigned', value: counts.pendente, label: 'Pendente' },
    { status: 'done', value: counts.trabalhado, label: 'Trabalhado' },
    { status: 'route', value: counts.disparado, label: 'Disparado' },
    { status: 'occurrence', value: counts.falha, label: 'Falha' }
  ]
}

export function markTratativasDispatched(orderIds: string[]): number {
  let count = 0
  const now = '18/07 11:00'
  for (const row of tratativasState.orders) {
    if (!orderIds.includes(row.orderId)) continue
    if (row.status === 'disparado') continue
    row.status = 'disparado'
    row.statusLabel = 'Disparado'
    row.lastContactLabel = now
    row.attempts += 1
    count += 1
  }
  tratativasState.pending = tratativasState.orders.filter((row) => row.status === 'pendente').length
  tratativasState.failed = tratativasState.orders.filter((row) => row.status === 'falha').length
  return count
}

export function markTratativaWorked(orderId: string): boolean {
  const row = tratativasState.orders.find((item) => item.orderId === orderId)
  if (!row || row.status === 'trabalhado') return false
  row.status = 'trabalhado'
  row.statusLabel = 'Trabalhado'
  row.lastContactLabel = '18/07 11:05'
  tratativasState.workedToday += 1
  tratativasState.pending = tratativasState.orders.filter((item) => item.status === 'pendente').length
  return true
}
