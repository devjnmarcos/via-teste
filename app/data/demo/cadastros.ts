import type { CadastroKind, CadastroNavItem } from '../../types/domain'
import { cadastrosNavigation } from '../../components/app/navigation'

/**
 * Catálogo dos 12 cadastros (mesma ordem/labels do legado).
 * SLA, Fretes e Onda 3 implementados com DataTable + AppModal.
 */
const descriptions: Record<CadastroKind, string> = {
  sla: 'Tabelas de SLA por conta, corte e termos',
  fretes: 'Tabelas de preço de frete por origem e limites',
  empresas: 'Empresas internas e clientes do ecossistema',
  contas: 'Contas vinculadas a empresas e escopos operacionais',
  usuarios: 'Acessos, papéis e aprovação de cadastro',
  'aprovacoes-pas': 'Fila de aprovação de pontos de apoio / transportadores',
  ocorrencias: 'Catálogo interno de tipos de ocorrência',
  operacoes: 'Catálogo de tipos e naturezas de operação (reversa, direta, marketplace)',
  regioes: 'Grupos e regiões de atendimento',
  feriados: 'Calendário operacional e impacto em SLA',
  produtos: 'Catálogo de produtos usados em itens de pedido',
  'templates-chatbot': 'Modelos de mensagem do chatbot'
}

const readyKinds = new Set<CadastroKind>([
  'sla',
  'fretes',
  'empresas',
  'contas',
  'usuarios',
  'aprovacoes-pas',
  'ocorrencias',
  'operacoes',
  'regioes',
  'feriados',
  'produtos',
  'templates-chatbot'
])

export const cadastroNavItems: CadastroNavItem[] = cadastrosNavigation.map((item) => {
  const kind = item.to.replace('/cadastros/', '') as CadastroKind
  return {
    kind,
    label: item.label,
    to: item.to,
    icon: item.icon,
    description: descriptions[kind],
    ready: readyKinds.has(kind)
  }
})

export function getCadastroMeta(kind: CadastroKind) {
  return cadastroNavItems.find((entry) => entry.kind === kind) ?? cadastroNavItems[0]!
}
