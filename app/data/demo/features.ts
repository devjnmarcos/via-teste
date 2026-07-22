/**
 * Fixtures — Feature Flags (Cadastros → Feature Flags).
 * Entidade Feature + vínculo N:N com Operador (kind 'contas' em cadastros-onda3.ts).
 * Não referencia Usuários/Papel — vínculo é só com Operador.
 */
import type { Metric } from '../../types/domain'
import type { StackedSeriesPoint } from '../../types/dashboard-reversa'
import { getCadastroOnda3Rows } from './cadastros-onda3'

export interface Feature {
  id: string
  name: string
  code: string
  description: string
  active: boolean
  createdAt: string
}

export interface FeatureOperatorLink {
  id: string
  featureId: string
  accountId: string
  active: boolean
  linkedAt: string
}

const featuresSeed: Feature[] = [
  { id: 'feat-1', name: 'Habilitar empresa', code: 'enable_company', description: 'Libera o módulo de gestão de empresas para o operador.', active: true, createdAt: '02/01/2025' },
  { id: 'feat-2', name: 'Chatbot reversa', code: 'enable_chatbot_reversa', description: 'Dispara templates de chatbot no fluxo de reversa.', active: true, createdAt: '14/02/2025' },
  { id: 'feat-3', name: 'Otimização de rota', code: 'enable_route_optimizer', description: 'Ativa o roteirizador automático para o operador.', active: true, createdAt: '03/03/2025' },
  { id: 'feat-4', name: 'Retirada em locker', code: 'enable_locker_pickup', description: 'Permite agendamento de retirada em locker.', active: false, createdAt: '20/04/2025' },
  { id: 'feat-5', name: 'Multi-transportadora', code: 'enable_multi_carrier', description: 'Permite mais de uma transportadora por operação.', active: true, createdAt: '11/05/2025' },
  { id: 'feat-6', name: 'Analytics de SLA', code: 'enable_sla_analytics', description: 'Exibe os painéis avançados de SLA para o operador.', active: true, createdAt: '09/06/2025' }
]

const linksSeed: FeatureOperatorLink[] = [
  { id: 'flk-1', featureId: 'feat-1', accountId: 'cta-1', active: true, linkedAt: '05/01/2025' },
  { id: 'flk-2', featureId: 'feat-1', accountId: 'cta-2', active: true, linkedAt: '06/01/2025' },
  { id: 'flk-3', featureId: 'feat-2', accountId: 'cta-1', active: true, linkedAt: '15/02/2025' },
  { id: 'flk-4', featureId: 'feat-3', accountId: 'cta-2', active: false, linkedAt: '04/03/2025' },
  { id: 'flk-5', featureId: 'feat-3', accountId: 'cta-3', active: true, linkedAt: '05/03/2025' },
  { id: 'flk-6', featureId: 'feat-5', accountId: 'cta-1', active: true, linkedAt: '12/05/2025' },
  { id: 'flk-7', featureId: 'feat-5', accountId: 'cta-3', active: true, linkedAt: '13/05/2025' }
]

let featuresStore: Feature[] = structuredClone(featuresSeed)
let linksStore: FeatureOperatorLink[] = structuredClone(linksSeed)

export function getFeatures(): Feature[] {
  return featuresStore
}

export function setFeatures(rows: Feature[]) {
  featuresStore = structuredClone(rows)
}

export function createEmptyFeature(): Omit<Feature, 'id'> {
  return {
    name: '',
    code: '',
    description: '',
    active: true,
    createdAt: new Date().toLocaleDateString('pt-BR')
  }
}

export function getFeatureLinks(featureId: string): FeatureOperatorLink[] {
  return linksStore.filter((link) => link.featureId === featureId)
}

export function setFeatureLinks(featureId: string, rows: FeatureOperatorLink[]) {
  linksStore = [
    ...linksStore.filter((link) => link.featureId !== featureId),
    ...structuredClone(rows)
  ]
}

export function createEmptyFeatureLink(featureId: string): Omit<FeatureOperatorLink, 'id'> {
  const firstAccount = getCadastroOnda3Rows('contas')[0]
  return {
    featureId,
    accountId: firstAccount ? firstAccount.id : '',
    active: true,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }
}

export function featureOperatorOptions(): { label: string; value: string }[] {
  return getCadastroOnda3Rows('contas').map((row) => ({ label: row.name, value: row.id }))
}

export function resolveOperatorLabel(accountId: string): string {
  const row = getCadastroOnda3Rows('contas').find((item) => item.id === accountId)
  return row?.name ?? accountId
}

export function linkedOperatorsCount(featureId: string): number {
  return linksStore.filter((link) => link.featureId === featureId).length
}

export function linkedOperatorsActiveCount(featureId: string): number {
  return linksStore.filter((link) => link.featureId === featureId && link.active).length
}

export function buildFeaturesMetrics(rows: Feature[]): Metric[] {
  const active = rows.filter((row) => row.active).length
  const inactive = rows.length - active
  const operatorsWithFeature = new Set(
    linksStore
      .filter((link) => rows.some((row) => row.id === link.featureId))
      .map((link) => link.accountId)
  ).size

  return [
    { label: 'Features', value: rows.length, note: 'cadastradas', icon: 'i-lucide-flag' },
    { label: 'Ativas', value: active, note: 'habilitadas', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Inativas', value: inactive, note: 'desabilitadas', icon: 'i-lucide-circle-off', tone: inactive > 0 ? 'warning' : undefined },
    { label: 'Operadores', value: operatorsWithFeature, note: 'com ao menos 1 feature', icon: 'i-lucide-wallet-cards' }
  ]
}

export function buildFeatureRankingSeries(rows: Feature[]): StackedSeriesPoint[] {
  return rows
    .map((feature) => {
      const links = getFeatureLinks(feature.id)
      return {
        label: feature.name,
        vol: links.filter((link) => link.active).length,
        invol: links.filter((link) => !link.active).length
      }
    })
    .sort((a, b) => (b.vol + b.invol) - (a.vol + a.invol))
}

export function featureAdoptionCounts(rows: Feature[]): { withOperators: number; withoutOperators: number } {
  const withOperators = rows.filter((feature) => getFeatureLinks(feature.id).length > 0).length
  return { withOperators, withoutOperators: rows.length - withOperators }
}

export function buildFeatureDetailMetrics(feature: Feature, links: FeatureOperatorLink[]): Metric[] {
  const active = links.filter((link) => link.active).length
  const inactive = links.length - active
  return [
    { label: 'Operadores', value: links.length, note: 'vinculados a esta feature', icon: 'i-lucide-wallet-cards' },
    { label: 'Ativos', value: active, note: 'vínculo habilitado', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Inativos', value: inactive, note: 'vínculo desabilitado', icon: 'i-lucide-circle-off', tone: inactive > 0 ? 'warning' : undefined }
  ]
}
