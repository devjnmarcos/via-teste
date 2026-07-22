# Feature Flags & Cargos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new Cadastros management screens — Feature Flags (entidade `Feature` com vínculo N:N a Operador) e Cargos (entidade `Cargo` com vínculo N:N a Usuário) — com CRUD completo, gestão de vínculos e, só para Feature Flags, abas tabela/gráfico.

**Architecture:** Duas fixtures novas em `app/data/demo/` seguindo exatamente o padrão de `integrations.ts` (entidade + junction table em memória + helpers de métricas/vínculo). Duas páginas dedicadas em `app/pages/cadastros/` (não o catch-all `[kind]/index.vue`, que só cobre o CRUD simples de `CadastroOnda3Page.vue` e não tem contagem de vínculos, modal de vínculos nem abas com gráfico) seguindo o padrão visual de `configuracoes/integracoes.vue` (CRUD + modal "Ver operadores/usuários" com vínculo N:N) e o padrão de abas manual de `dashboards/sla.vue` (`<nav>` + `<button>` com underline ativo). `CadastroKind` ganha 2 membros novos só para as entradas de sidebar/breadcrumb reaproveitarem a lógica genérica já existente em `cadastros.ts`/`breadcrumbs.ts` — nenhuma das duas telas passa pelo `CadastroOnda3Page.vue`.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Nuxt UI 4 (`USelectMenu` com `multiple` para o multi-select de vínculo), Tailwind CSS 4, Chart.js via `app/components/charts/` (`DonutChart`, `StackedBarChart`, `ChartPanel`), Vitest.

---

## Contexto verificado no código (não relatar de novo, só para orientar quem implementa)

- `app/components/cadastros/CadastroOnda3Page.vue` + `app/data/demo/cadastros-onda3.ts` cobrem CRUD genérico simples (`name`/`detail`/`meta`/`active`), sem contagem de vínculos N:N nem abas com gráfico — por isso Feature Flags e Cargos usam páginas dedicadas, como `app/pages/configuracoes/integracoes.vue` já faz para Integrações × Operador.
- `app/utils/cadastros.ts` (`isCadastroKind`/`resolveCadastroKind`) e `app/utils/breadcrumbs.ts` (bloco `/cadastros/*`) derivam a lista de kinds válidos de `cadastroNavItems` (`app/data/demo/cadastros.ts`), que por sua vez deriva de `cadastrosNavigation` (`app/components/app/navigation.ts`). Ou seja: ao adicionar os 2 itens em `cadastrosNavigation` e as 2 descrições em `cadastros.ts`, breadcrumb e resolução de kind passam a funcionar automaticamente para `/cadastros/feature-flags` e `/cadastros/cargos` — **sem tocar em `breadcrumbs.ts` nem `utils/cadastros.ts`**.
- Rotas de arquivo estático (`app/pages/cadastros/feature-flags.vue`, `app/pages/cadastros/cargos.vue`) têm precedência sobre a rota dinâmica `app/pages/cadastros/[kind]/index.vue` para o path exato — mesmo mecanismo que já coexiste com `app/pages/cadastros/sla/index.vue` e `app/pages/cadastros/fretes/index.vue` hoje.
- `app/components/charts/DonutChart.vue` hoje tem os textos `'Voluntário'`/`'Involuntário'` fixos no array `labels` do `chartData` (não são props). Reaproveitar esse componente para "features com × sem operador vinculado" exige adicionar `volLabel`/`involLabel` opcionais (default = textos atuais, sem quebrar `dashboard-reversa.vue`/`dashboards/sla.vue`) — `StackedBarChart.vue` já tem esses props, então isso alinha os dois wrappers.
- **Cuidado de compilação:** `app/data/demo/cadastros-onda3.ts` define `export type CadastroOnda3Kind = Exclude<CadastroKind, 'sla' | 'fretes'>` e depois usa `Record<CadastroOnda3Kind, ...>` em dois literais exaustivos (`store` e `cadastroOnda3Configs`). Se `CadastroKind` ganhar `'feature-flags' | 'cargos'` sem tocar essa exclusão, `CadastroOnda3Kind` passa a incluir os 2 kinds novos automaticamente e os dois `Record<CadastroOnda3Kind, ...>` quebram o typecheck (faltando as chaves `'feature-flags'`/`'cargos'`). A Task 4 inclui o ajuste de 1 linha nessa exclusão — é o único motivo para tocar `cadastros-onda3.ts` neste plano, e não altera nenhum dos 10 kinds onda3 existentes.
- Nenhum teste no repo monta componente de gráfico (Chart.js/canvas) via `mountSuspended`; todo teste de tela pesada em Nuxt UI usa `readFileSync` + `expect(source).toContain(...)` (ver `tests/integrations.spec.ts`, `tests/routes.spec.ts`, `tests/p4-screens.spec.ts`). As duas páginas novas seguem essa mesma convenção de teste. Fixtures/helpers puros (sem Vue) recebem teste unitário direto, como `tests/integrations.spec.ts` já faz para `integrations.ts`.
- "Operador" = `Cadastros → Operadores`, `kind: 'contas'` em `cadastros-onda3.ts` (fixture com ids `cta-1`, `cta-2`, `cta-3`). "Usuário" = `Cadastros → Usuários`, `kind: 'usuarios'` (ids `usr-1`, `usr-2`, `usr-3`). O campo Papel de Usuários é `formFields` com `key: 'meta', label: 'Papel'` em `cadastroOnda3Configs.usuarios` — este plano não toca nesse arquivo.

## File Structure

**Criar:**
- `app/data/demo/features.ts` — entidade `Feature` + junction `FeatureOperatorLink` (mock em memória), helpers de CRUD/vínculo/métricas/série de gráfico. Espelha `app/data/demo/integrations.ts`.
- `app/data/demo/cargos.ts` — entidade `Cargo` + junction `CargoUserLink` (mock em memória), helpers de CRUD/vínculo/métricas. Espelha o mesmo padrão, mais simples (sem gráfico).
- `app/pages/cadastros/feature-flags.vue` — página dedicada: `PageHeader` + `MetricsStrip` + busca + abas Tabela/Gráfico (`DataTable`+`Pagination` vs. `ChartPanel`+`DonutChart`+`StackedBarChart`) + modal de criar/editar feature + modal "Operadores da feature" (listar/remover vínculo + multi-select para vincular vários operadores de uma vez) + modal de exclusão.
- `app/pages/cadastros/cargos.vue` — página dedicada: `PageHeader` + `MetricsStrip` simples + busca + `DataTable`+`Pagination` + modal de criar/editar cargo + modal "Usuários do cargo" (listar/remover vínculo + multi-select para vincular) + modal de exclusão. Sem abas, sem gráfico.
- `tests/feature-flags-cargos.spec.ts` — testes unitários das fixtures/helpers novos + testes de regressão de navegação/breadcrumb/CadastroKind + testes de conteúdo das 2 páginas (`readFileSync`) + teste de que Papel de Usuários não foi tocado.

