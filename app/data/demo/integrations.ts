/**
 * Fixtures — Integrações (Configurações → Integrações) e histórico (Gestão → Logs → Integração).
 * Substitui a antiga tela "Externos" (app/pages/configuracoes/externos.vue, removida).
 * Modelo novo (não existe hoje nem no front nem na API legado) — desenhado a partir das colunas
 * soltas por provedor em Account (intelipost_*, rapido_latina_*, tracken_*, oi_api_*,
 * integration_toutbox_*, integration_spotcon_*) e da config global em ModuleConfiguration
 * (Frete Rápido, VTEX, Kangu) do ViaReversa_Api.
 */
import type { Metric, StatusTone } from '../../types/domain'
import { getCadastroOnda3Rows } from './cadastros-onda3'

export type IntegrationKind = 'transportadora' | 'marketplace' | 'chatbot' | 'geolocalizacao' | 'pagamento' | 'outro'

export interface Integration {
  id: string
  provider: string
  kind: IntegrationKind
  label: string
  active: boolean
  createdAt: string
}

export interface IntegrationOperator {
  id: string
  integrationId: string
  accountId: string
  apiKeyMasked: string
  config: Record<string, unknown>
  active: boolean
  lastSyncLabel: string
}

export type IntegrationOrderStatus = 'pendente' | 'enviado' | 'erro' | 'concluido'

export interface IntegrationOrder {
  id: string
  integrationId: string
  orderId: string
  status: IntegrationOrderStatus
  errorMessage?: string
  requestedAt: string
  respondedAt?: string
}

export const integrationKindLabels: Record<IntegrationKind, string> = {
  transportadora: 'Transportadora',
  marketplace: 'Marketplace',
  chatbot: 'Chatbot',
  geolocalizacao: 'Geolocalização',
  pagamento: 'Pagamento',
  outro: 'Outro'
}

export const integrationKindOptions: { label: string; value: IntegrationKind }[] = (
  Object.entries(integrationKindLabels) as [IntegrationKind, string][]
).map(([value, label]) => ({ label, value }))

export const integrationOrderStatusMeta: Record<IntegrationOrderStatus, { label: string; icon: string; tone?: StatusTone }> = {
  pendente: { label: 'Pendente', icon: 'i-lucide-clock', tone: 'warning' },
  enviado: { label: 'Enviado', icon: 'i-lucide-send', tone: 'info' },
  erro: { label: 'Erro', icon: 'i-lucide-circle-alert', tone: 'danger' },
  concluido: { label: 'Concluído', icon: 'i-lucide-circle-check', tone: 'success' }
}

const integrationsSeed: Integration[] = [
  { id: 'int-1', provider: 'Toutbox', kind: 'transportadora', label: 'Toutbox · Reversa', active: true, createdAt: '02/03/2024' },
  { id: 'int-2', provider: 'Kangu', kind: 'transportadora', label: 'Kangu · Frete nacional', active: true, createdAt: '14/05/2024' },
  { id: 'int-3', provider: 'Intelipost', kind: 'transportadora', label: 'Intelipost · Rastreio', active: true, createdAt: '20/06/2024' },
  { id: 'int-4', provider: 'Rápido Latina', kind: 'transportadora', label: 'Rápido Latina · Sul', active: false, createdAt: '11/08/2024' },
  { id: 'int-5', provider: 'Tracken', kind: 'geolocalizacao', label: 'Tracken · Localização', active: true, createdAt: '03/09/2024' },
  { id: 'int-6', provider: 'Spotcon', kind: 'geolocalizacao', label: 'Spotcon · Geocode', active: true, createdAt: '05/11/2024' },
  { id: 'int-7', provider: 'VTEX', kind: 'marketplace', label: 'VTEX · Pedidos loja', active: true, createdAt: '18/01/2025' },
  { id: 'int-8', provider: 'Chatbot', kind: 'chatbot', label: 'Chatbot · Disparo WhatsApp', active: true, createdAt: '27/02/2025' }
]

const operatorsSeed: IntegrationOperator[] = [
  { id: 'iop-1', integrationId: 'int-1', accountId: 'cta-1', apiKeyMasked: 'tb_••••••••91fa', config: { workingDays: 5 }, active: true, lastSyncLabel: '18/07 10:40' },
  { id: 'iop-2', integrationId: 'int-2', accountId: 'cta-2', apiKeyMasked: 'kg_••••••••7b11', config: {}, active: false, lastSyncLabel: '16/07 14:20' },
  { id: 'iop-3', integrationId: 'int-3', accountId: 'cta-1', apiKeyMasked: 'il_••••••••c4e2', config: { sendOccurrences: true }, active: true, lastSyncLabel: '18/07 08:12' },
  { id: 'iop-4', integrationId: 'int-3', accountId: 'cta-3', apiKeyMasked: 'il_••••••••2290', config: { sendOccurrences: false }, active: true, lastSyncLabel: '17/07 09:30' },
  { id: 'iop-5', integrationId: 'int-5', accountId: 'cta-2', apiKeyMasked: 'tk_••••••••55d1', config: {}, active: true, lastSyncLabel: '15/07 22:05' },
  { id: 'iop-6', integrationId: 'int-7', accountId: 'cta-3', apiKeyMasked: 'vt_••••••••a001', config: { store: 'amazon-br' }, active: true, lastSyncLabel: '19/07 07:15' }
]

