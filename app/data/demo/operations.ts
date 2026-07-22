import type { Metric, Operation, OperationClient, OperationStage, TrendPoint } from '../../types/domain'
import { statusMeta } from '../../types/domain'

export const operationStages: OperationStage[] = [
  { key: 'new', label: statusMeta.new.label, count: 14, share: 7, progress: 25, color: statusMeta.new.color },
  { key: 'supportMissing', label: statusMeta.supportMissing.label, count: 10, share: 5, progress: 18, color: statusMeta.supportMissing.color },
  { key: 'assigned', label: statusMeta.assigned.label, count: 28, share: 14, progress: 50, color: statusMeta.assigned.color },
  { key: 'route', label: statusMeta.route.label, count: 53, share: 27, progress: 78, color: statusMeta.route.color },
  { key: 'done', label: 'Concluído hoje', count: 93, share: 47, progress: 100, color: statusMeta.done.color }
]

export const operations: Operation[] = [
  {
    slug: 'logistica-reversa',
    name: 'Logística Reversa',
    note: '12 clientes ativos',
    clientsCount: 12,
    total: 198,
    completedToday: 112,
    occurrences: 3,
    productivity: '97%',
    riskTone: 'danger',
    flow: { new: 7, supportMissing: 5, assigned: 14, route: 27, done: 47 }
  },
  {
    slug: 'weelog',
    name: 'Weelog',
    note: '8 clientes ativos',
    clientsCount: 8,
    total: 134,
    completedToday: 68,
    occurrences: 0,
    productivity: '99%',
    riskTone: 'success',
    flow: { new: 9, supportMissing: 4, assigned: 16, route: 31, done: 40 }
  },
  {
    slug: 'entrega-em-lote',
    name: 'Entrega em Lote',
    note: '6 clientes ativos',
    clientsCount: 6,
    total: 96,
    completedToday: 46,
    occurrences: 2,
    productivity: '96%',
    riskTone: 'warning',
    flow: { new: 5, supportMissing: 9, assigned: 15, route: 32, done: 39 }
  },
  {
    slug: 'entrega-expressa',
    name: 'Entrega Expressa',
    note: '5 clientes ativos',
    clientsCount: 5,
    total: 78,
    completedToday: 41,
    occurrences: 0,
    productivity: '100%',
    riskTone: 'success',
    flow: { new: 7, supportMissing: 3, assigned: 12, route: 25, done: 53 }
  },
  {
    slug: 'logistica-incremental',
    name: 'Logística Incremental',
    note: '4 clientes ativos',
    clientsCount: 4,
    total: 61,
    completedToday: 27,
    occurrences: 2,
    productivity: '93%',
    riskTone: 'danger',
    flow: { new: 11, supportMissing: 9, assigned: 19, route: 29, done: 32 }
  },
  {
    slug: 'store',
    name: 'Store',
    note: '3 clientes ativos',
    clientsCount: 3,
    total: 42,
    completedToday: 18,
    occurrences: 0,
    productivity: '100%',
    riskTone: 'success',
    flow: { new: 5, supportMissing: 2, assigned: 8, route: 20, done: 65 }
  }
]

export const totalOrders = operations.reduce((sum, operation) => sum + operation.total, 0)

export interface OperationFilterOption {
  label: string
  value: string
}

export const operationFilterOptions: OperationFilterOption[] = [
  { label: 'Todas as operações', value: 'all' },
  ...operations.map((operation) => ({ label: operation.name, value: operation.slug }))
]

export function operationVolumeRatio(operationSlug: string): number {
  if (operationSlug === 'all') return 1
  const operation = operations.find((item) => item.slug === operationSlug)
  if (!operation || totalOrders === 0) return 1
  return operation.total / totalOrders
}

export const homeMetrics: Metric[] = [
  { label: 'Pedidos no fluxo', value: totalOrders, note: 'todas as operações', icon: 'i-lucide-package-search', tone: 'info' },
  { label: 'Em rota agora', value: 146, note: '96 coletas em andamento', icon: 'i-lucide-route', tone: 'info' },
  { label: 'Ocorrências hoje', value: 7, note: '3 fora do SLA', icon: 'i-lucide-triangle-alert', tone: 'danger' },
  { label: 'Produtividade média', value: '97%', note: '+2 p.p. no período', icon: 'i-lucide-gauge', tone: 'success' }
]

export const operationMetrics: Metric[] = [
  { label: 'Pedidos no fluxo', value: 198, note: 'nesta operação', icon: 'i-lucide-package-search', tone: 'info' },
  { label: 'Aguardando distribuição', value: 10, note: '5% do fluxo', icon: 'i-lucide-map-pin-off', tone: 'warning' },
  { label: 'Em rota', value: 53, note: '27% do fluxo', icon: 'i-lucide-route', tone: 'info' },
  { label: 'Concluídos hoje', value: 112, note: '+9% desde ontem', icon: 'i-lucide-circle-check', tone: 'success' },
  { label: 'Ocorrências hoje', value: 3, note: '1 fora do SLA', icon: 'i-lucide-triangle-alert', tone: 'danger' }
]

export const trendSeries: TrendPoint[] = [
  { label: 'Qua', value: 31 },
  { label: 'Qui', value: 43 },
  { label: 'Sex', value: 39 },
  { label: 'Sáb', value: 68 },
  { label: 'Dom', value: 51 },
  { label: 'Seg', value: 86 },
  { label: 'Ter', value: 95 }
]

export const operationClients: OperationClient[] = [
  { name: 'Casas Bahia', account: 'Conta principal · SP', total: 42, route: 13, occurrences: 2, sla: 'Em risco', slaTone: 'warning', productivity: '94%' },
  { name: 'Renner', account: 'Conta varejo · Sul', total: 36, route: 11, occurrences: 1, sla: 'Saudável', slaTone: 'success', productivity: '98%' },
  { name: 'Amazon BR', account: 'Marketplace · SP', total: 31, route: 9, occurrences: 0, sla: 'Saudável', slaTone: 'success', productivity: '99%' },
  { name: 'Netshoes', account: 'Conta esportes · PR', total: 27, route: 8, occurrences: 0, sla: 'Saudável', slaTone: 'success', productivity: '97%' },
  { name: 'Centauro', account: 'Conta esportes · SP', total: 21, route: 6, occurrences: 0, sla: 'Atenção', slaTone: 'warning', productivity: '95%' }
]

export const periodSummary = [
  { value: '+8%', label: 'volume comparado à semana anterior' },
  { value: '−12%', label: 'ocorrências no período' },
  { value: '38', label: 'clientes ativos' },
  { value: '18', label: 'aguardando ponto de apoio' }
]