**Modificar:**
- `app/components/charts/DonutChart.vue` — adiciona `volLabel`/`involLabel` opcionais (default = textos atuais).
- `app/types/domain.ts` — `CadastroKind` ganha `'feature-flags' | 'cargos'`.
- `app/data/demo/cadastros.ts` — `descriptions` e `readyKinds` ganham entradas para os 2 kinds novos.
- `app/data/demo/cadastros-onda3.ts` — a exclusão do type `CadastroOnda3Kind` (linha 7) ganha `'feature-flags' | 'cargos'` para os 2 `Record<CadastroOnda3Kind, ...>` exaustivos do arquivo continuarem compilando (ver "Cuidado de compilação" acima). Nenhum dos 10 kinds onda3 existentes é alterado.
- `app/components/app/navigation.ts` — `cadastrosNavigation` ganha 2 itens novos (Feature Flags, Cargos) ao final da lista, depois de "Operações".
- `tests/navigation.spec.ts` — atualiza a expectativa de 13 → 15 itens em `cadastrosNavigation` com os 2 novos labels/rotas.
- `tests/routes.spec.ts` — adiciona 5 linhas na lista `routes` cobrindo as 2 páginas novas (mesma convenção do arquivo).

---

## Task 1: `DonutChart` aceita rótulos customizados

**Files:**
- Modify: `app/components/charts/DonutChart.vue`
- Test: `tests/feature-flags-cargos.spec.ts` (novo arquivo)

- [ ] **Step 1: Criar o arquivo de teste com o primeiro caso (red)**

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: FAIL — `DonutChart.vue` ainda não tem `volLabel`/`involLabel`.

- [ ] **Step 3: Implementar `volLabel`/`involLabel` em `DonutChart.vue`**

Substitua o bloco de props e o `chartData`:

```vue
<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { chartColors, donutOptions, ensureChartJsRegistered } from '../../utils/chart-theme'

ensureChartJsRegistered()

const props = withDefaults(defineProps<{
  vol: number
  invol: number
  height?: number
  ariaLabel?: string
  volLabel?: string
  involLabel?: string
}>(), {
  height: 240,
  ariaLabel: 'Voluntário versus Involuntário',
  volLabel: 'Voluntário',
  involLabel: 'Involuntário'
})

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: [props.volLabel, props.involLabel],
  datasets: [{
    data: [props.vol, props.invol],
    backgroundColor: [chartColors.vol, chartColors.invol],
    borderWidth: 2,
    borderColor: chartColors.surface,
    hoverOffset: 4
  }]
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => donutOptions())
const chartHeight = computed(() => `${props.height}px`)
</script>
```

(O `<template>` não muda.)

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: PASS

- [ ] **Step 5: Rodar a suíte inteira para garantir que `dashboard-reversa.vue`/`dashboards/sla.vue` não quebraram (props opcionais, default preservado)**

Run: `npx vitest run tests/dashboard-reversa.spec.ts tests/sla-consolidated.spec.ts tests/routes.spec.ts`
Expected: PASS (sem alterações de comportamento — só props novas opcionais)

- [ ] **Step 6: Commit**

```bash
git add app/components/charts/DonutChart.vue tests/feature-flags-cargos.spec.ts
git commit -m "feat: DonutChart aceita volLabel/involLabel customizados"
```

---

## Task 2: Fixture e helpers de `Feature` + vínculo com Operador

**Files:**
- Create: `app/data/demo/features.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever os testes (red)** — acrescente ao final de `tests/feature-flags-cargos.spec.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e confirmar falha (red)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: FAIL — `Cannot find module '../app/data/demo/features'`

- [ ] **Step 3: Implementar `app/data/demo/features.ts`**

