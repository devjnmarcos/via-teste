import { describe, expect, it } from 'vitest'
import {
  dashboardsNavigation,
  navigationItems,
  slaAnalyticsNavigation
} from '../app/components/app/navigation'
import {
  buildSlaStackedSeries,
  dateRowsForDimension,
  entitiesForDimension,
  slaPercentTrend,
  slaVariantMeta
} from '../app/data/demo/sla-analytics'
import {
  buildLojaStatusDistribution,
  indicadoresPaRows,
  lojaQueueRows
} from '../app/data/demo/dashboards'
import {
  createRouteFromSelection,
  deleteRouteIfEmpty,
  getRouteById,
  routesState
} from '../app/data/demo/roteirizacao'
import {
  expedicaoState,
  markOrdersPrinted
} from '../app/data/demo/expedicao'
import {
  buildMonthCells,
  buildWeekCells,
  countEventsByDay,
  eventsForDay,
  weekRangeLabel
} from '../app/data/demo/calendario'
import {
  buildSlaDateMetrics,
  buildSlaEntityMetrics
} from '../app/utils/sla-analytics-metrics'
import {
  buildIndicadoresMetrics,
  buildLojaMetrics
} from '../app/utils/dashboards-metrics'
import {
  buildCalendarioMetrics,
  buildExpedicaoMetrics,
  buildRoutesListMetrics,
  buildRoteirizacaoMetrics
} from '../app/utils/operacao-p2-metrics'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

