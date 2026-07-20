/**
 * Fixtures de roteirização e rotas.
 */

import type { TrendPoint } from '../../types/domain'

export type RouteStatus = 'Aberta' | 'Em montagem' | 'Fechada'

export interface RouteRow extends Record<string, unknown> {
  id: string
  code: string
  name: string
  status: RouteStatus
  ordersCount: number
  weightKg: number
  createdAtLabel: string
  supportPoint: string
}

export interface RouteOrderRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  city: string
  weightKg: number
  statusLabel: string
  /** Coordenada mock 0–100 no eixo X do mapa visual. */
  mapX?: number
  /** Coordenada mock 0–100 no eixo Y do mapa visual. */
  mapY?: number
}

export interface ScriptingOrderRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  city: string
  uf: string
  weightKg: number
  statusLabel: string
  selected: boolean
}

export const routesAccountOptions = [
  { label: 'Todas as contas', value: 'all' },
  { label: 'Casas Bahia · Nacional', value: 'acc-1' },
  { label: 'Renner · Sul', value: 'acc-2' }
]

export const routesState = {
  routes: [
    {
      id: 'rt-101',
      code: 'R-101',
      name: 'Zona Norte · Manhã',
      status: 'Aberta' as RouteStatus,
      ordersCount: 12,
      weightKg: 148,
      createdAtLabel: '18/07 07:40',
      supportPoint: 'PA Centro · SP'
    },
    {
      id: 'rt-102',
      code: 'R-102',
      name: 'Zona Sul · Tarde',
      status: 'Em montagem' as RouteStatus,
      ordersCount: 7,
      weightKg: 86,
      createdAtLabel: '18/07 08:15',
      supportPoint: 'PA Centro · SP'
    },
    {
      id: 'rt-103',
      code: 'R-103',
      name: 'ABC · Express',
      status: 'Fechada' as RouteStatus,
      ordersCount: 15,
      weightKg: 192,
      createdAtLabel: '17/07 16:20',
      supportPoint: 'PA Contagem · MG'
    },
    {
      id: 'rt-104',
      code: 'R-104',
      name: 'Litoral · Coleta',
      status: 'Aberta' as RouteStatus,
      ordersCount: 0,
      weightKg: 0,
      createdAtLabel: '18/07 09:05',
      supportPoint: 'PA Zona Sul · RJ'
    },
    {
      id: 'rt-105',
      code: 'R-105',
      name: 'Interior · Semanal',
      status: 'Fechada' as RouteStatus,
      ordersCount: 9,
      weightKg: 110,
      createdAtLabel: '16/07 11:30',
      supportPoint: 'PA Curitiba · PR'
    },
    {
      id: 'rt-106',
      code: 'R-106',
      name: 'Centro · Noturna',
      status: 'Em montagem' as RouteStatus,
      ordersCount: 4,
      weightKg: 41,
      createdAtLabel: '18/07 09:50',
      supportPoint: 'PA Centro · SP'
    }
  ] as RouteRow[],
  scriptingOrders: [
    {
      id: 'so-1',
      orderId: '48301',
      client: 'Ana Souza',
      city: 'São Paulo',
      uf: 'SP',
      weightKg: 12,
      statusLabel: 'Em estoque',
      selected: false
    },
    {
      id: 'so-2',
      orderId: '48302',
      client: 'Bruno Lima',
      city: 'Guarulhos',
      uf: 'SP',
      weightKg: 8,
      statusLabel: 'Em estoque',
      selected: false
    },
    {
      id: 'so-3',
      orderId: '48303',
      client: 'Carla Mendes',
      city: 'Osasco',
      uf: 'SP',
      weightKg: 15,
      statusLabel: 'Atribuído',
      selected: false
    },
    {
      id: 'so-4',
      orderId: '48304',
      client: 'Diego Alves',
      city: 'São Bernardo',
      uf: 'SP',
      weightKg: 6,
      statusLabel: 'Em estoque',
      selected: false
    },
    {
      id: 'so-5',
      orderId: '48305',
      client: 'Elena Rocha',
      city: 'Santo André',
      uf: 'SP',
      weightKg: 11,
      statusLabel: 'Em estoque',
      selected: false
    },
    {
      id: 'so-6',
      orderId: '48306',
      client: 'Fábio Nunes',
      city: 'Campinas',
      uf: 'SP',
      weightKg: 9,
      statusLabel: 'Atribuído',
      selected: false
    },
    {
      id: 'so-7',
      orderId: '48307',
      client: 'Gisele Prado',
      city: 'São Paulo',
      uf: 'SP',
      weightKg: 14,
      statusLabel: 'Em estoque',
      selected: false
    },
    {
      id: 'so-8',
      orderId: '48308',
      client: 'Hugo Martins',
      city: 'Barueri',
      uf: 'SP',
      weightKg: 7,
      statusLabel: 'Em estoque',
      selected: false
    }
  ] as ScriptingOrderRow[]
}

