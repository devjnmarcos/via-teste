/**
 * Fixtures — Pontos de apoio e Transportadores (Gestão / secondary nav).
 */
import type { Metric } from '../../types/domain'

export interface PontoApoioRow extends Record<string, unknown> {
  id: string
  name: string
  city: string
  state: string
  responsible: string
  capacity: string
  statusLabel: string
  active: boolean
}

export interface TransportadorRow extends Record<string, unknown> {
  id: string
  name: string
  type: string
  region: string
  phone: string
  statusLabel: string
  active: boolean
}

export const pontosApoioRows: PontoApoioRow[] = [
  {
    id: 'pa-1',
    name: 'Ponto de apoio Zona Sul',
    city: 'São Paulo',
    state: 'SP',
    responsible: 'Ana Duarte',
    capacity: '120',
    statusLabel: 'Ativo',
    active: true
  },
  {
    id: 'pa-2',
    name: 'Ponto de apoio Centro',
    city: 'São Paulo',
    state: 'SP',
    responsible: 'João Ribeiro',
    capacity: '80',
    statusLabel: 'Ativo',
    active: true
  },
  {
    id: 'pa-3',
    name: 'Ponto de apoio Campinas',
    city: 'Campinas',
    state: 'SP',
    responsible: 'Camila Ferreira',
    capacity: '60',
    statusLabel: 'Pausado',
    active: false
  },
  {
    id: 'pa-4',
    name: 'Ponto de apoio Porto Alegre',
    city: 'Porto Alegre',
    state: 'RS',
    responsible: 'Lucas Mendes',
    capacity: '50',
    statusLabel: 'Ativo',
    active: true
  }
]

export const transportadoresRows: TransportadorRow[] = [
  {
    id: 'tr-1',
    name: 'Marcos L.',
    type: 'Motoboy',
    region: 'SP · Zona Sul',
    phone: '(11) 98888-1001',
    statusLabel: 'Ativo',
    active: true
  },
  {
    id: 'tr-2',
    name: 'Rita S.',
    type: 'Van',
    region: 'RJ · Baixada',
    phone: '(21) 97777-2002',
    statusLabel: 'Ativo',
    active: true
  },
  {
    id: 'tr-3',
    name: 'Paulo N.',
    type: 'Motoboy',
    region: 'SP · Centro',
    phone: '(11) 96666-3003',
    statusLabel: 'Inativo',
    active: false
  },
  {
    id: 'tr-4',
    name: 'Fernanda K.',
    type: 'Carro',
    region: 'PR · Curitiba',
    phone: '(41) 95555-4004',
    statusLabel: 'Ativo',
    active: true
  }
]

export function buildPontosApoioMetrics(rows: PontoApoioRow[]): Metric[] {
  const active = rows.filter((row) => row.active).length
  const capacity = rows.reduce((sum, row) => sum + (Number(row.capacity) || 0), 0)
  return [
    { label: 'Pontos', value: rows.length, note: 'cadastrados', icon: 'i-lucide-map-pin-house' },
    { label: 'Ativos', value: active, note: 'operando', icon: 'i-lucide-check-circle', tone: 'success' },
    { label: 'Capacidade', value: capacity, note: 'pedidos/dia', icon: 'i-lucide-gauge' }
  ]
}

export function buildTransportadoresMetrics(rows: TransportadorRow[]): Metric[] {
  const active = rows.filter((row) => row.active).length
  const motoboy = rows.filter((row) => row.type === 'Motoboy').length
  return [
    { label: 'Transportadores', value: rows.length, note: 'cadastrados', icon: 'i-lucide-truck' },
    { label: 'Ativos', value: active, note: 'disponíveis', icon: 'i-lucide-check-circle', tone: 'success' },
    { label: 'Motoboys', value: motoboy, note: 'modalidade', icon: 'i-lucide-bike' }
  ]
}

export function createEmptyPontoApoio(): Omit<PontoApoioRow, 'id'> {
  return {
    name: '',
    city: '',
    state: 'SP',
    responsible: '',
    capacity: '40',
    statusLabel: 'Ativo',
    active: true
  }
}

export function createEmptyTransportador(): Omit<TransportadorRow, 'id'> {
  return {
    name: '',
    type: 'Motoboy',
    region: '',
    phone: '',
    statusLabel: 'Ativo',
    active: true
  }
}