describe('navegação P2', () => {
  it('expõe Expedição, Roteirização, Rotas e Calendário na operação', () => {
    expect(navigationItems.map((item) => item.to)).toEqual([
      '/',
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
      '/operacao/geo-audit',
      '/operacao/dashboard-reversa',
      '/calendario'
    ])
  })

  it('expõe submenu SLA analytics com rotas do legado (6 menu + 2 transportador)', () => {
    expect(slaAnalyticsNavigation.map((item) => item.to)).toEqual([
      '/sla/cliente-por-data',
      '/sla/estado-por-data',
      '/sla/pa-por-data',
      '/sla/transportador-por-data',
      '/sla/por-cliente',
      '/sla/por-estado',
      '/sla/por-pa',
      '/sla/por-transportador'
    ])
    expect(slaAnalyticsNavigation.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
  })

  it('expõe submenu Dashboards sem Dashboard Reversa', () => {
    expect(dashboardsNavigation.map((item) => item.label)).toEqual([
      'Indicadores',
      'Loja',
      'Loja (TV)'
    ])
    expect(dashboardsNavigation.map((item) => item.to)).toEqual([
      '/dashboards/indicadores',
      '/dashboards/loja',
      '/dashboards/loja-tv'
    ])
  })
})

describe('SLA analytics fixtures e métricas', () => {
  it('cobre as 6 variantes e séries por dimensão', () => {
    expect(Object.keys(slaVariantMeta)).toHaveLength(8)
    expect(entitiesForDimension('customer').length).toBeGreaterThanOrEqual(5)
    expect(dateRowsForDimension('state').length).toBeGreaterThanOrEqual(6)
    expect(slaPercentTrend.length).toBeGreaterThanOrEqual(5)
    expect(buildSlaStackedSeries(entitiesForDimension('support_point'))[0]?.vol).toBeGreaterThan(0)
  })

  it('monta MetricsStrip de entidade e por data', () => {
    const entityMetrics = buildSlaEntityMetrics(entitiesForDimension('customer'))
    expect(entityMetrics).toHaveLength(6)
    expect(entityMetrics[0]?.label).toBe('% Atendido')

    const dateMetrics = buildSlaDateMetrics(dateRowsForDimension('customer'))
    expect(dateMetrics).toHaveLength(3)
    expect(dateMetrics[2]?.label).toBe('Volume')
  })
})

describe('dashboards P2 fixtures e métricas', () => {
  it('agrega indicadores de PA e fila da loja', () => {
    expect(indicadoresPaRows.length).toBeGreaterThanOrEqual(5)
    const metrics = buildIndicadoresMetrics(indicadoresPaRows)
    expect(metrics).toHaveLength(6)
    expect(metrics[0]?.label).toBe('Convidados / atribuídos')

    const lojaMetrics = buildLojaMetrics(lojaQueueRows)
    expect(lojaMetrics[0]?.label).toBe('Na fila')
    expect(buildLojaStatusDistribution(lojaQueueRows).length).toBeGreaterThanOrEqual(3)
  })
})

describe('roteirização e rotas', () => {
  it('cria rota a partir da seleção e bloqueia exclusão com pedidos', () => {
    const before = routesState.scriptingOrders.length
    const candidate = routesState.scriptingOrders[0]
    expect(candidate).toBeTruthy()

    const created = createRouteFromSelection({
      name: 'Rota teste Vitest',
      orderIds: [candidate!.orderId]
    })
    expect(created.ordersCount).toBe(1)
    expect(getRouteById(created.id)?.name).toBe('Rota teste Vitest')
    expect(routesState.scriptingOrders.length).toBe(before - 1)
    expect(deleteRouteIfEmpty(created.id)).toBe(false)

    const empty = routesState.routes.find((route) => route.ordersCount === 0)
    expect(empty).toBeTruthy()
    expect(deleteRouteIfEmpty(empty!.id)).toBe(true)
  })

  it('monta métricas de listagem e montagem', () => {
    expect(buildRoutesListMetrics(routesState.routes).length).toBe(6)
    expect(
      buildRoteirizacaoMetrics(routesState.scriptingOrders, [], 2)[0]?.label
    ).toBe('Selecionados')
  })
})

describe('expedição e calendário', () => {
  it('marca etiquetas como impressas', () => {
    const ready = expedicaoState.orders.find((order) => !order.printed)
    expect(ready).toBeTruthy()
    const before = expedicaoState.printedToday
    const count = markOrdersPrinted([ready!.orderId])
    expect(count).toBe(1)
    expect(expedicaoState.printedToday).toBe(before + 1)
    expect(buildExpedicaoMetrics(expedicaoState.orders, 1, expedicaoState.printedToday)[1]?.label)
      .toBe('Impressos hoje')
  })

  it('monta grade do mês e eventos do dia', () => {
    const cells = buildMonthCells(2026, 6)
    expect(cells.length % 7).toBe(0)
    expect(cells.some((cell) => cell.day === 18)).toBe(true)
    expect(eventsForDay(18).length).toBeGreaterThanOrEqual(2)
    expect(countEventsByDay()[18]).toBeGreaterThanOrEqual(2)
    expect(buildCalendarioMetrics(eventsForDay(18), 3)[0]?.label).toBe('Agendados')
  })

  it('monta vista semana e label do intervalo', () => {
    const week = buildWeekCells(2026, 6, 18)
    expect(week).toHaveLength(7)
    expect(week.every((cell) => cell.weekdayLabel)).toBe(true)
    expect(week.some((cell) => cell.day === 18)).toBe(true)
    expect(weekRangeLabel(2026, 6, 18)).toContain('Julho 2026')
  })

  it('expõe fixtures SLA por transportador', () => {
    expect(entitiesForDimension('transporter').length).toBeGreaterThanOrEqual(4)
    expect(dateRowsForDimension('transporter').length).toBeGreaterThanOrEqual(4)
    expect(slaVariantMeta['por-transportador'].title).toContain('Transportador')
  })
})

describe('breadcrumbs P2', () => {
  it('resolve SLA, Dashboards, operação e calendário', () => {
    expect(resolveBreadcrumbs('/sla/por-cliente')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'SLA', to: '/sla' },
      { label: 'SLA por Cliente' }
    ])
    expect(resolveBreadcrumbs('/sla/cliente-por-data')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'SLA', to: '/sla' },
      { label: 'SLA por Cliente (Data)' }
    ])
    expect(resolveBreadcrumbs('/sla/por-transportador')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'SLA', to: '/sla' },
      { label: 'SLA por Transportador' }
    ])
    expect(resolveBreadcrumbs('/dashboards/loja-tv')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Dashboards', to: '/dashboards' },
      { label: 'Loja (TV)' }
    ])
    expect(resolveBreadcrumbs('/operacao/expedicao')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Expedição' }
    ])
    expect(resolveBreadcrumbs('/operacao/roteirizacao')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Roteirização' }
    ])
    expect(resolveBreadcrumbs('/operacao/rotas/rt-101', { id: 'rt-101' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Rotas', to: '/operacao/rotas' },
      { label: '#rt-101' }
    ])
    expect(resolveBreadcrumbs('/calendario')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Calendário' }
    ])
  })
})