```ts
/**
 * Fixtures — Feature Flags (Cadastros → Feature Flags).
 * Entidade Feature + vínculo N:N com Operador (kind 'contas' em cadastros-onda3.ts).
 * Não referencia Usuários/Papel — vínculo é só com Operador.
 */
import type { Metric } from '../../types/domain'
import type { StackedSeriesPoint } from '../../types/dashboard-reversa'
import { getCadastroOnda3Rows } from './cadastros-onda3'

export interface Feature {
  id: string
  name: string
  code: string
  description: string
  active: boolean
  createdAt: string
}

export interface FeatureOperatorLink {
  id: string
  featureId: string
  accountId: string
  active: boolean
  linkedAt: string
}

const featuresSeed: Feature[] = [
  { id: 'feat-1', name: 'Habilitar empresa', code: 'enable_company', description: 'Libera o módulo de gestão de empresas para o operador.', active: true, createdAt: '02/01/2025' },
  { id: 'feat-2', name: 'Chatbot reversa', code: 'enable_chatbot_reversa', description: 'Dispara templates de chatbot no fluxo de reversa.', active: true, createdAt: '14/02/2025' },
  { id: 'feat-3', name: 'Otimização de rota', code: 'enable_route_optimizer', description: 'Ativa o roteirizador automático para o operador.', active: true, createdAt: '03/03/2025' },
  { id: 'feat-4', name: 'Retirada em locker', code: 'enable_locker_pickup', description: 'Permite agendamento de retirada em locker.', active: false, createdAt: '20/04/2025' },
  { id: 'feat-5', name: 'Multi-transportadora', code: 'enable_multi_carrier', description: 'Permite mais de uma transportadora por operação.', active: true, createdAt: '11/05/2025' },
  { id: 'feat-6', name: 'Analytics de SLA', code: 'enable_sla_analytics', description: 'Exibe os painéis avançados de SLA para o operador.', active: true, createdAt: '09/06/2025' }
]

const linksSeed: FeatureOperatorLink[] = [
  { id: 'flk-1', featureId: 'feat-1', accountId: 'cta-1', active: true, linkedAt: '05/01/2025' },
  { id: 'flk-2', featureId: 'feat-1', accountId: 'cta-2', active: true, linkedAt: '06/01/2025' },
  { id: 'flk-3', featureId: 'feat-2', accountId: 'cta-1', active: true, linkedAt: '15/02/2025' },
  { id: 'flk-4', featureId: 'feat-3', accountId: 'cta-2', active: false, linkedAt: '04/03/2025' },
  { id: 'flk-5', featureId: 'feat-3', accountId: 'cta-3', active: true, linkedAt: '05/03/2025' },
  { id: 'flk-6', featureId: 'feat-5', accountId: 'cta-1', active: true, linkedAt: '12/05/2025' },
  { id: 'flk-7', featureId: 'feat-5', accountId: 'cta-3', active: true, linkedAt: '13/05/2025' }
]

let featuresStore: Feature[] = structuredClone(featuresSeed)
let linksStore: FeatureOperatorLink[] = structuredClone(linksSeed)

export function getFeatures(): Feature[] {
  return featuresStore
}

export function setFeatures(rows: Feature[]) {
  featuresStore = structuredClone(rows)
}

export function createEmptyFeature(): Omit<Feature, 'id'> {
  return {
    name: '',
    code: '',
    description: '',
    active: true,
    createdAt: new Date().toLocaleDateString('pt-BR')
  }
}

export function getFeatureLinks(featureId: string): FeatureOperatorLink[] {
  return linksStore.filter((link) => link.featureId === featureId)
}

export function setFeatureLinks(featureId: string, rows: FeatureOperatorLink[]) {
  linksStore = [
    ...linksStore.filter((link) => link.featureId !== featureId),
    ...structuredClone(rows)
  ]
}

export function createEmptyFeatureLink(featureId: string): Omit<FeatureOperatorLink, 'id'> {
  const firstAccount = getCadastroOnda3Rows('contas')[0]
  return {
    featureId,
    accountId: firstAccount ? firstAccount.id : '',
    active: true,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }
}

export function featureOperatorOptions(): { label: string; value: string }[] {
  return getCadastroOnda3Rows('contas').map((row) => ({ label: row.name, value: row.id }))
}

export function resolveOperatorLabel(accountId: string): string {
  const row = getCadastroOnda3Rows('contas').find((item) => item.id === accountId)
  return row?.name ?? accountId
}

export function linkedOperatorsCount(featureId: string): number {
  return linksStore.filter((link) => link.featureId === featureId).length
}

export function buildFeaturesMetrics(rows: Feature[]): Metric[] {
  const active = rows.filter((row) => row.active).length
  const inactive = rows.length - active
  const operatorsWithFeature = new Set(
    linksStore
      .filter((link) => rows.some((row) => row.id === link.featureId))
      .map((link) => link.accountId)
  ).size

  return [
    { label: 'Features', value: rows.length, note: 'cadastradas', icon: 'i-lucide-flag' },
    { label: 'Ativas', value: active, note: 'habilitadas', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Inativas', value: inactive, note: 'desabilitadas', icon: 'i-lucide-circle-off', tone: inactive > 0 ? 'warning' : undefined },
    { label: 'Operadores', value: operatorsWithFeature, note: 'com ao menos 1 feature', icon: 'i-lucide-wallet-cards' }
  ]
}

export function buildFeatureRankingSeries(rows: Feature[]): StackedSeriesPoint[] {
  return rows
    .map((feature) => {
      const links = getFeatureLinks(feature.id)
      return {
        label: feature.name,
        vol: links.filter((link) => link.active).length,
        invol: links.filter((link) => !link.active).length
      }
    })
    .sort((a, b) => (b.vol + b.invol) - (a.vol + a.invol))
}

export function featureAdoptionCounts(rows: Feature[]): { withOperators: number; withoutOperators: number } {
  const withOperators = rows.filter((feature) => getFeatureLinks(feature.id).length > 0).length
  return { withOperators, withoutOperators: rows.length - withOperators }
}
```

- [ ] **Step 4: Rodar e confirmar que passa (green)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/data/demo/features.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat: fixture e helpers de Feature Flags (vínculo N:N com Operador)"
```

---

## Task 3: Fixture e helpers de `Cargo` + vínculo com Usuário (sem tocar Papel)

**Files:**
- Create: `app/data/demo/cargos.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever os testes (red)** — acrescente ao final de `tests/feature-flags-cargos.spec.ts`:

```ts
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
import { cadastroOnda3Configs } from '../app/data/demo/cadastros-onda3'

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
```

- [ ] **Step 2: Rodar e confirmar falha (red)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: FAIL — `Cannot find module '../app/data/demo/cargos'`

- [ ] **Step 3: Implementar `app/data/demo/cargos.ts`**

```ts
/**
 * Fixtures — Cargos (Cadastros → Cargos).
 * Entidade Cargo + vínculo N:N com Usuário (kind 'usuarios' em cadastros-onda3.ts).
 * Aditivo ao campo Papel (meta) do formulário de Usuários — não substitui nem remove Papel.
 */
import type { Metric } from '../../types/domain'
import { getCadastroOnda3Rows } from './cadastros-onda3'

export interface Cargo {
  id: string
  name: string
  detail: string
  active: boolean
}

export interface CargoUserLink {
  id: string
  cargoId: string
  userId: string
  linkedAt: string
}

const cargosSeed: Cargo[] = [
  { id: 'cgo-1', name: 'Coordenador de Operações', detail: 'Responde pela operação diária do ponto de apoio.', active: true },
  { id: 'cgo-2', name: 'Analista de SLA', detail: 'Acompanha indicadores de atendimento e prazo.', active: true },
  { id: 'cgo-3', name: 'Auxiliar de Backoffice', detail: 'Suporte administrativo e cadastro.', active: true },
  { id: 'cgo-4', name: 'Supervisor de Rota', detail: 'Planeja e acompanha roteirização.', active: false }
]

const linksSeed: CargoUserLink[] = [
  { id: 'cul-1', cargoId: 'cgo-1', userId: 'usr-1', linkedAt: '10/01/2025' },
  { id: 'cul-2', cargoId: 'cgo-2', userId: 'usr-2', linkedAt: '11/01/2025' },
  { id: 'cul-3', cargoId: 'cgo-2', userId: 'usr-3', linkedAt: '12/01/2025' },
  { id: 'cul-4', cargoId: 'cgo-3', userId: 'usr-1', linkedAt: '13/01/2025' }
]

let cargosStore: Cargo[] = structuredClone(cargosSeed)
let linksStore: CargoUserLink[] = structuredClone(linksSeed)

export function getCargos(): Cargo[] {
  return cargosStore
}

export function setCargos(rows: Cargo[]) {
  cargosStore = structuredClone(rows)
}

export function createEmptyCargo(): Omit<Cargo, 'id'> {
  return { name: '', detail: '', active: true }
}

export function getCargoLinks(cargoId: string): CargoUserLink[] {
  return linksStore.filter((link) => link.cargoId === cargoId)
}

export function setCargoLinks(cargoId: string, rows: CargoUserLink[]) {
  linksStore = [
    ...linksStore.filter((link) => link.cargoId !== cargoId),
    ...structuredClone(rows)
  ]
}

export function createEmptyCargoLink(cargoId: string): Omit<CargoUserLink, 'id'> {
  const firstUser = getCadastroOnda3Rows('usuarios')[0]
  return {
    cargoId,
    userId: firstUser ? firstUser.id : '',
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }
}

export function cargoUserOptions(): { label: string; value: string }[] {
  return getCadastroOnda3Rows('usuarios').map((row) => ({ label: row.name, value: row.id }))
}

export function resolveUserLabel(userId: string): string {
  const row = getCadastroOnda3Rows('usuarios').find((item) => item.id === userId)
  return row?.name ?? userId
}

export function linkedUsersCount(cargoId: string): number {
  return linksStore.filter((link) => link.cargoId === cargoId).length
}

export function buildCargosMetrics(rows: Cargo[]): Metric[] {
  const totalLinks = linksStore.filter((link) => rows.some((row) => row.id === link.cargoId)).length
  return [
    { label: 'Cargos', value: rows.length, note: 'cadastrados', icon: 'i-lucide-id-card' },
    { label: 'Vínculos', value: totalLinks, note: 'usuário × cargo', icon: 'i-lucide-users' }
  ]
}
```

