# SLA Consolidado + Renomeação de Devoluções Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar as 8 telas de SLA Analytics (`app/pages/sla/*.vue`) em 1 única página nova (`/dashboards/sla`), preservando 100% das métricas/gráficos/colunas atuais; e renomear os textos visíveis literais "DEV IN"/"DEV OUT"/"Devoluções" para "Caixas"/"Despachos"/"Remessas" dentro das páginas de listagem e detalhe de Devoluções (sem tocar em `acompanhamento.vue`, rotas, `navigation.ts` ou `AppSidebar.vue`).

**Architecture:** A página nova (`app/pages/dashboards/sla.vue`) segue o padrão de abas manuais do `app/pages/operacao/dashboard-reversa.vue` (`<nav>` + `<button>` + underline, sem `UTabs`): 1 filtro de "Dimensão" (Cliente/Estado/Ponto de apoio/Transportador) troca `entityColumn`/dimension como as 8 variants faziam antes, e dentro da tela 2 abas — "Ranking por entidade" (o antigo modo `by-entity`: 6 métricas + `DonutChart` + `StackedBarChart` + tabela de 8 colunas) e "Evolução por data" (o antigo modo `by-date`: 3 métricas + `PercentTrendChart` + tabela de 7 colunas) — mostram o conteúdo das 8 telas legadas para a dimensão selecionada. `app/data/demo/sla-analytics.ts` e `app/utils/sla-analytics-metrics.ts` são 100% reaproveitados sem alteração de comportamento (só ganham 2 exports novos e aditivos: `slaConsolidatedDimensions`, `slaConsolidatedTabs`). `app/components/sla/SlaReportView.vue` e as 8 páginas antigas são deletadas por ficarem órfãs. Devoluções: troca pontual de strings literais em 4 páginas + 2 strings em `app/utils/devolucoes-metrics.ts`; `acompanhamento.vue` não é tocado.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>` + TypeScript, Nuxt UI 4 (`USelectMenu`), Tailwind CSS 4, Chart.js 4 via `app/components/charts/`, Vitest.

**Projeto:** `D:/DEVJUANMARCOS/PROJETOS/KEENER/VIA REVERSA/V2/ViaReversaV2_Front` (não confundir com a cópia de deploy em `.../via-teste`, que não faz parte deste plano).

---

## Contexto e decisões de design

- Este é 1 de 6 planos paralelos. Um plano irmão cuida de `app/components/app/navigation.ts` / `app/components/app/AppSidebar.vue` — a rota `/dashboards/sla` e a entrada de menu já estão sendo registradas por ele. **Não tocar nesses 2 arquivos.** Este plano só cria a página de fato em `app/pages/dashboards/sla.vue` e deleta as 8 páginas antigas.
- **Por que abas (nav+button+underline) em vez de lado a lado:** as 2 visões (ranking por entidade × evolução por data) têm métricas diferentes (6 vs 3), gráficos diferentes (2 vs 1) e tabelas com número de colunas diferente (8 vs 7) — colocá-las lado a lado duplicaria a largura horizontal da tela e forçaria scroll duplo. Abas seguem o padrão já aprovado em `dashboard-reversa.vue` (citado explicitamente pelo usuário) e mantêm cada visão com a largura total da tela, sem perder nenhuma informação (o requisito é "nenhuma métrica/gráfico/coluna pode desaparecer, só se reorganizar" — abas reorganizam, não escondem: cada visão continua 100% visível ao clicar na aba).
- **Reaproveitamento:** `slaVariantMeta`, `entitiesForDimension`, `dateRowsForDimension`, `buildSlaStackedSeries`, `slaPercentTrend`, `slaAccountOptions`, `slaOperationOptions`, `slaPeriodOptions`, `buildSlaEntityMetrics`, `buildSlaDateMetrics` — todos de `app/data/demo/sla-analytics.ts` / `app/utils/sla-analytics-metrics.ts` — são importados sem nenhuma alteração de assinatura. Isso mantém os testes existentes de `tests/p2-screens.spec.ts` (que cobrem esses exports) passando sem qualquer edição.
- **`app/components/sla/SlaReportView.vue` é deletado, não absorvido como componente.** Hoje só as 8 páginas antigas o consomem (confirmado por grep); a página nova não usa um componente wrapper — ela escreve tudo diretamente em `app/pages/dashboards/sla.vue`, no mesmo estilo de `dashboard-reversa.vue` (614 linhas, tudo na página, sem `*View.vue` intermediário). Criar um componente novo só para 1 consumidor violaria YAGNI.
- **Nenhuma mudança em `app/data/demo/sla-analytics.ts` além de 2 exports aditivos** (`slaConsolidatedDimensions`, `slaConsolidatedTabs`) — `slaVariantMeta` continua com as 8 chaves originais (usadas pela página nova só para ler `entityColumn`), então `expect(Object.keys(slaVariantMeta)).toHaveLength(8)` em `tests/p2-screens.spec.ts` continua válido sem edição.
- **Testes de navegação/breadcrumbs não são tocados:** `tests/p2-screens.spec.ts` (submenu SLA, breadcrumbs `/sla/*`) e `tests/navigation.spec.ts` dependem de `app/components/app/navigation.ts` e `app/utils/breadcrumbs.ts` — nenhum dos dois é alterado por este plano (breadcrumbs.ts resolve `/dashboards/*` de forma genérica via `dashboardsNavigation`, então a nova rota herda breadcrumb automaticamente assim que o plano irmão registrar a entrada de menu). Só `tests/routes.spec.ts` (que testa existência/conteúdo de arquivo, não navegação) precisa de edição.
- **Grep de "PA" solto:** `tests/routes.spec.ts` tem um teste que proíbe a palavra solta `PA` (regex `/\bPA\b/`) em qualquer arquivo listado na tabela `routes`. A página nova entra nessa tabela, então o filtro de dimensão usa o rótulo por extenso "Ponto de apoio" (nunca a sigla) — nunca renderiza `slaVariantMeta['por-pa'].title` (que contém a sigla "PA") diretamente no template.
- **Devoluções — grep feito nos arquivos reais** (texto visível literal "DEV IN"/"DEV OUT"/"Devoluções", fora de comentários de código):
  - `app/pages/devolucoes/dev-in/index.vue:18` — `useSeoMeta({ title: 'DEV IN · Devoluções · Via Reversa' })`
  - `app/pages/devolucoes/dev-in/index.vue:52` — coluna `label: 'Status DEV OUT'`
  - `app/pages/devolucoes/dev-in/index.vue:161` — `PageHeader title="DEV IN"`
  - `app/pages/devolucoes/dev-in/[id]/index.vue:28` — `useSeoMeta({ title: () => \`DEV IN #${boxId.value} · Devoluções · Via Reversa\` })`
  - `app/pages/devolucoes/dev-in/[id]/index.vue:137` — `PageHeader :title="\`DEV IN #${box.id}\`"`
  - `app/pages/devolucoes/dev-out/index.vue:20` — `useSeoMeta({ title: 'DEV OUT · Devoluções · Via Reversa' })`
  - `app/pages/devolucoes/dev-out/index.vue:184` — `PageHeader title="DEV OUT"`
  - `app/pages/devolucoes/dev-out/[id].vue:29` — `useSeoMeta({ title: () => \`DEV OUT #${lotId.value} · Devoluções · Via Reversa\` })`
  - `app/pages/devolucoes/dev-out/[id].vue:151` — `PageHeader :title="\`DEV OUT #${lot.id}\`"`
  - `app/utils/devolucoes-metrics.ts:63` — `note: ... \`${readyForLot} sem vínculo DEV OUT\` ...` (usado por `buildDevInListMetrics`, renderizado em `dev-in/index.vue`)
  - `app/utils/devolucoes-metrics.ts:138` — `label: 'Status DEV OUT'` (usado por `buildDevInDetailMetrics`, renderizado em `dev-in/[id]/index.vue`)
  - **Fora de escopo (decisão explícita):** `app/pages/devolucoes/dev-in/index.vue:162` (`subtitle="Entrada de Devolução ao Fornecedor"`) e `app/pages/devolucoes/dev-out/index.vue:185` (`subtitle="Saída de Devolução ao Fornecedor"`) usam a palavra "Devolução" (singular), não "Devoluções" (o literal pedido) — não são alterados. `app/utils/devolucoes-metrics.ts:254,262,268` (`'DEV IN em conferência'`, `'prontas para DEV OUT'`, `'Com DEV OUT'`, dentro de `buildAcompanhamentoMetrics`) só são consumidos por `app/pages/devolucoes/acompanhamento.vue`, que o enunciado explicitamente isenta de edição — não são alterados. Comentários de código (`/** Listagem DEV IN — ... */` etc.) não são texto visível na UI — não são alterados.
  - Rotas (`/devolucoes`, `/devolucoes/dev-in`, `/devolucoes/dev-out`) e os labels de `app/components/app/navigation.ts` (`'DEV IN'`, `'DEV OUT'`, `'Devoluções'`) não são tocados — são do plano irmão.
- **Testes de Devoluções:** `tests/devolucoes.spec.ts` afirma literalmente `'Status DEV OUT'` no array de labels de `buildDevInDetailMetrics` (linha ~101) — precisa virar `'Status Despachos'`. Nenhum outro teste do repo afirma texto literal "DEV IN"/"DEV OUT" fora de `tests/navigation.spec.ts` (que testa `app/components/app/navigation.ts` e `app/utils/breadcrumbs.ts` — não tocados por este plano).

## File Structure

- Modify: `app/data/demo/sla-analytics.ts` — adiciona `SlaConsolidatedTabId`, `SlaConsolidatedTab`, `slaConsolidatedTabs`, `SlaDimensionOption`, `slaConsolidatedDimensions` (aditivo, nada removido).
- Create: `tests/sla-consolidated.spec.ts` — testa a configuração nova de dimensões/abas e o conteúdo da página consolidada.
- Create: `app/pages/dashboards/sla.vue` — página consolidada (filtro de dimensão + abas Ranking/Por data).
- Modify: `tests/routes.spec.ts` — remove as 7 linhas mortas (4 páginas antigas de `/sla/*` + 3 usos de `SlaReportView.vue`), adiciona linhas para `app/pages/dashboards/sla.vue`.
- Delete: `app/pages/sla/index.vue`, `app/pages/sla/cliente-por-data.vue`, `app/pages/sla/estado-por-data.vue`, `app/pages/sla/pa-por-data.vue`, `app/pages/sla/transportador-por-data.vue`, `app/pages/sla/por-cliente.vue`, `app/pages/sla/por-estado.vue`, `app/pages/sla/por-pa.vue`, `app/pages/sla/por-transportador.vue`.
- Delete: `app/components/sla/SlaReportView.vue`.
- Modify: `app/utils/devolucoes-metrics.ts` — renomeia 2 strings literais (`'sem vínculo DEV OUT'` → `'sem vínculo Despachos'`, `'Status DEV OUT'` → `'Status Despachos'`).
- Modify: `tests/devolucoes.spec.ts` — atualiza a asserção `'Status DEV OUT'` → `'Status Despachos'`.
- Create: `tests/devolucoes-rename.spec.ts` — testa os textos visíveis renomeados nas 4 páginas de Devoluções.
- Modify: `app/pages/devolucoes/dev-in/index.vue` — título, `useSeoMeta`, label de coluna.
- Modify: `app/pages/devolucoes/dev-out/index.vue` — título, `useSeoMeta`.
- Modify: `app/pages/devolucoes/dev-in/[id]/index.vue` — `useSeoMeta`, título do `PageHeader`.
- Modify: `app/pages/devolucoes/dev-out/[id].vue` — `useSeoMeta`, título do `PageHeader`.

---

### Task 1: `sla-analytics.ts` — configuração de dimensões e abas do consolidado

**Files:**
- Modify: `app/data/demo/sla-analytics.ts`
- Test: `tests/sla-consolidated.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/sla-consolidated.spec.ts`:

```ts
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
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/sla-consolidated.spec.ts`
Expected: FAIL com `Cannot find module` / `slaConsolidatedDimensions is not exported` (os exports ainda não existem).

- [ ] **Step 3: Implementar os exports em `app/data/demo/sla-analytics.ts`**

Adicionar ao final do arquivo (depois de `isSlaReportVariant`):

```ts
export type SlaConsolidatedTabId = 'ranking' | 'by-date'

export interface SlaConsolidatedTab {
  id: SlaConsolidatedTabId
  label: string
}

/**
 * Abas da página consolidada `/dashboards/sla` — substitui a divisão em
 * 8 arquivos (4 dimensões × 2 modos) por 1 filtro de dimensão + 2 abas.
 */
