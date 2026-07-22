/**
 * Fixtures e helpers da Onda 3 de Cadastros (10 kinds além de SLA/Fretes).
 * Create/edit curto em modal; Usuários usa delete com keyword; Regiões usa expand.
 */
import type { CadastroKind, Metric } from '../../types/domain'

export type CadastroOnda3Kind = Exclude<CadastroKind, 'sla' | 'fretes' | 'feature-flags' | 'cargos'>

export interface CadastroOnda3Row extends Record<string, unknown> {
  id: string
  name: string
  detail: string
  meta: string
  statusLabel: string
  active: boolean
  /** Keyword de exclusão (usuários = e-mail). */
  keyword?: string
  /** Filhos para coluna expand (regiões). */
  children?: { id: string; label: string; detail: string }[]
  /** Status de fila (aprovações). */
  queueStatus?: 'pendente' | 'aprovado' | 'recusado'
  /** Tags do Account legado (kinds JSON array) — só usado no kind 'contas'. */
  tipo?: string
  /** Espelha User.is_transporter do legado — só usado no kind 'usuarios'. */
  isTransporter?: boolean
}

export interface CadastroOnda3FormField {
  key: keyof CadastroOnda3Row & string
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'switch' | 'select'
  options?: { label: string; value: string }[]
}

export interface CadastroOnda3Config {
  kind: CadastroOnda3Kind
  singular: string
  createLabel: string
  searchPlaceholder: string
  deleteMode: 'confirm' | 'keyword'
  formFields: CadastroOnda3FormField[]
  hasExpand?: boolean
  hasApproveActions?: boolean
}

const empresas: CadastroOnda3Row[] = [
  { id: 'emp-1', name: 'Casas Bahia', detail: 'CNPJ 33.041.260/0652-90', meta: 'Cliente · SP', statusLabel: 'Ativa', active: true },
  { id: 'emp-2', name: 'Via Reversa Ops', detail: 'CNPJ 12.345.678/0001-90', meta: 'Interna · SP', statusLabel: 'Ativa', active: true },
  { id: 'emp-3', name: 'Renner Logística', detail: 'CNPJ 92.754.738/0001-62', meta: 'Cliente · RS', statusLabel: 'Inativa', active: false }
]

const contas: CadastroOnda3Row[] = [
  { id: 'cta-1', name: 'CB · CD Cajamar', detail: 'Casas Bahia', meta: 'Reversa · SP', statusLabel: 'Ativa', active: true, tipo: 'Cliente' },
  { id: 'cta-2', name: 'RN · Hub Sul', detail: 'Renner', meta: 'Troca · RS', statusLabel: 'Ativa', active: true, tipo: 'Cliente' },
  { id: 'cta-3', name: 'AMZ · São Paulo', detail: 'Amazon BR', meta: 'Reversa · SP', statusLabel: 'Pausada', active: false, tipo: 'Fornecedor' }
]

const usuarios: CadastroOnda3Row[] = [
  { id: 'usr-1', name: 'Ana Duarte', detail: 'Operações', meta: 'Admin', statusLabel: 'Ativo', active: true, keyword: 'ana.duarte@viareversa.com', isTransporter: false },
  { id: 'usr-2', name: 'João Ribeiro', detail: 'Ponto de apoio Centro', meta: 'Operador', statusLabel: 'Ativo', active: true, keyword: 'joao.ribeiro@viareversa.com', isTransporter: true },
  { id: 'usr-3', name: 'Camila Ferreira', detail: 'Backoffice', meta: 'Analista', statusLabel: 'Inativo', active: false, keyword: 'camila.ferreira@viareversa.com', isTransporter: false }
]

const aprovacoes: CadastroOnda3Row[] = [
  { id: 'ap-1', name: 'Ponto de apoio Zona Leste', detail: 'São Paulo · SP', meta: 'Há 2h', statusLabel: 'Pendente', active: true, queueStatus: 'pendente' },
  { id: 'ap-2', name: 'Transportador Marcos L.', detail: 'Motoboy · SP', meta: 'Há 1d', statusLabel: 'Pendente', active: true, queueStatus: 'pendente' },
  { id: 'ap-3', name: 'Ponto de apoio Campinas', detail: 'Campinas · SP', meta: 'Há 3d', statusLabel: 'Aprovado', active: true, queueStatus: 'aprovado' },
  { id: 'ap-4', name: 'Transportador Rita S.', detail: 'Van · RJ', meta: 'Há 5d', statusLabel: 'Recusado', active: false, queueStatus: 'recusado' }
]