const routeOrdersById: Record<string, RouteOrderRow[]> = {
  'rt-101': [
    {
      id: 'ro-1',
      orderId: '48210',
      client: 'Ana Souza',
      city: 'São Paulo',
      weightKg: 12,
      statusLabel: 'Em rota',
      mapX: 22,
      mapY: 38
    },
    {
      id: 'ro-2',
      orderId: '48211',
      client: 'Bruno Lima',
      city: 'Guarulhos',
      weightKg: 8,
      statusLabel: 'Em rota',
      mapX: 48,
      mapY: 28
    },
    {
      id: 'ro-3',
      orderId: '48212',
      client: 'Carla Mendes',
      city: 'Osasco',
      weightKg: 15,
      statusLabel: 'Em estoque',
      mapX: 68,
      mapY: 52
    }
  ],
  'rt-102': [
    {
      id: 'ro-4',
      orderId: '48220',
      client: 'Diego Alves',
      city: 'São Bernardo',
      weightKg: 6,
      statusLabel: 'Em estoque',
      mapX: 30,
      mapY: 60
    },
    {
      id: 'ro-5',
      orderId: '48221',
      client: 'Elena Rocha',
      city: 'Santo André',
      weightKg: 11,
      statusLabel: 'Atribuído',
      mapX: 55,
      mapY: 45
    }
  ],
  'rt-103': [
    {
      id: 'ro-6',
      orderId: '48190',
      client: 'Fábio Nunes',
      city: 'Contagem',
      weightKg: 9,
      statusLabel: 'Concluído',
      mapX: 40,
      mapY: 50
    }
  ],
  'rt-104': [],
  'rt-105': [
    {
      id: 'ro-7',
      orderId: '48150',
      client: 'Gisele Prado',
      city: 'Curitiba',
      weightKg: 14,
      statusLabel: 'Concluído',
      mapX: 35,
      mapY: 70
    }
  ],
  'rt-106': [
    {
      id: 'ro-8',
      orderId: '48310',
      client: 'Hugo Martins',
      city: 'São Paulo',
      weightKg: 7,
      statusLabel: 'Em estoque',
      mapX: 50,
      mapY: 40
    }
  ]
}

export const routesVolumeTrend: TrendPoint[] = [
  { label: '12/07', value: 3 },
  { label: '13/07', value: 5 },
  { label: '14/07', value: 4 },
  { label: '15/07', value: 6 },
  { label: '16/07', value: 2 },
  { label: '17/07', value: 4 },
  { label: '18/07', value: 3 }
]

let routeSeq = 110

export function getRouteById(id: string): RouteRow | undefined {
  return routesState.routes.find((route) => route.id === id)
}

export function getRouteOrders(id: string): RouteOrderRow[] {
  return routeOrdersById[id] ?? []
}

export function createRouteFromSelection(input: {
  name: string
  orderIds: string[]
}): RouteRow {
  routeSeq += 1
  const selected = routesState.scriptingOrders.filter((order) =>
    input.orderIds.includes(order.orderId)
  )
  const weightKg = selected.reduce((acc, order) => acc + order.weightKg, 0)
  const route: RouteRow = {
    id: `rt-${routeSeq}`,
    code: `R-${routeSeq}`,
    name: input.name.trim() || `Rota ${routeSeq}`,
    status: 'Em montagem',
    ordersCount: selected.length,
    weightKg,
    createdAtLabel: '18/07 10:00',
    supportPoint: 'PA Centro · SP'
  }
  routesState.routes.unshift(route)
  routeOrdersById[route.id] = selected.map((order, index) => ({
    id: `ro-new-${routeSeq}-${index}`,
    orderId: order.orderId,
    client: order.client,
    city: order.city,
    weightKg: order.weightKg,
    statusLabel: order.statusLabel
  }))
  for (const order of routesState.scriptingOrders) {
    if (input.orderIds.includes(order.orderId)) {
      order.selected = false
    }
  }
  routesState.scriptingOrders = routesState.scriptingOrders.filter(
    (order) => !input.orderIds.includes(order.orderId)
  )
  return route
}

export function deleteRouteIfEmpty(id: string): boolean {
  const route = getRouteById(id)
  if (!route || route.ordersCount > 0) return false
  routesState.routes = routesState.routes.filter((item) => item.id !== id)
  delete routeOrdersById[id]
  return true
}

export function buildRoutesDistribution(
  rows: RouteRow[]
): Array<{ status: 'assigned' | 'route' | 'done' | 'stock'; value: number; label?: string }> {
  const abertas = rows.filter((row) => row.status === 'Aberta').length
  const montagem = rows.filter((row) => row.status === 'Em montagem').length
  const fechadas = rows.filter((row) => row.status === 'Fechada').length
  return [
    { status: 'assigned', value: abertas, label: 'Abertas' },
    { status: 'stock', value: montagem, label: 'Em montagem' },
    { status: 'done', value: fechadas, label: 'Fechadas' }
  ]
}
