import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildIntegrationOrdersMetrics,
  buildIntegrationsMetrics,
  createEmptyIntegration,
  createEmptyIntegrationOperator,
  getIntegrationOperators,
  getIntegrationOrders,
  getIntegrations,
  integrationAccountOptions,
  integrationKindLabels,
  integrationKindOptions,
  integrationOrderStatusMeta,
  resolveAccountLabel,
  setIntegrationOperators,
  setIntegrations
} from '../app/data/demo/integrations'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'
import type { CadastroKind } from '../app/types/domain'
import { cadastroNavItems } from '../app/data/demo/cadastros'
import {
  cadastroOnda3Configs,
  createEmptyCadastroOnda3,
  getCadastroOnda3Rows
} from '../app/data/demo/cadastros-onda3'

describe('fixtures de integrações', () => {
  it('expõe entre 5 e 8 integrações cobrindo providers reais do legado', () => {
    const rows = getIntegrations()
    expect(rows.length).toBeGreaterThanOrEqual(5)
    expect(rows.length).toBeLessThanOrEqual(8)
    const providers = rows.map((row) => row.provider)
    expect(providers).toContain('Toutbox')
    expect(providers).toContain('Kangu')
    expect(providers).toContain('Intelipost')
    expect(providers).toContain('VTEX')
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
  })

  it('calcula métricas de integrações (total/ativas/inativas)', () => {
    const rows = getIntegrations()
    const metrics = buildIntegrationsMetrics(rows)
    expect(metrics).toHaveLength(3)
    expect(metrics[0]).toMatchObject({ label: 'Integrações', value: rows.length })
    const active = rows.filter((row) => row.active).length
    expect(metrics[1]).toMatchObject({ label: 'Ativas', value: active })
    expect(metrics[2]).toMatchObject({ label: 'Inativas', value: rows.length - active })
  })

  it('cria e persiste uma integração nova (mock)', () => {
    const before = getIntegrations().length
    const draft = createEmptyIntegration()
    expect(draft.active).toBe(true)
    setIntegrations([...getIntegrations(), { id: 'int-test', ...draft, provider: 'Teste' }])
    expect(getIntegrations().length).toBe(before + 1)
    expect(getIntegrations().some((row) => row.id === 'int-test')).toBe(true)
    setIntegrations(getIntegrations().filter((row) => row.id !== 'int-test'))
    expect(getIntegrations().length).toBe(before)
  })

  it('lista operadores vinculados a uma integração e resolve o nome da conta', () => {
    const first = getIntegrations()[0]!
    const operators = getIntegrationOperators(first.id)
    expect(Array.isArray(operators)).toBe(true)
    for (const op of operators) {
      expect(op.integrationId).toBe(first.id)
      expect(resolveAccountLabel(op.accountId)).not.toBe('')
    }
  })

  it('substitui os operadores de uma integração (mock)', () => {
    const first = getIntegrations()[0]!
    const before = getIntegrationOperators(first.id)
    const draft = createEmptyIntegrationOperator(first.id)
    expect(draft.integrationId).toBe(first.id)
    setIntegrationOperators(first.id, [...before, { id: 'iop-test', ...draft, apiKeyMasked: 'xx_test' }])
    expect(getIntegrationOperators(first.id).length).toBe(before.length + 1)
    setIntegrationOperators(first.id, before)
    expect(getIntegrationOperators(first.id).length).toBe(before.length)
  })

  it('expõe opções de tipo e de conta para os formulários', () => {
    expect(integrationKindOptions.length).toBeGreaterThan(0)
    expect(integrationKindOptions.every((opt) => opt.label === integrationKindLabels[opt.value as keyof typeof integrationKindLabels])).toBe(true)
    expect(integrationAccountOptions().length).toBeGreaterThan(0)
  })

  it('expõe histórico de pedidos por integração com status variados e ao menos um erro com mensagem', () => {
    const rows = getIntegrationOrders()
    expect(rows.length).toBeGreaterThanOrEqual(6)
    const statuses = new Set(rows.map((row) => row.status))
    expect(statuses.has('pendente')).toBe(true)
    expect(statuses.has('enviado')).toBe(true)
    expect(statuses.has('erro')).toBe(true)
    expect(statuses.has('concluido')).toBe(true)
    const withError = rows.filter((row) => row.status === 'erro')
    expect(withError.length).toBeGreaterThan(0)
    expect(withError.every((row) => Boolean(row.errorMessage))).toBe(true)
  })

  it('calcula métricas de status do histórico', () => {
    const rows = getIntegrationOrders()
    const metrics = buildIntegrationOrdersMetrics(rows)
    expect(metrics).toHaveLength(4)
    expect(metrics.map((metric) => metric.label)).toEqual(['Pendentes', 'Enviados', 'Erros', 'Concluídos'])
  })

  it('expõe meta de ícone + texto para cada status (nunca só cor)', () => {
    for (const status of ['pendente', 'enviado', 'erro', 'concluido'] as const) {
      expect(integrationOrderStatusMeta[status].label.length).toBeGreaterThan(0)
      expect(integrationOrderStatusMeta[status].icon.startsWith('i-lucide-')).toBe(true)
    }
  })
})