const ocorrencias: CadastroOnda3Row[] = [
  { id: 'oc-1', name: 'Endereço não localizado', detail: 'Cliente ausente / geocode', meta: 'Bloqueante', statusLabel: 'Ativa', active: true },
  { id: 'oc-2', name: 'Produto divergente', detail: 'SKU / quantidade', meta: 'Operacional', statusLabel: 'Ativa', active: true },
  { id: 'oc-3', name: 'Embalagem danificada', detail: 'Coleta', meta: 'Informativa', statusLabel: 'Inativa', active: false }
]

const operacoes: CadastroOnda3Row[] = [
  { id: 'op-1', name: 'Logística Reversa', detail: 'Coleta e retorno ao CD', meta: 'Reversa', statusLabel: 'Ativo', active: true },
  { id: 'op-2', name: 'Entrega em Lote', detail: 'Expedição consolidada', meta: 'Direta', statusLabel: 'Ativo', active: true },
  { id: 'op-3', name: 'Entrega Expressa', detail: 'SLA curto, prioridade alta', meta: 'Direta', statusLabel: 'Ativo', active: true },
  { id: 'op-4', name: 'Logística Incremental', detail: 'Reposição contínua de estoque', meta: 'Reversa', statusLabel: 'Ativo', active: true },
  { id: 'op-5', name: 'Weelog', detail: 'Integração Weelog', meta: 'Parceiro', statusLabel: 'Ativo', active: true },
  { id: 'op-6', name: 'VTEX', detail: 'Pedidos originados na VTEX', meta: 'Marketplace', statusLabel: 'Ativo', active: true },
  { id: 'op-7', name: 'Store', detail: 'Venda em loja física', meta: 'Loja', statusLabel: 'Inativo', active: false }
]

const regioes: CadastroOnda3Row[] = [
  {
    id: 'rg-1',
    name: 'Grande SP',
    detail: 'Capital e ABC',
    meta: '12 cidades',
    statusLabel: 'Ativa',
    active: true,
    children: [
      { id: 'rg-1-a', label: 'São Paulo', detail: 'Capital' },
      { id: 'rg-1-b', label: 'Santo André', detail: 'ABC' },
      { id: 'rg-1-c', label: 'São Bernardo', detail: 'ABC' }
    ]
  },
  {
    id: 'rg-2',
    name: 'Interior SP · Campinas',
    detail: 'RMC',
    meta: '8 cidades',
    statusLabel: 'Ativa',
    active: true,
    children: [
      { id: 'rg-2-a', label: 'Campinas', detail: 'Hub' },
      { id: 'rg-2-b', label: 'Valinhos', detail: 'RMC' }
    ]
  },
  {
    id: 'rg-3',
    name: 'RM Rio',
    detail: 'Baixada e capital',
    meta: '6 cidades',
    statusLabel: 'Inativa',
    active: false,
    children: []
  }
]

const feriados: CadastroOnda3Row[] = [
  { id: 'fe-1', name: 'Independência', detail: '07/09', meta: 'Nacional', statusLabel: 'Ativo', active: true },
  { id: 'fe-2', name: 'Consciência Negra (SP)', detail: '20/11', meta: 'Estadual · SP', statusLabel: 'Ativo', active: true },
  { id: 'fe-3', name: 'Aniversário São Paulo', detail: '25/01', meta: 'Municipal · SP', statusLabel: 'Inativo', active: false }
]

const produtos: CadastroOnda3Row[] = [
  { id: 'pr-1', name: 'Caixa M', detail: 'SKU BOX-M', meta: 'Embalagem', statusLabel: 'Ativo', active: true },
  { id: 'pr-2', name: 'Etiqueta térmica', detail: 'SKU LAB-80', meta: 'Consumível', statusLabel: 'Ativo', active: true },
  { id: 'pr-3', name: 'Lacre segurança', detail: 'SKU SEAL-01', meta: 'Consumível', statusLabel: 'Inativo', active: false }
]

const templates: CadastroOnda3Row[] = [
  { id: 'tp-1', name: 'Agendamento · lembrete', detail: 'WhatsApp', meta: 'Operacional', statusLabel: 'Ativo', active: true },
  { id: 'tp-2', name: 'Ocorrência · endereço', detail: 'SMS', meta: 'Tratativa', statusLabel: 'Ativo', active: true },
  { id: 'tp-3', name: 'Checkout · link', detail: 'WhatsApp', meta: 'Público', statusLabel: 'Rascunho', active: false }
]

const store: Record<CadastroOnda3Kind, CadastroOnda3Row[]> = {
  empresas: structuredClone(empresas),
  contas: structuredClone(contas),
  usuarios: structuredClone(usuarios),
  'aprovacoes-pas': structuredClone(aprovacoes),
  ocorrencias: structuredClone(ocorrencias),
  operacoes: structuredClone(operacoes),
  regioes: structuredClone(regioes),
  feriados: structuredClone(feriados),
  produtos: structuredClone(produtos),
  'templates-chatbot': structuredClone(templates)
}

