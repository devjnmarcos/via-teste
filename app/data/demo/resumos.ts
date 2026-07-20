/**
 * Fixtures de Resumos (analytics) — totais por operação, por cliente e por UF.
 */

import type { StatusKey, TrendPoint } from '../../types/domain'

export interface ResumoOperacaoRow extends Record<string, unknown> {
  id: string
  operationName: string
  novos: number
  semPa: number
  atribuidos: number
  emEstoque: number
  emRota: number
  concluidosHoje: number
  ocorrenciasHoje: number
  cancelados: number
  produtividade: string
  total: number
}

export interface ResumoClienteRow extends Record<string, unknown> {
  id: string
  accountId: string
  accountName: string
  operationType: string
  total: number
  emRota: number
  concluidos: number
  ocorrencias: number
  produtividade: string
}

export interface ResumoEstadoRow extends Record<string, unknown> {
  id: string
  uf: string
  stateName: string
  total: number
  emRota: number
  concluidos: number
  ocorrencias: number
  pontosApoio: number
}

export interface ResumoPaRow extends Record<string, unknown> {
  id: string
  name: string
  uf: string
  city: string
  total: number
  emRota: number
  concluidos: number
  ocorrencias: number
}

export interface ResumoTransportadorRow extends Record<string, unknown> {
  id: string
  name: string
  modality: string
  total: number
  emRota: number
  concluidos: number
  ocorrencias: number
  slaPct: string
}

export interface ResumoMapPoint extends Record<string, unknown> {
  id: string
  label: string
  uf: string
  city: string
  orders: number
  x: number
  y: number
}

export const resumosAccountOptions = [
  { label: 'Todas as contas', value: 'all' },
  { label: 'Casas Bahia · Nacional', value: 'acc-1' },
  { label: 'Renner · Sul', value: 'acc-2' },
  { label: 'Amazon BR · Reversa', value: 'acc-3' }
]

export const resumosOperationOptions = [
  { label: 'Todas as operações', value: 'all' },
  { label: 'Logística Reversa', value: 'logistica-reversa' },
  { label: 'Coleta agendada', value: 'coleta-agendada' },
  { label: 'Troca em loja', value: 'troca-loja' }
]

export const resumosPeriodOptions = [
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Mês atual', value: 'month' }
]

export const resumosOperacaoRows: ResumoOperacaoRow[] = [
  {
    id: 'op-1',
    operationName: 'Logística Reversa',
    novos: 42,
    semPa: 18,
    atribuidos: 86,
    emEstoque: 54,
    emRota: 128,
    concluidosHoje: 97,
    ocorrenciasHoje: 14,
    cancelados: 6,
    produtividade: '78%',
    total: 445
  },
  {
    id: 'op-2',
    operationName: 'Coleta agendada',
    novos: 21,
    semPa: 9,
    atribuidos: 44,
    emEstoque: 31,
    emRota: 62,
    concluidosHoje: 48,
    ocorrenciasHoje: 7,
    cancelados: 3,
    produtividade: '71%',
    total: 225
  },
  {
    id: 'op-3',
    operationName: 'Troca em loja',
    novos: 12,
    semPa: 4,
    atribuidos: 28,
    emEstoque: 19,
    emRota: 35,
    concluidosHoje: 41,
    ocorrenciasHoje: 3,
    cancelados: 2,
    produtividade: '84%',
    total: 144
  },
  {
    id: 'op-4',
    operationName: 'Postagem própria',
    novos: 8,
    semPa: 2,
    atribuidos: 16,
    emEstoque: 11,
    emRota: 22,
    concluidosHoje: 19,
    ocorrenciasHoje: 2,
    cancelados: 1,
    produtividade: '69%',
    total: 81
  },
  {
    id: 'op-5',
    operationName: 'Devolução B2B',
    novos: 15,
    semPa: 6,
    atribuidos: 33,
    emEstoque: 24,
    emRota: 41,
    concluidosHoje: 29,
    ocorrenciasHoje: 5,
    cancelados: 2,
    produtividade: '66%',
    total: 155
  }
]

