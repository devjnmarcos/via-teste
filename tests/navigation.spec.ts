import { describe, expect, it } from 'vitest'
import {
  cadastrosNavigation,
  configuracoesNavGroup,
  configuracoesNavigation,
  dashboardsNavigation,
  devolucoesNavGroup,
  devolucoesNavigation,
  logsNavigation,
  navigationGroups,
  navigationItems,
  rotasRastreioNavigation,
  secondaryNavigation
} from '../app/components/app/navigation'
import { getOrderDetailBundle } from '../app/data/demo/order-detail'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

describe('navegação oficial', () => {
  it('expõe Home, Calendário e Operação ao vivo soltos no topo (seção Operação)', () => {
    expect(navigationItems.map((item) => item.to)).toEqual([
      '/',
      '/calendario',
      '/operacao/ao-vivo'
    ])
    expect(navigationItems.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
  })

  it('grupo Dashboards: Ponto de apoios, Operações, Ocorrências, SLA, Monitor do chatbot', () => {
    expect(dashboardsNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Ponto de apoios', to: '/dashboards/indicadores' },
      { label: 'Operações', to: '/operacao/dashboard-reversa' },
      { label: 'Ocorrências', to: '/operacao/tratativas' },
      { label: 'SLA', to: '/dashboards/sla' },
      { label: 'Monitor do chatbot', to: '/operacao/chatbot-monitor' }
    ])
    expect(dashboardsNavigation.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
  })

  it('grupo novo Rotas & Rastreio: Rotas, Roteirização, Rastreio', () => {
    expect(rotasRastreioNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Rotas', to: '/operacao/rotas' },
      { label: 'Roteirização', to: '/operacao/roteirizacao' },
      { label: 'Rastreio', to: '/operacao/geo-audit' }
    ])
  })

  it('grupo novo Logs: Ocorrências NG, Integração', () => {
    expect(logsNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Ocorrências NG', to: '/operacao/ocorrencias-ng' },
      { label: 'Integração', to: '/logs/integracao' }
    ])
  })

  it('grupo Devoluções renomeado Remessas: Caixas, Despachos e Lotes', () => {
    expect(devolucoesNavGroup.label).toBe('Remessas')
    expect(devolucoesNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Caixas', to: '/devolucoes/dev-in' },
      { label: 'Despachos', to: '/devolucoes/dev-out' },
      { label: 'Lotes', to: '/operacao/lotes' }
    ])
  })

  it('grupo Cadastros com 13 itens (Pedidos + 12 cadastros + Operações — Feature Flags/Cargos migraram para Configurações)', () => {
    expect(cadastrosNavigation.map((item) => item.label)).toEqual([
      'Pedidos',
      'SLA',
      'Fretes',
      'Empresas',
      'Operadores',
      'Usuários',
      "Aprovações PA's",
      'Ocorrências',
      'Regiões',
      'Feriados',
      'Produtos',
      'Templates Chatbot',
      'Operações'
    ])
    expect(cadastrosNavigation.find((item) => item.label === 'Operadores')?.to).toBe('/cadastros/contas')
    expect(cadastrosNavigation.find((item) => item.label === 'Operações')?.to).toBe('/cadastros/operacoes')
    expect(cadastrosNavigation.some((item) => item.label === 'Ocorrências Externas')).toBe(false)
    expect(cadastrosNavigation.some((item) => item.label === 'Feature Flags')).toBe(false)
    expect(cadastrosNavigation.some((item) => item.label === 'Cargos')).toBe(false)
  })

  it('grupo novo Configurações: Integrações, Feature Flags, Cargos apontando para /configuracoes/*', () => {
    expect(configuracoesNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes' },
      { label: 'Feature Flags', to: '/configuracoes/feature-flags' },
      { label: 'Cargos', to: '/configuracoes/cargos' }
    ])
    expect(configuracoesNavigation.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
    expect(configuracoesNavGroup.label).toBe('Configurações')
  })

  it('secondaryNavigation fica vazio (Integrações migrou para o grupo Configurações)', () => {
    expect(secondaryNavigation).toEqual([])
  })

  it('navigationGroups segue a ordem final da seção Gestão (Configurações por último)', () => {
    expect(navigationGroups.map((group) => group.label)).toEqual([
      'Dashboards',
      'Rotas & Rastreio',
      'Logs',
      'Remessas',
      'Cadastros',
      'Configurações'
    ])
    expect(navigationGroups.every((group) => group.children.length > 0)).toBe(true)
  })
})

