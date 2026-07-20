import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import {
  agingColumns,
  agendamentosFixture,
  agendRegionColumns,
  backlogFixture,
  buildTrabalhadoMetrics,
  buildVisaoGeralMetrics,
  dashboardReversaTabs,
  mailingFixture,
  motoboyAgingColumns,
  motoboyPerfColumns,
  motoboysFixture,
  resumoColumns,
  resumoFixture,
  resumoSubTabs,
  trabalhadoFixture,
  trabalhadoUfColumns,
  visaoGeralFixture
} from '../app/data/demo/dashboard-reversa'
import { navigationItems } from '../app/components/app/navigation'
import { isTypedColumn } from '../app/types/data-table'
import { pctTone } from '../app/utils/chart-theme'

const chartWrappers = [
  'app/components/charts/VolumeTrendChart.vue',
  'app/components/charts/StatusDistribution.vue',
  'app/components/charts/StackedBarChart.vue',
  'app/components/charts/DonutChart.vue',
  'app/components/charts/ComboBarLineChart.vue',
  'app/components/charts/PercentTrendChart.vue',
  'app/components/charts/MultiAxisLineChart.vue'
] as const

describe('Dashboard Reversa', () => {
  it('expõe as 7 abas do legado na ordem esperada', () => {
    expect(dashboardReversaTabs.map((tab) => tab.label)).toEqual([
      'Visão Geral',
      'Mailing',
      'Trabalhado',
      'Backlog',
      'Motoboys',
      'Agendamentos',
      'Resumo'
    ])
  })

  it('está na navegação de Operação', () => {
    expect(navigationItems.some((item) => item.to === '/operacao/dashboard-reversa')).toBe(true)
  })

  it('monta 6 métricas da Visão Geral a partir do fixture', () => {
    const metrics = buildVisaoGeralMetrics(visaoGeralFixture.kpis)
    expect(metrics).toHaveLength(6)
    expect(metrics.map((item) => item.label)).toEqual([
      'Total',
      'Coletados',
      'Ocorrências',
      'Pendentes',
      'Voluntário',
      'Involuntário'
    ])
  })

  it('calcula efetividade do Trabalhado como no legado', () => {
    const metrics = buildTrabalhadoMetrics({
      trabalhado: 820,
      concluidos: 610,
      ocorrencias: 54,
      vol_concluidos: 268,
      invol_concluidos: 342
    })
    const efetividade = metrics.find((item) => item.label === 'Efetividade')
    expect(efetividade?.value).toBe('74.4%')
  })

  it('mantém fixtures ricos em todas as abas das ondas C–D', () => {
    expect(mailingFixture.byDay.length).toBeGreaterThan(5)
    expect(mailingFixture.consolidado.length).toBeGreaterThan(0)
    expect(trabalhadoFixture.efetividadeEvolution.length).toBeGreaterThan(0)
    expect(trabalhadoFixture.byUf.length).toBeGreaterThan(0)
    expect(backlogFixture.agingMatrix.length).toBeGreaterThan(0)
    expect(backlogFixture.agendadoByUf.length).toBeGreaterThan(0)
    expect(motoboysFixture.performance.length).toBeGreaterThan(0)
    expect(agendamentosFixture.evolution.length).toBeGreaterThan(0)
    expect(resumoFixture.geral.length).toBeGreaterThan(0)
    expect(resumoSubTabs.map((tab) => tab.label)).toEqual(['Geral', 'Voluntário', 'Involuntário'])
  })

  it('usa DataTable tipada nas tabelas que antes tinham slot legado', () => {
    const columnSets = [
      trabalhadoUfColumns,
      agingColumns,
      motoboyAgingColumns,
      motoboyPerfColumns,
      agendRegionColumns,
      resumoColumns
    ]
    for (const columns of columnSets) {
      expect(columns.every(isTypedColumn)).toBe(true)
      expect(columns.every((column) => isTypedColumn(column) && column.type === 'text')).toBe(true)
    }
  })

  it('não renderiza linhas via slot legado no Dashboard Reversa', () => {
    const source = readFileSync('app/pages/operacao/dashboard-reversa.vue', 'utf8')
    expect(source).not.toMatch(/<tr[\s>]/)
    expect(source).not.toMatch(/pct-pill|age-pill/)
    expect(source).toMatch(/:rows="tabCache\.trabalhado\.byUf"/)
    expect(source).toMatch(/:rows="tabCache\.backlog\.agingMatrix"/)
    expect(source).toMatch(/:rows="tabCache\.motoboys\.backlogAging"/)
    expect(source).toMatch(/:rows="tabCache\.motoboys\.performance"/)
    expect(source).toMatch(/:rows="filteredAgendamentos\.byRegion"/)
    expect(source).toMatch(/:rows="resumoRows"/)
  })

  it('classifica pills de percentual como no legado', () => {
    expect(pctTone(85)).toBe('good')
    expect(pctTone(60)).toBe('mid')
    expect(pctTone(40)).toBe('bad')
    expect(pctTone(15, true)).toBe('good')
    expect(pctTone(55, true)).toBe('bad')
  })
})

describe('Charts DS (Chart.js)', () => {
  it('wrappers usam vue-chartjs e não SVG ad-hoc', () => {
    for (const path of chartWrappers) {
      expect(existsSync(path)).toBe(true)
      const source = readFileSync(path, 'utf8')
      expect(source).toMatch(/vue-chartjs/)
      expect(source).not.toMatch(/<svg[\s>]/)
      expect(source).not.toMatch(/preserveAspectRatio/)
    }
  })

  it('MetricsStrip permanece faixa contínua sem gap entre cards', () => {
    const source = readFileSync('app/components/app/MetricsStrip.vue', 'utf8')
    expect(source).toMatch(/gap:\s*0|gap-0/)
    expect(source).toMatch(/border-right:\s*1px solid var\(--via-line\)|border-r border-via-line/)
  })
})