export const resumosClienteRows: ResumoClienteRow[] = [
  {
    id: 'cli-1',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    operationType: 'Logística Reversa',
    total: 312,
    emRota: 88,
    concluidos: 146,
    ocorrencias: 18,
    produtividade: '76%'
  },
  {
    id: 'cli-2',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    operationType: 'Coleta agendada',
    total: 198,
    emRota: 54,
    concluidos: 91,
    ocorrencias: 11,
    produtividade: '72%'
  },
  {
    id: 'cli-3',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    operationType: 'Logística Reversa',
    total: 176,
    emRota: 49,
    concluidos: 82,
    ocorrencias: 9,
    produtividade: '81%'
  },
  {
    id: 'cli-4',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    operationType: 'Troca em loja',
    total: 94,
    emRota: 22,
    concluidos: 48,
    ocorrencias: 4,
    produtividade: '85%'
  },
  {
    id: 'cli-5',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    operationType: 'Postagem própria',
    total: 67,
    emRota: 18,
    concluidos: 31,
    ocorrencias: 3,
    produtividade: '68%'
  },
  {
    id: 'cli-6',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    operationType: 'Devolução B2B',
    total: 58,
    emRota: 15,
    concluidos: 27,
    ocorrencias: 5,
    produtividade: '64%'
  }
]

export const resumosEstadoRows: ResumoEstadoRow[] = [
  {
    id: 'uf-sp',
    uf: 'SP',
    stateName: 'São Paulo',
    total: 284,
    emRota: 76,
    concluidos: 132,
    ocorrencias: 16,
    pontosApoio: 42
  },
  {
    id: 'uf-rj',
    uf: 'RJ',
    stateName: 'Rio de Janeiro',
    total: 148,
    emRota: 41,
    concluidos: 68,
    ocorrencias: 9,
    pontosApoio: 18
  },
  {
    id: 'uf-mg',
    uf: 'MG',
    stateName: 'Minas Gerais',
    total: 121,
    emRota: 33,
    concluidos: 55,
    ocorrencias: 7,
    pontosApoio: 14
  },
  {
    id: 'uf-rs',
    uf: 'RS',
    stateName: 'Rio Grande do Sul',
    total: 98,
    emRota: 28,
    concluidos: 44,
    ocorrencias: 6,
    pontosApoio: 11
  },
  {
    id: 'uf-pr',
    uf: 'PR',
    stateName: 'Paraná',
    total: 87,
    emRota: 24,
    concluidos: 39,
    ocorrencias: 5,
    pontosApoio: 9
  },
  {
    id: 'uf-ba',
    uf: 'BA',
    stateName: 'Bahia',
    total: 64,
    emRota: 17,
    concluidos: 28,
    ocorrencias: 4,
    pontosApoio: 7
  },
  {
    id: 'uf-sc',
    uf: 'SC',
    stateName: 'Santa Catarina',
    total: 52,
    emRota: 14,
    concluidos: 23,
    ocorrencias: 3,
    pontosApoio: 6
  },
  {
    id: 'uf-pe',
    uf: 'PE',
    stateName: 'Pernambuco',
    total: 41,
    emRota: 11,
    concluidos: 18,
    ocorrencias: 2,
    pontosApoio: 5
  }
]

