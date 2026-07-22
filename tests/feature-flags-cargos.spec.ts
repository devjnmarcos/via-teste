import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildFeatureRankingSeries,
  buildFeaturesMetrics,
  createEmptyFeature,
  createEmptyFeatureLink,
  featureAdoptionCounts,
  featureOperatorOptions,
  getFeatureLinks,
  getFeatures,
  linkedOperatorsCount,
  resolveOperatorLabel,
  setFeatureLinks,
  setFeatures
} from '../app/data/demo/features'
import {
  buildCargosMetrics,
  cargoUserOptions,
  createEmptyCargo,
  createEmptyCargoLink,
  getCargoLinks,
  getCargos,
  linkedUsersCount,
  resolveUserLabel,
  setCargoLinks,
  setCargos
} from '../app/data/demo/cargos'
import { cadastroOnda3Configs, isCadastroOnda3Kind } from '../app/data/demo/cadastros-onda3'
import { cadastrosNavigation } from '../app/components/app/navigation'
import { cadastroNavItems, getCadastroMeta } from '../app/data/demo/cadastros'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

describe('DonutChart aceita rótulos customizados (uso em Feature Flags · adoção)', () => {
  it('expõe volLabel/involLabel opcionais com defaults iguais ao legado', () => {
    const source = readFileSync('app/components/charts/DonutChart.vue', 'utf8')
    expect(source).toContain('volLabel?: string')
    expect(source).toContain('involLabel?: string')
    expect(source).toContain("volLabel: 'Voluntário'")
    expect(source).toContain("involLabel: 'Involuntário'")
    expect(source).toContain('labels: [props.volLabel, props.involLabel]')
  })
})

describe('fixtures de Feature Flags', () => {
  it('expõe entre 5 e 8 features com códigos únicos no padrão enable_*', () => {
    const rows = getFeatures()
    expect(rows.length).toBeGreaterThanOrEqual(5)
    expect(rows.length).toBeLessThanOrEqual(8)
    expect(rows.every((row) => /^enable_[a-z_]+$/.test(row.code))).toBe(true)
    expect(new Set(rows.map((row) => row.code)).size).toBe(rows.length)
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
  })

  it('calcula métricas de features (total/ativas/inativas/operadores com ao menos 1 feature)', () => {
    const rows = getFeatures()
    const metrics = buildFeaturesMetrics(rows)
    expect(metrics).toHaveLength(4)
    expect(metrics.map((metric) => metric.label)).toEqual(['Features', 'Ativas', 'Inativas', 'Operadores'])
    expect(metrics[0]).toMatchObject({ value: rows.length })
    const active = rows.filter((row) => row.active).length
    expect(metrics[1]).toMatchObject({ value: active })
    expect(metrics[2]).toMatchObject({ value: rows.length - active })
  })

  it('cria e persiste uma feature nova (mock)', () => {
    const before = getFeatures().length
    const draft = createEmptyFeature()
    expect(draft.active).toBe(true)
    expect(draft.name).toBe('')
    setFeatures([...getFeatures(), { id: 'feat-test', ...draft, name: 'Teste', code: 'enable_test' }])
    expect(getFeatures().length).toBe(before + 1)
    setFeatures(getFeatures().filter((row) => row.id !== 'feat-test'))
    expect(getFeatures().length).toBe(before)
  })

  it('lista vínculos de operador de uma feature e resolve o nome do operador', () => {
    const withLinks = getFeatures().find((row) => getFeatureLinks(row.id).length > 0)
    expect(withLinks).toBeTruthy()
    const links = getFeatureLinks(withLinks!.id)
    for (const link of links) {
      expect(link.featureId).toBe(withLinks!.id)
      expect(resolveOperatorLabel(link.accountId)).not.toBe('')
    }
    expect(linkedOperatorsCount(withLinks!.id)).toBe(links.length)
  })

  it('expõe ao menos 1 feature sem nenhum operador vinculado (caso 0 vínculos)', () => {
    const rows = getFeatures()
    expect(rows.some((row) => getFeatureLinks(row.id).length === 0)).toBe(true)
  })

  it('substitui os vínculos de uma feature (mock)', () => {
    const first = getFeatures()[0]!
    const before = getFeatureLinks(first.id)
    const draft = createEmptyFeatureLink(first.id)
    expect(draft.featureId).toBe(first.id)
    setFeatureLinks(first.id, [...before, { id: 'flk-test', ...draft, accountId: 'cta-2' }])
    expect(getFeatureLinks(first.id).length).toBe(before.length + 1)
    setFeatureLinks(first.id, before)
    expect(getFeatureLinks(first.id).length).toBe(before.length)
  })

  it('expõe opções de operador para o formulário de vínculo', () => {
    expect(featureOperatorOptions().length).toBeGreaterThan(0)
  })

  it('monta a série de ranking (ativos × inativos) ordenada do maior para o menor total', () => {
    const series = buildFeatureRankingSeries(getFeatures())
    expect(series.length).toBe(getFeatures().length)
    for (const point of series) {
      expect(point.vol).toBeGreaterThanOrEqual(0)
      expect(point.invol).toBeGreaterThanOrEqual(0)
    }
    const totals = series.map((point) => point.vol + point.invol)
    const sorted = [...totals].sort((a, b) => b - a)
    expect(totals).toEqual(sorted)
  })

  it('calcula adoção (features com × sem operador vinculado) somando ao total de features', () => {
    const rows = getFeatures()
    const adoption = featureAdoptionCounts(rows)
    expect(adoption.withOperators + adoption.withoutOperators).toBe(rows.length)
    expect(adoption.withoutOperators).toBeGreaterThan(0)
  })
})