const ordersSeed: IntegrationOrder[] = [
  { id: 'ord-1', integrationId: 'int-1', orderId: '48224', status: 'concluido', requestedAt: '18/07 09:00', respondedAt: '18/07 09:02' },
  { id: 'ord-2', integrationId: 'int-1', orderId: '48310', status: 'pendente', requestedAt: '18/07 11:20' },
  { id: 'ord-3', integrationId: 'int-2', orderId: '48355', status: 'enviado', requestedAt: '18/07 10:05' },
  { id: 'ord-4', integrationId: 'int-2', orderId: '48360', status: 'erro', errorMessage: 'CEP não localizado pela transportadora', requestedAt: '18/07 09:40', respondedAt: '18/07 09:41' },
  { id: 'ord-5', integrationId: 'int-3', orderId: '48372', status: 'concluido', requestedAt: '17/07 16:00', respondedAt: '17/07 16:03' },
  { id: 'ord-6', integrationId: 'int-3', orderId: '48390', status: 'erro', errorMessage: 'Token de autenticação expirado', requestedAt: '17/07 15:10', respondedAt: '17/07 15:11' },
  { id: 'ord-7', integrationId: 'int-6', orderId: '48401', status: 'pendente', requestedAt: '18/07 12:00' },
  { id: 'ord-8', integrationId: 'int-7', orderId: '48415', status: 'enviado', requestedAt: '18/07 13:10' }
]

let integrationsStore: Integration[] = structuredClone(integrationsSeed)
let operatorsStore: IntegrationOperator[] = structuredClone(operatorsSeed)
const ordersStore: IntegrationOrder[] = structuredClone(ordersSeed)

export function getIntegrations(): Integration[] {
  return integrationsStore
}

export function setIntegrations(rows: Integration[]) {
  integrationsStore = structuredClone(rows)
}

export function createEmptyIntegration(): Omit<Integration, 'id'> {
  return {
    provider: '',
    kind: 'transportadora',
    label: '',
    active: true,
    createdAt: new Date().toLocaleDateString('pt-BR')
  }
}

export function buildIntegrationsMetrics(rows: Integration[]): Metric[] {
  const active = rows.filter((row) => row.active).length
  return [
    { label: 'Integrações', value: rows.length, note: 'cadastradas', icon: 'i-lucide-plug' },
    { label: 'Ativas', value: active, note: 'em uso', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Inativas', value: rows.length - active, note: 'pausadas', icon: 'i-lucide-pause-circle', tone: rows.length - active > 0 ? 'warning' : undefined }
  ]
}

export function getIntegrationOperators(integrationId: string): IntegrationOperator[] {
  return operatorsStore.filter((op) => op.integrationId === integrationId)
}

export function setIntegrationOperators(integrationId: string, rows: IntegrationOperator[]) {
  operatorsStore = [
    ...operatorsStore.filter((op) => op.integrationId !== integrationId),
    ...structuredClone(rows)
  ]
}

export function createEmptyIntegrationOperator(integrationId: string): Omit<IntegrationOperator, 'id'> {
  const firstAccount = getCadastroOnda3Rows('contas')[0]
  return {
    integrationId,
    accountId: firstAccount ? firstAccount.id : '',
    apiKeyMasked: '',
    config: {},
    active: true,
    lastSyncLabel: 'Nunca sincronizado'
  }
}

export function integrationAccountOptions(): { label: string; value: string }[] {
  return getCadastroOnda3Rows('contas').map((row) => ({ label: row.name, value: row.id }))
}

export function resolveAccountLabel(accountId: string): string {
  const row = getCadastroOnda3Rows('contas').find((item) => item.id === accountId)
  return row?.name ?? accountId
}

export function getIntegrationOrders(): IntegrationOrder[] {
  return ordersStore
}

export function buildIntegrationOrdersMetrics(rows: IntegrationOrder[]): Metric[] {
  const pendente = rows.filter((row) => row.status === 'pendente').length
  const enviado = rows.filter((row) => row.status === 'enviado').length
  const erro = rows.filter((row) => row.status === 'erro').length
  const concluido = rows.filter((row) => row.status === 'concluido').length
  return [
    { label: 'Pendentes', value: pendente, note: 'na fila', icon: 'i-lucide-clock', tone: pendente > 0 ? 'warning' : undefined },
    { label: 'Enviados', value: enviado, note: 'aguardando resposta', icon: 'i-lucide-send' },
    { label: 'Erros', value: erro, note: 'falharam', icon: 'i-lucide-circle-alert', tone: erro > 0 ? 'danger' : undefined },
    { label: 'Concluídos', value: concluido, note: 'finalizados', icon: 'i-lucide-circle-check', tone: 'success' }
  ]
}