export const cadastroOnda3Configs: Record<CadastroOnda3Kind, CadastroOnda3Config> = {
  empresas: {
    kind: 'empresas',
    singular: 'empresa',
    createLabel: 'Nova empresa',
    searchPlaceholder: 'Buscar por nome ou CNPJ…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Nome *', placeholder: 'Ex.: Casas Bahia' },
      { key: 'detail', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
      { key: 'meta', label: 'Tipo / UF', placeholder: 'Cliente · SP' },
      { key: 'active', label: 'Ativa', type: 'switch' }
    ]
  },
  contas: {
    kind: 'contas',
    singular: 'conta',
    createLabel: 'Nova conta',
    searchPlaceholder: 'Buscar por conta ou empresa…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Conta *', placeholder: 'Ex.: CB · CD Cajamar' },
      { key: 'detail', label: 'Empresa', placeholder: 'Casas Bahia' },
      { key: 'meta', label: 'Operação / UF', placeholder: 'Reversa · SP' },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: [
          { label: 'Cliente', value: 'Cliente' },
          { label: 'Fornecedor', value: 'Fornecedor' },
          { label: 'Ponto de apoio', value: 'Ponto de apoio' }
        ]
      },
      { key: 'active', label: 'Ativa', type: 'switch' }
    ]
  },
  usuarios: {
    kind: 'usuarios',
    singular: 'usuário',
    createLabel: 'Novo usuário',
    searchPlaceholder: 'Buscar por nome ou e-mail…',
    deleteMode: 'keyword',
    formFields: [
      { key: 'name', label: 'Nome *', placeholder: 'Nome completo' },
      { key: 'keyword', label: 'E-mail *', placeholder: 'usuario@empresa.com', type: 'email' },
      { key: 'detail', label: 'Área', placeholder: 'Operações' },
      { key: 'meta', label: 'Papel', placeholder: 'Operador' },
      { key: 'isTransporter', label: 'É transportador', type: 'switch' },
      { key: 'active', label: 'Ativo', type: 'switch' }
    ]
  },
  'aprovacoes-pas': {
    kind: 'aprovacoes-pas',
    singular: 'aprovação',
    createLabel: 'Registrar solicitação',
    searchPlaceholder: 'Buscar ponto de apoio ou transportador…',
    deleteMode: 'confirm',
    hasApproveActions: true,
    formFields: [
      { key: 'name', label: 'Solicitante *', placeholder: 'Ponto de apoio ou transportador' },
      { key: 'detail', label: 'Local / tipo', placeholder: 'Cidade · UF' },
      { key: 'meta', label: 'Recebido', placeholder: 'Há 1h' }
    ]
  },
  ocorrencias: {
    kind: 'ocorrencias',
    singular: 'ocorrência',
    createLabel: 'Nova ocorrência',
    searchPlaceholder: 'Buscar tipo de ocorrência…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Tipo *', placeholder: 'Ex.: Endereço não localizado' },
      { key: 'detail', label: 'Descrição', placeholder: 'Contexto operacional' },
      { key: 'meta', label: 'Severidade', placeholder: 'Bloqueante' },
      { key: 'active', label: 'Ativa', type: 'switch' }
    ]
  },
  operacoes: {
    kind: 'operacoes',
    singular: 'operação',
    createLabel: 'Nova operação',
    searchPlaceholder: 'Buscar tipo de operação…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Operação *', placeholder: 'Ex.: Logística Reversa' },
      { key: 'detail', label: 'Descrição', placeholder: 'Contexto operacional' },
      { key: 'meta', label: 'Natureza', placeholder: 'Reversa' },
      { key: 'active', label: 'Ativa', type: 'switch' }
    ]
  },
  regioes: {
    kind: 'regioes',
    singular: 'região',
    createLabel: 'Nova região',
    searchPlaceholder: 'Buscar região…',
    deleteMode: 'confirm',
    hasExpand: true,
    formFields: [
      { key: 'name', label: 'Região *', placeholder: 'Ex.: Grande SP' },
      { key: 'detail', label: 'Abrangência', placeholder: 'Capital e ABC' },
      { key: 'meta', label: 'Resumo', placeholder: '12 cidades' },
      { key: 'active', label: 'Ativa', type: 'switch' }
    ]
  },
  feriados: {
    kind: 'feriados',
    singular: 'feriado',
    createLabel: 'Novo feriado',
    searchPlaceholder: 'Buscar feriado…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Nome *', placeholder: 'Independência' },
      { key: 'detail', label: 'Data', placeholder: '07/09' },
      { key: 'meta', label: 'Abrangência', placeholder: 'Nacional' },
      { key: 'active', label: 'Ativo', type: 'switch' }
    ]
  },
  produtos: {
    kind: 'produtos',
    singular: 'produto',
    createLabel: 'Novo produto',
    searchPlaceholder: 'Buscar produto ou SKU…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Produto *', placeholder: 'Caixa M' },
      { key: 'detail', label: 'SKU', placeholder: 'BOX-M' },
      { key: 'meta', label: 'Categoria', placeholder: 'Embalagem' },
      { key: 'active', label: 'Ativo', type: 'switch' }
    ]
  },
  'templates-chatbot': {
    kind: 'templates-chatbot',
    singular: 'template',
    createLabel: 'Novo template',
    searchPlaceholder: 'Buscar template…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Template *', placeholder: 'Agendamento · lembrete' },
      { key: 'detail', label: 'Canal', placeholder: 'WhatsApp' },
      { key: 'meta', label: 'Uso', placeholder: 'Operacional' },
      { key: 'active', label: 'Ativo', type: 'switch' }
    ]
  }
}