describe('fixtures de Cargos', () => {
  it('expõe ao menos 3 cargos com ids/nomes únicos', () => {
    const rows = getCargos()
    expect(rows.length).toBeGreaterThanOrEqual(3)
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
    expect(new Set(rows.map((row) => row.name)).size).toBe(rows.length)
  })

  it('calcula métricas simples de cargos (total de cargos e total de vínculos)', () => {
    const rows = getCargos()
    const metrics = buildCargosMetrics(rows)
    expect(metrics).toHaveLength(2)
    expect(metrics.map((metric) => metric.label)).toEqual(['Cargos', 'Vínculos'])
    expect(metrics[0]).toMatchObject({ value: rows.length })
  })

  it('cria e persiste um cargo novo (mock)', () => {
    const before = getCargos().length
    const draft = createEmptyCargo()
    expect(draft.active).toBe(true)
    expect(draft.name).toBe('')
    setCargos([...getCargos(), { id: 'cgo-test', ...draft, name: 'Teste' }])
    expect(getCargos().length).toBe(before + 1)
    setCargos(getCargos().filter((row) => row.id !== 'cgo-test'))
    expect(getCargos().length).toBe(before)
  })

  it('lista vínculos de usuário de um cargo e resolve o nome do usuário', () => {
    const withLinks = getCargos().find((row) => getCargoLinks(row.id).length > 0)
    expect(withLinks).toBeTruthy()
    const links = getCargoLinks(withLinks!.id)
    for (const link of links) {
      expect(link.cargoId).toBe(withLinks!.id)
      expect(resolveUserLabel(link.userId)).not.toBe('')
    }
    expect(linkedUsersCount(withLinks!.id)).toBe(links.length)
  })

  it('substitui os vínculos de um cargo (mock)', () => {
    const first = getCargos()[0]!
    const before = getCargoLinks(first.id)
    const draft = createEmptyCargoLink(first.id)
    expect(draft.cargoId).toBe(first.id)
    setCargoLinks(first.id, [...before, { id: 'cul-test', ...draft, userId: 'usr-2' }])
    expect(getCargoLinks(first.id).length).toBe(before.length + 1)
    setCargoLinks(first.id, before)
    expect(getCargoLinks(first.id).length).toBe(before.length)
  })

  it('expõe opções de usuário para o formulário de vínculo', () => {
    expect(cargoUserOptions().length).toBeGreaterThan(0)
  })
})

describe('Cargo é aditivo — não toca no campo Papel de Usuários', () => {
  it('cadastroOnda3Configs.usuarios continua com o campo meta/Papel intacto', () => {
    const field = cadastroOnda3Configs.usuarios.formFields.find((item) => item.key === 'meta')
    expect(field).toBeTruthy()
    expect(field!.label).toBe('Papel')
  })
})