export const slaConsolidatedTabs: SlaConsolidatedTab[] = [
  { id: 'ranking', label: 'Ranking por entidade' },
  { id: 'by-date', label: 'Evolução por data' }
]

export interface SlaDimensionOption {
  value: SlaDimension
  label: string
  entityVariant: SlaReportVariant
  dateVariant: SlaReportVariant
}

/** Filtro de dimensão único da página consolidada. */
export const slaConsolidatedDimensions: SlaDimensionOption[] = [
  { value: 'customer', label: 'Cliente', entityVariant: 'por-cliente', dateVariant: 'cliente-por-data' },
  { value: 'state', label: 'Estado', entityVariant: 'por-estado', dateVariant: 'estado-por-data' },
  { value: 'support_point', label: 'Ponto de apoio', entityVariant: 'por-pa', dateVariant: 'pa-por-data' },
  { value: 'transporter', label: 'Transportador', entityVariant: 'por-transportador', dateVariant: 'transportador-por-data' }
]
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/sla-consolidated.spec.ts`
Expected: PASS (3 testes)

- [ ] **Step 5: Rodar a suíte de SLA existente para garantir que nada quebrou**

Run: `npm run test:run -- tests/p2-screens.spec.ts`
Expected: PASS (os exports são aditivos, `slaVariantMeta` e as demais funções não mudaram)

- [ ] **Step 6: Commit**

```bash
git add app/data/demo/sla-analytics.ts tests/sla-consolidated.spec.ts
git commit -m "feat(sla): adiciona config de dimensoes e abas do SLA consolidado"
```

---

### Task 2: Criar `app/pages/dashboards/sla.vue` (página consolidada)

**Files:**
- Create: `app/pages/dashboards/sla.vue`
- Modify: `tests/sla-consolidated.spec.ts`
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Escrever os testes que falham (conteúdo da página nova)**

Adicionar ao final de `tests/sla-consolidated.spec.ts` (ajustar o import do topo para incluir `existsSync, readFileSync` de `node:fs`):

```ts
import { existsSync, readFileSync } from 'node:fs'
```

```ts
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
```

- [ ] **Step 2: Rodar os testes e confirmar falha**

Run: `npm run test:run -- tests/sla-consolidated.spec.ts`
Expected: FAIL em `existsSync(pagePath)).toBe(true)` (o arquivo ainda não existe).

- [ ] **Step 3: Criar `app/pages/dashboards/sla.vue`**

```vue
<script setup lang="ts">
/**
 * SLA consolidado — substitui as 8 telas legadas (cliente/estado/ponto de apoio/transportador
 * × ranking-por-entidade/evolução-por-data) em 1 página com filtro de dimensão + abas.
 */
