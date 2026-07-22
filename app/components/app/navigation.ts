export interface NavigationItem {
  label: string
  to: string
  icon: string
}

export interface NavigationGroup {
  label: string
  icon: string
  children: NavigationItem[]
}

/**
 * Itens soltos no topo, seção "Operação": Home, Calendário e o sobrevivente
 * do extinto grupo Operação (Operação ao vivo) — Lotes migrou pro grupo Remessas.
 */
export const navigationItems: NavigationItem[] = [
  { label: 'Home', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Calendário', to: '/calendario', icon: 'i-lucide-calendar' },
  { label: 'Operação ao vivo', to: '/operacao/ao-vivo', icon: 'i-lucide-radio-tower' }
]

/**
 * Grupo Dashboards — Ponto de apoios (ex-Indicadores), Operações (ex-Dashboard Reversa),
 * Ocorrências (ex-Tratativas), SLA (rota nova, substitui os 8 relatórios antigos de /sla/*)
 * e Monitor do chatbot (rota já existia como deep-link sem entrada de menu).
 * Loja / Loja (TV) saem do menu (páginas continuam existindo no código).
 */
export const dashboardsNavigation: NavigationItem[] = [
  { label: 'Ponto de apoios', to: '/dashboards/indicadores', icon: 'i-lucide-gauge' },
  { label: 'Operações', to: '/operacao/dashboard-reversa', icon: 'i-lucide-chart-column-increasing' },
  { label: 'Ocorrências', to: '/operacao/tratativas', icon: 'i-lucide-messages-square' },
  { label: 'SLA', to: '/dashboards/sla', icon: 'i-lucide-timer' },
  { label: 'Monitor do chatbot', to: '/operacao/chatbot-monitor', icon: 'i-lucide-bot' }
]

export const dashboardsNavGroup: NavigationGroup = {
  label: 'Dashboards',
  icon: 'i-lucide-layout-dashboard',
  children: dashboardsNavigation
}

/**
 * Grupo novo Rotas & Rastreio — Rotas e Roteirização (vieram do extinto grupo Operação)
 * e Rastreio (ex-Auditoria geográfica, mesma rota /operacao/geo-audit).
 */
export const rotasRastreioNavigation: NavigationItem[] = [
  { label: 'Rotas', to: '/operacao/rotas', icon: 'i-lucide-map-pinned' },
  { label: 'Roteirização', to: '/operacao/roteirizacao', icon: 'i-lucide-route' },
  { label: 'Rastreio', to: '/operacao/geo-audit', icon: 'i-lucide-map-pin-off' }
]

export const rotasRastreioNavGroup: NavigationGroup = {
  label: 'Rotas & Rastreio',
  icon: 'i-lucide-route',
  children: rotasRastreioNavigation
}

/**
 * Grupo novo Logs — Ocorrências NG (veio do extinto grupo Operação) e Integração
 * (rota nova, página ainda não existe — criada por outro plano).
 */
export const logsNavigation: NavigationItem[] = [
  { label: 'Ocorrências NG', to: '/operacao/ocorrencias-ng', icon: 'i-lucide-radar' },
  { label: 'Integração', to: '/logs/integracao', icon: 'i-lucide-scroll-text' }
]

export const logsNavGroup: NavigationGroup = {
  label: 'Logs',
  icon: 'i-lucide-scroll-text',
  children: logsNavigation
}

/**
 * Grupo Devoluções renomeado Remessas — Caixas (ex-DEV IN), Despachos (ex-DEV OUT)
 * e Lotes (migrou do extinto grupo Operação). "Acompanhamento" sai do menu
 * (página continua existindo no código).
 */
export const devolucoesNavigation: NavigationItem[] = [
  { label: 'Caixas', to: '/devolucoes/dev-in', icon: 'i-lucide-package-plus' },
  { label: 'Despachos', to: '/devolucoes/dev-out', icon: 'i-lucide-truck' },
  { label: 'Lotes', to: '/operacao/lotes', icon: 'i-lucide-layers' }
]

export const devolucoesNavGroup: NavigationGroup = {
  label: 'Remessas',
  icon: 'i-lucide-undo-2',
  children: devolucoesNavigation
}

/**
 * Grupo Cadastros — Pedidos migrou do extinto grupo Operação (rota /pedidos inalterada,
 * ver "Decisão registrada" no plano); Contas renomeada Operadores; Ocorrências Externas
 * saiu do menu; Operações é rota nova (página ainda não existe).
 */
export const cadastrosNavigation: NavigationItem[] = [
  { label: 'Pedidos', to: '/pedidos', icon: 'i-lucide-package-search' },
  { label: 'SLA', to: '/cadastros/sla', icon: 'i-lucide-timer' },
  { label: 'Fretes', to: '/cadastros/fretes', icon: 'i-lucide-banknote' },
  { label: 'Empresas', to: '/cadastros/empresas', icon: 'i-lucide-building-2' },
  { label: 'Operadores', to: '/cadastros/contas', icon: 'i-lucide-wallet-cards' },
  { label: 'Usuários', to: '/cadastros/usuarios', icon: 'i-lucide-users' },
  { label: "Aprovações PA's", to: '/cadastros/aprovacoes-pas', icon: 'i-lucide-user-check' },
  { label: 'Ocorrências', to: '/cadastros/ocorrencias', icon: 'i-lucide-triangle-alert' },
  { label: 'Regiões', to: '/cadastros/regioes', icon: 'i-lucide-map' },
  { label: 'Feriados', to: '/cadastros/feriados', icon: 'i-lucide-calendar-off' },
  { label: 'Produtos', to: '/cadastros/produtos', icon: 'i-lucide-package' },
  { label: 'Templates Chatbot', to: '/cadastros/templates-chatbot', icon: 'i-lucide-bot' },
  { label: 'Operações', to: '/cadastros/operacoes', icon: 'i-lucide-shuffle' },
  { label: 'Feature Flags', to: '/cadastros/feature-flags', icon: 'i-lucide-toggle-right' },
  { label: 'Cargos', to: '/cadastros/cargos', icon: 'i-lucide-id-card' }
]

export const cadastrosNavGroup: NavigationGroup = {
  label: 'Cadastros',
  icon: 'i-lucide-folder-cog',
  children: cadastrosNavigation
}

/**
 * Item solto final — Integrações substitui o extinto grupo Configurações (só sobrou
 * 1 filho depois de remover SLA/Processamento) e o antigo secondaryNavigation
 * (Pontos de apoio/Transportadores saíram do menu — páginas deletadas por outro plano).
 */
export const secondaryNavigation: NavigationItem[] = [
  { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' }
]

/** Todos os grupos com submenu na sidebar, na ordem final da seção "Gestão". */
export const navigationGroups: NavigationGroup[] = [
  dashboardsNavGroup,
  rotasRastreioNavGroup,
  logsNavGroup,
  devolucoesNavGroup,
  cadastrosNavGroup
]

/** Garante contrato mínimo dos itens (to/label/icon) para o render da sidebar. */
export function assertNavigationIntegrity(items: NavigationItem[] = [
  ...navigationItems,
  ...secondaryNavigation,
  ...navigationGroups.flatMap((group) => group.children)
]) {
  for (const item of items) {
    if (!item.label?.trim()) throw new Error('NavigationItem sem label')
    if (!item.to?.startsWith('/')) throw new Error(`NavigationItem sem to válido: ${item.label}`)
    if (!item.icon?.startsWith('i-lucide-')) throw new Error(`NavigationItem sem ícone Lucide: ${item.label}`)
  }
  return true
}
