import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const routes = [
  ['app/pages/index.vue', 'OperationsBoard'],
  ['app/pages/operacoes/[slug].vue', 'OperationFlow'],
  ['app/pages/operacao/ao-vivo.vue', 'AttentionQueue'],
  ['app/pages/pedidos/index.vue', 'OrdersTable'],
  ['app/pages/pedidos/novo.vue', 'OrderCreateWizard'],
  ['app/pages/pedidos/[id]/index.vue', 'OrderJourney'],
  ['app/pages/pedidos/[id]/index.vue', 'OrderSummary'],
  ['app/pages/pedidos/[id]/index.vue', 'DecisionPanel'],
  ['app/pages/pedidos/[id]/index.vue', 'OrderItemsPanel'],
  ['app/pages/pedidos/[id]/index.vue', 'OrderOccurrencesPanel'],
  ['app/pages/pedidos/[id]/index.vue', 'OrderEvidencesPanel'],
  ['app/pages/pedidos/[id]/index.vue', 'OrderSchedulingPanel'],
  ['app/pages/pedidos/[id]/index.vue', 'OrderHistoryPanel'],
  ['app/pages/pedidos/[id]/editar.vue', 'OrderEditForm'],
  ['app/pages/pedidos/[id]/checkout.vue', 'MetricsStrip'],
  ['app/pages/pedidos/novo-proprio.vue', 'OrderCreateWizard'],
  ['app/pages/operacao/geo-audit.vue', 'VolumeTrendChart'],
  ['app/pages/pontos-de-apoio/index.vue', 'DataTable'],
  ['app/pages/transportadores/index.vue', 'Pagination'],
  ['app/components/cadastros/CadastroOnda3Page.vue', 'AppModal'],
  ['app/pages/cadastros/sla/index.vue', 'DataTable'],
  ['app/pages/cadastros/fretes/index.vue', 'AppModal'],
  ['app/pages/devolucoes/dev-in/index.vue', 'DataTable'],
  ['app/pages/devolucoes/dev-in/[id]/index.vue', 'AppModal'],
  ['app/pages/devolucoes/dev-out/index.vue', 'DataTable'],
  ['app/pages/devolucoes/dev-out/[id].vue', 'AppModal'],
  ['app/pages/devolucoes/acompanhamento.vue', 'MetricsStrip'],
  ['app/pages/operacao/dashboard-reversa.vue', 'MetricsStrip'],
  ['app/pages/operacao/dashboard-reversa.vue', 'StackedBarChart'],
  ['app/pages/operacao/dashboard-reversa.vue', 'ChartPanel'],
  ['app/pages/operacao/dashboard-reversa.vue', 'DonutChart'],
  ['app/pages/index.vue', 'VolumeTrendChart'],
  ['app/pages/operacoes/[slug].vue', 'StatusDistribution'],
  ['app/pages/devolucoes/acompanhamento.vue', 'VolumeTrendChart'],
  ['app/pages/operacao/lotes/index.vue', 'DataTable'],
  ['app/pages/operacao/lotes/index.vue', 'VolumeTrendChart'],
  ['app/pages/operacao/lotes/[id].vue', 'AppModal'],
  ['app/pages/faturas/a-receber.vue', 'FaturasListView'],
  ['app/pages/faturas/a-pagar.vue', 'FaturasListView'],
  ['app/components/faturas/FaturasListView.vue', 'MetricsStrip'],
  ['app/components/faturas/FaturasListView.vue', 'VolumeTrendChart'],
  ['app/pages/faturas/nova/[kind].vue', 'DataTable'],
  ['app/pages/faturas/[id].vue', 'AppModal'],
  ['app/pages/login.vue', 'AppFormField'],
  ['app/pages/auth/recuperar-senha.vue', 'AppFormField'],
  ['app/pages/auth/nova-senha.vue', 'EmptyState'],
  ['app/pages/cadastro-transportador.vue', 'AppFormField'],
  ['app/pages/resumos/totais-por-operacao.vue', 'MetricsStrip'],
  ['app/pages/resumos/totais-por-operacao.vue', 'StatusDistribution'],
  ['app/pages/resumos/totais-por-operacao.vue', 'DataTable'],
  ['app/pages/resumos/pedidos-por-cliente.vue', 'VolumeTrendChart'],
  ['app/pages/resumos/pedidos-por-estado.vue', 'Pagination'],
  ['app/components/sla/SlaReportView.vue', 'MetricsStrip'],
  ['app/components/sla/SlaReportView.vue', 'PercentTrendChart'],
  ['app/components/sla/SlaReportView.vue', 'DataTable'],
  ['app/pages/sla/cliente-por-data.vue', 'SlaReportView'],
  ['app/pages/sla/por-cliente.vue', 'SlaReportView'],
  ['app/pages/sla/por-transportador.vue', 'SlaReportView'],
  ['app/pages/sla/transportador-por-data.vue', 'SlaReportView'],
  ['app/pages/resumos/pontos-de-apoio.vue', 'MetricsStrip'],
  ['app/pages/resumos/transportadores.vue', 'DataTable'],
  ['app/pages/resumos/mapa.vue', 'resumos-mapa-canvas'],
  ['app/pages/dashboards/indicadores.vue', 'StackedBarChart'],
  ['app/pages/dashboards/loja.vue', 'StatusDistribution'],
  ['app/pages/dashboards/loja-tv.vue', 'MetricsStrip'],
  ['app/pages/operacao/expedicao.vue', 'etiqueta-pdf-preview'],
  ['app/pages/operacao/roteirizacao.vue', 'AppFormField'],
  ['app/pages/operacao/rotas/index.vue', 'VolumeTrendChart'],
  ['app/pages/operacao/rotas/[id].vue', 'rota-mapa-visual'],
  ['app/pages/calendario.vue', 'ViaCalendar'],
  ['app/pages/calendario.vue', 'ViaCalendarWeek'],
  ['app/pages/cadastro-motoboy.vue', 'AppFormField'],
  ['app/pages/excluir-conta.vue', 'AppModal'],
  ['app/pages/auth/cadastro-loja.vue', 'AppFormField'],
  ['app/pages/operacao/tratativas.vue', 'MetricsStrip'],
  ['app/pages/operacao/tratativas.vue', 'StatusDistribution'],
  ['app/pages/operacao/ocorrencias-ng.vue', 'AppModal'],
  ['app/pages/operacao/disparo-chatbot.vue', 'DataTable'],
  ['app/pages/operacao/chatbot-monitor.vue', 'PercentTrendChart'],
  ['app/pages/operacao/mileto-backfill.vue', 'AppModal'],
  ['app/pages/loja/check-in.vue', 'AppFormField'],
  ['app/pages/configuracoes/sla/index.vue', 'AppFormField'],
  ['app/pages/configuracoes/sla/auditoria.vue', 'VolumeTrendChart'],
  ['app/pages/configuracoes/processo.vue', 'AppModal'],
  ['app/pages/configuracoes/externos.vue', 'MetricsStrip'],
  ['app/pages/publico/consulta-pedido.vue', 'AppFormField'],
  ['app/pages/publico/pedido/[hash].vue', 'EmptyState'],
  ['app/pages/c.vue', 'AppModal'],
  ['app/pages/checkout.vue', 'AppModal'],
  ['app/layouts/auth.vue', 'AppToastHost'],
  ['app/layouts/public.vue', 'AppToastHost'],
  ['app/layouts/tv.vue', 'AppToastHost']
] as const

describe('rotas aprovadas', () => {
  it.each(routes)('materializa %s com %s', (path, component) => {
    expect(existsSync(path)).toBe(true)
    expect(readFileSync(path, 'utf8')).toContain(component)
  })

  it('mantém a nomenclatura completa nas páginas', () => {
    for (const [path] of routes) {
      if (!existsSync(path)) continue
      expect(readFileSync(path, 'utf8')).not.toMatch(/\bPA\b/)
    }
  })

  it('não usa DataTable genérica no detalhe do pedido', () => {
    const panels = [
      'app/components/orders/OrderItemsPanel.vue',
      'app/components/orders/OrderOccurrencesPanel.vue',
      'app/components/orders/OrderEvidencesPanel.vue',
      'app/components/orders/OrderSchedulingPanel.vue',
      'app/components/orders/OrderHistoryPanel.vue'
    ]
    for (const path of panels) {
      expect(readFileSync(path, 'utf8')).not.toContain('DataTable')
    }
  })
})
