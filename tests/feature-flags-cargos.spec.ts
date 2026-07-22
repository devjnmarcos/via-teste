import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildFeatureDetailMetrics,
  buildFeatureRankingSeries,
  buildFeaturesMetrics,
  createEmptyFeature,
  createEmptyFeatureLink,
  featureAdoptionCounts,
  featureOperatorOptions,
  getFeatureLinks,
  getFeatures,
  linkedOperatorsActiveCount,
  linkedOperatorsCount,
  resolveOperatorLabel,
  setFeatureLinks,
  setFeatures
} from '../app/data/demo/features'
import {
  buildCargoDetailMetrics,
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
import type { CadastroOnda3Row } from '../app/data/demo/cadastros-onda3'
import { cadastroOnda3Configs, getCadastroOnda3Rows, isCadastroOnda3Kind } from '../app/data/demo/cadastros-onda3'
import { cadastrosNavigation, configuracoesNavigation } from '../app/components/app/navigation'
import { cadastroNavItems } from '../app/data/demo/cadastros'
import { isCadastroKind } from '../app/utils/cadastros'
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

  it('conta só os vínculos ativos de uma feature (linkedOperatorsActiveCount)', () => {
    const withLinks = getFeatures().find((row) => getFeatureLinks(row.id).length > 0)!
    const links = getFeatureLinks(withLinks.id)
    expect(linkedOperatorsActiveCount(withLinks.id)).toBe(links.filter((link) => link.active).length)
  })

  it('calcula métricas de detalhe (operadores/ativos/inativos) a partir dos vínculos informados', () => {
    const feature = getFeatures()[0]!
    const links = getFeatureLinks(feature.id)
    const metrics = buildFeatureDetailMetrics(feature, links)
    expect(metrics.map((metric) => metric.label)).toEqual(['Operadores', 'Ativos', 'Inativos'])
    expect(metrics[0]).toMatchObject({ value: links.length })
    const active = links.filter((link) => link.active).length
    expect(metrics[1]).toMatchObject({ value: active })
    expect(metrics[2]).toMatchObject({ value: links.length - active })
  })
})

describe('fixtures de Cargos', () => {
  it('expõe ao menos 3 cargos com ids/nomes únicos e data de criação pt-BR', () => {
    const rows = getCargos()
    expect(rows.length).toBeGreaterThanOrEqual(3)
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
    expect(new Set(rows.map((row) => row.name)).size).toBe(rows.length)
    expect(rows.every((row) => /^\d{2}\/\d{2}\/\d{4}$/.test(row.createdAt))).toBe(true)
  })

  it('calcula métricas simples de cargos (total de cargos e total de vínculos)', () => {
    const rows = getCargos()
    const metrics = buildCargosMetrics(rows)
    expect(metrics).toHaveLength(2)
    expect(metrics.map((metric) => metric.label)).toEqual(['Cargos', 'Vínculos'])
    expect(metrics[0]).toMatchObject({ value: rows.length })
  })

  it('cria e persiste um cargo novo (mock) com createdAt padrão pt-BR', () => {
    const before = getCargos().length
    const draft = createEmptyCargo()
    expect(draft.active).toBe(true)
    expect(draft.name).toBe('')
    expect(draft.createdAt).toBeTruthy()
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

  it('calcula métricas de detalhe (usuários/ativos/inativos) a partir das linhas de usuário vinculadas', () => {
    const cargo = getCargos().find((row) => getCargoLinks(row.id).length > 0)!
    const userRows = getCadastroOnda3Rows('usuarios')
    const linkedUsers = getCargoLinks(cargo.id)
      .map((link) => userRows.find((row) => row.id === link.userId))
      .filter((row): row is CadastroOnda3Row => Boolean(row))
    const metrics = buildCargoDetailMetrics(cargo, linkedUsers)
    expect(metrics.map((metric) => metric.label)).toEqual(['Usuários', 'Ativos', 'Inativos'])
    expect(metrics[0]).toMatchObject({ value: linkedUsers.length })
    const active = linkedUsers.filter((row) => row.active).length
    expect(metrics[1]).toMatchObject({ value: active })
    expect(metrics[2]).toMatchObject({ value: linkedUsers.length - active })
  })
})

describe('Cargo é aditivo — não toca no campo Papel de Usuários', () => {
  it('cadastroOnda3Configs.usuarios continua com o campo meta/Papel intacto', () => {
    const field = cadastroOnda3Configs.usuarios.formFields.find((item) => item.key === 'meta')
    expect(field).toBeTruthy()
    expect(field!.label).toBe('Papel')
  })
})

describe('Feature Flags e Cargos saem de Cadastros, entram em Configurações', () => {
  it('Feature Flags e Cargos NÃO são kinds onda3 (têm página dedicada, não CadastroOnda3Page)', () => {
    expect(isCadastroOnda3Kind('feature-flags')).toBe(false)
    expect(isCadastroOnda3Kind('cargos')).toBe(false)
  })

  it('cadastrosNavigation não tem mais Feature Flags/Cargos (mudaram para o grupo Configurações)', () => {
    const labels = cadastrosNavigation.map((item) => item.label)
    expect(labels).not.toContain('Feature Flags')
    expect(labels).not.toContain('Cargos')
    expect(labels.at(-1)).toBe('Operações')
  })

  it('configuracoesNavigation tem Integrações, Feature Flags e Cargos apontando para /configuracoes/*', () => {
    expect(configuracoesNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes' },
      { label: 'Feature Flags', to: '/configuracoes/feature-flags' },
      { label: 'Cargos', to: '/configuracoes/cargos' }
    ])
  })

  it('cadastroNavItems/isCadastroKind não conhecem mais feature-flags/cargos como cadastro', () => {
    expect(cadastroNavItems.some((item) => item.kind === 'feature-flags')).toBe(false)
    expect(cadastroNavItems.some((item) => item.kind === 'cargos')).toBe(false)
    expect(isCadastroKind('feature-flags')).toBe(false)
    expect(isCadastroKind('cargos')).toBe(false)
  })

  it('breadcrumb resolve /configuracoes/feature-flags e /configuracoes/cargos (listagem)', () => {
    expect(resolveBreadcrumbs('/configuracoes/feature-flags')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Feature Flags' }
    ])
    expect(resolveBreadcrumbs('/configuracoes/cargos')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Cargos' }
    ])
  })

  it('breadcrumb resolve /configuracoes/feature-flags/:id e /configuracoes/cargos/:id com o nome da entidade', () => {
    const feature = getFeatures()[0]!
    expect(resolveBreadcrumbs(`/configuracoes/feature-flags/${feature.id}`, { id: feature.id })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Feature Flags', to: '/configuracoes/feature-flags' },
      { label: feature.name }
    ])

    const cargo = getCargos()[0]!
    expect(resolveBreadcrumbs(`/configuracoes/cargos/${cargo.id}`, { id: cargo.id })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Cargos', to: '/configuracoes/cargos' },
      { label: cargo.name }
    ])
  })
})

