/**
 * Fixtures — Auditoria geográfica (geo-audit).
 */
import type { Metric } from '../../types/domain'

export interface GeoLogRow extends Record<string, unknown> {
  id: string
  orderId: string
  address: string
  city: string
  state: string
  status: 'pendente' | 'corrigido' | 'falhou'
  statusLabel: string
  source: string
  updatedAt: string
}

export const geoAuditState = {
  rows: [
    {
      id: 'geo-1',
      orderId: '48224',
      address: 'Av. Paulista, 1578',
      city: 'São Paulo',
      state: 'SP',
      status: 'pendente' as const,
      statusLabel: 'Pendente',
      source: 'Coleta',
      updatedAt: 'há 12 min'
    },
    {
      id: 'geo-2',
      orderId: '48197',
      address: 'Rua inexistente, 0',
      city: 'Porto Alegre',
      state: 'RS',
      status: 'falhou' as const,
      statusLabel: 'Falhou',
      source: 'Importação',
      updatedAt: 'há 40 min'
    },
    {
      id: 'geo-3',
      orderId: '48208',
      address: 'Rua Augusta, 2690',
      city: 'São Paulo',
      state: 'SP',
      status: 'corrigido' as const,
      statusLabel: 'Corrigido',
      source: 'Job',
      updatedAt: 'há 2h'
    },
    {
      id: 'geo-4',
      orderId: '48190',
      address: 'Av. Tancredo Neves, 148',
      city: 'Salvador',
      state: 'BA',
      status: 'pendente' as const,
      statusLabel: 'Pendente',
      source: 'Checkout',
      updatedAt: 'há 3h'
    },
    {
      id: 'geo-5',
      orderId: '48201',
      address: 'Rua XV de Novembro, 700',
      city: 'Curitiba',
      state: 'PR',
      status: 'corrigido' as const,
      statusLabel: 'Corrigido',
      source: 'Job',
      updatedAt: 'ontem'
    }
  ] as GeoLogRow[],
  jobRunning: false,
  lastJobAt: 'ontem 18:40'
}

export const geoAuditTrend = [
  { label: 'Seg', value: 3 },
  { label: 'Ter', value: 5 },
  { label: 'Qua', value: 2 },
  { label: 'Qui', value: 7 },
  { label: 'Sex', value: 4 },
  { label: 'Sáb', value: 1 },
  { label: 'Dom', value: 2 }
]

export const geoAuditStatusOptions = [
  { label: 'Todos os status', value: 'all' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Corrigidos', value: 'corrigido' },
  { label: 'Falhos', value: 'falhou' }
]

export function buildGeoAuditMetrics(rows: GeoLogRow[]): Metric[] {
  const pendente = rows.filter((row) => row.status === 'pendente').length
  const corrigido = rows.filter((row) => row.status === 'corrigido').length
  const falhou = rows.filter((row) => row.status === 'falhou').length
  return [
    { label: 'Pendentes', value: pendente, note: 'endereços', icon: 'i-lucide-map-pin', tone: 'warning' },
    { label: 'Corrigidos', value: corrigido, note: 'geocode ok', icon: 'i-lucide-map-pin-check', tone: 'success' },
    { label: 'Falhos', value: falhou, note: 'revisar', icon: 'i-lucide-map-pin-off', tone: 'danger' }
  ]
}

export function enqueueFixInvalidAddresses(): { queued: number } {
  if (geoAuditState.jobRunning) return { queued: 0 }
  geoAuditState.jobRunning = true
  const pending = geoAuditState.rows.filter((row) => row.status === 'pendente' || row.status === 'falhou')
  for (const row of pending) {
    row.status = 'corrigido'
    row.statusLabel = 'Corrigido'
    row.source = 'Job'
    row.updatedAt = 'agora'
  }
  geoAuditState.jobRunning = false
  geoAuditState.lastJobAt = 'agora'
  return { queued: pending.length }
}