- [ ] **Step 4: Rodar e confirmar que passa (green)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/data/demo/cargos.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat: fixture e helpers de Cargos (vínculo N:N com Usuário, sem tocar Papel)"
```

---

## Task 4: `CadastroKind` + sidebar + breadcrumb automático para os 2 kinds novos

**Files:**
- Modify: `app/types/domain.ts`
- Modify: `app/data/demo/cadastros.ts`
- Modify: `app/data/demo/cadastros-onda3.ts`
- Modify: `app/components/app/navigation.ts`
- Modify: `tests/navigation.spec.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever os testes (red)** — acrescente ao final de `tests/feature-flags-cargos.spec.ts`:

```ts
import { cadastrosNavigation } from '../app/components/app/navigation'
import { cadastroNavItems, getCadastroMeta } from '../app/data/demo/cadastros'
import { isCadastroOnda3Kind } from '../app/data/demo/cadastros-onda3'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

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
```

- [ ] **Step 2: Rodar e confirmar falha (red)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: FAIL — `cadastrosNavigation` ainda não tem os 2 itens novos.

- [ ] **Step 3: Extender `CadastroKind` em `app/types/domain.ts`**

Localize o bloco (por volta da linha 239) e troque:

```ts
export type CadastroKind =
  | 'sla'
  | 'fretes'
  | 'empresas'
  | 'contas'
  | 'usuarios'
  | 'aprovacoes-pas'
  | 'ocorrencias'
  | 'operacoes'
  | 'regioes'
  | 'feriados'
  | 'produtos'
  | 'templates-chatbot'
```

por:

```ts
export type CadastroKind =
  | 'sla'
  | 'fretes'
  | 'empresas'
  | 'contas'
  | 'usuarios'
  | 'aprovacoes-pas'
  | 'ocorrencias'
  | 'operacoes'
  | 'regioes'
  | 'feriados'
  | 'produtos'
  | 'templates-chatbot'
  | 'feature-flags'
  | 'cargos'
```

- [ ] **Step 4: Excluir os 2 kinds novos de `CadastroOnda3Kind` em `app/data/demo/cadastros-onda3.ts`**

Extender `CadastroKind` (Step 3) faz `CadastroOnda3Kind` (que é `Exclude<CadastroKind, 'sla' | 'fretes'>`) herdar `'feature-flags'` e `'cargos'` automaticamente — e os dois `Record<CadastroOnda3Kind, ...>` exaustivos deste arquivo (`store` e `cadastroOnda3Configs`) quebrariam o typecheck por faltar essas 2 chaves. Corrija a exclusão (linha 7) para manter exatamente os mesmos 10 kinds onda3 de antes:

```ts
export type CadastroOnda3Kind = Exclude<CadastroKind, 'sla' | 'fretes' | 'feature-flags' | 'cargos'>
```

- [ ] **Step 5: Adicionar descrições e `readyKinds` em `app/data/demo/cadastros.ts`**

No objeto `descriptions`, depois da entrada `'templates-chatbot'`:

```ts
const descriptions: Record<CadastroKind, string> = {
  sla: 'Tabelas de SLA por conta, corte e termos',
  fretes: 'Tabelas de preço de frete por origem e limites',
  empresas: 'Empresas internas e clientes do ecossistema',
  contas: 'Contas vinculadas a empresas e escopos operacionais',
  usuarios: 'Acessos, papéis e aprovação de cadastro',
  'aprovacoes-pas': 'Fila de aprovação de pontos de apoio / transportadores',
  ocorrencias: 'Catálogo interno de tipos de ocorrência',
  operacoes: 'Catálogo de tipos e naturezas de operação (reversa, direta, marketplace)',
  regioes: 'Grupos e regiões de atendimento',
  feriados: 'Calendário operacional e impacto em SLA',
  produtos: 'Catálogo de produtos usados em itens de pedido',
  'templates-chatbot': 'Modelos de mensagem do chatbot',
  'feature-flags': 'Recursos habilitados por operador (feature flags)',
  cargos: 'Cargos vinculados a usuários do sistema'
}
```

E no `readyKinds`:

```ts
const readyKinds = new Set<CadastroKind>([
  'sla',
  'fretes',
  'empresas',
  'contas',
  'usuarios',
  'aprovacoes-pas',
  'ocorrencias',
  'operacoes',
  'regioes',
  'feriados',
  'produtos',
  'templates-chatbot',
  'feature-flags',
  'cargos'
])
```

- [ ] **Step 6: Adicionar os 2 itens em `cadastrosNavigation` (`app/components/app/navigation.ts`)**

Troque o array (mantendo os 13 itens existentes intactos, só acrescentando ao final):

```ts
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
```

- [ ] **Step 7: Rodar o novo teste e confirmar que passa (green)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: PASS

- [ ] **Step 8: Atualizar `tests/navigation.spec.ts` (13 → 15 itens) — esse teste vai quebrar até ser atualizado**

Em `tests/navigation.spec.ts`, troque o bloco `it('grupo Cadastros com 13 itens...`:

```ts
  it('grupo Cadastros com 15 itens (Pedidos + 12 cadastros + Operações + Feature Flags + Cargos)', () => {
    expect(cadastrosNavigation.map((item) => item.label)).toEqual([
      'Pedidos',
      'SLA',
      'Fretes',
      'Empresas',
      'Operadores',
      'Usuários',
      "Aprovações PA's",
      'Ocorrências',
      'Regiões',
      'Feriados',
      'Produtos',
      'Templates Chatbot',
      'Operações',
      'Feature Flags',
      'Cargos'
    ])
    expect(cadastrosNavigation.find((item) => item.label === 'Operadores')?.to).toBe('/cadastros/contas')
    expect(cadastrosNavigation.find((item) => item.label === 'Operações')?.to).toBe('/cadastros/operacoes')
    expect(cadastrosNavigation.find((item) => item.label === 'Feature Flags')?.to).toBe('/cadastros/feature-flags')
    expect(cadastrosNavigation.find((item) => item.label === 'Cargos')?.to).toBe('/cadastros/cargos')
    expect(cadastrosNavigation.some((item) => item.label === 'Ocorrências Externas')).toBe(false)
  })
```

