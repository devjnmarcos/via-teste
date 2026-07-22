import { describe, expect, it } from 'vitest'
import { rotasRastreioNavigation, secondaryNavigation } from '../app/components/app/navigation'
import {
  approveCadastroSolicitacao,
  buildCadastroOnda3Metrics,
  getCadastroOnda3Rows,
  isCadastroOnda3Kind,
  rejectCadastroSolicitacao
} from '../app/data/demo/cadastros-onda3'
import { cadastroNavItems } from '../app/data/demo/cadastros'
import {
  buildGeoAuditMetrics,
  enqueueFixInvalidAddresses,
  geoAuditState
} from '../app/data/demo/geo-audit'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'
import { existsSync, readFileSync } from 'node:fs'

describe('navegação P4 / gap fechado', () => {
  it('inclui Rastreio (ex-Auditoria geográfica) no grupo Rotas & Rastreio', () => {
    const item = rotasRastreioNavigation.find((entry) => entry.to === '/operacao/geo-audit')
    expect(item?.label).toBe('Rastreio')
  })

  it('Pontos de apoio e Transportadores saíram do menu; só resta Integrações', () => {
    expect(secondaryNavigation).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' }
    ])
  })

  it('mantém os 11 cadastros legados e o novo Operações como ready', () => {
    const legacyReadyLabels = [
      'SLA', 'Fretes', 'Empresas', 'Operadores', 'Usuários',
      "Aprovações PA's", 'Ocorrências', 'Regiões', 'Feriados', 'Produtos', 'Templates Chatbot'
    ]
    const legacyItems = cadastroNavItems.filter((item) => legacyReadyLabels.includes(item.label))
    expect(legacyItems).toHaveLength(11)
    expect(legacyItems.every((item) => item.ready)).toBe(true)

    const operacoesItem = cadastroNavItems.find((item) => item.label === 'Operações')
    expect(operacoesItem?.ready).toBe(true)
  })
})

describe('cadastros onda 3', () => {
  it('expõe fixtures e métricas para os 10 kinds', () => {
    const kinds = cadastroNavItems
      .map((item) => item.kind)
      .filter(isCadastroOnda3Kind)

    expect(kinds).toHaveLength(10)
    for (const kind of kinds) {
      const rows = getCadastroOnda3Rows(kind)
      expect(rows.length).toBeGreaterThan(0)
      expect(buildCadastroOnda3Metrics(rows, kind).length).toBeGreaterThanOrEqual(3)
    }
  })

  it('aprova e recusa solicitações PA', () => {
    const pending = getCadastroOnda3Rows('aprovacoes-pas').find((row) => row.queueStatus === 'pendente')
    expect(pending).toBeTruthy()
    expect(approveCadastroSolicitacao('aprovacoes-pas', pending!.id)).toBe(true)
    const another = getCadastroOnda3Rows('aprovacoes-pas').find((row) => row.queueStatus === 'pendente')
    expect(another).toBeTruthy()
    expect(rejectCadastroSolicitacao('aprovacoes-pas', another!.id)).toBe(true)
  })
})

describe('geo-audit e gestão de rede', () => {
  it('calcula métricas e corrige inválidos', () => {
    expect(buildGeoAuditMetrics(geoAuditState.rows)).toHaveLength(3)
    const before = geoAuditState.rows.filter((row) => row.status !== 'corrigido').length
    const result = enqueueFixInvalidAddresses()
    expect(result.queued).toBe(before)
    expect(geoAuditState.rows.every((row) => row.status === 'corrigido')).toBe(true)
  })
})

describe('breadcrumbs P4', () => {
  it('resolve geo-audit, gestão e complementos de pedido', () => {
    expect(resolveBreadcrumbs('/operacao/geo-audit')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Rastreio' }
    ])
    expect(resolveBreadcrumbs('/pedidos/novo-proprio')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: 'Pedido próprio' }
    ])
    expect(resolveBreadcrumbs('/pedidos/48224/editar', { id: '48224' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: '#48224', to: '/pedidos/48224' },
      { label: 'Editar' }
    ])
    expect(resolveBreadcrumbs('/pedidos/48224/checkout', { id: '48224' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: '#48224', to: '/pedidos/48224' },
      { label: 'Checkout' }
    ])
  })
})

describe('rotas P4 materializadas', () => {
  const files = [
    ['app/pages/operacao/geo-audit.vue', 'MetricsStrip'],
    ['app/pages/operacao/geo-audit.vue', 'VolumeTrendChart'],
    ['app/pages/pedidos/[id]/editar.vue', 'OrderEditForm'],
    ['app/pages/pedidos/[id]/checkout.vue', 'AppFormField'],
    ['app/pages/pedidos/novo-proprio.vue', 'OrderCreateWizard'],
    ['app/pages/cadastros/[kind]/index.vue', 'CadastroOnda3Page'],
    ['app/components/cadastros/CadastroOnda3Page.vue', 'Pagination']
  ] as const

  it.each(files)('materializa %s com %s', (path, token) => {
    expect(existsSync(path)).toBe(true)
    expect(readFileSync(path, 'utf8')).toContain(token)
  })
})

describe('remoção de Pontos de apoio e Transportadores', () => {
  it('as páginas e a fixture gestao-rede.ts não existem mais', () => {
    expect(existsSync('app/pages/pontos-de-apoio/index.vue')).toBe(false)
    expect(existsSync('app/pages/transportadores/index.vue')).toBe(false)
    expect(existsSync('app/data/demo/gestao-rede.ts')).toBe(false)
  })
})
