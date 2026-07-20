/**
 * Fixtures de Faturas a receber / a pagar.
 */

import { reactive } from 'vue'
import type { TrendPoint } from '../../types/domain'

export type FaturaKind = 'a-receber' | 'a-pagar'
export type FaturaStatus = 'Aberta' | 'Paga' | 'Vencida' | 'Cancelada'

export interface FaturaPedidoRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  valueLabel: string
  value: number
}

export interface FiscalDocumentRow extends Record<string, unknown> {
  id: string
  number: string
  series: string
  issuedAtLabel: string
  type: string
}

export interface FaturaRow extends Record<string, unknown> {
  id: string
  kind: FaturaKind
  competenceLabel: string
  accountId: string
  accountName: string
  value: number
  valueLabel: string
  status: FaturaStatus
  dueAtLabel: string
  notes: string
  orders: FaturaPedidoRow[]
  documents: FiscalDocumentRow[]
}

export const faturasAccountOptions = [
  { label: 'Casas Bahia · Nacional', value: 'acc-1' },
  { label: 'Renner · Sul', value: 'acc-2' },
  { label: 'Amazon BR · Reversa', value: 'acc-3' }
]

export const faturasStatusOptions = [
  { label: 'Todos os status', value: 'Todos' },
  { label: 'Aberta', value: 'Aberta' },
  { label: 'Paga', value: 'Paga' },
  { label: 'Vencida', value: 'Vencida' },
  { label: 'Cancelada', value: 'Cancelada' }
]

export function isFaturaKind(value: string): value is FaturaKind {
  return value === 'a-receber' || value === 'a-pagar'
}

export function faturaKindLabel(kind: FaturaKind): string {
  return kind === 'a-receber' ? 'A receber' : 'A pagar'
}