- [ ] **Step 9: Rodar toda a suíte de navegação/cadastros para garantir que nada mais quebrou**

Run: `npx vitest run tests/navigation.spec.ts tests/p4-screens.spec.ts tests/integrations.spec.ts tests/feature-flags-cargos.spec.ts`
Expected: PASS — em especial confirme que "mantém os 11 cadastros legados" e "expõe fixtures... para os 10 kinds" (ambos em `p4-screens.spec.ts`) continuam em 11/10 (Feature Flags/Cargos não são onda3, não entram nessa contagem).

- [ ] **Step 10: Commit**

```bash
git add app/types/domain.ts app/data/demo/cadastros.ts app/data/demo/cadastros-onda3.ts app/components/app/navigation.ts tests/navigation.spec.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat: Feature Flags e Cargos entram no CadastroKind e na sidebar de Cadastros"
```

---

## Task 5: Página `Cadastros → Feature Flags`

**Files:**
- Create: `app/pages/cadastros/feature-flags.vue`
- Modify: `tests/routes.spec.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever os testes de conteúdo da página (red)** — acrescente ao final de `tests/feature-flags-cargos.spec.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e confirmar falha (red)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: FAIL — `app/pages/cadastros/feature-flags.vue` não existe.

- [ ] **Step 3: Implementar `app/pages/cadastros/feature-flags.vue`**

```vue
<script setup lang="ts">
/**
 * Cadastros → Feature Flags — CRUD de features + vínculo N:N com Operador (kind 'contas').
 * Abas tabela/gráfico no padrão de dashboards/sla.vue. Vínculos geridos no modal "Operadores".
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Feature, FeatureOperatorLink } from '~/data/demo/features'
import {
  buildFeatureRankingSeries,
  buildFeaturesMetrics,
  createEmptyFeature,
  featureAdoptionCounts,
  featureOperatorOptions,
  getFeatureLinks,
  getFeatures,
  linkedOperatorsCount,
  resolveOperatorLabel,
  setFeatureLinks,
  setFeatures
} from '~/data/demo/features'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Feature Flags · Cadastros · Via Reversa' })

type FeatureFlagsTabId = 'tabela' | 'grafico'

interface FeatureDisplayRow extends Record<string, unknown> {
  id: string
  name: string
  code: string
  description: string
  active: boolean
  createdAt: string
  linkedCount: number
}

const toast = useToast()

const activeTab = ref<FeatureFlagsTabId>('tabela')
const tabs: { id: FeatureFlagsTabId; label: string }[] = [
  { id: 'tabela', label: 'Tabela' },
  { id: 'grafico', label: 'Gráfico' }
]

const rows = ref<Feature[]>(structuredClone(getFeatures()))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<Feature | null>(null)
const form = reactive(createEmptyFeature())

const operatorsOpen = ref(false)
const operatorsFeature = ref<Feature | null>(null)
const linkRows = ref<FeatureOperatorLink[]>([])
const linkPickerOpen = ref(false)
const selectedOperatorIds = ref<string[]>([])

const columns: DataTableColumn<FeatureDisplayRow>[] = [
  { type: 'text', key: 'name', label: 'Nome', width: '22%', secondaryKey: 'description' },
  { type: 'text', key: 'code', label: 'Código', width: '20%' },
  { type: 'text', key: 'linkedCount', label: 'Operadores', width: '110px', align: 'right' },
  { type: 'switch', key: 'active', label: 'Ativa', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '210px',
    items: (row) => [
      { key: 'operators', label: 'Ver operadores', icon: 'i-lucide-wallet-cards', variant: 'ghost', ariaLabel: `Ver operadores de ${row.name}` },
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.name}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.name}` }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.code, row.description].some((value) => value.toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildFeaturesMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const displayRows = computed((): FeatureDisplayRow[] =>
  pagedRows.value.map((row) => ({ ...row, linkedCount: linkedOperatorsCount(row.id) }))
)

const rankingSeries = computed(() => buildFeatureRankingSeries(filteredRows.value))
const adoption = computed(() => featureAdoptionCounts(filteredRows.value))

watch(search, () => {
  page.value = 1
})

function selectTab(tab: FeatureFlagsTabId) {
  activeTab.value = tab
}

function persist() {
  setFeatures(structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyFeature())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: Feature) {
  editingId.value = row.id
  form.name = row.name
  form.code = row.code
  form.description = row.description
  form.active = row.active
  form.createdAt = row.createdAt
  formOpen.value = true
}

function openDelete(row: Feature) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: FeatureDisplayRow; action: string }) {
  if (payload.action === 'operators') openOperators(payload.row)
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: FeatureDisplayRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target) {
    target.active = payload.value
    persist()
  }
}

