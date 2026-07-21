import { describe, expect, it } from 'vitest'
import {
  cadastrosNavigation,
  devolucoesNavigation,
  navigationItems,
  operacaoNavigation,
  resumosNavigation
} from '../app/components/app/navigation'
import { getOrderDetailBundle } from '../app/data/demo/order-detail'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

describe('navegação oficial', () => {
  it('expõe Home e itens soltos (Calendário, Auditoria geográfica) fora de grupo', () => {
    expect(navigationItems.map(item => item.to)).toEqual([
      '/',
      '/calendario',
      '/operacao/geo-audit'
    ])
  })

  it('agrupa operação ao vivo, pedidos, lotes e Dashboard Reversa no grupo Operação', () => {
    expect(operacaoNavigation.map(item => item.to)).toEqual([
      '/operacao/ao-vivo',
      '/pedidos',
      '/operacao/lotes',
      '/operacao/expedicao',
      '/operacao/roteirizacao',
      '/operacao/rotas',
      '/loja/check-in',
      '/operacao/tratativas',
      '/operacao/ocorrencias-ng',
      '/operacao/disparo-chatbot',
      '/operacao/dashboard-reversa'
    ])
  })

  it('usa ícones Lucide em todos os destinos', () => {
    expect(navigationItems.every(item => item.icon.startsWith('i-lucide-'))).toBe(true)
    expect(operacaoNavigation.every(item => item.icon.startsWith('i-lucide-'))).toBe(true)
  })

  it('inclui submenu Cadastros com 12 destinos', () => {
    expect(cadastrosNavigation).toHaveLength(12)
    expect(cadastrosNavigation[0]?.to).toBe('/cadastros/sla')
    expect(cadastrosNavigation[1]?.to).toBe('/cadastros/fretes')
  })

  it('inclui submenu Devoluções com Acompanhamento, DEV IN e DEV OUT', () => {
    expect(devolucoesNavigation.map((item) => item.label)).toEqual([
      'Acompanhamento',
      'DEV IN',
      'DEV OUT'
    ])
    expect(devolucoesNavigation.map((item) => item.to)).toEqual([
      '/devolucoes/acompanhamento',
      '/devolucoes/dev-in',
      '/devolucoes/dev-out'
    ])
    expect(devolucoesNavigation.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
  })

  it('inclui submenu Resumos com as três telas analíticas', () => {
    expect(resumosNavigation.map((item) => item.label)).toEqual([
      'Totais por Operação',
      'Pedidos por Cliente',
      'Pedidos por Estado'
    ])
    expect(resumosNavigation.map((item) => item.to)).toEqual([
      '/resumos/totais-por-operacao',
      '/resumos/pedidos-por-cliente',
      '/resumos/pedidos-por-estado'
    ])
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

  it('resolve cadastro aninhado Novo/Editar com links intermediários', () => {
    expect(resolveBreadcrumbs('/cadastros/empresas/novo')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Empresas', to: '/cadastros/empresas' },
      { label: 'Novo' }
    ])
    expect(resolveBreadcrumbs('/cadastros/contas/42', { kind: 'contas', id: '42' })).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Contas', to: '/cadastros/contas' },
      { label: 'Editar' }
    ])
  })

  it('resolve Devoluções → DEV IN / DEV OUT e detalhe', () => {
    expect(resolveBreadcrumbs('/devolucoes/dev-in')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Devoluções', to: '/devolucoes' },
      { label: 'DEV IN' }
    ])
    expect(resolveBreadcrumbs('/devolucoes/dev-out')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Devoluções', to: '/devolucoes' },
      { label: 'DEV OUT' }
    ])
    expect(resolveBreadcrumbs('/devolucoes/dev-in/1042', { id: '1042' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Devoluções', to: '/devolucoes' },
      { label: 'DEV IN', to: '/devolucoes/dev-in' },
      { label: '#1042' }
    ])
    expect(resolveBreadcrumbs('/devolucoes/acompanhamento')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Devoluções', to: '/devolucoes' },
      { label: 'Acompanhamento' }
    ])
  })

  it('resolve Home, operação ao vivo, pedidos, lotes e detalhe', () => {
    expect(resolveBreadcrumbs('/')).toEqual([{ label: 'Home' }])
    expect(resolveBreadcrumbs('/operacao/ao-vivo')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Operação ao vivo' }
    ])
    expect(resolveBreadcrumbs('/operacao/dashboard-reversa')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Dashboard Reversa' }
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