export const resumosPaRows: ResumoPaRow[] = [
  {
    id: 'pa-1',
    name: 'PA Centro · SP',
    uf: 'SP',
    city: 'São Paulo',
    total: 96,
    emRota: 28,
    concluidos: 44,
    ocorrencias: 6
  },
  {
    id: 'pa-2',
    name: 'PA Zona Sul · RJ',
    uf: 'RJ',
    city: 'Rio de Janeiro',
    total: 72,
    emRota: 21,
    concluidos: 33,
    ocorrencias: 5
  },
  {
    id: 'pa-3',
    name: 'PA Contagem · MG',
    uf: 'MG',
    city: 'Contagem',
    total: 58,
    emRota: 16,
    concluidos: 27,
    ocorrencias: 4
  },
  {
    id: 'pa-4',
    name: 'PA Curitiba · PR',
    uf: 'PR',
    city: 'Curitiba',
    total: 49,
    emRota: 14,
    concluidos: 22,
    ocorrencias: 3
  },
  {
    id: 'pa-5',
    name: 'PA Porto Alegre · RS',
    uf: 'RS',
    city: 'Porto Alegre',
    total: 41,
    emRota: 12,
    concluidos: 18,
    ocorrencias: 3
  },
  {
    id: 'pa-6',
    name: 'PA Salvador · BA',
    uf: 'BA',
    city: 'Salvador',
    total: 33,
    emRota: 9,
    concluidos: 14,
    ocorrencias: 2
  }
]

export const resumosTransportadorRows: ResumoTransportadorRow[] = [
  {
    id: 'tr-1',
    name: 'Loggi Express',
    modality: 'Last mile',
    total: 128,
    emRota: 42,
    concluidos: 61,
    ocorrencias: 8,
    slaPct: '86%'
  },
  {
    id: 'tr-2',
    name: 'Total Express',
    modality: 'Courier',
    total: 94,
    emRota: 31,
    concluidos: 44,
    ocorrencias: 9,
    slaPct: '78%'
  },
  {
    id: 'tr-3',
    name: 'Jadlog Urbano',
    modality: 'Econômico',
    total: 76,
    emRota: 22,
    concluidos: 38,
    ocorrencias: 5,
    slaPct: '82%'
  },
  {
    id: 'tr-4',
    name: 'Motoboy Rede SP',
    modality: 'Motofrete',
    total: 58,
    emRota: 19,
    concluidos: 27,
    ocorrencias: 4,
    slaPct: '80%'
  },
  {
    id: 'tr-5',
    name: 'Correios PAC Reversa',
    modality: 'Postal',
    total: 47,
    emRota: 11,
    concluidos: 21,
    ocorrencias: 6,
    slaPct: '68%'
  },
  {
    id: 'tr-6',
    name: 'Flash Courier',
    modality: 'Express',
    total: 35,
    emRota: 10,
    concluidos: 17,
    ocorrencias: 2,
    slaPct: '82%'
  }
]

/** Pontos mock para o mapa de pedidos (coordenadas normalizadas 0–100). */
export const resumosMapPoints: ResumoMapPoint[] = [
  { id: 'mp-1', label: 'SP · Centro', uf: 'SP', city: 'São Paulo', orders: 96, x: 62, y: 58 },
  { id: 'mp-2', label: 'RJ · Zona Sul', uf: 'RJ', city: 'Rio de Janeiro', orders: 72, x: 72, y: 62 },
  { id: 'mp-3', label: 'MG · Contagem', uf: 'MG', city: 'Contagem', orders: 58, x: 58, y: 52 },
  { id: 'mp-4', label: 'PR · Curitiba', uf: 'PR', city: 'Curitiba', orders: 49, x: 48, y: 72 },
  { id: 'mp-5', label: 'RS · Porto Alegre', uf: 'RS', city: 'Porto Alegre', orders: 41, x: 42, y: 86 },
  { id: 'mp-6', label: 'BA · Salvador', uf: 'BA', city: 'Salvador', orders: 33, x: 78, y: 38 },
  { id: 'mp-7', label: 'SC · Florianópolis', uf: 'SC', city: 'Florianópolis', orders: 28, x: 52, y: 78 },
  { id: 'mp-8', label: 'PE · Recife', uf: 'PE', city: 'Recife', orders: 22, x: 82, y: 28 }
]