describe('página Configurações · Feature Flags (listagem)', () => {
  const source = readFileSync('app/pages/configuracoes/feature-flags/index.vue', 'utf8')

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

  it('Ver operadores navega para a página de detalhe em vez de abrir modal', () => {
    expect(source).toContain("key: 'operators'")
    expect(source).toContain('Ver operadores')
    expect(source).toContain('navigateTo(`/configuracoes/feature-flags/${payload.row.id}`)')
    expect(source).not.toContain('Vincular operadores')
    expect(source).not.toContain('operatorsOpen')
  })

  it('coluna Criada em e resumo de vínculos (N ativos) aparecem na tabela', () => {
    expect(source).toContain("key: 'createdAt'")
    expect(source).toContain('Criada em')
    expect(source).toContain('linkedSummary')
    expect(source).toContain('linkedOperatorsActiveCount')
  })
})

describe('página Configurações · Feature Flags (detalhe)', () => {
  const source = readFileSync('app/pages/configuracoes/feature-flags/[id].vue', 'utf8')

  it('busca a feature pela rota e 404 quando não existe', () => {
    expect(source).toContain('route.params.id')
    expect(source).toContain('createError({ statusCode: 404')
  })

  it('mostra MetricsStrip de detalhe e a tabela de operadores vinculados com switch e remoção', () => {
    expect(source).toContain('buildFeatureDetailMetrics')
    expect(source).toContain('<DataTable')
    expect(source).toContain("type: 'switch'")
    expect(source).toContain("key: 'remove'")
    expect(source).toContain('getCadastroOnda3Rows')
  })

  it('permite editar a feature e vincular novos operadores por modal picker', () => {
    expect(source).toContain('Editar feature')
    expect(source).toContain('Vincular operadores')
    expect(source).toContain('multiple')
  })
})

describe('página Configurações · Cargos (listagem)', () => {
  const source = readFileSync('app/pages/configuracoes/cargos/index.vue', 'utf8')

  it('materializa CRUD completo com MetricsStrip, DataTable e modais', () => {
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('<DataTable')
    expect(source).toContain('variant="form"')
    expect(source).toContain('variant="confirm"')
    expect(source).toContain('Novo cargo')
  })

  it('Ver usuários navega para a página de detalhe em vez de abrir modal', () => {
    expect(source).toContain("key: 'users'")
    expect(source).toContain('Ver usuários')
    expect(source).toContain('navigateTo(`/configuracoes/cargos/${payload.row.id}`)')
    expect(source).not.toContain('Vincular usuários')
    expect(source).not.toContain('usersOpen')
  })

  it('coluna Criado em aparece na tabela (Cargo ganha createdAt)', () => {
    expect(source).toContain("key: 'createdAt'")
    expect(source).toContain('Criado em')
  })

  it('não tem abas nem gráfico (fora de escopo para Cargos)', () => {
    expect(source).not.toContain('ChartPanel')
    expect(source).not.toContain('DonutChart')
    expect(source).not.toContain('StackedBarChart')
    expect(source).not.toContain('aria-label="Abas')
  })
})

describe('página Configurações · Cargos (detalhe)', () => {
  const source = readFileSync('app/pages/configuracoes/cargos/[id].vue', 'utf8')

  it('busca o cargo pela rota e 404 quando não existe', () => {
    expect(source).toContain('route.params.id')
    expect(source).toContain('createError({ statusCode: 404')
  })

  it('mostra MetricsStrip de detalhe e a tabela de usuários vinculados (sem switch, com remoção)', () => {
    expect(source).toContain('buildCargoDetailMetrics')
    expect(source).toContain('<DataTable')
    expect(source).toContain("key: 'remove'")
    expect(source).toContain('getCadastroOnda3Rows')
  })

  it('permite editar o cargo e vincular novos usuários por modal picker', () => {
    expect(source).toContain('Editar cargo')
    expect(source).toContain('Vincular usuários')
    expect(source).toContain('multiple')
  })
})