export function getCadastroOnda3Rows(kind: CadastroOnda3Kind): CadastroOnda3Row[] {
  return store[kind]
}

export function setCadastroOnda3Rows(kind: CadastroOnda3Kind, rows: CadastroOnda3Row[]) {
  store[kind] = rows
}

export function createEmptyCadastroOnda3(kind: CadastroOnda3Kind): Omit<CadastroOnda3Row, 'id'> {
  const base: Omit<CadastroOnda3Row, 'id'> = {
    name: '',
    detail: '',
    meta: '',
    statusLabel: 'Ativo',
    active: true
  }
  if (kind === 'usuarios') {
    base.keyword = ''
    base.isTransporter = false
  }
  if (kind === 'contas') base.tipo = 'Cliente'
  if (kind === 'aprovacoes-pas') {
    base.queueStatus = 'pendente'
    base.statusLabel = 'Pendente'
  }
  if (kind === 'regioes') base.children = []
  return base
}

export function buildCadastroOnda3Metrics(rows: CadastroOnda3Row[], kind: CadastroOnda3Kind): Metric[] {
  const total = rows.length
  const active = rows.filter((row) => row.active).length
  const inactive = total - active

  if (kind === 'aprovacoes-pas') {
    const pendente = rows.filter((row) => row.queueStatus === 'pendente').length
    const aprovado = rows.filter((row) => row.queueStatus === 'aprovado').length
    const recusado = rows.filter((row) => row.queueStatus === 'recusado').length
    return [
      { label: 'Total', value: total, note: 'solicitações', icon: 'i-lucide-inbox', tone: 'info' },
      { label: 'Pendentes', value: pendente, note: 'na fila', icon: 'i-lucide-clock', tone: 'warning' },
      { label: 'Aprovadas', value: aprovado, note: 'liberadas', icon: 'i-lucide-check', tone: 'success' },
      { label: 'Recusadas', value: recusado, note: 'negadas', icon: 'i-lucide-x', tone: 'danger' },
      { label: 'Ativas', value: active, note: 'visíveis', icon: 'i-lucide-eye', tone: 'success' },
      { label: 'Inativas', value: inactive, note: 'ocultas', icon: 'i-lucide-eye-off', tone: inactive ? 'warning' : undefined }
    ]
  }

  return [
    { label: 'Total', value: total, note: 'registros', icon: 'i-lucide-database', tone: 'info' },
    { label: 'Ativos', value: active, note: 'habilitados', icon: 'i-lucide-check-circle', tone: 'success' },
    { label: 'Inativos', value: inactive, note: 'desabilitados', icon: 'i-lucide-circle-off', tone: inactive ? 'warning' : undefined }
  ]
}

export function isCadastroOnda3Kind(kind: CadastroKind): kind is CadastroOnda3Kind {
  return Object.hasOwn(cadastroOnda3Configs, kind)
}

export function approveCadastroSolicitacao(kind: CadastroOnda3Kind, id: string): boolean {
  if (kind !== 'aprovacoes-pas') return false
  const row = store[kind].find((item) => item.id === id)
  if (!row || row.queueStatus !== 'pendente') return false
  row.queueStatus = 'aprovado'
  row.statusLabel = 'Aprovado'
  row.active = true
  return true
}

export function rejectCadastroSolicitacao(kind: CadastroOnda3Kind, id: string): boolean {
  if (kind !== 'aprovacoes-pas') return false
  const row = store[kind].find((item) => item.id === id)
  if (!row || row.queueStatus !== 'pendente') return false
  row.queueStatus = 'recusado'
  row.statusLabel = 'Recusado'
  row.active = false
  return true
}