import type { DataTableColumn } from '~/types/data-table'
import type {
  SlaConsolidatedTabId,
  SlaDateRow,
  SlaDimension,
  SlaEntityRow
} from '~/data/demo/sla-analytics'
import {
  buildSlaStackedSeries,
  dateRowsForDimension,
  entitiesForDimension,
  slaAccountOptions,
  slaConsolidatedDimensions,
  slaConsolidatedTabs,
  slaOperationOptions,
  slaPercentTrend,
  slaPeriodOptions,
  slaVariantMeta
} from '~/data/demo/sla-analytics'
import {
  buildSlaDateMetrics,
  buildSlaEntityMetrics
} from '~/utils/sla-analytics-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const dimension = ref<SlaDimension>('customer')
const activeTab = ref<SlaConsolidatedTabId>('ranking')

const accountId = ref('all')
const operationId = ref('all')
const period = ref('7d')

const entityPage = ref(1)
const entityPageSize = ref(DEFAULT_PAGE_SIZE)
const datePage = ref(1)
const datePageSize = ref(DEFAULT_PAGE_SIZE)

const dimensionConfig = computed(
  () => slaConsolidatedDimensions.find((item) => item.value === dimension.value) ?? slaConsolidatedDimensions[0]!
)
const entityColumnLabel = computed(() => slaVariantMeta[dimensionConfig.value.entityVariant].entityColumn)

useSeoMeta({
  title: () => `SLA · ${dimensionConfig.value.label} · Via Reversa`
})

const entityRows = computed(() => entitiesForDimension(dimension.value))
const dateRows = computed(() => dateRowsForDimension(dimension.value))