function formatBrl(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const initialFaturas: FaturaRow[] = [
  {
    id: '9001',
    kind: 'a-receber',
    competenceLabel: 'Jul/2026',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    value: 42850.4,
    valueLabel: formatBrl(42850.4),
    status: 'Aberta',
    dueAtLabel: '31/07/2026',
    notes: 'Competência julho — coleta reversa',
    orders: [
      {
        id: 'fp-1',
        orderId: '48224',
        client: 'Casas Bahia',
        value: 1890.5,
        valueLabel: formatBrl(1890.5)
      },
      {
        id: 'fp-2',
        orderId: '48190',
        client: 'Casas Bahia',
        value: 720,
        valueLabel: formatBrl(720)
      }
    ],
    documents: [
      {
        id: 'fd-1',
        number: '883192',
        series: '1',
        issuedAtLabel: '05/07/2026',
        type: 'NF-e'
      }
    ]
  },
  {
    id: '9002',
    kind: 'a-receber',
    competenceLabel: 'Jun/2026',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    value: 19200,
    valueLabel: formatBrl(19200),
    status: 'Paga',
    dueAtLabel: '30/06/2026',
    notes: '',
    orders: [
      {
        id: 'fp-3',
        orderId: '47001',
        client: 'Renner',
        value: 980,
        valueLabel: formatBrl(980)
      }
    ],
    documents: [
      {
        id: 'fd-2',
        number: '771001',
        series: 'A',
        issuedAtLabel: '02/06/2026',
        type: 'NF-e'
      }
    ]
  },
  {
    id: '9003',
    kind: 'a-receber',
    competenceLabel: 'Mai/2026',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    value: 8450.9,
    valueLabel: formatBrl(8450.9),
    status: 'Vencida',
    dueAtLabel: '15/06/2026',
    notes: 'Aguardando confirmação financeira',
    orders: [
      {
        id: 'fp-4',
        orderId: '46012',
        client: 'Amazon BR',
        value: 2100,
        valueLabel: formatBrl(2100)
      }
    ],
    documents: []
  },
  {
    id: '9004',
    kind: 'a-receber',
    competenceLabel: 'Jul/2026',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    value: 11340,
    valueLabel: formatBrl(11340),
    status: 'Aberta',
    dueAtLabel: '28/07/2026',
    notes: '',
    orders: [
      {
        id: 'fp-5',
        orderId: '48208',
        client: 'Renner',
        value: 450,
        valueLabel: formatBrl(450)
      },
      {
        id: 'fp-6',
        orderId: '48201',
        client: 'Renner',
        value: 310,
        valueLabel: formatBrl(310)
      }
    ],
    documents: [
      {
        id: 'fd-3',
        number: '882010',
        series: '1',
        issuedAtLabel: '10/07/2026',
        type: 'NF-e'
      }
    ]
  },
  {
    id: '9101',
    kind: 'a-pagar',
    competenceLabel: 'Jul/2026',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    value: 15600,
    valueLabel: formatBrl(15600),
    status: 'Aberta',
    dueAtLabel: '25/07/2026',
    notes: 'Repasse ponto de apoio',
    orders: [
      {
        id: 'fp-7',
        orderId: '48197',
        client: 'Casas Bahia',
        value: 640,
        valueLabel: formatBrl(640)
      }
    ],
    documents: [
      {
        id: 'fd-4',
        number: '55021',
        series: 'U',
        issuedAtLabel: '08/07/2026',
        type: 'NFS-e'
      }
    ]
  },
  {
    id: '9102',
    kind: 'a-pagar',
    competenceLabel: 'Jun/2026',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    value: 9800.5,
    valueLabel: formatBrl(9800.5),
    status: 'Paga',
    dueAtLabel: '20/06/2026',
    notes: '',
    orders: [
      {
        id: 'fp-8',
        orderId: '45990',
        client: 'Amazon BR',
        value: 1200,
        valueLabel: formatBrl(1200)
      }
    ],
    documents: [
      {
        id: 'fd-5',
        number: '44901',
        series: 'U',
        issuedAtLabel: '01/06/2026',
        type: 'NFS-e'
      }
    ]
  },
  {
    id: '9103',
    kind: 'a-pagar',
    competenceLabel: 'Mai/2026',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    value: 4200,
    valueLabel: formatBrl(4200),
    status: 'Vencida',
    dueAtLabel: '10/06/2026',
    notes: 'Bloqueio parcial',
    orders: [],
    documents: []
  },
  {
    id: '9104',
    kind: 'a-pagar',
    competenceLabel: 'Jul/2026',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    value: 2750,
    valueLabel: formatBrl(2750),
    status: 'Cancelada',
    dueAtLabel: '18/07/2026',
    notes: 'Duplicidade cancelada',
    orders: [],
    documents: []
  }
]

/** Pedidos elegíveis para inclusão em nova fatura (mock). */
export interface EligibleOrderRow extends Record<string, unknown> {
  id: string
  orderId: string
  client: string
  accountId: string
  value: number
  valueLabel: string
  createdAtLabel: string
}

export const eligibleOrdersForInvoice: EligibleOrderRow[] = [
  {
    id: 'eo-1',
    orderId: '48231',
    client: 'Renner',
    accountId: 'acc-2',
    value: 890,
    valueLabel: formatBrl(890),
    createdAtLabel: '17/07/2026'
  },
  {
    id: 'eo-2',
    orderId: '48229',
    client: 'Amazon BR',
    accountId: 'acc-3',
    value: 1240,
    valueLabel: formatBrl(1240),
    createdAtLabel: '17/07/2026'
  },
  {
    id: 'eo-3',
    orderId: '48219',
    client: 'Casas Bahia',
    accountId: 'acc-1',
    value: 670.5,
    valueLabel: formatBrl(670.5),
    createdAtLabel: '16/07/2026'
  },
  {
    id: 'eo-4',
    orderId: '48208',
    client: 'Amazon BR',
    accountId: 'acc-3',
    value: 410,
    valueLabel: formatBrl(410),
    createdAtLabel: '15/07/2026'
  },
  {
    id: 'eo-5',
    orderId: '48201',
    client: 'Renner',
    accountId: 'acc-2',
    value: 320,
    valueLabel: formatBrl(320),
    createdAtLabel: '15/07/2026'
  },
  {
    id: 'eo-6',
    orderId: '48197',
    client: 'Casas Bahia',
    accountId: 'acc-1',
    value: 980,
    valueLabel: formatBrl(980),
    createdAtLabel: '14/07/2026'
  }
]

export const faturasVolumeTrendReceive: TrendPoint[] = [
  { label: 'Jan', value: 22 },
  { label: 'Fev', value: 18 },
  { label: 'Mar', value: 25 },
  { label: 'Abr', value: 31 },
  { label: 'Mai', value: 27 },
  { label: 'Jun', value: 34 },
  { label: 'Jul', value: 29 }
]

export const faturasVolumeTrendPay: TrendPoint[] = [
  { label: 'Jan', value: 14 },
  { label: 'Fev', value: 16 },
  { label: 'Mar', value: 12 },
  { label: 'Abr', value: 19 },
  { label: 'Mai', value: 21 },
  { label: 'Jun', value: 17 },
  { label: 'Jul', value: 20 }
]

export interface CreateFaturaInput {
  kind: FaturaKind
  competenceLabel: string
  accountId: string
  dueAtLabel: string
  notes: string
  orderIds: string[]
}

export function createEmptyFaturaForm(kind: FaturaKind) {
  return {
    kind,
    competenceLabel: 'Jul/2026',
    accountId: '',
    dueAtLabel: '',
    notes: ''
  }
}

export const faturasState = reactive({
  invoices: structuredClone(initialFaturas) as FaturaRow[]
})

export function listFaturasByKind(kind: FaturaKind): FaturaRow[] {
  return faturasState.invoices.filter((row) => row.kind === kind)
}

export function getFatura(id: string): FaturaRow | undefined {
  return faturasState.invoices.find((row) => row.id === id)
}

export function createFatura(input: CreateFaturaInput): FaturaRow {
  const account = faturasAccountOptions.find((item) => item.value === input.accountId)
  const selected = eligibleOrdersForInvoice.filter((order) =>
    input.orderIds.includes(order.orderId)
  )
  const value = selected.reduce((sum, order) => sum + order.value, 0)
  const prefix = input.kind === 'a-receber' ? 9200 : 9300
  const id = String(prefix + faturasState.invoices.length)

  const invoice: FaturaRow = {
    id,
    kind: input.kind,
    competenceLabel: input.competenceLabel.trim() || 'Jul/2026',
    accountId: input.accountId,
    accountName: account?.label ?? input.accountId,
    value,
    valueLabel: formatBrl(value),
    status: 'Aberta',
    dueAtLabel: input.dueAtLabel.trim() || '—',
    notes: input.notes.trim(),
    orders: selected.map((order, index) => ({
      id: `fp-new-${id}-${index}`,
      orderId: order.orderId,
      client: order.client,
      value: order.value,
      valueLabel: order.valueLabel
    })),
    documents: []
  }

  faturasState.invoices = [invoice, ...faturasState.invoices]
  return invoice
}

export { formatBrl }
