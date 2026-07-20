/**
 * Fixtures de Check-in de loja.
 */

import type { TrendPoint } from '../../types/domain'

export type CheckInResultStatus = 'encontrado' | 'ja_checkin' | 'nao_encontrado' | 'divergente'

export interface CheckInHistoryRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  store: string
  statusLabel: string
  checkedAtLabel: string
  operator: string
}

export interface CheckInLookupResult {
  orderId: string
  client: string
  store: string
  status: CheckInResultStatus
  statusLabel: string
  canConfirm: boolean
}

export const lojaCheckInState = {
  checkInsToday: 64,
  queue: 11,
  divergences: 3,
  history: [
    {
      id: 'ci-1',
      orderId: '52101',
      client: 'Ana Souza',
      store: 'Loja Centro · SP',
      statusLabel: 'Confirmado',
      checkedAtLabel: '18/07 08:05',
      operator: 'marina.ops'
    },
    {
      id: 'ci-2',
      orderId: '52102',
      client: 'Bruno Lima',
      store: 'Loja Centro · SP',
      statusLabel: 'Confirmado',
      checkedAtLabel: '18/07 08:18',
      operator: 'marina.ops'
    },
    {
      id: 'ci-3',
      orderId: '52103',
      client: 'Carla Mendes',
      store: 'Loja Sul · RJ',
      statusLabel: 'Divergente',
      checkedAtLabel: '18/07 08:40',
      operator: 'paulo.loja'
    },
    {
      id: 'ci-4',
      orderId: '52104',
      client: 'Diego Alves',
      store: 'Loja Norte · MG',
      statusLabel: 'Confirmado',
      checkedAtLabel: '18/07 09:02',
      operator: 'paulo.loja'
    },
    {
      id: 'ci-5',
      orderId: '52105',
      client: 'Elena Rocha',
      store: 'Loja Centro · SP',
      statusLabel: 'Confirmado',
      checkedAtLabel: '18/07 09:25',
      operator: 'marina.ops'
    },
    {
      id: 'ci-6',
      orderId: '52106',
      client: 'Fábio Nunes',
      store: 'Loja Sul · RJ',
      statusLabel: 'Confirmado',
      checkedAtLabel: '18/07 09:48',
      operator: 'paulo.loja'
    },
    {
      id: 'ci-7',
      orderId: '52107',
      client: 'Gisele Prado',
      store: 'Loja Centro · SP',
      statusLabel: 'Confirmado',
      checkedAtLabel: '18/07 10:10',
      operator: 'marina.ops'
    },
    {
      id: 'ci-8',
      orderId: '52108',
      client: 'Hugo Martins',
      store: 'Loja Norte · MG',
      statusLabel: 'Divergente',
      checkedAtLabel: '18/07 10:32',
      operator: 'paulo.loja'
    }
  ] as CheckInHistoryRow[]
}

export const lojaCheckInVolumeTrend: TrendPoint[] = [
  { label: '08h', value: 6 },
  { label: '09h', value: 11 },
  { label: '10h', value: 14 },
  { label: '11h', value: 9 },
  { label: '12h', value: 7 },
  { label: '13h', value: 10 },
  { label: '14h', value: 7 }
]

const catalog: Record<string, CheckInLookupResult> = {
  '52120': {
    orderId: '52120',
    client: 'Iris Castro',
    store: 'Loja Centro · SP',
    status: 'encontrado',
    statusLabel: 'Pronto para check-in',
    canConfirm: true
  },
  '52121': {
    orderId: '52121',
    client: 'João Pedro',
    store: 'Loja Sul · RJ',
    status: 'ja_checkin',
    statusLabel: 'Já realizado',
    canConfirm: false
  },
  '52103': {
    orderId: '52103',
    client: 'Carla Mendes',
    store: 'Loja Sul · RJ',
    status: 'divergente',
    statusLabel: 'Divergência de loja',
    canConfirm: false
  }
}

export function lookupCheckInOrder(query: string): CheckInLookupResult | null {
  const key = query.trim()
  if (!key) return null
  if (catalog[key]) return { ...catalog[key] }
  if (/^\d{5}$/.test(key)) {
    return {
      orderId: key,
      client: 'Cliente não identificado',
      store: '—',
      status: 'nao_encontrado',
      statusLabel: 'Pedido não encontrado',
      canConfirm: false
    }
  }
  return null
}

export function confirmCheckIn(orderId: string): CheckInHistoryRow | null {
  const found = catalog[orderId]
  if (!found || !found.canConfirm) return null
  const row: CheckInHistoryRow = {
    id: `ci-${Date.now()}`,
    orderId: found.orderId,
    client: found.client,
    store: found.store,
    statusLabel: 'Confirmado',
    checkedAtLabel: '18/07 11:15',
    operator: 'demo.ops'
  }
  lojaCheckInState.history = [row, ...lojaCheckInState.history]
  lojaCheckInState.checkInsToday += 1
  lojaCheckInState.queue = Math.max(0, lojaCheckInState.queue - 1)
  found.status = 'ja_checkin'
  found.statusLabel = 'Já realizado'
  found.canConfirm = false
  return row
}