describe('sidebar e CadastroKind — Feature Flags e Cargos', () => {
  it('Feature Flags e Cargos NÃO são kinds onda3 (têm página dedicada, não CadastroOnda3Page)', () => {
    expect(isCadastroOnda3Kind('feature-flags')).toBe(false)
    expect(isCadastroOnda3Kind('cargos')).toBe(false)
  })

  it('cadastrosNavigation ganha as 2 entradas novas ao final, depois de Operações', () => {
    const labels = cadastrosNavigation.map((item) => item.label)
    expect(labels.at(-2)).toBe('Feature Flags')
    expect(labels.at(-1)).toBe('Cargos')
    expect(cadastrosNavigation.find((item) => item.label === 'Feature Flags')).toMatchObject({
      to: '/cadastros/feature-flags'
    })
    expect(cadastrosNavigation.find((item) => item.label === 'Cargos')).toMatchObject({
      to: '/cadastros/cargos'
    })
  })

  it('cadastroNavItems resolve kind/descrição/ready para os 2 kinds novos', () => {
    const feature = cadastroNavItems.find((item) => item.label === 'Feature Flags')
    const cargo = cadastroNavItems.find((item) => item.label === 'Cargos')
    expect(feature).toMatchObject({ kind: 'feature-flags', ready: true })
    expect(cargo).toMatchObject({ kind: 'cargos', ready: true })
    expect(feature!.description.length).toBeGreaterThan(0)
    expect(cargo!.description.length).toBeGreaterThan(0)
    expect(getCadastroMeta('feature-flags').label).toBe('Feature Flags')
    expect(getCadastroMeta('cargos').label).toBe('Cargos')
  })

  it('breadcrumb resolve /cadastros/feature-flags e /cadastros/cargos sem precisar editar breadcrumbs.ts', () => {
    expect(resolveBreadcrumbs('/cadastros/feature-flags')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Feature Flags' }
    ])
    expect(resolveBreadcrumbs('/cadastros/cargos')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Cargos' }
    ])
  })
})

describe('página Cadastros · Feature Flags', () => {
  const source = readFileSync('app/pages/cadastros/feature-flags.vue', 'utf8')

  it('materializa CRUD completo com MetricsStrip, DataTable e modais', () => {
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('<DataTable')
    expect(source).toContain('variant="form"')
    expect(source).toContain('variant="confirm"')
    expect(source).toContain('Nova feature')
  })

  it('tem abas Tabela/Gráfico no padrão de dashboards/sla.vue (nav + button + underline ativo)', () => {
    expect(source).toContain("activeTab === tab.id ? 'border-via-blue font-bold text-via-ink' : undefined")
    expect(source).toContain('Tabela')
    expect(source).toContain('Gráfico')
  })

  it('a aba gráfico usa DonutChart (adoção) e StackedBarChart (ranking) dentro de ChartPanel', () => {
    expect(source).toContain('<ChartPanel')
    expect(source).toContain('<DonutChart')
    expect(source).toContain('<StackedBarChart')
  })

  it('tem ação Ver operadores e o modal de vínculo com multi-select', () => {
    expect(source).toContain("key: 'operators'")
    expect(source).toContain('Ver operadores')
    expect(source).toContain('resolveOperatorLabel')
    expect(source).toContain('multiple')
    expect(source).toContain('Vincular operadores')
  })

  it('coluna Operadores mostra a quantidade de vínculos por feature', () => {
    expect(source).toContain('linkedCount')
    expect(source).toContain('linkedOperatorsCount')
  })
})

describe('página Cadastros · Cargos', () => {
  const source = readFileSync('app/pages/cadastros/cargos.vue', 'utf8')

  it('materializa CRUD completo com MetricsStrip, DataTable e modais', () => {
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('<DataTable')
    expect(source).toContain('variant="form"')
    expect(source).toContain('variant="confirm"')
    expect(source).toContain('Novo cargo')
  })

  it('tem ação Ver usuários e o modal de vínculo com multi-select', () => {
    expect(source).toContain("key: 'users'")
    expect(source).toContain('Ver usuários')
    expect(source).toContain('resolveUserLabel')
    expect(source).toContain('multiple')
    expect(source).toContain('Vincular usuários')
  })

  it('coluna Usuários mostra a quantidade de vínculos por cargo', () => {
    expect(source).toContain('linkedCount')
    expect(source).toContain('linkedUsersCount')
  })

  it('não tem abas nem gráfico (fora de escopo para Cargos)', () => {
    expect(source).not.toContain('ChartPanel')
    expect(source).not.toContain('DonutChart')
    expect(source).not.toContain('StackedBarChart')
    expect(source).not.toContain('aria-label="Abas')
  })
})