describe('breadcrumb de Logs · Integração', () => {
  it('resolve /logs/integracao', () => {
    expect(resolveBreadcrumbs('/logs/integracao')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Logs · Integração' }
    ])
  })
})

describe('kind operacoes substitui ocorrencias-externas', () => {
  it('cadastroNavItems não referencia mais ocorrencias-externas nas descrições', () => {
    const kinds: CadastroKind[] = cadastroNavItems.map((item) => item.kind)
    expect(kinds).not.toContain('ocorrencias-externas' as CadastroKind)
  })
})

describe('cadastro Operações', () => {
  it('expõe fixture e config do kind operacoes com o catálogo do legado', () => {
    const rows = getCadastroOnda3Rows('operacoes')
    expect(rows.length).toBeGreaterThanOrEqual(6)
    const names = rows.map((row) => row.name)
    expect(names).toContain('Logística Reversa')
    expect(names).toContain('Entrega em Lote')
    expect(names).toContain('Entrega Expressa')
    expect(names).toContain('Logística Incremental')
    expect(names).toContain('Weelog')
    expect(names).toContain('VTEX')
    expect(names).toContain('Store')
    expect(cadastroOnda3Configs.operacoes.singular).toBe('operação')
  })

  it('não expõe mais o kind ocorrencias-externas em cadastroOnda3Configs', () => {
    expect(Object.keys(cadastroOnda3Configs)).not.toContain('ocorrencias-externas')
  })

  it('createEmptyCadastroOnda3 funciona para operacoes', () => {
    const draft = createEmptyCadastroOnda3('operacoes')
    expect(draft.active).toBe(true)
    expect(draft.name).toBe('')
  })
})

describe('campo Tipo em Contas', () => {
  it('fixture de contas tem tipo Cliente/Fornecedor', () => {
    const rows = getCadastroOnda3Rows('contas')
    expect(rows.every((row) => typeof row.tipo === 'string' && row.tipo.length > 0)).toBe(true)
    expect(rows.map((row) => row.tipo)).toContain('Cliente')
    expect(rows.map((row) => row.tipo)).toContain('Fornecedor')
  })

  it('config de contas expõe o campo select Tipo com as 3 opções do legado', () => {
    const field = cadastroOnda3Configs.contas.formFields.find((item) => item.key === 'tipo')
    expect(field).toBeTruthy()
    expect(field!.type).toBe('select')
    expect(field!.options?.map((opt) => opt.value)).toEqual(['Cliente', 'Fornecedor', 'Ponto de apoio'])
  })

  it('createEmptyCadastroOnda3 define tipo padrão para contas', () => {
    expect(createEmptyCadastroOnda3('contas').tipo).toBe('Cliente')
  })

  it('CadastroOnda3Page.vue só mostra a coluna Tipo quando kind é contas', () => {
    const source = readFileSync('app/components/cadastros/CadastroOnda3Page.vue', 'utf8')
    expect(source).toContain("props.kind === 'contas'")
    expect(source).toContain("field.type === 'select'")
  })
})

describe('toggle É transportador em Usuários', () => {
  it('config de usuarios expõe o switch isTransporter', () => {
    const field = cadastroOnda3Configs.usuarios.formFields.find((item) => item.key === 'isTransporter')
    expect(field).toBeTruthy()
    expect(field!.type).toBe('switch')
    expect(field!.label).toBe('É transportador')
  })

  it('fixture de usuarios tem isTransporter definido', () => {
    const rows = getCadastroOnda3Rows('usuarios')
    expect(rows.every((row) => typeof row.isTransporter === 'boolean')).toBe(true)
    expect(rows.some((row) => row.isTransporter === true)).toBe(true)
  })

  it('createEmptyCadastroOnda3 define isTransporter=false para usuarios', () => {
    expect(createEmptyCadastroOnda3('usuarios').isTransporter).toBe(false)
  })
})

describe('página Configurações · Integrações', () => {
  it('materializa CRUD completo com MetricsStrip, DataTable e modais', () => {
    const source = readFileSync('app/pages/configuracoes/integracoes.vue', 'utf8')
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('<DataTable')
    expect(source).toContain("variant=\"form\"")
    expect(source).toContain("variant=\"confirm\"")
    expect(source).toContain('Nova integração')
  })
})

describe('página Configurações · Integrações — modal Configurar', () => {
  it('tem ação Configurar e o modal de operadores vinculados', () => {
    const source = readFileSync('app/pages/configuracoes/integracoes.vue', 'utf8')
    expect(source).toContain("key: 'configure'")
    expect(source).toContain('Configurar')
    expect(source).toContain('resolveAccountLabel')
    expect(source).toContain('Vincular conta')
  })
})

describe('página Logs · Integração', () => {
  it('é somente leitura, com filtros, MetricsStrip e badge ícone+texto', () => {
    const source = readFileSync('app/pages/logs/integracao.vue', 'utf8')
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('integrationOrderStatusMeta')
    expect(source).not.toContain('AppModal')
    expect(source).not.toContain('DataTable')
    expect(source).toContain('EmptyState')
    expect(source).toContain('Solicitado em')
    expect(source).toContain('Respondido em')
  })
})
