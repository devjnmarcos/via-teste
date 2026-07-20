/**
 * Fixtures de compartilhamento / superfícies públicas.
 */

export interface PublicOrderSummary {
  hash: string
  orderId: string
  client: string
  statusLabel: string
  accountName: string
  supportPoint: string
  scheduledLabel: string
  addressSnippet: string
}

export interface PublicBoxSummary {
  id: string
  orderId: string
  itemsCount: number
  weightKg: number
  statusLabel: string
}

export interface PublicScheduleSlot {
  id: string
  label: string
  available: boolean
}

export interface PublicCheckoutSession {
  token: string
  orderId: string
  carrier: string
  amountLabel: string
  status: 'pending' | 'paid' | 'expired'
  statusLabel: string
}

const publicOrders: Record<string, PublicOrderSummary> = {
  abc123: {
    hash: 'abc123',
    orderId: '53101',
    client: 'Ana Souza',
    statusLabel: 'Agendado',
    accountName: 'Casas Bahia · Nacional',
    supportPoint: 'PA Centro · SP',
    scheduledLabel: '20/07 · 14h–18h',
    addressSnippet: 'Rua das Flores, 120 — Centro/SP'
  },
  def456: {
    hash: 'def456',
    orderId: '53102',
    client: 'Bruno Lima',
    statusLabel: 'Em rota',
    accountName: 'Renner · Sul',
    supportPoint: 'PA Porto Alegre · RS',
    scheduledLabel: '19/07 · 09h–12h',
    addressSnippet: 'Av. Ipiranga, 900 — Centro/RS'
  }
}

const publicBoxes: Record<string, PublicBoxSummary> = {
  'bx-8801': {
    id: 'bx-8801',
    orderId: '53101',
    itemsCount: 3,
    weightKg: 4.2,
    statusLabel: 'Pronto para coleta'
  },
  'bx-8802': {
    id: 'bx-8802',
    orderId: '53102',
    itemsCount: 1,
    weightKg: 1.1,
    statusLabel: 'Etiqueta gerada'
  }
}

export const publicScheduleSlots: PublicScheduleSlot[] = [
  { id: 'slot-1', label: '19/07 · 09h–12h', available: true },
  { id: 'slot-2', label: '19/07 · 14h–18h', available: true },
  { id: 'slot-3', label: '20/07 · 09h–12h', available: false },
  { id: 'slot-4', label: '20/07 · 14h–18h', available: true }
]

export const publicCheckoutSessions: Record<string, PublicCheckoutSession> = {
  'kangu-demo': {
    token: 'kangu-demo',
    orderId: '53110',
    carrier: 'Kangu',
    amountLabel: 'R$ 18,90',
    status: 'pending',
    statusLabel: 'Aguardando pagamento'
  }
}

export function searchPublicOrder(query: string): PublicOrderSummary | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const byHash = publicOrders[q]
  if (byHash) return { ...byHash }
  const byOrder = Object.values(publicOrders).find(
    (item) => item.orderId === q || item.orderId.toLowerCase() === q
  )
  return byOrder ? { ...byOrder } : null
}

export function getPublicOrderByHash(hash: string): PublicOrderSummary | null {
  const found = publicOrders[hash]
  return found ? { ...found } : null
}

export function getPublicBox(id: string): PublicBoxSummary | null {
  const found = publicBoxes[id]
  return found ? { ...found } : null
}

export function confirmPublicSchedule(token: string, slotId: string): PublicScheduleSlot | null {
  if (!token.trim()) return null
  const slot = publicScheduleSlots.find((item) => item.id === slotId && item.available)
  return slot ? { ...slot } : null
}

export function payPublicCheckout(token: string): PublicCheckoutSession | null {
  const session = publicCheckoutSessions[token]
  if (!session || session.status !== 'pending') return null
  session.status = 'paid'
  session.statusLabel = 'Pago'
  return { ...session }
}
