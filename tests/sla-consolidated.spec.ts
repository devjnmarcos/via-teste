import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  slaConsolidatedDimensions,
  slaConsolidatedTabs
} from '../app/data/demo/sla-analytics'

describe('SLA consolidado — configuração de dimensões e abas', () => {
  it('expõe 4 dimensões (Cliente, Estado, Ponto de apoio, Transportador)', () => {
    expect(slaConsolidatedDimensions.map((item) => item.label)).toEqual([
      'Cliente',
      'Estado',
      'Ponto de apoio',
      'Transportador'
    ])
    expect(slaConsolidatedDimensions.map((item) => item.value)).toEqual([
      'customer',
      'state',
      'support_point',
      'transporter'
    ])
  })

  it('mapeia cada dimensão às variantes por-entidade e por-data existentes em slaVariantMeta', () => {
    expect(slaConsolidatedDimensions.map((item) => item.entityVariant)).toEqual([
      'por-cliente',
      'por-estado',
      'por-pa',
      'por-transportador'
    ])
    expect(slaConsolidatedDimensions.map((item) => item.dateVariant)).toEqual([
      'cliente-por-data',
      'estado-por-data',
      'pa-por-data',
      'transportador-por-data'
    ])
  })

  it('expõe 2 abas (ranking, by-date)', () => {
    expect(slaConsolidatedTabs.map((tab) => tab.id)).toEqual(['ranking', 'by-date'])
    expect(slaConsolidatedTabs.map((tab) => tab.label)).toEqual([
      'Ranking por entidade',
      'Evolução por data'
    ])
  })
})

describe('SLA consolidado — página nova cobre as 8 telas legadas', () => {
  const pagePath = 'app/pages/dashboards/sla.vue'

  it('existe em app/pages/dashboards/sla.vue', () => {
    expect(existsSync(pagePath)).toBe(true)
  })

  it('mantém todas as métricas e colunas do modo Ranking (por-entidade)', () => {
    const source = readFileSync(pagePath, 'utf8')
    for (const label of [
      'Atendidos',
      'Expirados',
      '% Atendido',
      '% Expirado',
      'Concluídos',
      'Ocorrências',
      'Total'
    ]) {
      expect(source).toContain(label)
    }
    expect(source).toContain('DonutChart')
    expect(source).toContain('StackedBarChart')
  })

  it('mantém a coluna Data e o gráfico de tendência do modo Por data', () => {
    const source = readFileSync(pagePath, 'utf8')
    expect(source).toContain("key: 'dateLabel'")
    expect(source).toContain('PercentTrendChart')
  })

  it('usa 1 filtro de dimensão único em vez de 8 arquivos, e segue o padrão de abas do dashboard-reversa', () => {
    const source = readFileSync(pagePath, 'utf8')
    expect(source).toContain('slaConsolidatedDimensions')
    expect(source).toContain('slaConsolidatedTabs')
    expect(source).toContain('<nav')
    expect(source).not.toContain('UTabs')
  })

  it('não usa "PA" como palavra solta (usa Ponto de apoio por extenso)', () => {
    const source = readFileSync(pagePath, 'utf8')
    expect(source).not.toMatch(/\bPA\b/)
  })
})

describe('SLA consolidado — as 8 páginas antigas foram removidas', () => {
  it('não existe mais nenhuma das 8 rotas antigas de /sla/*', () => {
    for (const path of [
      'app/pages/sla/index.vue',
      'app/pages/sla/cliente-por-data.vue',
      'app/pages/sla/estado-por-data.vue',
      'app/pages/sla/pa-por-data.vue',
      'app/pages/sla/transportador-por-data.vue',
      'app/pages/sla/por-cliente.vue',
      'app/pages/sla/por-estado.vue',
      'app/pages/sla/por-pa.vue',
      'app/pages/sla/por-transportador.vue'
    ]) {
      expect(existsSync(path)).toBe(false)
    }
  })

  it('remove o componente SlaReportView (órfão, sem consumidores)', () => {
    expect(existsSync('app/components/sla/SlaReportView.vue')).toBe(false)
  })
})