export const resumosVolumeTrend: TrendPoint[] = [
  { label: '12/07', value: 118 },
  { label: '13/07', value: 132 },
  { label: '14/07', value: 141 },
  { label: '15/07', value: 126 },
  { label: '16/07', value: 154 },
  { label: '17/07', value: 168 },
  { label: '18/07', value: 149 }
]

export const resumosOccurrenceTrend: TrendPoint[] = [
  { label: '12/07', value: 12 },
  { label: '13/07', value: 15 },
  { label: '14/07', value: 11 },
  { label: '15/07', value: 18 },
  { label: '16/07', value: 14 },
  { label: '17/07', value: 16 },
  { label: '18/07', value: 13 }
]

export function buildOperacaoDistribution(
  rows: ResumoOperacaoRow[]
): Array<{ status: StatusKey; value: number; label?: string }> {
  const sum = (key: keyof ResumoOperacaoRow) =>
    rows.reduce((acc, row) => acc + Number(row[key] ?? 0), 0)

  return [
    { status: 'new', value: sum('novos'), label: 'Novos' },
    { status: 'supportMissing', value: sum('semPa'), label: 'Sem ponto de apoio' },
    { status: 'assigned', value: sum('atribuidos'), label: 'Atribuídos' },
    { status: 'stock', value: sum('emEstoque'), label: 'Em estoque' },
    { status: 'route', value: sum('emRota'), label: 'Em rota' },
    { status: 'done', value: sum('concluidosHoje'), label: 'Concluídos hoje' },
    { status: 'occurrence', value: sum('ocorrenciasHoje'), label: 'Ocorrências' },
    { status: 'cancelled', value: sum('cancelados'), label: 'Cancelados' }
  ]
}

export function buildClienteDistribution(
  rows: ResumoClienteRow[]
): Array<{ status: StatusKey; value: number; label?: string }> {
  const emRota = rows.reduce((acc, row) => acc + row.emRota, 0)
  const concluidos = rows.reduce((acc, row) => acc + row.concluidos, 0)
  const ocorrencias = rows.reduce((acc, row) => acc + row.ocorrencias, 0)
  const outros = Math.max(
    0,
    rows.reduce((acc, row) => acc + row.total, 0) - emRota - concluidos - ocorrencias
  )

  return [
    { status: 'assigned', value: outros, label: 'Demais status' },
    { status: 'route', value: emRota, label: 'Em rota' },
    { status: 'done', value: concluidos, label: 'Concluídos' },
    { status: 'occurrence', value: ocorrencias, label: 'Ocorrências' }
  ]
}

export function buildEstadoDistribution(
  rows: ResumoEstadoRow[]
): Array<{ status: StatusKey; value: number; label?: string }> {
  const palette: StatusKey[] = [
    'route',
    'done',
    'assigned',
    'stock',
    'new',
    'occurrence',
    'supportMissing',
    'cancelled'
  ]
  return rows
    .slice()
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((row, index) => ({
      status: palette[index % palette.length]!,
      value: row.total,
      label: row.uf
    }))
}

export function buildPaDistribution(
  rows: ResumoPaRow[]
): Array<{ status: StatusKey; value: number; label?: string }> {
  const palette: StatusKey[] = ['route', 'done', 'assigned', 'stock', 'new', 'occurrence']
  return rows.slice(0, 6).map((row, index) => ({
    status: palette[index % palette.length]!,
    value: row.total,
    label: row.name.length > 16 ? `${row.name.slice(0, 14)}…` : row.name
  }))
}

export function buildTransportadorDistribution(
  rows: ResumoTransportadorRow[]
): Array<{ status: StatusKey; value: number; label?: string }> {
  const palette: StatusKey[] = ['route', 'done', 'assigned', 'stock', 'occurrence', 'new']
  return rows.slice(0, 6).map((row, index) => ({
    status: palette[index % palette.length]!,
    value: row.total,
    label: row.name.length > 16 ? `${row.name.slice(0, 14)}…` : row.name
  }))
}
