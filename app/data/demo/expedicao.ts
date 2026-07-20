/**
 * Fixtures de Expedição (etiquetas de pedidos).
 */

import type { TrendPoint } from '../../types/domain'

export interface ExpedicaoOrderRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  accountName: string
  supportPoint: string
  statusLabel: string
  createdAtLabel: string
  printed: boolean
}

export const expedicaoAccountOptions = [
  { label: 'Todas as contas', value: 'all' },
  { label: 'Casas Bahia · Nacional', value: 'acc-1' },
  { label: 'Renner · Sul', value: 'acc-2' },
  { label: 'Amazon BR · Reversa', value: 'acc-3' }
]

export const expedicaoStatusOptions = [
  { label: 'Todos os status', value: 'all' },
  { label: 'Pronto para etiqueta', value: 'ready' },
  { label: 'Já impresso', value: 'printed' }
]

export const expedicaoState = {
  orders: [
    {
      id: 'ex-1',
      orderId: '48401',
      client: 'Ana Souza',
      accountName: 'Casas Bahia · Nacional',
      supportPoint: 'PA Centro · SP',
      statusLabel: 'Pronto para etiqueta',
      createdAtLabel: '18/07 08:12',
      printed: false
    },
    {
      id: 'ex-2',
      orderId: '48402',
      client: 'Bruno Lima',
      accountName: 'Casas Bahia · Nacional',
      supportPoint: 'PA Centro · SP',
      statusLabel: 'Pronto para etiqueta',
      createdAtLabel: '18/07 08:20',
      printed: false
    },
    {
      id: 'ex-3',
      orderId: '48403',
      client: 'Carla Mendes',
      accountName: 'Renner · Sul',
      supportPoint: 'PA Porto Alegre · RS',
      statusLabel: 'Já impresso',
      createdAtLabel: '18/07 07:55',
      printed: true
    },
    {
      id: 'ex-4',
      orderId: '48404',
      client: 'Diego Alves',
      accountName: 'Amazon BR · Reversa',
      supportPoint: 'PA Contagem · MG',
      statusLabel: 'Pronto para etiqueta',
      createdAtLabel: '18/07 08:40',
      printed: false
    },
    {
      id: 'ex-5',
      orderId: '48405',
      client: 'Elena Rocha',
      accountName: 'Casas Bahia · Nacional',
      supportPoint: 'PA Zona Sul · RJ',
      statusLabel: 'Pronto para etiqueta',
      createdAtLabel: '18/07 09:05',
      printed: false
    },
    {
      id: 'ex-6',
      orderId: '48406',
      client: 'Fábio Nunes',
      accountName: 'Renner · Sul',
      supportPoint: 'PA Curitiba · PR',
      statusLabel: 'Já impresso',
      createdAtLabel: '17/07 16:30',
      printed: true
    },
    {
      id: 'ex-7',
      orderId: '48407',
      client: 'Gisele Prado',
      accountName: 'Amazon BR · Reversa',
      supportPoint: 'PA Centro · SP',
      statusLabel: 'Pronto para etiqueta',
      createdAtLabel: '18/07 09:22',
      printed: false
    },
    {
      id: 'ex-8',
      orderId: '48408',
      client: 'Hugo Martins',
      accountName: 'Casas Bahia · Nacional',
      supportPoint: 'PA Centro · SP',
      statusLabel: 'Pronto para etiqueta',
      createdAtLabel: '18/07 09:40',
      printed: false
    }
  ] as ExpedicaoOrderRow[],
  printedToday: 14
}

export const expedicaoVolumeTrend: TrendPoint[] = [
  { label: '12/07', value: 18 },
  { label: '13/07', value: 22 },
  { label: '14/07', value: 15 },
  { label: '15/07', value: 27 },
  { label: '16/07', value: 19 },
  { label: '17/07', value: 24 },
  { label: '18/07', value: 14 }
]

export function markOrdersPrinted(orderIds: string[]): number {
  let count = 0
  for (const order of expedicaoState.orders) {
    if (orderIds.includes(order.orderId) && !order.printed) {
      order.printed = true
      order.statusLabel = 'Já impresso'
      count += 1
    }
  }
  expedicaoState.printedToday += count
  return count
}