describe('breadcrumbs do topbar', () => {
  it('resolve Cadastros → SLA sem duplicar Via Reversa', () => {
    expect(resolveBreadcrumbs('/cadastros/sla')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'SLA' }
    ])
  })

  it('resolve Cadastros → Fretes e stubs', () => {
    expect(resolveBreadcrumbs('/cadastros/fretes')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Fretes' }
    ])
    expect(resolveBreadcrumbs('/cadastros/empresas')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Empresas' }
    ])
  })

  it('resolve cadastro aninhado Novo/Editar com links intermediários (Contas renomeado Operadores)', () => {
    expect(resolveBreadcrumbs('/cadastros/empresas/novo')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Empresas', to: '/cadastros/empresas' },
      { label: 'Novo' }
    ])
    expect(resolveBreadcrumbs('/cadastros/contas/42', { kind: 'contas', id: '42' })).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Operadores', to: '/cadastros/contas' },
      { label: 'Editar' }
    ])
  })

  it('resolve Remessas → Caixas / Despachos e detalhe', () => {
    expect(resolveBreadcrumbs('/devolucoes/dev-in')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Remessas', to: '/devolucoes' },
      { label: 'Caixas' }
    ])
    expect(resolveBreadcrumbs('/devolucoes/dev-out')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Remessas', to: '/devolucoes' },
      { label: 'Despachos' }
    ])
    expect(resolveBreadcrumbs('/devolucoes/dev-in/1042', { id: '1042' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Remessas', to: '/devolucoes' },
      { label: 'Caixas', to: '/devolucoes/dev-in' },
      { label: '#1042' }
    ])
  })

  it('resolve Home, operação ao vivo, dashboard de operações, lotes e detalhe', () => {
    expect(resolveBreadcrumbs('/')).toEqual([{ label: 'Home' }])
    expect(resolveBreadcrumbs('/operacao/ao-vivo')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Operação ao vivo' }
    ])
    expect(resolveBreadcrumbs('/operacao/dashboard-reversa')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Operações' }
    ])
    expect(resolveBreadcrumbs('/operacao/lotes')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Lotes' }
    ])
    expect(resolveBreadcrumbs('/pedidos')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos' }
    ])
    expect(resolveBreadcrumbs('/pedidos/novo')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: 'Novo pedido' }
    ])
    expect(resolveBreadcrumbs('/pedidos/48224', { id: '48224' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: '#48224' }
    ])
  })

  it('resolve Rastreio (ex-Auditoria geográfica) e Ocorrências (ex-Tratativas)', () => {
    expect(resolveBreadcrumbs('/operacao/geo-audit')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Rastreio' }
    ])
    expect(resolveBreadcrumbs('/operacao/tratativas')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Ocorrências' }
    ])
  })

  it('resolve operação a partir do slug', () => {
    expect(resolveBreadcrumbs('/operacoes/logistica-reversa', { slug: 'logistica-reversa' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Logística Reversa' }
    ])
  })

  it('marca só o último item como página atual (sem to)', () => {
    const crumbs = resolveBreadcrumbs('/cadastros/sla')
    expect(crumbs.at(-1)?.to).toBeUndefined()
    expect(crumbs.slice(0, -1).every((item) => Boolean(item.to))).toBe(true)
  })
})

describe('detalhe do pedido', () => {
  it('expõe bundle completo do pedido em destaque', () => {
    const detail = getOrderDetailBundle('48224')
    expect(detail.items).toHaveLength(1)
    expect(detail.occurrences).toHaveLength(3)
    expect(detail.evidences).toHaveLength(3)
    expect(detail.materials.length).toBeGreaterThan(0)
    expect(detail.barcodes.length).toBeGreaterThan(0)
    expect(detail.locker).not.toBeNull()
    expect(detail.fiscal).not.toBeNull()
    expect(detail.scheduling).toHaveLength(1)
    expect(detail.history.length).toBeGreaterThan(0)
  })
})