function saveForm() {
  if (!form.name.trim() || !form.code.trim()) {
    toast.error('Campo obrigatório', 'Informe nome e código antes de salvar.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.code = form.code.trim()
      target.description = form.description.trim()
      target.active = form.active
    }
  }
  else {
    const created: Feature = {
      id: `feat-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      active: form.active,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `Feature ${wasEdit ? 'atualizada' : 'criada'} (mock).`)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  persist()
  toast.success('Excluída', `${pendingDelete.value.name} removida (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}

const availableOperatorOptions = computed(() =>
  featureOperatorOptions().filter((opt) => !linkRows.value.some((link) => link.accountId === opt.value))
)

function openOperators(row: Feature) {
  operatorsFeature.value = row
  linkRows.value = structuredClone(getFeatureLinks(row.id))
  linkPickerOpen.value = false
  selectedOperatorIds.value = []
  operatorsOpen.value = true
}

function openLinkPicker() {
  selectedOperatorIds.value = []
  linkPickerOpen.value = true
}

function addSelectedOperators() {
  if (!selectedOperatorIds.value.length) {
    toast.error('Selecione ao menos 1 operador', 'Escolha na lista antes de vincular.')
    return
  }
  const created = selectedOperatorIds.value.map((accountId) => ({
    id: `flk-${Date.now()}-${accountId}`,
    featureId: operatorsFeature.value!.id,
    accountId,
    active: true,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }))
  linkRows.value = [...created, ...linkRows.value]
  linkPickerOpen.value = false
  selectedOperatorIds.value = []
}

function removeOperatorLink(link: FeatureOperatorLink) {
  linkRows.value = linkRows.value.filter((row) => row.id !== link.id)
  toast.success('Removido', 'Vínculo de operador removido (mock).')
}

function toggleOperatorLinkActive(link: FeatureOperatorLink, value: boolean) {
  const target = linkRows.value.find((row) => row.id === link.id)
  if (target) target.active = value
}

function saveOperators() {
  if (!operatorsFeature.value) return
  setFeatureLinks(operatorsFeature.value.id, linkRows.value)
  operatorsOpen.value = false
  toast.success('Salvo', `Vínculos de ${operatorsFeature.value.name} atualizados (mock).`)
}
</script>

<template>
  <div class="feature-flags-page">
    <PageHeader
      title="Feature Flags"
      subtitle="Recursos habilitados por operador (mock)"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Nova feature
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="listMetrics" />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por nome ou código…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <nav
      class="flex min-h-[49px] flex-wrap gap-[18px] border-b border-via-line px-[18px]"
      aria-label="Abas de Feature Flags"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="inline-flex cursor-pointer items-center border-0 border-b-2 border-transparent bg-transparent text-xs text-via-muted transition-[color,border-color] duration-150"
        :class="activeTab === tab.id ? 'border-via-blue font-bold text-via-ink' : undefined"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <template v-if="activeTab === 'tabela'">
      <DataTable
        :columns="columns"
        :rows="displayRows"
        min-width="880px"
        empty-title="Nenhuma feature"
        empty-description="Cadastre a primeira feature ou ajuste a busca."
        @action="onAction"
        @update:switch="onSwitch"
      />

      <Pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="filteredRows.length"
      />
    </template>

    <template v-else>
      <section
        class="grid grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)] border-b border-via-line max-[1100px]:grid-cols-1"
        aria-label="Gráficos de Feature Flags"
      >
        <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
          <ChartPanel
            title="Adoção por operador"
            note="features com × sem vínculo"
          >
            <DonutChart
              :vol="adoption.withOperators"
              :invol="adoption.withoutOperators"
              vol-label="Com operadores"
              invol-label="Sem operadores"
              aria-label="Features com operadores vinculados versus sem vínculo"
              :height="220"
            />
          </ChartPanel>
        </div>
        <div class="min-w-0">
          <ChartPanel
            title="Ranking de features"
            note="operadores ativos × inativos por feature"
          >
            <StackedBarChart
              :series="rankingSeries"
              orientation="horizontal"
              vol-label="Ativos"
              invol-label="Inativos"
              aria-label="Ranking de features por operadores vinculados"
              :height="240"
            />
          </ChartPanel>
        </div>
      </section>
    </template>

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar feature' : 'Nova feature'"
      :description="editingId ? 'Atualize os dados da feature.' : 'Informe os dados da nova feature.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Nome *">
        <UInput
          v-model="form.name"
          placeholder="Ex.: Habilitar empresa"
        />
      </AppFormField>
      <AppFormField label="Código *">
        <UInput
          v-model="form.code"
          placeholder="Ex.: enable_company"
        />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput
          v-model="form.description"
          placeholder="Explique o que a feature libera"
        />
      </AppFormField>
      <AppFormField label="Ativa">
        <USwitch v-model="form.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="operatorsOpen"
      variant="form"
      :title="operatorsFeature ? `Operadores · ${operatorsFeature.name}` : 'Operadores da feature'"
      :description="operatorsFeature ? `Operadores vinculados a ${operatorsFeature.code}.` : ''"
      confirm-label="Salvar"
      @confirm="saveOperators"
    >
      <div class="grid gap-2">
        <div
          v-for="link in linkRows"
          :key="link.id"
          class="flex items-center justify-between gap-3 border-b border-via-line py-2 text-xs last:border-b-0"
        >
          <div class="min-w-0">
            <strong class="block truncate">{{ resolveOperatorLabel(link.accountId) }}</strong>
            <small class="block text-via-muted">Vinculado em {{ link.linkedAt }}</small>
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            <USwitch
              :model-value="link.active"
              size="sm"
              @update:model-value="toggleOperatorLinkActive(link, Boolean($event))"
            />
            <AppButton
              variant="ghost"
              icon="i-lucide-trash-2"
              aria-label="Remover vínculo"
              @click="removeOperatorLink(link)"
            />
          </div>
        </div>
        <p
          v-if="!linkRows.length"
          class="m-0 text-xs text-via-muted"
        >
          Nenhum operador vinculado a esta feature.
        </p>

        <AppButton
          variant="secondary"
          icon="i-lucide-plus"
          class="justify-self-start"
          @click="openLinkPicker"
        >
          Vincular operadores
        </AppButton>

        <div
          v-if="linkPickerOpen"
          class="grid gap-3 border-t border-via-line pt-3"
        >
          <AppFormField label="Operadores *">
            <USelectMenu
              v-model="selectedOperatorIds"
              multiple
              value-key="value"
              :items="availableOperatorOptions"
              placeholder="Selecione um ou mais operadores"
            />
          </AppFormField>
          <div class="flex justify-end gap-2">
            <AppButton
              variant="secondary"
              @click="linkPickerOpen = false"
            >
              Cancelar
            </AppButton>
            <AppButton
              variant="primary"
              @click="addSelectedOperators"
            >
              Adicionar vínculos
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir feature"
      :description="pendingDelete ? `“${pendingDelete.name}” será removida. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
```

- [ ] **Step 4: Rodar e confirmar que passa (green)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: PASS

- [ ] **Step 5: Adicionar a rota em `tests/routes.spec.ts`**

No array `routes`, acrescente (perto das outras linhas de `configuracoes/integracoes.vue`):

```ts
  ['app/pages/cadastros/feature-flags.vue', 'MetricsStrip'],
  ['app/pages/cadastros/feature-flags.vue', 'DonutChart'],
  ['app/pages/cadastros/feature-flags.vue', 'StackedBarChart'],
```

- [ ] **Step 6: Rodar `tests/routes.spec.ts` e confirmar que passa**

Run: `npx vitest run tests/routes.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/pages/cadastros/feature-flags.vue tests/routes.spec.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat: página Cadastros · Feature Flags (CRUD + vínculo com Operador + abas tabela/gráfico)"
```

---

## Task 6: Página `Cadastros → Cargos`

**Files:**
- Create: `app/pages/cadastros/cargos.vue`
- Modify: `tests/routes.spec.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever os testes de conteúdo da página (red)** — acrescente ao final de `tests/feature-flags-cargos.spec.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e confirmar falha (red)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: FAIL — `app/pages/cadastros/cargos.vue` não existe.

- [ ] **Step 3: Implementar `app/pages/cadastros/cargos.vue`**

```vue
<script setup lang="ts">
/**
 * Cadastros → Cargos — CRUD de cargos + vínculo N:N com Usuário (kind 'usuarios').
 * Sem abas/gráfico (fora de escopo). Vínculos geridos no modal "Usuários".
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Cargo, CargoUserLink } from '~/data/demo/cargos'
import {
  buildCargosMetrics,
  cargoUserOptions,
  createEmptyCargo,
  getCargoLinks,
  getCargos,
  linkedUsersCount,
  resolveUserLabel,
  setCargoLinks,
  setCargos
} from '~/data/demo/cargos'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Cargos · Cadastros · Via Reversa' })

interface CargoDisplayRow extends Record<string, unknown> {
  id: string
  name: string
  detail: string
  active: boolean
  linkedCount: number
}

const toast = useToast()

const rows = ref<Cargo[]>(structuredClone(getCargos()))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<Cargo | null>(null)
const form = reactive(createEmptyCargo())

const usersOpen = ref(false)
const usersCargo = ref<Cargo | null>(null)
const linkRows = ref<CargoUserLink[]>([])
const linkPickerOpen = ref(false)
const selectedUserIds = ref<string[]>([])

const columns: DataTableColumn<CargoDisplayRow>[] = [
  { type: 'text', key: 'name', label: 'Cargo', width: '30%', secondaryKey: 'detail' },
  { type: 'text', key: 'linkedCount', label: 'Usuários', width: '110px', align: 'right' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '210px',
    items: (row) => [
      { key: 'users', label: 'Ver usuários', icon: 'i-lucide-users', variant: 'ghost', ariaLabel: `Ver usuários de ${row.name}` },
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.name}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.name}` }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.detail].some((value) => value.toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildCargosMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const displayRows = computed((): CargoDisplayRow[] =>
  pagedRows.value.map((row) => ({ ...row, linkedCount: linkedUsersCount(row.id) }))
)

watch(search, () => {
  page.value = 1
})

function persist() {
  setCargos(structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyCargo())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: Cargo) {
  editingId.value = row.id
  form.name = row.name
  form.detail = row.detail
  form.active = row.active
  formOpen.value = true
}

function openDelete(row: Cargo) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: CargoDisplayRow; action: string }) {
  if (payload.action === 'users') openUsers(payload.row)
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: CargoDisplayRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target) {
    target.active = payload.value
    persist()
  }
}

function saveForm() {
  if (!form.name.trim()) {
    toast.error('Campo obrigatório', 'Informe o nome do cargo antes de salvar.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.detail = form.detail.trim()
      target.active = form.active
    }
  }
  else {
    const created: Cargo = {
      id: `cgo-${Date.now()}`,
      name: form.name.trim(),
      detail: form.detail.trim(),
      active: form.active
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `Cargo ${wasEdit ? 'atualizado' : 'criado'} (mock).`)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  persist()
  toast.success('Excluído', `${pendingDelete.value.name} removido (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}

const availableUserOptions = computed(() =>
  cargoUserOptions().filter((opt) => !linkRows.value.some((link) => link.userId === opt.value))
)

function openUsers(row: Cargo) {
  usersCargo.value = row
  linkRows.value = structuredClone(getCargoLinks(row.id))
  linkPickerOpen.value = false
  selectedUserIds.value = []
  usersOpen.value = true
}

function openLinkPicker() {
  selectedUserIds.value = []
  linkPickerOpen.value = true
}

function addSelectedUsers() {
  if (!selectedUserIds.value.length) {
    toast.error('Selecione ao menos 1 usuário', 'Escolha na lista antes de vincular.')
    return
  }
  const created = selectedUserIds.value.map((userId) => ({
    id: `cul-${Date.now()}-${userId}`,
    cargoId: usersCargo.value!.id,
    userId,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }))
  linkRows.value = [...created, ...linkRows.value]
  linkPickerOpen.value = false
  selectedUserIds.value = []
}

function removeUserLink(link: CargoUserLink) {
  linkRows.value = linkRows.value.filter((row) => row.id !== link.id)
  toast.success('Removido', 'Vínculo de usuário removido (mock).')
}

function saveUsers() {
  if (!usersCargo.value) return
  setCargoLinks(usersCargo.value.id, linkRows.value)
  usersOpen.value = false
  toast.success('Salvo', `Vínculos de ${usersCargo.value.name} atualizados (mock).`)
}
</script>

<template>
  <div class="cargos-page">
    <PageHeader
      title="Cargos"
      subtitle="Cargos vinculados a usuários do sistema (mock)"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo cargo
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="listMetrics" />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar cargo…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="displayRows"
      min-width="720px"
      empty-title="Nenhum cargo"
      empty-description="Cadastre o primeiro cargo ou ajuste a busca."
      @action="onAction"
      @update:switch="onSwitch"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar cargo' : 'Novo cargo'"
      :description="editingId ? 'Atualize os dados do cargo.' : 'Informe os dados do novo cargo.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Nome *">
        <UInput
          v-model="form.name"
          placeholder="Ex.: Coordenador de Operações"
        />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput
          v-model="form.detail"
          placeholder="Descreva a responsabilidade do cargo"
        />
      </AppFormField>
      <AppFormField label="Ativo">
        <USwitch v-model="form.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="usersOpen"
      variant="form"
      :title="usersCargo ? `Usuários · ${usersCargo.name}` : 'Usuários do cargo'"
      :description="usersCargo ? `Usuários vinculados a ${usersCargo.name}.` : ''"
      confirm-label="Salvar"
      @confirm="saveUsers"
    >
      <div class="grid gap-2">
        <div
          v-for="link in linkRows"
          :key="link.id"
          class="flex items-center justify-between gap-3 border-b border-via-line py-2 text-xs last:border-b-0"
        >
          <div class="min-w-0">
            <strong class="block truncate">{{ resolveUserLabel(link.userId) }}</strong>
            <small class="block text-via-muted">Vinculado em {{ link.linkedAt }}</small>
          </div>
          <AppButton
            variant="ghost"
            icon="i-lucide-trash-2"
            aria-label="Remover vínculo"
            @click="removeUserLink(link)"
          />
        </div>
        <p
          v-if="!linkRows.length"
          class="m-0 text-xs text-via-muted"
        >
          Nenhum usuário vinculado a este cargo.
        </p>

        <AppButton
          variant="secondary"
          icon="i-lucide-plus"
          class="justify-self-start"
          @click="openLinkPicker"
        >
          Vincular usuários
        </AppButton>

        <div
          v-if="linkPickerOpen"
          class="grid gap-3 border-t border-via-line pt-3"
        >
          <AppFormField label="Usuários *">
            <USelectMenu
              v-model="selectedUserIds"
              multiple
              value-key="value"
              :items="availableUserOptions"
              placeholder="Selecione um ou mais usuários"
            />
          </AppFormField>
          <div class="flex justify-end gap-2">
            <AppButton
              variant="secondary"
              @click="linkPickerOpen = false"
            >
              Cancelar
            </AppButton>
            <AppButton
              variant="primary"
              @click="addSelectedUsers"
            >
              Adicionar vínculos
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir cargo"
      :description="pendingDelete ? `“${pendingDelete.name}” será removido. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
```

- [ ] **Step 4: Rodar e confirmar que passa (green)**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts`
Expected: PASS

- [ ] **Step 5: Adicionar a rota em `tests/routes.spec.ts`**

No array `routes`, acrescente:

```ts
  ['app/pages/cadastros/cargos.vue', 'MetricsStrip'],
  ['app/pages/cadastros/cargos.vue', 'AppModal'],
```

- [ ] **Step 6: Rodar `tests/routes.spec.ts` e confirmar que passa**

Run: `npx vitest run tests/routes.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/pages/cadastros/cargos.vue tests/routes.spec.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat: página Cadastros · Cargos (CRUD + vínculo com Usuário)"
```

---

## Task 7: Checklist final

**Files:** nenhum arquivo novo — só validação.

- [ ] **Step 1: Rodar a suíte completa de testes**

Run: `npm run test:run`
Expected: todos os testes passam, incluindo `tests/feature-flags-cargos.spec.ts`, `tests/navigation.spec.ts`, `tests/routes.spec.ts`, `tests/p4-screens.spec.ts` e `tests/integrations.spec.ts`.

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: sem erros. Preste atenção especial a `app/pages/cadastros/feature-flags.vue` e `app/pages/cadastros/cargos.vue` (uso de `USelectMenu multiple` com `v-model` de `string[]`, e `DataTableColumn<T>[]` com `align`/`items` como função).

- [ ] **Step 3: Rodar o lint**

Run: `npm run lint`
Expected: sem erros. Se o ESLint reclamar de import não usado ou ordenação de imports nos arquivos novos, corrija (sem alterar comportamento) e rode `npm run lint` de novo.

- [ ] **Step 4: Se qualquer passo acima falhar, corrigir e re-rodar todos os 3 antes de seguir**

Não marcar esta task como concluída enquanto `npm run test:run`, `npm run typecheck` e `npm run lint` não estiverem 100% verdes ao mesmo tempo.

- [ ] **Step 5: Commit final (se houver ajustes de lint/typecheck)**

```bash
git add -A
git commit -m "chore: ajustes de lint/typecheck para Feature Flags e Cargos"
```

(Pule este commit se nenhum arquivo mudou nos Steps 1–4.)

---

## Self-Review

**1. Cobertura do spec:**
- Entidade `Feature` (nome/código/descrição) + N:N com Operador → Task 2 (`features.ts`).
- Tela Feature Flags: cards de métricas, abas tabela/gráfico, coluna com contagem de vínculos, "Ver operadores" com remoção de vínculo, vincular a mais operadores, gráfico (ranking + adoção) → Task 5.
- Entidade `Cargo` (nome/descrição, `formFields` simples) + N:N com Usuário → Task 3 (`cargos.ts`).
- Tela Cargos: CRUD completo, contagem de usuários vinculados, "Ver usuários" com remoção, vincular a mais usuários, `MetricsStrip` simples, sem gráfico/abas → Task 6.
- Não tocar no campo Papel de Usuários → regra verificada explicitamente em Task 3 (teste de regressão sobre `cadastroOnda3Configs.usuarios`).
- Entrada na sidebar dentro do grupo Cadastros para as 2 telas → Task 4.
- Decisão página dedicada vs. catch-all `[kind]/index.vue`, justificada com leitura do código real → documentado na seção de contexto + File Structure.
- Fixtures em memória, sem API real → todas as fixtures (`features.ts`, `cargos.ts`) seguem exatamente o padrão de `integrations.ts`.
- Reuso de `AppModal`/`AppButton`/`MetricsStrip`/`DataTable`/`Pagination`/`charts/*`/tabs manual → usado em todas as tasks; nenhum componente genérico novo foi criado (o "seletor N:N com busca" citado como aceitável no prompt não foi extraído porque `USelectMenu multiple` já resolve os dois casos sem componente extra — YAGNI).
- Banimentos do CLAUDE.md (cartão arredondado em excesso, ícone em fundo pastel, badge decorativo, status sem texto) → nenhuma classe nova introduzida além das já usadas em `integracoes.vue`/`dashboards/sla.vue`; nenhum badge, nenhum ícone com fundo, todo switch tem label textual ao lado.
- Checklist final com `test:run`/`typecheck`/`lint`, sem `build` → Task 7.
- Não tocar em nada dos outros 6 planos já executados → nenhuma task edita arquivos de outros domínios (pedidos, devoluções, SLA, faturas, etc.); os únicos arquivos compartilhados tocados (`navigation.ts`, `domain.ts`, `cadastros.ts`, `tests/navigation.spec.ts`, `tests/routes.spec.ts`) recebem só adições ao final das listas existentes, sem remover/reordenar nada dos 13 itens/12 kinds legados.

**2. Placeholders:** nenhum "TBD"/"implementar depois" — todo step de código tem o conteúdo completo do arquivo ou do bloco exato a substituir, com path e (quando aplicável) o texto anterior para localizar o trecho.

**1b. Achado corrigido durante a revisão:** estender `CadastroKind` sem mais nada quebraria o typecheck de `app/data/demo/cadastros-onda3.ts`, porque `CadastroOnda3Kind = Exclude<CadastroKind, 'sla' | 'fretes'>` herdaria `'feature-flags'`/`'cargos'` e os `Record<CadastroOnda3Kind, ...>` exaustivos (`store`, `cadastroOnda3Configs`) ficariam sem essas 2 chaves. Corrigido inline: Task 4 Step 4 agora exclui explicitamente os 2 kinds novos de `CadastroOnda3Kind`, mais um teste de regressão (`isCadastroOnda3Kind('feature-flags') === false` / `'cargos' === false`) e a Task 7 chama atenção para rodar `npm run typecheck` — sem esse fix o plano passaria `test:run` (vitest não type-checa) mas quebraria `typecheck`.

**3. Consistência de tipos/nomes:** confirmado que `Feature`/`FeatureOperatorLink`/`Cargo`/`CargoUserLink` e todas as funções (`getFeatures`, `setFeatures`, `createEmptyFeature`, `getFeatureLinks`, `setFeatureLinks`, `createEmptyFeatureLink`, `featureOperatorOptions`, `resolveOperatorLabel`, `linkedOperatorsCount`, `buildFeaturesMetrics`, `buildFeatureRankingSeries`, `featureAdoptionCounts` e os equivalentes de Cargos) são declaradas na Task 2/3 com a mesma assinatura usada nos testes da Task 2/3 e nas páginas da Task 5/6 — sem nomes divergentes entre tasks. `createEmptyFeatureLink`/`createEmptyCargoLink` são exportados e testados (Task 2/3) mas conscientemente não importados nas páginas (Task 5/6), porque o fluxo de vínculo virou multi-select em lote — isso está anotado explicitamente no texto acima para quem for revisar o motivo do "não uso" desse export nas páginas.
