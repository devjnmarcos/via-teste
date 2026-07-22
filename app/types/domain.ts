export type StatusTone = 'neutral' | 'info' | 'assigned' | 'success' | 'warning' | 'danger'

export type StatusKey =
  | 'new'
  | 'supportMissing'
  | 'assigned'
  | 'stock'
  | 'backOrder'
  | 'route'
  | 'done'
  | 'occurrence'
  | 'cancelled'

export type StageKey = 'new' | 'supportMissing' | 'assigned' | 'route' | 'done'

export interface StatusDefinition {
  label: string
  tone: StatusTone
  color: string
}

export const statusMeta: Record<StatusKey, StatusDefinition> = {
  new: { label: 'Não processado', tone: 'neutral', color: 'var(--via-subtle)' },
  supportMissing: { label: 'Ponto de apoio não identificado', tone: 'warning', color: 'var(--via-amber)' },
  assigned: { label: 'Atribuído', tone: 'assigned', color: 'var(--via-violet)' },
  stock: { label: 'Em estoque', tone: 'neutral', color: 'var(--via-subtle)' },
  backOrder: { label: 'Back Order', tone: 'warning', color: 'var(--via-amber)' },
  route: { label: 'Em rota', tone: 'info', color: 'var(--via-blue)' },
  done: { label: 'Concluído', tone: 'success', color: 'var(--via-green)' },
  occurrence: { label: 'Ocorrência', tone: 'danger', color: 'var(--via-red)' },
  cancelled: { label: 'Cancelado', tone: 'danger', color: 'var(--via-red)' }
}

export interface Metric {
  label: string
  value: string | number
  note: string
  icon?: string
  tone?: StatusTone
  /** Deep-link opcional (ex.: acompanhamento → listagem filtrada). */
  to?: string
}

export interface OperationStage {
  key: StageKey
  label: string
  count: number
  share: number
  progress: number
  color: string
}

export interface OperationClient {
  name: string
  account: string
  total: number
  route: number
  occurrences: number
  sla: string
  slaTone: StatusTone
  productivity: string
}

export interface Operation {
  slug: string
  name: string
  note: string
  clientsCount: number
  total: number
  completedToday: number
  occurrences: number
  productivity: string
  riskTone: StatusTone
  flow: Record<StageKey, number>
}

export interface TrendPoint {
  label: string
  value: number
}

export interface OrderEvent {
  time: string
  name: string
  description: string
  tone: StatusTone
}

export interface Establishment {
  role: 'Origem' | 'Ponto de apoio' | 'Destino'
  name: string
  detail: string
}

export interface Order {
  id: string
  href: string
  client: string
  operation: string
  state: string
  status: StatusKey
  statusLabel?: string
  supportPoint: string
  responsible: string
  region: string
  createdAt: string
  updatedAt: string
  stageDuration: string
  sla: string
  slaTone: StatusTone
  /** Etiqueta 100×150mm já gerada para este pedido (bloqueia "Gerar etiqueta" em lote). */
  labelPrinted?: boolean
  /** Pedido elegível para disparo de template de chatbot em lote. */
  chatbotEligible?: boolean
  items: number
  occurrences: number
  evidences: number
  scheduling: number
  document?: string
  externalOrder?: string
  address?: string
  transporter?: string
  events: OrderEvent[]
  establishments: Establishment[]
}

export interface AttentionItem {
  orderId: string
  status: StatusKey
  label?: string
  description: string
  timing: string
}

/** Abas do detalhe do pedido (além da visão geral). */
export type OrderDetailTabId =
  | 'overview'
  | 'items'
  | 'occurrences'
  | 'evidences'
  | 'materials'
  | 'barcodes'
  | 'scheduling'
  | 'history'

export interface OrderItem {
  id: string
  description: string
  serialNumber: string
  manufacturer: string
  category: string
  quantity: number
  price: string
  weightKg: string
}

export interface OrderOccurrence {
  id: string
  description: string
  happenedAt: string
  origin: string
  createdAt: string
  tone: StatusTone
  canRemove?: boolean
}

export interface OrderEvidence {
  id: string
  filename: string
  kind: 'foto' | 'documento' | 'assinatura'
  localization: string
  createdAt: string
  author: string
}

export interface OrderMaterial extends Record<string, unknown> {
  id: string
  productName: string
  quantity: number
}

export interface OrderBarcode {
  id: string
  barcode: string
  localization: string
  createdAt: string
}

export interface OrderLockerInfo {
  expeditionAt: string
  expeditionExtId: string
  expeditionQrcode: string
  removalAt: string
  removalExtCode: string
  removalQrcode: string
}

export interface OrderFiscalDocument {
  number: string
  series: string
  orderId: string
  accessKey: string
  volumeAmount: string
  value: string
  itemsValue: string
  emissionDate: string
}

export interface OrderSchedulingSlot {
  id: string
  scheduledFor: string
  window: string
  status: string
  channel: string
  note: string
  tone: StatusTone
}

export interface OrderHistoryEntry {
  id: string
  createdAt: string
  description: string
  username: string
}

export interface OrderDetailBundle {
  orderId: string
  items: OrderItem[]
  occurrences: OrderOccurrence[]
  evidences: OrderEvidence[]
  materials: OrderMaterial[]
  barcodes: OrderBarcode[]
  locker: OrderLockerInfo | null
  fiscal: OrderFiscalDocument | null
  scheduling: OrderSchedulingSlot[]
  history: OrderHistoryEntry[]
}

export type CadastroKind =
  | 'sla'
  | 'fretes'
  | 'empresas'
  | 'contas'
  | 'usuarios'
  | 'aprovacoes-pas'
  | 'ocorrencias'
  | 'operacoes'
  | 'regioes'
  | 'feriados'
  | 'produtos'
  | 'templates-chatbot'

export interface CadastroNavItem {
  kind: CadastroKind
  label: string
  to: string
  icon: string
  description: string
  /** true = piloto implementado; false = stub da onda */
  ready?: boolean
}

export interface CadastroRow {
  id: string
  href: string
  primary: string
  secondary: string
  tertiary: string
  status: string
  statusTone: StatusTone
  meta?: string
}

export interface CadastroColumn {
  key: 'primary' | 'secondary' | 'tertiary' | 'status' | 'meta'
  label: string
}

export interface CadastroFormField {
  key: string
  label: string
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'date'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  value?: string
}