const entityMetrics = computed(() => buildSlaEntityMetrics(entityRows.value))
const dateMetrics = computed(() => buildSlaDateMetrics(dateRows.value))

const stackedSeries = computed(() => buildSlaStackedSeries(entityRows.value))
const donutAttended = computed(() => entityRows.value.reduce((acc, row) => acc + row.attended, 0))
const donutExpired = computed(() => entityRows.value.reduce((acc, row) => acc + row.expired, 0))

const entityColumns = computed<DataTableColumn<SlaEntityRow>[]>(() => [
  {
    type: 'text',
    key: 'entityLabel',
    label: entityColumnLabel.value,
    width: '22%',
    secondaryKey: 'entitySecondary'
  },
  { type: 'text', key: 'attended', label: 'Atendidos', width: '100px', align: 'right' },
  { type: 'text', key: 'expired', label: 'Expirados', width: '100px', align: 'right' },
  { type: 'text', key: 'attendedPct', label: '% Atendido', width: '100px', align: 'right' },
  { type: 'text', key: 'expiredPct', label: '% Expirado', width: '100px', align: 'right' },
  { type: 'text', key: 'completed', label: 'Concluídos', width: '100px', align: 'right' },
  { type: 'text', key: 'withOccurrence', label: 'Ocorrências', width: '100px', align: 'right' },
  { type: 'text', key: 'total', label: 'Total', width: '80px', align: 'right' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '130px',
    items: (row) => [
      {
        key: 'orders',
        label: 'Ver pedidos',
        icon: 'i-lucide-package-search',
        variant: 'ghost' as const,
        ariaLabel: `Ver pedidos de ${row.entityLabel}`
      }
    ]
  }
])

const dateColumns = computed<DataTableColumn<SlaDateRow>[]>(() => [
  { type: 'text', key: 'dateLabel', label: 'Data', width: '90px' },
  { type: 'text', key: 'entityLabel', label: entityColumnLabel.value, width: '24%' },
  { type: 'text', key: 'attended', label: 'Atendidos', width: '100px', align: 'right' },
  { type: 'text', key: 'expired', label: 'Expirados', width: '100px', align: 'right' },
  { type: 'text', key: 'attendedPct', label: '% Atendido', width: '100px', align: 'right' },
  { type: 'text', key: 'expiredPct', label: '% Expirado', width: '100px', align: 'right' },
  { type: 'text', key: 'total', label: 'Total', width: '80px', align: 'right' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '130px',
    items: (row) => [
      {
        key: 'orders',
        label: 'Ver pedidos',
        icon: 'i-lucide-package-search',
        variant: 'ghost' as const,
        ariaLabel: `Ver pedidos de ${row.entityLabel} em ${row.dateLabel}`
      }
    ]
  }
])

const pagedEntityRows = computed(() => slicePage(entityRows.value, entityPage.value, entityPageSize.value))
const pagedDateRows = computed(() => slicePage(dateRows.value, datePage.value, datePageSize.value))

const filterSummary = computed(() => {
  const account = slaAccountOptions.find((item) => item.value === accountId.value)?.label ?? 'Todas'
  const periodLabel = slaPeriodOptions.find((item) => item.value === period.value)?.label ?? period.value
  return `${account} · ${periodLabel}`
})

watch([accountId, operationId, period, dimension], () => {
  entityPage.value = 1
  datePage.value = 1
})

function selectTab(tab: SlaConsolidatedTabId) {
  activeTab.value = tab
}

function refresh() {
  toast.success('Atualizado', `SLA · ${dimensionConfig.value.label} recarregado (mock).`)
}

function onEntityAction(payload: { row: SlaEntityRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({ path: '/pedidos', query: { slaEntity: payload.row.entityLabel } })
  }
}

function onDateAction(payload: { row: SlaDateRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({
      path: '/pedidos',
      query: { slaEntity: payload.row.entityLabel, slaDate: payload.row.dateLabel }
    })
  }
}
</script>

<template>
  <div class="sla-report-page">
    <PageHeader
      title="SLA"
      :subtitle="`Relatório SLA · ${dimensionConfig.label} · ${filterSummary}`"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <USelectMenu
        v-model="dimension"
        value-key="value"
        :items="slaConsolidatedDimensions"
        class="w-[200px]"
        aria-label="Dimensão"
      />
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="slaAccountOptions"
        class="w-[240px]"
      />
      <USelectMenu
        v-model="operationId"
        value-key="value"
        :items="slaOperationOptions"
        class="w-[220px]"
      />
      <USelectMenu
        v-model="period"
        value-key="value"
        :items="slaPeriodOptions"
        class="w-[180px]"
      />
    </section>

    <nav
      class="flex min-h-[49px] flex-wrap gap-[18px] border-b border-via-line px-[18px]"
      aria-label="Abas do relatório SLA"
    >
      <button
        v-for="tab in slaConsolidatedTabs"
        :key="tab.id"
        type="button"
        class="inline-flex cursor-pointer items-center border-0 border-b-2 border-transparent bg-transparent text-xs text-via-muted transition-[color,border-color] duration-150"
        :class="activeTab === tab.id ? 'border-via-blue font-bold text-via-ink' : undefined"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <template v-if="activeTab === 'ranking'">
      <MetricsStrip
        :metrics="entityMetrics"
        :max-per-row="3"
      />

      <section
        class="grid grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)] border-b border-via-line max-[1100px]:grid-cols-1"
        aria-label="Gráficos"
      >
        <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
          <ChartPanel
            title="Atendido × Expirado"
            note="consolidado"
          >
            <DonutChart
              :vol="donutAttended"
              :invol="donutExpired"
              aria-label="Atendido versus expirado"
              :height="220"
            />
          </ChartPanel>
        </div>
        <div class="min-w-0">
          <ChartPanel
            title="Top entidades"
            note="atendido × expirado"
          >
            <StackedBarChart
              :series="stackedSeries"
              vol-label="Atendido"
              invol-label="Expirado"
              aria-label="Atendido versus expirado por entidade"
              :height="220"
            />
          </ChartPanel>
        </div>
      </section>

      <DataTable
        :columns="entityColumns"
        :rows="pagedEntityRows"
        min-width="1100px"
        empty-title="Sem entidades"
        empty-description="Ajuste os filtros para ver o ranking de SLA."
        @action="onEntityAction"
      />

      <Pagination
        v-model:page="entityPage"
        v-model:page-size="entityPageSize"
        :total="entityRows.length"
      />
    </template>

    <template v-else>
      <MetricsStrip
        :metrics="dateMetrics"
        :max-per-row="3"
      />

      <section
        class="border-b border-via-line"
        aria-label="Tendência de efetividade"
      >
        <ChartPanel
          title="Efetividade no tempo"
          note="% atendido (fixture)"
        >
          <PercentTrendChart
            :series="slaPercentTrend"
            label="Efetividade %"
            aria-label="Evolução percentual de SLA"
            :height="180"
          />
        </ChartPanel>
      </section>

      <DataTable
        :columns="dateColumns"
        :rows="pagedDateRows"
        min-width="980px"
        empty-title="Sem buckets no período"
        empty-description="Ajuste os filtros para ver o SLA por data."
        @action="onDateAction"
      />

      <Pagination
        v-model:page="datePage"
        v-model:page-size="datePageSize"
        :total="dateRows.length"
      />
    </template>
  </div>
