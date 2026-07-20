import {
  cadastrosNavigation,
  cadastrosNavGroup,
  configuracoesNavigation,
  configuracoesNavGroup,
  dashboardsNavigation,
  dashboardsNavGroup,
  devolucoesNavigation,
  devolucoesNavGroup,
  faturasNavigation,
  faturasNavGroup,
  resumosNavigation,
  resumosNavGroup,
  slaAnalyticsNavigation,
  slaAnalyticsNavGroup
} from '../components/app/navigation'
import { operations } from '../data/demo/operations'
import { isCadastroKind } from './cadastros'
import { isFaturaKind, faturaKindLabel } from '../data/demo/faturas'

export interface BreadcrumbItem {
  label: string
  to?: string
}

function paramValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function cadastroLabel(kind: string): string {
  return cadastrosNavigation.find((item) => item.to === `/cadastros/${kind}`)?.label ?? kind
}

function devolucaoLabel(segment: string): string {
  return (
    devolucoesNavigation.find((item) => item.to === `/devolucoes/${segment}`)?.label
    ?? segment
  )
}

function faturaNavLabel(segment: string): string {
  return (
    faturasNavigation.find((item) => item.to === `/faturas/${segment}`)?.label
    ?? segment
  )
}

function resumoNavLabel(segment: string): string {
  const drillLabels: Record<string, string> = {
    'pontos-de-apoio': 'Pontos de apoio',
    transportadores: 'Transportadores',
    mapa: 'Mapa'
  }
  return (
    resumosNavigation.find((item) => item.to === `/resumos/${segment}`)?.label
    ?? drillLabels[segment]
    ?? segment
  )
}

function slaNavLabel(segment: string): string {
  return (
    slaAnalyticsNavigation.find((item) => item.to === `/sla/${segment}`)?.label
    ?? segment
  )
}

function dashboardNavLabel(segment: string): string {
  return (
    dashboardsNavigation.find((item) => item.to === `/dashboards/${segment}`)?.label
    ?? segment
  )
}

function configuracaoNavLabel(segment: string): string {
  return (
    configuracoesNavigation.find((item) => item.to === `/configuracoes/${segment}`)?.label
    ?? segment
  )
}

/**
 * Hierarquia de breadcrumbs alinhada à sidebar (`navigation.ts`) e às rotas reais.
 * O último item é a página atual (sem `to`).
 */
