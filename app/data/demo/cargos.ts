/**
 * Fixtures — Cargos (Cadastros → Cargos).
 * Entidade Cargo + vínculo N:N com Usuário (kind 'usuarios' em cadastros-onda3.ts).
 * Aditivo ao campo Papel (meta) do formulário de Usuários — não substitui nem remove Papel.
 */
import type { Metric } from '../../types/domain'
import type { CadastroOnda3Row } from './cadastros-onda3'
import { getCadastroOnda3Rows } from './cadastros-onda3'

export interface Cargo {
  id: string
  name: string
  detail: string
  active: boolean
  createdAt: string
}

export interface CargoUserLink {
  id: string
  cargoId: string
  userId: string
  linkedAt: string
}

const cargosSeed: Cargo[] = [
  { id: 'cgo-1', name: 'Coordenador de Operações', detail: 'Responde pela operação diária do ponto de apoio.', active: true, createdAt: '08/01/2025' },
  { id: 'cgo-2', name: 'Analista de SLA', detail: 'Acompanha indicadores de atendimento e prazo.', active: true, createdAt: '19/02/2025' },
  { id: 'cgo-3', name: 'Auxiliar de Backoffice', detail: 'Suporte administrativo e cadastro.', active: true, createdAt: '02/03/2025' },
  { id: 'cgo-4', name: 'Supervisor de Rota', detail: 'Planeja e acompanha roteirização.', active: false, createdAt: '25/04/2025' }
]

const linksSeed: CargoUserLink[] = [
  { id: 'cul-1', cargoId: 'cgo-1', userId: 'usr-1', linkedAt: '10/01/2025' },
  { id: 'cul-2', cargoId: 'cgo-2', userId: 'usr-2', linkedAt: '11/01/2025' },
  { id: 'cul-3', cargoId: 'cgo-2', userId: 'usr-3', linkedAt: '12/01/2025' },
  { id: 'cul-4', cargoId: 'cgo-3', userId: 'usr-1', linkedAt: '13/01/2025' }
]

let cargosStore: Cargo[] = structuredClone(cargosSeed)
let linksStore: CargoUserLink[] = structuredClone(linksSeed)

export function getCargos(): Cargo[] {
  return cargosStore
}

export function setCargos(rows: Cargo[]) {
  cargosStore = structuredClone(rows)
}

export function createEmptyCargo(): Omit<Cargo, 'id'> {
  return { name: '', detail: '', active: true, createdAt: new Date().toLocaleDateString('pt-BR') }
}

export function getCargoLinks(cargoId: string): CargoUserLink[] {
  return linksStore.filter((link) => link.cargoId === cargoId)
}

export function setCargoLinks(cargoId: string, rows: CargoUserLink[]) {
  linksStore = [
    ...linksStore.filter((link) => link.cargoId !== cargoId),
    ...structuredClone(rows)
  ]
}

export function createEmptyCargoLink(cargoId: string): Omit<CargoUserLink, 'id'> {
  const firstUser = getCadastroOnda3Rows('usuarios')[0]
  return {
    cargoId,
    userId: firstUser ? firstUser.id : '',
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }
}

export function cargoUserOptions(): { label: string; value: string }[] {
  return getCadastroOnda3Rows('usuarios').map((row) => ({ label: row.name, value: row.id }))
}

export function resolveUserLabel(userId: string): string {
  const row = getCadastroOnda3Rows('usuarios').find((item) => item.id === userId)
  return row?.name ?? userId
}

export function linkedUsersCount(cargoId: string): number {
  return linksStore.filter((link) => link.cargoId === cargoId).length
}

export function buildCargosMetrics(rows: Cargo[]): Metric[] {
  const totalLinks = linksStore.filter((link) => rows.some((row) => row.id === link.cargoId)).length
  return [
    { label: 'Cargos', value: rows.length, note: 'cadastrados', icon: 'i-lucide-id-card', tone: 'info' },
    { label: 'Vínculos', value: totalLinks, note: 'usuário × cargo', icon: 'i-lucide-users', tone: 'assigned' }
  ]
}

export function buildCargoDetailMetrics(cargo: Cargo, linkedUsers: CadastroOnda3Row[]): Metric[] {
  const active = linkedUsers.filter((row) => row.active).length
  const inactive = linkedUsers.length - active
  return [
    { label: 'Usuários', value: linkedUsers.length, note: 'vinculados a este cargo', icon: 'i-lucide-users', tone: 'assigned' },
    { label: 'Ativos', value: active, note: 'usuário ativo', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Inativos', value: inactive, note: 'usuário inativo', icon: 'i-lucide-circle-off', tone: inactive > 0 ? 'warning' : undefined }
  ]
}