</template>
```

- [ ] **Step 4: Rodar os testes e confirmar sucesso**

Run: `npm run test:run -- tests/sla-consolidated.spec.ts`
Expected: PASS (todos os testes do Step 1)

- [ ] **Step 5: Adicionar a página nova em `tests/routes.spec.ts`**

Na tabela `routes` de `tests/routes.spec.ts`, logo antes da linha `['app/pages/dashboards/indicadores.vue', 'StackedBarChart'],`, adicionar:

```ts
  ['app/pages/dashboards/sla.vue', 'DonutChart'],
  ['app/pages/dashboards/sla.vue', 'StackedBarChart'],
  ['app/pages/dashboards/sla.vue', 'PercentTrendChart'],
  ['app/pages/dashboards/sla.vue', 'MetricsStrip'],
```

- [ ] **Step 6: Rodar `routes.spec.ts` e confirmar sucesso**

Run: `npm run test:run -- tests/routes.spec.ts`
Expected: PASS, incluindo o teste `mantém a nomenclatura completa nas páginas` (sem `\bPA\b`).

- [ ] **Step 7: Commit**

```bash
git add app/pages/dashboards/sla.vue tests/sla-consolidated.spec.ts tests/routes.spec.ts
git commit -m "feat(sla): cria pagina consolidada /dashboards/sla"
```

---

### Task 3: Deletar as 8 páginas antigas de `/sla/*`

**Files:**
- Delete: `app/pages/sla/index.vue`
- Delete: `app/pages/sla/cliente-por-data.vue`
- Delete: `app/pages/sla/estado-por-data.vue`
- Delete: `app/pages/sla/pa-por-data.vue`
- Delete: `app/pages/sla/transportador-por-data.vue`
- Delete: `app/pages/sla/por-cliente.vue`
- Delete: `app/pages/sla/por-estado.vue`
- Delete: `app/pages/sla/por-pa.vue`
- Delete: `app/pages/sla/por-transportador.vue`
- Modify: `tests/sla-consolidated.spec.ts`
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Escrever o teste que falha (arquivos antigos não devem mais existir)**

Adicionar ao final de `tests/sla-consolidated.spec.ts`:

```ts
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
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/sla-consolidated.spec.ts`
Expected: FAIL (os 9 arquivos ainda existem).

- [ ] **Step 3: Remover as linhas mortas de `tests/routes.spec.ts`**

Remover estas 4 linhas da tabela `routes`:

```ts
  ['app/pages/sla/cliente-por-data.vue', 'SlaReportView'],
  ['app/pages/sla/por-cliente.vue', 'SlaReportView'],
  ['app/pages/sla/por-transportador.vue', 'SlaReportView'],
  ['app/pages/sla/transportador-por-data.vue', 'SlaReportView'],
```

- [ ] **Step 4: Deletar os 9 arquivos**

```bash
rm "app/pages/sla/index.vue" \
   "app/pages/sla/cliente-por-data.vue" \
   "app/pages/sla/estado-por-data.vue" \
   "app/pages/sla/pa-por-data.vue" \
   "app/pages/sla/transportador-por-data.vue" \
   "app/pages/sla/por-cliente.vue" \
   "app/pages/sla/por-estado.vue" \
   "app/pages/sla/por-pa.vue" \
   "app/pages/sla/por-transportador.vue"
```

- [ ] **Step 5: Rodar os testes e confirmar sucesso**

Run: `npm run test:run -- tests/sla-consolidated.spec.ts tests/routes.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A app/pages/sla tests/sla-consolidated.spec.ts tests/routes.spec.ts
git commit -m "chore(sla): remove as 8 paginas legadas de /sla substituidas por /dashboards/sla"
```

---

### Task 4: Deletar `app/components/sla/SlaReportView.vue`

**Files:**
- Delete: `app/components/sla/SlaReportView.vue`
- Modify: `tests/sla-consolidated.spec.ts`
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao `describe` criado na Task 3 (mesmo bloco `'SLA consolidado — as 8 páginas antigas foram removidas'`), um segundo `it`:

```ts
  it('remove o componente SlaReportView (órfão, sem consumidores)', () => {
    expect(existsSync('app/components/sla/SlaReportView.vue')).toBe(false)
  })
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/sla-consolidated.spec.ts`
Expected: FAIL (`SlaReportView.vue` ainda existe).

- [ ] **Step 3: Remover as 3 linhas mortas de `tests/routes.spec.ts`**

Remover:

```ts
  ['app/components/sla/SlaReportView.vue', 'MetricsStrip'],
  ['app/components/sla/SlaReportView.vue', 'PercentTrendChart'],
  ['app/components/sla/SlaReportView.vue', 'DataTable'],
```

- [ ] **Step 4: Confirmar (grep) que não há mais nenhum consumidor antes de deletar**

Run: `grep -rn "SlaReportView" app/ tests/`
Expected: nenhuma ocorrência (a busca só deve retornar vazio — se aparecer algo além do que já foi removido, pare e investigue antes de deletar).

- [ ] **Step 5: Deletar o arquivo**

```bash
rm "app/components/sla/SlaReportView.vue"
```

- [ ] **Step 6: Rodar os testes e confirmar sucesso**

Run: `npm run test:run -- tests/sla-consolidated.spec.ts tests/routes.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add -A app/components/sla tests/sla-consolidated.spec.ts tests/routes.spec.ts
git commit -m "chore(sla): remove SlaReportView.vue orfao"
```

---

### Task 5: `devolucoes-metrics.ts` — renomear "DEV OUT" para "Despachos"

**Files:**
- Modify: `app/utils/devolucoes-metrics.ts:63,138`
- Test: `tests/devolucoes.spec.ts`

- [ ] **Step 1: Atualizar o teste (torna a asserção atual falha)**

Em `tests/devolucoes.spec.ts`, no teste `'expande métricas do detalhe DEV IN'`, trocar:

```ts
    expect(metrics.map((item) => item.label)).toEqual([
      'Itens na caixa',
      'Itens Reversa',
      'Itens Entrega',
      'Status DEV OUT'
    ])
```

por:

```ts
    expect(metrics.map((item) => item.label)).toEqual([
      'Itens na caixa',
      'Itens Reversa',
      'Itens Entrega',
      'Status Despachos'
    ])
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/devolucoes.spec.ts`
Expected: FAIL em `'expande métricas do detalhe DEV IN'` (o label ainda é `'Status DEV OUT'`).

- [ ] **Step 3: Implementar a troca em `app/utils/devolucoes-metrics.ts`**

Linha 63, dentro de `buildDevInListMetrics`, trocar:

```ts
      note: readyForLot > 0 ? `${readyForLot} sem vínculo DEV OUT` : 'soma no filtro',
```

por:

```ts
      note: readyForLot > 0 ? `${readyForLot} sem vínculo Despachos` : 'soma no filtro',
```

Linha 138, dentro de `buildDevInDetailMetrics`, trocar:

```ts
      label: 'Status DEV OUT',
```

por:

```ts
      label: 'Status Despachos',
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/devolucoes.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/utils/devolucoes-metrics.ts tests/devolucoes.spec.ts
git commit -m "refactor(devolucoes): renomeia label/nota DEV OUT para Despachos em devolucoes-metrics"
```

---

### Task 6: `dev-in/index.vue` — renomear título, aba do navegador e coluna

**Files:**
- Modify: `app/pages/devolucoes/dev-in/index.vue:18,52,161`
- Test: `tests/devolucoes-rename.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/devolucoes-rename.spec.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Devoluções — DEV IN → Caixas, DEV OUT → Despachos (texto visível)', () => {
  it('renomeia título, aba do navegador e coluna da listagem DEV IN', () => {
    const source = readFileSync('app/pages/devolucoes/dev-in/index.vue', 'utf8')
    expect(source).toContain("useSeoMeta({ title: 'Caixas · Remessas · Via Reversa' })")
    expect(source).toContain('title="Caixas"')
    expect(source).toContain("label: 'Status Despachos'")
    expect(source).not.toMatch(/title="DEV IN"/)
    expect(source).not.toMatch(/'DEV IN/)
    expect(source).not.toMatch(/Status DEV OUT/)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/devolucoes-rename.spec.ts`
Expected: FAIL (o arquivo ainda contém `'DEV IN · Devoluções · Via Reversa'`, `title="DEV IN"` e `'Status DEV OUT'`).

- [ ] **Step 3: Implementar as 3 trocas**

Linha 18, trocar:

```ts
useSeoMeta({ title: 'DEV IN · Devoluções · Via Reversa' })
```

por:

```ts
useSeoMeta({ title: 'Caixas · Remessas · Via Reversa' })
```

Linha 52, trocar:

```ts
  { type: 'text', key: 'lotOutStatus', label: 'Status DEV OUT', width: '120px' },
```

por:

```ts
  { type: 'text', key: 'lotOutStatus', label: 'Status Despachos', width: '120px' },
```

Linha 161, trocar:

```html
      title="DEV IN"
```

por:

```html
      title="Caixas"
```

(a linha 162, `subtitle="Entrada de Devolução ao Fornecedor"`, permanece igual — não usa o literal "Devoluções").

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/devolucoes-rename.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/devolucoes/dev-in/index.vue tests/devolucoes-rename.spec.ts
git commit -m "refactor(devolucoes): renomeia titulo/coluna DEV IN para Caixas na listagem"
```

---

### Task 7: `dev-out/index.vue` — renomear título e aba do navegador

**Files:**
- Modify: `app/pages/devolucoes/dev-out/index.vue:20,184`
- Test: `tests/devolucoes-rename.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao `describe` de `tests/devolucoes-rename.spec.ts` (mesmo arquivo da Task 6):

```ts
  it('renomeia título e aba do navegador da listagem DEV OUT', () => {
    const source = readFileSync('app/pages/devolucoes/dev-out/index.vue', 'utf8')
    expect(source).toContain("useSeoMeta({ title: 'Despachos · Remessas · Via Reversa' })")
    expect(source).toContain('title="Despachos"')
    expect(source).not.toMatch(/title="DEV OUT"/)
    expect(source).not.toMatch(/'DEV OUT/)
  })
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/devolucoes-rename.spec.ts`
Expected: FAIL (o novo `it` falha; o arquivo ainda contém `'DEV OUT · Devoluções · Via Reversa'` e `title="DEV OUT"`).

- [ ] **Step 3: Implementar as 2 trocas**

Linha 20, trocar:

```ts
useSeoMeta({ title: 'DEV OUT · Devoluções · Via Reversa' })
```

por:

```ts
useSeoMeta({ title: 'Despachos · Remessas · Via Reversa' })
```

Linha 184, trocar:

```html
      title="DEV OUT"
```

por:

```html
      title="Despachos"
```

(a linha 185, `subtitle="Saída de Devolução ao Fornecedor"`, permanece igual).

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/devolucoes-rename.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/devolucoes/dev-out/index.vue tests/devolucoes-rename.spec.ts
git commit -m "refactor(devolucoes): renomeia titulo DEV OUT para Despachos na listagem"
```

---

### Task 8: `dev-in/[id]/index.vue` — renomear título do detalhe

**Files:**
- Modify: `app/pages/devolucoes/dev-in/[id]/index.vue:28,137`
- Test: `tests/devolucoes-rename.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao `describe` de `tests/devolucoes-rename.spec.ts`:

```ts
  it('renomeia título do detalhe DEV IN para Caixa #id', () => {
    const source = readFileSync('app/pages/devolucoes/dev-in/[id]/index.vue', 'utf8')
    expect(source).toContain('`Caixa #${boxId.value} · Remessas · Via Reversa`')
    expect(source).toContain('`Caixa #${box.id}`')
    expect(source).not.toMatch(/DEV IN #/)
  })
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/devolucoes-rename.spec.ts`
Expected: FAIL (o arquivo ainda contém `` `DEV IN #${boxId.value} · Devoluções · Via Reversa` `` e `` `DEV IN #${box.id}` ``).

- [ ] **Step 3: Implementar as 2 trocas**

Linha 28, trocar:

```ts
useSeoMeta({ title: () => `DEV IN #${boxId.value} · Devoluções · Via Reversa` })
```

por:

```ts
useSeoMeta({ title: () => `Caixa #${boxId.value} · Remessas · Via Reversa` })
```

Linha 137, trocar:

```html
      :title="`DEV IN #${box.id}`"
```

por:

```html
      :title="`Caixa #${box.id}`"
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/devolucoes-rename.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "app/pages/devolucoes/dev-in/[id]/index.vue" tests/devolucoes-rename.spec.ts
git commit -m "refactor(devolucoes): renomeia titulo DEV IN para Caixa no detalhe"
```

---

### Task 9: `dev-out/[id].vue` — renomear título do detalhe

**Files:**
- Modify: `app/pages/devolucoes/dev-out/[id].vue:29,151`
- Test: `tests/devolucoes-rename.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao `describe` de `tests/devolucoes-rename.spec.ts`:

```ts
  it('renomeia título do detalhe DEV OUT para Despacho #id', () => {
    const source = readFileSync('app/pages/devolucoes/dev-out/[id].vue', 'utf8')
    expect(source).toContain('`Despacho #${lotId.value} · Remessas · Via Reversa`')
    expect(source).toContain('`Despacho #${lot.id}`')
    expect(source).not.toMatch(/DEV OUT #/)
  })

  it('não altera acompanhamento.vue (fora do escopo deste plano)', () => {
    const source = readFileSync('app/pages/devolucoes/acompanhamento.vue', 'utf8')
    expect(source).toContain('Acompanhamento de Devoluções')
    expect(source).toContain('Visão agregada DEV IN — caixas, itens, período e transportadores')
  })
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/devolucoes-rename.spec.ts`
Expected: FAIL no primeiro `it` novo (o arquivo ainda contém `` `DEV OUT #${lotId.value} · Devoluções · Via Reversa` `` e `` `DEV OUT #${lot.id}` ``); o segundo `it` já passa (acompanhamento.vue não foi tocado por nenhuma task anterior).

- [ ] **Step 3: Implementar as 2 trocas**

Linha 29, trocar:

```ts
useSeoMeta({ title: () => `DEV OUT #${lotId.value} · Devoluções · Via Reversa` })
```

por:

```ts
useSeoMeta({ title: () => `Despacho #${lotId.value} · Remessas · Via Reversa` })
```

Linha 151, trocar:

```html
      :title="`DEV OUT #${lot.id}`"
```

por:

```html
      :title="`Despacho #${lot.id}`"
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/devolucoes-rename.spec.ts`
Expected: PASS (todos os `it` do arquivo)

- [ ] **Step 5: Rodar a suíte completa de Devoluções**

Run: `npm run test:run -- tests/devolucoes.spec.ts tests/devolucoes-rename.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add "app/pages/devolucoes/dev-out/[id].vue" tests/devolucoes-rename.spec.ts
git commit -m "refactor(devolucoes): renomeia titulo DEV OUT para Despacho no detalhe"
```

---

### Task 10: Checklist final do CLAUDE.md

**Files:** (nenhum arquivo novo — só verificação; corrigir regressões inline nos arquivos das tasks anteriores, se houver)

- [ ] **Step 1: Rodar a suíte completa de testes**

Run: `npm run test:run`
Expected: todos os testes passam, incluindo `tests/sla-consolidated.spec.ts`, `tests/devolucoes.spec.ts`, `tests/devolucoes-rename.spec.ts`, `tests/routes.spec.ts`, `tests/p2-screens.spec.ts`, `tests/harvest-route-manifest.spec.ts`, `tests/import-paths.spec.ts` e `tests/navigation.spec.ts` (estes 2 últimos não foram editados por este plano e devem continuar verdes sem alteração).

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: 0 erros. Prestar atenção especial a `app/pages/dashboards/sla.vue` (tipos `SlaDimension`, `SlaConsolidatedTabId`, `DataTableColumn<SlaEntityRow>` / `DataTableColumn<SlaDateRow>` devem bater com os definidos em `app/data/demo/sla-analytics.ts` e `app/types/data-table.ts`).

- [ ] **Step 3: Rodar o lint**

Run: `npm run lint`
Expected: 0 erros/warnings. Se o ESLint reclamar de import não usado ou ordenação de imports em `app/pages/dashboards/sla.vue`, corrigir mantendo os mesmos imports (nenhum é supérfluo — todos são consumidos no template ou no script).

- [ ] **Step 4: Rodar o build**

Run: `npm run build`
Expected: build conclui sem erros. Confirma que a rota `/dashboards/sla` compila e que a remoção das 8 rotas `/sla/*` e de `SlaReportView.vue` não deixou nenhuma referência quebrada.

- [ ] **Step 5: Rodar a verificação de fundação**

Run: `node scripts/verify-foundation.mjs`
Expected: `{ "status": "ok", ... }` — este script só valida arquivos de raiz/config, não é afetado por este plano, mas deve continuar passando.

- [ ] **Step 6: Grep final de sanidade**

Run: `grep -rn "SlaReportView" app/ tests/`
Expected: nenhuma ocorrência.

Run: `grep -rn "app/pages/sla/" tests/routes.spec.ts`
Expected: nenhuma ocorrência.

Run: `grep -rln "DEV IN\|DEV OUT" app/pages/devolucoes/`
Expected: só `app/pages/devolucoes/acompanhamento.vue` (fora do escopo deste plano, conforme decisão documentada).

- [ ] **Step 7: Commit final (se algum ajuste tiver sido feito no Step 3)**

```bash
git add -A
git commit -m "chore: checklist final CLAUDE.md - sla consolidado e rename devolucoes"
```

(Se nenhum ajuste foi necessário nos Steps 1–5, não há nada para commitar — todas as tasks anteriores já foram commitadas individualmente.)

---

## Self-Review

**1. Cobertura do spec:**
- Consolidar as 8 telas de SLA em 1, sem perder métricas/gráficos/colunas → Tasks 1–2 (métricas, gráficos e colunas dos 2 modos preservados integralmente, testados linha a linha no Step 1 da Task 2).
- Escolha e justificativa de tabs vs lado a lado → seção "Contexto e decisões de design" + Task 2 (segue o padrão `<nav>+<button>` do `dashboard-reversa.vue`, testado em `not.toContain('UTabs')`).
- Filtro de dimensão único trocando `entityColumn`/`dimension` → Task 1 (`slaConsolidatedDimensions`) + Task 2 (`dimension` ref + `dimensionConfig` computed).
- Deletar as 8 páginas antigas → Task 3.
- Decidir e documentar o destino de `SlaReportView.vue` → decisão documentada (deletar, não absorver como componente) + Task 4.
- Não tocar `navigation.ts`/`AppSidebar.vue` → nenhuma task os modifica; documentado explicitamente na seção de contexto.
- Grep de testes cobrindo SLA e replanejamento → `tests/p2-screens.spec.ts` e `tests/routes.spec.ts` analisados; `routes.spec.ts` ajustado nas Tasks 2–4, `p2-screens.spec.ts` deliberadamente não tocado (motivo documentado).
- Renomear "DEV IN"/"DEV OUT"/"Devoluções" em dev-in/dev-out (listagem + detalhe) → Tasks 5–9, com grep prévio documentado citando arquivos e linhas exatas.
- `acompanhamento.vue` não editado → confirmado por teste na Task 9 e por decisão documentada na seção de contexto.
- Grep de testes de Devoluções que assertam texto literal e ajuste → `tests/devolucoes.spec.ts` (Task 5) e novo `tests/devolucoes-rename.spec.ts` (Tasks 6–9); `tests/navigation.spec.ts` identificado e deliberadamente não tocado (depende de `navigation.ts`, fora do escopo).
- Task final rodando o checklist do CLAUDE.md → Task 10.
- Cópia `via-teste` não recebe tasks → nenhuma task referencia esse diretório.

**2. Placeholder scan:** todas as steps têm código completo (sem "TBD"/"implementar depois"); todos os comandos de teste são exatos e executáveis; nenhuma referência a "similar à Task N" sem repetir o código.

**3. Consistência de tipos:** `SlaDimension`, `SlaReportVariant`, `SlaEntityRow`, `SlaDateRow` (Task 1, reaproveitados de `sla-analytics.ts` sem alteração) são usados com os mesmos nomes em `app/pages/dashboards/sla.vue` (Task 2). `SlaConsolidatedTabId` definido na Task 1 (`'ranking' | 'by-date'`) é usado idêntico no `activeTab` ref e no `v-if="activeTab === 'ranking'"` da Task 2. `slaConsolidatedDimensions`/`slaConsolidatedTabs` (Task 1) são importados com o mesmo nome em todos os pontos (Task 2, testes das Tasks 1–2). Os labels renomeados em Devoluções (`'Status Despachos'`, `'Caixas'`, `'Despachos'`, `'Caixa #...'`, `'Despacho #...'`) são idênticos entre implementação (Tasks 5–9) e as asserções de teste correspondentes.