export function resolveBreadcrumbs(
  path: string,
  params: Record<string, string | string[] | undefined> = {}
): BreadcrumbItem[] {
  const normalized = path.replace(/\/+$/, '') || '/'

  if (normalized === '/') {
    return [{ label: 'Home' }]
  }

  if (normalized === '/operacao/ao-vivo') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Operação ao vivo' }
    ]
  }

  if (normalized === '/operacao/dashboard-reversa') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Dashboard Reversa' }
    ]
  }

  if (normalized === '/operacao/lotes') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Lotes' }
    ]
  }

  if (normalized.startsWith('/operacao/lotes/')) {
    const id = paramValue(params.id) ?? normalized.split('/').pop() ?? ''
    return [
      { label: 'Home', to: '/' },
      { label: 'Lotes', to: '/operacao/lotes' },
      { label: `#${id}` }
    ]
  }

  if (normalized === '/operacao/expedicao') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Expedição' }
    ]
  }

  if (normalized === '/operacao/roteirizacao') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Roteirização' }
    ]
  }

  if (normalized === '/operacao/rotas') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Rotas' }
    ]
  }

  if (normalized.startsWith('/operacao/rotas/')) {
    const id = paramValue(params.id) ?? normalized.split('/').pop() ?? ''
    return [
      { label: 'Home', to: '/' },
      { label: 'Rotas', to: '/operacao/rotas' },
      { label: `#${id}` }
    ]
  }

  if (normalized === '/loja/check-in') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Check In' }
    ]
  }

  if (normalized === '/operacao/tratativas') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Tratativas' }
    ]
  }

  if (normalized === '/operacao/ocorrencias-ng') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Ocorrências NG' }
    ]
  }

  if (normalized === '/operacao/disparo-chatbot') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Disparo Chatbot' }
    ]
  }

  if (normalized === '/operacao/geo-audit') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Auditoria geográfica' }
    ]
  }

  if (normalized === '/operacao/chatbot-monitor') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Disparo Chatbot', to: '/operacao/disparo-chatbot' },
      { label: 'Monitor' }
    ]
  }

  if (normalized === '/operacao/mileto-backfill') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Ocorrências NG', to: '/operacao/ocorrencias-ng' },
      { label: 'Mileto backfill' }
    ]
  }

  if (normalized === '/calendario') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Calendário' }
    ]
  }

  if (normalized === '/pedidos') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Pedidos' }
    ]
  }

  if (normalized === '/pedidos/novo') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: 'Novo pedido' }
    ]
  }

  if (normalized === '/pedidos/novo-proprio') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: 'Pedido próprio' }
    ]
  }

  if (normalized.startsWith('/pedidos/')) {
    const segments = normalized.split('/').filter(Boolean)
    const id = paramValue(params.id) ?? segments[1] ?? ''
    const action = segments[2]

    if (action === 'editar') {
      return [
        { label: 'Home', to: '/' },
        { label: 'Pedidos', to: '/pedidos' },
        { label: `#${id}`, to: `/pedidos/${id}` },
        { label: 'Editar' }
      ]
    }

    if (action === 'checkout') {
      return [
        { label: 'Home', to: '/' },
        { label: 'Pedidos', to: '/pedidos' },
        { label: `#${id}`, to: `/pedidos/${id}` },
        { label: 'Checkout' }
      ]
    }

    return [
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: `#${id}` }
    ]
  }

  if (normalized === '/pontos-de-apoio') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Pontos de apoio' }
    ]
  }

  if (normalized === '/transportadores') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Transportadores' }
    ]
  }

  if (normalized.startsWith('/operacoes/')) {
    const slug = paramValue(params.slug) ?? normalized.split('/').pop() ?? ''
    const operation = operations.find((item) => item.slug === slug)
    return [
      { label: 'Home', to: '/' },
      { label: operation?.name ?? 'Operação' }
    ]
  }

  if (normalized === '/cadastros' || normalized.startsWith('/cadastros/')) {
    const segments = normalized.split('/').filter(Boolean) // cadastros, kind?, action?
    const kind = segments[1]
    const action = segments[2]

    const crumbs: BreadcrumbItem[] = [
      { label: cadastrosNavGroup.label, to: '/cadastros' }
    ]

    if (!kind) {
      crumbs[crumbs.length - 1] = { label: cadastrosNavGroup.label }
      return crumbs
    }

    if (!isCadastroKind(kind)) {
      crumbs.push({ label: kind })
      return crumbs
    }

    const kindTo = `/cadastros/${kind}`
    const kindLabel = cadastroLabel(kind)

    if (!action) {
      crumbs.push({ label: kindLabel })
      return crumbs
    }

    crumbs.push({ label: kindLabel, to: kindTo })

    if (action === 'novo') {
      crumbs.push({ label: 'Novo' })
      return crumbs
    }

    crumbs.push({ label: 'Editar' })
    return crumbs
  }

  if (normalized === '/faturas' || normalized.startsWith('/faturas/')) {
    const segments = normalized.split('/').filter(Boolean) // faturas, section?, third?
    const section = segments[1]
    const third = segments[2]

    const crumbs: BreadcrumbItem[] = [
      { label: 'Home', to: '/' },
      { label: faturasNavGroup.label, to: '/faturas' }
    ]

    if (!section) {
      crumbs[crumbs.length - 1] = { label: faturasNavGroup.label }
      return crumbs
    }

    if (section === 'nova') {
      const label = third && isFaturaKind(third)
        ? `Nova · ${faturaKindLabel(third)}`
        : 'Nova fatura'
      crumbs.push({ label })
      return crumbs
    }

    if (isFaturaKind(section)) {
      crumbs.push({ label: faturaNavLabel(section) })
      return crumbs
    }

    crumbs.push({ label: `#${section}` })
    return crumbs
  }

  if (normalized === '/resumos' || normalized.startsWith('/resumos/')) {
    const segments = normalized.split('/').filter(Boolean)
    const section = segments[1]

    const crumbs: BreadcrumbItem[] = [
      { label: 'Home', to: '/' },
      { label: resumosNavGroup.label, to: '/resumos' }
    ]

    if (!section) {
      crumbs[crumbs.length - 1] = { label: resumosNavGroup.label }
      return crumbs
    }

    crumbs.push({ label: resumoNavLabel(section) })
    return crumbs
  }

  if (normalized === '/sla' || normalized.startsWith('/sla/')) {
    const segments = normalized.split('/').filter(Boolean)
    const section = segments[1]

    const crumbs: BreadcrumbItem[] = [
      { label: 'Home', to: '/' },
      { label: slaAnalyticsNavGroup.label, to: '/sla' }
    ]

    if (!section) {
      crumbs[crumbs.length - 1] = { label: slaAnalyticsNavGroup.label }
      return crumbs
    }

    crumbs.push({ label: slaNavLabel(section) })
    return crumbs
  }

  if (normalized === '/dashboards' || normalized.startsWith('/dashboards/')) {
    const segments = normalized.split('/').filter(Boolean)
    const section = segments[1]

    const crumbs: BreadcrumbItem[] = [
      { label: 'Home', to: '/' },
      { label: dashboardsNavGroup.label, to: '/dashboards' }
    ]

    if (!section) {
      crumbs[crumbs.length - 1] = { label: dashboardsNavGroup.label }
      return crumbs
    }

    crumbs.push({ label: dashboardNavLabel(section) })
    return crumbs
  }

  if (normalized === '/configuracoes' || normalized.startsWith('/configuracoes/')) {
    const segments = normalized.split('/').filter(Boolean)
    const section = segments[1]
    const third = segments[2]

    const crumbs: BreadcrumbItem[] = [
      { label: 'Home', to: '/' },
      { label: configuracoesNavGroup.label, to: '/configuracoes' }
    ]

    if (!section) {
      crumbs[crumbs.length - 1] = { label: configuracoesNavGroup.label }
      return crumbs
    }

    if (section === 'sla' && third === 'auditoria') {
      crumbs.push({ label: 'SLA', to: '/configuracoes/sla' })
      crumbs.push({ label: 'Auditoria' })
      return crumbs
    }

    crumbs.push({ label: configuracaoNavLabel(section) })
    return crumbs
  }

  if (normalized === '/login') {
    return [{ label: 'Entrar' }]
  }

  if (normalized === '/auth/recuperar-senha') {
    return [
      { label: 'Entrar', to: '/login' },
      { label: 'Recuperar senha' }
    ]
  }

  if (normalized === '/auth/nova-senha') {
    return [
      { label: 'Entrar', to: '/login' },
      { label: 'Nova senha' }
    ]
  }

  if (normalized === '/cadastro-transportador') {
    return [
      { label: 'Entrar', to: '/login' },
      { label: 'Cadastro transportador' }
    ]
  }

  if (normalized === '/cadastro-motoboy') {
    return [
      { label: 'Entrar', to: '/login' },
      { label: 'Cadastro motoboy' }
    ]
  }

  if (normalized === '/excluir-conta') {
    return [
      { label: 'Entrar', to: '/login' },
      { label: 'Excluir conta' }
    ]
  }

  if (normalized === '/auth/cadastro-loja') {
    return [
      { label: 'Entrar', to: '/login' },
      { label: 'Cadastro loja' }
    ]
  }

  if (normalized === '/devolucoes' || normalized.startsWith('/devolucoes/')) {
    const segments = normalized.split('/').filter(Boolean) // devolucoes, section?, id?, extra?
    const section = segments[1]
    const id = segments[2]
    const extra = segments[3]

    const crumbs: BreadcrumbItem[] = [
      { label: 'Home', to: '/' },
      { label: devolucoesNavGroup.label, to: '/devolucoes' }
    ]

    if (!section) {
      crumbs[crumbs.length - 1] = { label: devolucoesNavGroup.label }
      return crumbs
    }

    const sectionTo = `/devolucoes/${section}`
    const sectionLabel = devolucaoLabel(section)

    if (!id) {
      crumbs.push({ label: sectionLabel })
      return crumbs
    }

    crumbs.push({ label: sectionLabel, to: sectionTo })

    if (extra === 'ticket') {
      crumbs.push({ label: `#${id}`, to: `${sectionTo}/${id}` })
      crumbs.push({ label: 'Ticket' })
      return crumbs
    }

    crumbs.push({ label: `#${id}` })
    return crumbs
  }

  return [
    { label: 'Home', to: '/' },
    { label: 'Via Reversa' }
  ]
}
