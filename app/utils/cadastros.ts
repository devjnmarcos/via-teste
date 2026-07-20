import type { CadastroKind } from '../types/domain'
import { cadastroNavItems } from '../data/demo/cadastros'

const KIND_SET = new Set(cadastroNavItems.map((item) => item.kind))

export function isCadastroKind(value: string): value is CadastroKind {
  return KIND_SET.has(value as CadastroKind)
}

export function resolveCadastroKind(param: string | string[] | undefined): CadastroKind | null {
  const value = Array.isArray(param) ? param[0] : param
  if (!value || !isCadastroKind(value)) return null
  return value
}
