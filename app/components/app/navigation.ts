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

export const navigationItems: NavigationItem[] = [
  { label: 'Home', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Operação ao vivo', to: '/operacao/ao-vivo', icon: 'i-lucide-radio-tower' },
  { label: 'Pedidos', to: '/pedidos', icon: 'i-lucide-package-search' },
  { label: 'Lotes', to: '/operacao/lotes', icon: 'i-lucide-layers' },
  { label: 'Expedição', to: '/operacao/expedicao', icon: 'i-lucide-printer' },
  { label: 'Roteirização', to: '/operacao/roteirizacao', icon: 'i-lucide-route' },
  { label: 'Rotas', to: '/operacao/rotas', icon: 'i-lucide-map-pinned' },
  { label: 'Check In', to: '/loja/check-in', icon: 'i-lucide-scan-line' },
  { label: 'Tratativas', to: '/operacao/tratativas', icon: 'i-lucide-messages-square' },
  { label: 'Ocorrências NG', to: '/operacao/ocorrencias-ng', icon: 'i-lucide-radar' },
  { label: 'Disparo Chatbot', to: '/operacao/disparo-chatbot', icon: 'i-lucide-bot' },
  { label: 'Auditoria geográfica', to: '/operacao/geo-audit', icon: 'i-lucide-map-pin-off' },
  { label: 'Dashboard Reversa', to: '/operacao/dashboard-reversa', icon: 'i-lucide-chart-column-increasing' },
  { label: 'Calendário', to: '/calendario', icon: 'i-lucide-calendar' }
]

/** Labels e ordem iguais ao menu Cadastros do legado. */
export const cadastrosNavigation: NavigationItem[] = [
  { label: 'SLA', to: '/cadastros/sla', icon: 'i-lucide-timer' },
  { label: 'Fretes', to: '/cadastros/fretes', icon: 'i-lucide-banknote' },
  { label: 'Empresas', to: '/cadastros/empresas', icon: 'i-lucide-building-2' },
  { label: 'Contas', to: '/cadastros/contas', icon: 'i-lucide-wallet-cards' },
  { label: 'Usuários', to: '/cadastros/usuarios', icon: 'i-lucide-users' },
  { label: "Aprovações PA's", to: '/cadastros/aprovacoes-pas', icon: 'i-lucide-user-check' },
  { label: 'Ocorrências', to: '/cadastros/ocorrencias', icon: 'i-lucide-triangle-alert' },
  { label: 'Ocorrências Externas', to: '/cadastros/ocorrencias-externas', icon: 'i-lucide-list-tree' },
  { label: 'Regiões', to: '/cadastros/regioes', icon: 'i-lucide-map' },
  { label: 'Feriados', to: '/cadastros/feriados', icon: 'i-lucide-calendar-off' },
  { label: 'Produtos', to: '/cadastros/produtos', icon: 'i-lucide-package' },
  { label: 'Templates Chatbot', to: '/cadastros/templates-chatbot', icon: 'i-lucide-bot' }
]

export const cadastrosNavGroup: NavigationGroup = {
  label: 'Cadastros',
  icon: 'i-lucide-folder-cog',
  children: cadastrosNavigation
}

/** Labels e ordem alinhadas ao menu Devoluções do legado. */
export const devolucoesNavigation: NavigationItem[] = [
  { label: 'Acompanhamento', to: '/devolucoes/acompanhamento', icon: 'i-lucide-chart-column' },
  { label: 'DEV IN', to: '/devolucoes/dev-in', icon: 'i-lucide-package-plus' },
  { label: 'DEV OUT', to: '/devolucoes/dev-out', icon: 'i-lucide-truck' }
]

export const devolucoesNavGroup: NavigationGroup = {
  label: 'Devoluções',
  icon: 'i-lucide-undo-2',
  children: devolucoesNavigation
}

/** Labels fiéis ao menu Faturas do legado. */
export const faturasNavigation: NavigationItem[] = [
  { label: 'A receber', to: '/faturas/a-receber', icon: 'i-lucide-arrow-down-left' },
  { label: 'A pagar', to: '/faturas/a-pagar', icon: 'i-lucide-arrow-up-right' }
]

export const faturasNavGroup: NavigationGroup = {
  label: 'Faturas',
  icon: 'i-lucide-receipt',
  children: faturasNavigation
}

/** Labels fiéis ao menu Resumos do legado (substitui placeholder Análises). */
export const resumosNavigation: NavigationItem[] = [
  { label: 'Totais por Operação', to: '/resumos/totais-por-operacao', icon: 'i-lucide-layout-grid' },
  { label: 'Pedidos por Cliente', to: '/resumos/pedidos-por-cliente', icon: 'i-lucide-building-2' },
  { label: 'Pedidos por Estado', to: '/resumos/pedidos-por-estado', icon: 'i-lucide-map' }
]

export const resumosNavGroup: NavigationGroup = {
  label: 'Resumos',
  icon: 'i-lucide-chart-no-axes-combined',
  children: resumosNavigation
}

/** Labels fiéis ao menu SLA (analytics) do legado — distinto de Cadastros → SLA. */
export const slaAnalyticsNavigation: NavigationItem[] = [
  { label: 'SLA por Cliente (Data)', to: '/sla/cliente-por-data', icon: 'i-lucide-calendar-clock' },
  { label: 'SLA por Estado (Data)', to: '/sla/estado-por-data', icon: 'i-lucide-calendar-range' },
  { label: 'SLA por PA (Data)', to: '/sla/pa-por-data', icon: 'i-lucide-calendar-check' },
  { label: 'SLA por Transportador (Data)', to: '/sla/transportador-por-data', icon: 'i-lucide-calendar-days' },
  { label: 'SLA por Cliente', to: '/sla/por-cliente', icon: 'i-lucide-users' },
  { label: 'SLA por Estado', to: '/sla/por-estado', icon: 'i-lucide-map' },
  { label: 'SLA por PA', to: '/sla/por-pa', icon: 'i-lucide-map-pin-house' },
  { label: 'SLA por Transportador', to: '/sla/por-transportador', icon: 'i-lucide-truck' }
]

export const slaAnalyticsNavGroup: NavigationGroup = {
  label: 'SLA',
  icon: 'i-lucide-timer',
  children: slaAnalyticsNavigation
}

/** Labels fiéis ao menu Dashboards do legado (exceto Dashboard Reversa). */
export const dashboardsNavigation: NavigationItem[] = [
  { label: 'Indicadores', to: '/dashboards/indicadores', icon: 'i-lucide-gauge' },
  { label: 'Loja', to: '/dashboards/loja', icon: 'i-lucide-store' },
  { label: 'Loja (TV)', to: '/dashboards/loja-tv', icon: 'i-lucide-tv' }
]

export const dashboardsNavGroup: NavigationGroup = {
  label: 'Dashboards',
  icon: 'i-lucide-layout-dashboard',
  children: dashboardsNavigation
}

/** Labels fiéis ao menu Configurações do legado (módulo — distinto de Cadastros SLA). */
export const configuracoesNavigation: NavigationItem[] = [
  { label: 'SLA', to: '/configuracoes/sla', icon: 'i-lucide-timer' },
  { label: 'Processamento', to: '/configuracoes/processo', icon: 'i-lucide-cog' },
  { label: 'Externos', to: '/configuracoes/externos', icon: 'i-lucide-plug' }
]

export const configuracoesNavGroup: NavigationGroup = {
  label: 'Configurações',
  icon: 'i-lucide-settings-2',
  children: configuracoesNavigation
}

/** Itens de Gestão com rotas reais (ex-placeholders). */
export const secondaryNavigation: NavigationItem[] = [
  { label: 'Pontos de apoio', to: '/pontos-de-apoio', icon: 'i-lucide-map-pin-house' },
  { label: 'Transportadores', to: '/transportadores', icon: 'i-lucide-truck' }
]

/** Todos os grupos com submenu na sidebar. */
export const navigationGroups: NavigationGroup[] = [
  dashboardsNavGroup,
  slaAnalyticsNavGroup,
  resumosNavGroup,
  faturasNavGroup,
  devolucoesNavGroup,
  cadastrosNavGroup,
  configuracoesNavGroup
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
