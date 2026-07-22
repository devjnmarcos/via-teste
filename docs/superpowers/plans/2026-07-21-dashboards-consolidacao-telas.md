# Consolidação de telas — Dashboards, Operações, Ocorrências, Rastreio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover gráficos/tabelas duplicados ou migrados de 6 telas (Lotes, Calendário, Tratativas, Dashboard Reversa, Indicadores, Ocorrências NG) mantendo apenas o conteúdo que ainda faz sentido nelas, e adicionar um filtro de Operação ao Dashboard Reversa.

**Architecture:** Cada tela é um Single File Component Nuxt (`app/pages/**/*.vue`) já implementado; este plano só remove seções de template + imports/computeds órfãos correspondentes, sem tocar em `navigation.ts`/`AppSidebar.vue` (plano irmão) nem nas rotas. O único código novo é um utilitário puro de escalonamento client-side (`app/utils/dashboard-reversa-filter.ts`) e duas funções em `app/data/demo/operations.ts` para alimentar o novo filtro de Operação do Dashboard Reversa — não há chamada de API nem mudança de fixture existente.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>` + TypeScript, Nuxt UI 4 (`USelectMenu`, `UInput`), Tailwind CSS 4, Vitest (`@nuxt/test-utils`), ESLint, `nuxt typecheck`.

**Projeto:** `D:/DEVJUANMARCOS/PROJETOS/KEENER/VIA REVERSA/V2/ViaReversaV2_Front` (não confundir com a cópia de deploy em `.../via-teste`, que não faz parte deste plano).

---

## Contexto e decisões de design

- Este é 1 de 6 planos paralelos. Um plano irmão cuida de `app/utils/navigation.ts` / `app/components/app/AppSidebar.vue` / labels do menu — **não tocar nesses 2 arquivos**. As rotas (`to`) de todas as páginas abaixo continuam as mesmas.
- **`buildIndicadoresMetrics`** (`app/utils/dashboards-metrics.ts:8`) já recebe apenas `DashboardPaRow[]` e soma `invited/assigned/stock/route/done/oldestHours` — não depende de nada que será removido da tela. A fonte de dados (`indicadoresPaRows`, filtro por `paId`) é mantida integralmente; só a `DataTable` e os 2 gráficos deixam de renderizar.
- **Filtro de Operação no Dashboard Reversa:** os fixtures das 7 abas (`app/data/demo/dashboard-reversa.ts`) são mocks estáticos sem dimensão "operação" própria. Para o filtro afetar os números de forma honesta e sem inventar datasets paralelos por aba, este plano introduz um fator de proporção (`operationVolumeRatio`, calculado a partir do campo `total` de cada operação em `app/data/demo/operations.ts` sobre `totalOrders`) aplicado a todo campo numérico dos fixtures que não seja uma taxa/percentual (`pct_*`, `efetividade`, `media_geral`). Isso é registrado como decisão explícita na Task 4 — não é um placeholder, é a estratégia definitiva de filtragem client-side para este mock.
- A lista de operações usada no novo filtro é a fonte real do código (`app/data/demo/operations.ts`, 6 entradas: Logística Reversa, Weelog, Entrega em Lote, Entrega Expressa, Logística Incremental, Store) — é a mesma lista usada na Home/`operacoes/[slug].vue`. Não existe uma 7ª operação "VTEX" nesta base; o enunciado a menciona como pista de legado, mas o código-fonte só tem essas 6.
- Convenção de teste já existente no repo (`tests/dashboard-reversa.spec.ts`): validar remoção/permanência de blocos de template via `readFileSync` + regex sobre o `.vue`, em vez de montar a página inteira. Este plano segue a mesma convenção para as 6 telas.

## File Structure

- Modify: `app/pages/operacao/lotes/index.vue` — remove seção "Volume de importações".
- Modify: `app/pages/calendario.vue` — remove `ChartPanel`/`VolumeTrendChart` da direita, grid vira 1 coluna.
- Modify: `app/pages/operacao/tratativas.vue` — remove listagem de pedidos, seleção e modal de disparo em lote.
- Modify: `app/data/demo/operations.ts` — adiciona `operationFilterOptions` e `operationVolumeRatio`.
- Create: `app/utils/dashboard-reversa-filter.ts` — `scaleDashboardReversaFixture`, escalonamento numérico genérico por ratio.
- Modify: `app/pages/operacao/dashboard-reversa.vue` — adiciona `USelectMenu` de Operação e aplica o escalonamento ao carregar cada aba.
- Modify: `app/pages/dashboards/indicadores.vue` — remove `DataTable`, os 2 gráficos e a `Pagination`; mantém só filtros + `MetricsStrip`.
- Modify: `app/pages/operacao/ocorrencias-ng.vue` — remove os 2 gráficos.
- Modify: `tests/routes.spec.ts` — remove/ajusta 2 asserções que dependiam dos componentes removidos.
- Modify: `tests/lotes-faturas.spec.ts` — nova asserção negativa para a seção removida de Lotes.
- Modify: `tests/p2-screens.spec.ts` — novas asserções para Calendário e Indicadores.
- Modify: `tests/p3-screens.spec.ts` — novas asserções para Tratativas e Ocorrências NG.
- Modify: `tests/dashboard-reversa.spec.ts` — novos testes para `operationFilterOptions`, `operationVolumeRatio`, `scaleDashboardReversaFixture` e para o novo filtro na página.

---

### Task 1: Lotes — remover "Volume de importações"

**Files:**
- Modify: `app/pages/operacao/lotes/index.vue`
- Modify: `tests/routes.spec.ts:40`
- Test: `tests/lotes-faturas.spec.ts`

- [ ] **Step 1: Escrever o teste que falha (conteúdo da tela sem o gráfico)**

Em `tests/lotes-faturas.spec.ts`, adicionar `existsSync, readFileSync` ao import do topo (`import { describe, expect, it } from 'vitest'` vira duas linhas) e um novo `describe` ao final do arquivo:

```ts
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
```

```ts
describe('conteúdo da tela de Lotes', () => {
  it('remove a seção de Volume de importações e mantém tabela e paginação', () => {
    const path = 'app/pages/operacao/lotes/index.vue'
    expect(existsSync(path)).toBe(true)
    const source = readFileSync(path, 'utf8')
    expect(source).not.toContain('Volume de importações')
    expect(source).not.toContain('VolumeTrendChart')
    expect(source).not.toContain('lotesVolumeTrend')
    expect(source).toContain('<DataTable')
    expect(source).toContain('<Pagination')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/lotes-faturas.spec.ts`
Expected: FAIL em `not.toContain('Volume de importações')` (a seção ainda existe na página).

- [ ] **Step 3: Remover a seção do template**

Em `app/pages/operacao/lotes/index.vue`, remover o bloco (entre a seção de filtros e a `DataTable`):

```html
    <section
      class="border-b border-via-line bg-via-surface px-[18px] pt-4 pb-2"
      aria-label="Tendência de importações"
    >
      <header class="mb-3 [&_h2]:m-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-via-ink [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-xs [&_p]:text-via-muted">
        <h2>Volume de importações</h2>
        <p>Lotes criados nos últimos 7 dias (fixture).</p>
      </header>
      <VolumeTrendChart
        :series="lotesVolumeTrend"
        title="Lotes criados · 7 dias"
        note="volume diário"
      />
    </section>

    <DataTable
```

fica:

```html
    <DataTable
```

- [ ] **Step 4: Remover o import órfão de `lotesVolumeTrend`**

De:

```ts
import {
  createEmptyLotForm,
  createLot,
  lotesAccountOptions,
  lotesState,
  lotesStatusOptions,
  lotesVolumeTrend
} from '~/data/demo/lotes'
```

para:

```ts
import {
  createEmptyLotForm,
  createLot,
  lotesAccountOptions,
  lotesState,
  lotesStatusOptions
} from '~/data/demo/lotes'
```

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/lotes-faturas.spec.ts`
Expected: PASS

- [ ] **Step 6: Atualizar `tests/routes.spec.ts` (remover asserção obsoleta)**

A tabela `routes` tem, hoje, duas linhas para `app/pages/operacao/lotes/index.vue`:

```ts
  ['app/pages/operacao/lotes/index.vue', 'DataTable'],
  ['app/pages/operacao/lotes/index.vue', 'VolumeTrendChart'],
```

Remover a segunda linha (`VolumeTrendChart`), mantendo apenas:

```ts
  ['app/pages/operacao/lotes/index.vue', 'DataTable'],
```

- [ ] **Step 7: Rodar a suíte completa e confirmar sucesso**

Run: `npm run test:run -- tests/routes.spec.ts tests/lotes-faturas.spec.ts`
Expected: PASS (todos os testes)

- [ ] **Step 8: Commit**

```bash
git add app/pages/operacao/lotes/index.vue tests/routes.spec.ts tests/lotes-faturas.spec.ts
git commit -m "feat(lotes): remove seção Volume de importações da listagem"
```

---

### Task 2: Calendário — remover gráfico e ocupar largura toda

**Files:**
- Modify: `app/pages/calendario.vue`
- Test: `tests/p2-screens.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Em `tests/p2-screens.spec.ts`, adicionar ao import do topo:

```ts
import { existsSync, readFileSync } from 'node:fs'
```

E, ao final do arquivo, um novo `describe`:

```ts
describe('conteúdo da tela de Calendário', () => {
  it('remove o painel de tendência e ocupa a largura toda', () => {
    const path = 'app/pages/calendario.vue'
    expect(existsSync(path)).toBe(true)
    const source = readFileSync(path, 'utf8')
    expect(source).not.toContain('ChartPanel')
    expect(source).not.toContain('VolumeTrendChart')
    expect(source).not.toContain('calendarioVolumeTrend')
    expect(source).toContain('grid-cols-1')
    expect(source).toContain('<ViaCalendar')
    expect(source).toContain('<ViaCalendarWeek')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/p2-screens.spec.ts`
Expected: FAIL em `not.toContain('ChartPanel')`.

- [ ] **Step 3: Remover a coluna de gráfico e simplificar o grid**

Em `app/pages/calendario.vue`, o bloco:

```html
    <section
      class="grid grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)] border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Agenda e tendência"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ViaCalendar
          v-if="viewMode === 'month'"
          :cells="cells"
          :counts="counts"
          :selected-day="selectedDay"
          :today-day="18"
          @select="onSelectDay"
        />
        <ViaCalendarWeek
          v-else
          :cells="weekCells"
          :counts="counts"
          :selected-day="selectedDay"
          :today-day="18"
          :events-by-day="eventsByDay"
          @select="onSelectDay"
        />
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Volume agendado"
          note="dias com pedidos"
        >
          <VolumeTrendChart
            :series="calendarioVolumeTrend"
            title="Agendamentos · mês"
            note="pedidos"
            :height="200"
          />
        </ChartPanel>
      </div>
    </section>
```

vira:

```html
    <section
      class="grid grid-cols-1 border-b border-via-line"
      aria-label="Agenda"
    >
      <div class="min-w-0">
        <ViaCalendar
          v-if="viewMode === 'month'"
          :cells="cells"
          :counts="counts"
          :selected-day="selectedDay"
          :today-day="18"
          @select="onSelectDay"
        />
        <ViaCalendarWeek
          v-else
          :cells="weekCells"
          :counts="counts"
          :selected-day="selectedDay"
          :today-day="18"
          :events-by-day="eventsByDay"
          @select="onSelectDay"
        />
      </div>
    </section>
```

- [ ] **Step 4: Remover o import órfão de `calendarioVolumeTrend`**

De:

```ts
import {
  buildMonthCells,
  buildWeekCells,
  calendarioAccountOptions,
  calendarioEvents,
  calendarioMonthIndex,
  calendarioMonthLabel,
  calendarioVolumeTrend,
  calendarioYear,
  countEventsByDay,
  eventsForDay,
  weekRangeLabel
} from '~/data/demo/calendario'
```

para:

```ts
import {
  buildMonthCells,
  buildWeekCells,
  calendarioAccountOptions,
  calendarioEvents,
  calendarioMonthIndex,
  calendarioMonthLabel,
  calendarioYear,
  countEventsByDay,
  eventsForDay,
  weekRangeLabel
} from '~/data/demo/calendario'
```

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/p2-screens.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/pages/calendario.vue tests/p2-screens.spec.ts
git commit -m "feat(calendario): remove painel de tendência e ocupa largura toda"
```

---

### Task 3: Tratativas → "Ocorrências" — remover listagem de pedidos e disparo em lote

**Files:**
- Modify: `app/pages/operacao/tratativas.vue`
- Test: `tests/p3-screens.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Em `tests/p3-screens.spec.ts`, adicionar ao import do topo:

```ts
import { existsSync, readFileSync } from 'node:fs'
```

E, ao final do arquivo, um novo `describe`:

```ts
describe('conteúdo da tela de Tratativas', () => {
  it('remove listagem de pedidos e disparo em lote, mantém métricas e gráficos', () => {
    const path = 'app/pages/operacao/tratativas.vue'
    expect(existsSync(path)).toBe(true)
    const source = readFileSync(path, 'utf8')
    expect(source).not.toContain('<DataTable')
    expect(source).not.toContain('<Pagination')
    expect(source).not.toContain('dispatchOpen')
    expect(source).not.toContain('markTratativasDispatched')
    expect(source).not.toContain('/operacao/disparo-chatbot')
    expect(source).not.toContain('>Disparar<')
    expect(source).toContain('/operacao/chatbot-monitor')
    expect(source).toContain('VolumeTrendChart')
    expect(source).toContain('StatusDistribution')
    expect(source).toContain('<MetricsStrip')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: FAIL em `not.toContain('<DataTable')`.

- [ ] **Step 3: Substituir o `<script setup>` inteiro**

Substituir todo o conteúdo do bloco `<script setup lang="ts">...</script>` de `app/pages/operacao/tratativas.vue` por:

```html
<script setup lang="ts">
/**
 * Operação → Tratativas (chatbot).
 * A listagem de pedidos elegíveis e o disparo em lote foram migrados para a
 * listagem de pedidos (plano irmão); esta tela mantém apenas indicadores e
 * gráficos de acompanhamento.
 */
import {
  buildTratativasDistribution,
  tratativaStatusOptions,
  tratativasState,
  tratativasVolumeTrend
} from '~/data/demo/tratativas'
import { buildTratativasMetrics } from '~/utils/operacao-p3-metrics'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Tratativas · Operação · Via Reversa' })

const toast = useToast()
const search = ref('')
const statusFilter = ref('all')

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return tratativasState.orders.filter((row) => {
    if (statusFilter.value !== 'all' && row.status !== statusFilter.value) return false
    if (!query) return true
    return [row.orderId, row.client, row.accountName, row.channel]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() =>
  buildTratativasMetrics(
    filteredRows.value,
    tratativasState.contactsToday,
    tratativasState.workedToday,
    // Seleção e disparo em lote saíram desta tela (migrados para /pedidos);
    // não há mais seleção local, então o indicador de "Selecionados" fica zerado.
    0
  )
)

const distribution = computed(() => buildTratativasDistribution(filteredRows.value))

function refresh() {
  toast.success('Atualizado', 'Tratativas recarregadas (mock).')
}
</script>
```

- [ ] **Step 4: Substituir o `<template>` inteiro**

Substituir todo o conteúdo do bloco `<template>...</template>` por:

```html
<template>
  <div class="tratativas-page">
    <PageHeader
      title="Tratativas"
      subtitle="Pedidos elegíveis ao chatbot e acompanhamento de contatos"
    >
      <AppButton
        icon="i-lucide-activity"
        variant="ghost"
        to="/operacao/chatbot-monitor"
      >
        Monitor
      </AppButton>
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="listMetrics"
      :max-per-row="3"
    />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar pedido ou cliente…"
        class="w-[280px]"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="tratativaStatusOptions"
        class="w-[200px]"
      />
    </section>

    <section
      class="grid grid-cols-2 border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Contatos por dia"
          note="volume (fixture)"
        >
          <VolumeTrendChart
            :series="tratativasVolumeTrend"
            title="Contatos · 7 dias"
            note="chatbot"
            :height="160"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Distribuição de tratativas"
          note="status atual"
        >
          <StatusDistribution
            :items="distribution"
            title="Status das tratativas"
            :height="200"
          />
        </ChartPanel>
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: PASS

- [ ] **Step 6: Rodar `nuxt typecheck` (imports/tipos órfãos)**

Run: `npm run typecheck`
Expected: sem erros relacionados a `app/pages/operacao/tratativas.vue` (tipos `DataTableColumn`/`TratativaOrderRow` não são mais importados nem usados).

- [ ] **Step 7: Commit**

```bash
git add app/pages/operacao/tratativas.vue tests/p3-screens.spec.ts
git commit -m "feat(tratativas): remove listagem de pedidos e disparo em lote da tela"
```

---

### Task 4: Utilitário de escalonamento por Operação (para o Dashboard Reversa)

**Files:**
- Modify: `app/data/demo/operations.ts`
- Create: `app/utils/dashboard-reversa-filter.ts`
- Test: `tests/dashboard-reversa.spec.ts`

- [ ] **Step 1: Escrever o teste que falha (opções de filtro e ratio)**

Em `tests/dashboard-reversa.spec.ts`, adicionar ao import do topo:

```ts
import { operationFilterOptions, operationVolumeRatio, operations, totalOrders } from '../app/data/demo/operations'
import { scaleDashboardReversaFixture } from '../app/utils/dashboard-reversa-filter'
```

E um novo `describe` ao final do arquivo:

```ts
describe('Filtro de Operação (Dashboard Reversa)', () => {
  it('expõe "Todas as operações" + as 6 operações do domínio', () => {
    expect(operationFilterOptions[0]).toEqual({ label: 'Todas as operações', value: 'all' })
    expect(operationFilterOptions).toHaveLength(operations.length + 1)
    expect(operationFilterOptions.slice(1).map((item) => item.value)).toEqual(
      operations.map((operation) => operation.slug)
    )
  })

  it('calcula o ratio de cada operação sobre o total e cai para 1 em "all"/slug desconhecido', () => {
    expect(operationVolumeRatio('all')).toBe(1)
    expect(operationVolumeRatio('slug-inexistente')).toBe(1)
    const store = operations.find((operation) => operation.slug === 'store')!
    expect(operationVolumeRatio('store')).toBeCloseTo(store.total / totalOrders, 6)
  })

  it('escalona campos numéricos preservando percentuais e strings', () => {
    const scaledKpis = scaleDashboardReversaFixture({ trabalhado: 820, concluidos: 610 }, 0.5)
    expect(scaledKpis).toEqual({ trabalhado: 410, concluidos: 305 })

    const scaledRow = scaleDashboardReversaFixture(
      { id: '1', uf: 'SP', total_atribuidos: 186, pct_coletados: 79.6 },
      0.5
    )
    expect(scaledRow).toEqual({ id: '1', uf: 'SP', total_atribuidos: 93, pct_coletados: 79.6 })
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/dashboard-reversa.spec.ts`
Expected: FAIL com erro de import (`operationFilterOptions`/`operationVolumeRatio`/`scaleDashboardReversaFixture` não existem ainda).

- [ ] **Step 3: Adicionar `operationFilterOptions` e `operationVolumeRatio` em `app/data/demo/operations.ts`**

Logo depois de `export const totalOrders = operations.reduce((sum, operation) => sum + operation.total, 0)` (linha 87), adicionar:

```ts
export interface OperationFilterOption {
  label: string
  value: string
}

export const operationFilterOptions: OperationFilterOption[] = [
  { label: 'Todas as operações', value: 'all' },
  ...operations.map((operation) => ({ label: operation.name, value: operation.slug }))
]

export function operationVolumeRatio(operationSlug: string): number {
  if (operationSlug === 'all') return 1
  const operation = operations.find((item) => item.slug === operationSlug)
  if (!operation || totalOrders === 0) return 1
  return operation.total / totalOrders
}
```

- [ ] **Step 4: Criar `app/utils/dashboard-reversa-filter.ts`**

```ts
/**
 * Escalonamento client-side dos fixtures do Dashboard Reversa por operação.
 *
 * Os fixtures das 7 abas (Visão Geral, Mailing, Trabalhado, Backlog, Motoboys,
 * Agendamentos, Resumo) não têm uma dimensão "operação" própria — são mocks
 * estáticos. Para o filtro de Operação afetar os números exibidos sem
 * inventar datasets paralelos por aba, aplicamos um fator de proporção
 * (operationVolumeRatio, calculado a partir do total de pedidos de cada
 * operação em app/data/demo/operations.ts) a todo campo numérico que não
 * seja uma taxa/percentual (chaves iniciadas por "pct_" ou iguais a
 * "efetividade" / "media_geral"). É uma simulação simples e honesta de
 * "essa operação representa X% do volume total" sobre os mesmos mocks —
 * não é uma segmentação real por operação.
 */

const PERCENT_LIKE_KEY = /^pct_|^efetividade$|^media_geral$/i

function scaleNode(value: unknown, ratio: number, key?: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => scaleNode(item, ratio))
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      result[childKey] = scaleNode(childValue, ratio, childKey)
    }
    return result
  }
  if (typeof value === 'number' && key && !PERCENT_LIKE_KEY.test(key)) {
    return Math.max(0, Math.round(value * ratio))
  }
  return value
}

export function scaleDashboardReversaFixture<T>(fixture: T, ratio: number): T {
  return scaleNode(fixture, ratio) as T
}
```

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/dashboard-reversa.spec.ts`
Expected: PASS

- [ ] **Step 6: Rodar `nuxt typecheck`**

Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 7: Commit**

```bash
git add app/data/demo/operations.ts app/utils/dashboard-reversa-filter.ts tests/dashboard-reversa.spec.ts
git commit -m "feat(dashboard-reversa): utilitário de escalonamento por operação"
```

---

### Task 5: Dashboard Reversa → "Operações" — adicionar filtro de Operação

**Files:**
- Modify: `app/pages/operacao/dashboard-reversa.vue`
- Test: `tests/dashboard-reversa.spec.ts`

- [ ] **Step 1: Escrever o teste que falha (marcação do filtro na página)**

Em `tests/dashboard-reversa.spec.ts`, dentro do `describe('Filtro de Operação (Dashboard Reversa)', ...)` criado na Task 4, adicionar mais um `it`:

```ts
  it('adiciona o USelectMenu de Operação na barra de filtros e usa o ratio ao carregar as abas', () => {
    const source = readFileSync('app/pages/operacao/dashboard-reversa.vue', 'utf8')
    expect(source).toMatch(/v-model="operationId"/)
    expect(source).toMatch(/aria-label="Operação"/)
    expect(source).toMatch(/operationFilterOptions/)
    expect(source).toMatch(/scaleDashboardReversaFixture/)
    expect(source).toMatch(/operationVolumeRatio\(operationId\.value\)/)
  })
```

(o `readFileSync` já está importado neste arquivo desde os testes existentes.)

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/dashboard-reversa.spec.ts`
Expected: FAIL em `toMatch(/v-model="operationId"/)`.

- [ ] **Step 3: Importar os novos utilitários**

Em `app/pages/operacao/dashboard-reversa.vue`, no bloco de imports (depois do `import { accountFilterOptions, ... } from '~/data/demo/dashboard-reversa'`), adicionar:

```ts
import { operationFilterOptions, operationVolumeRatio } from '~/data/demo/operations'
import { scaleDashboardReversaFixture } from '~/utils/dashboard-reversa-filter'
```

- [ ] **Step 4: Adicionar o ref `operationId` antes do `tabCache`**

De:

```ts
const accountId = ref<string>('all')
const periodKind = ref<PeriodKind>('created_at')
const periodStart = ref('2026-07-01')
const periodEnd = ref('2026-07-17')
const activeTab = ref<DashboardReversaTabId>('visao-geral')
const resumoSubTab = ref<ResumoSubTabId>('geral')
const loading = ref(false)
```

para:

```ts
const accountId = ref<string>('all')
const operationId = ref<string>('all')
const periodKind = ref<PeriodKind>('created_at')
const periodStart = ref('2026-07-01')
const periodEnd = ref('2026-07-17')
const activeTab = ref<DashboardReversaTabId>('visao-geral')
const resumoSubTab = ref<ResumoSubTabId>('geral')
const loading = ref(false)
```

- [ ] **Step 5: Aplicar o ratio na carga inicial do `tabCache` e no `filterSummary`**

De:

```ts
const tabCache = reactive<{
  'visao-geral': VisaoGeralFixture | null
  mailing: MailingFixture | null
  trabalhado: TrabalhadoFixture | null
  backlog: BacklogFixture | null
  motoboys: MotoboysFixture | null
  agendamentos: AgendamentosFixture | null
  resumo: ResumoFixture | null
}>({
  'visao-geral': structuredClone(visaoGeralFixture),
  mailing: null,
  trabalhado: null,
  backlog: null,
  motoboys: null,
  agendamentos: null,
  resumo: null
})

const filterSummary = computed(() => {
  const account =
    accountFilterOptions.find((item) => item.value === accountId.value)?.label ?? 'Todas as contas'
  return `${periodStart.value} a ${periodEnd.value} · ${account}`
})
```

para:

```ts
const tabCache = reactive<{
  'visao-geral': VisaoGeralFixture | null
  mailing: MailingFixture | null
  trabalhado: TrabalhadoFixture | null
  backlog: BacklogFixture | null
  motoboys: MotoboysFixture | null
  agendamentos: AgendamentosFixture | null
  resumo: ResumoFixture | null
}>({
  'visao-geral': scaleDashboardReversaFixture(visaoGeralFixture, operationVolumeRatio(operationId.value)),
  mailing: null,
  trabalhado: null,
  backlog: null,
  motoboys: null,
  agendamentos: null,
  resumo: null
})

const filterSummary = computed(() => {
  const account =
    accountFilterOptions.find((item) => item.value === accountId.value)?.label ?? 'Todas as contas'
  const operation =
    operationFilterOptions.find((item) => item.value === operationId.value)?.label ?? 'Todas as operações'
  return `${periodStart.value} a ${periodEnd.value} · ${account} · ${operation}`
})
```

- [ ] **Step 6: Escalonar cada aba em `ensureTabLoaded` e em `applyAgendFilters`**

De:

```ts
function ensureTabLoaded(tab: DashboardReversaTabId) {
  visitedTabs.value.add(tab)
  if (tab === 'visao-geral' && !tabCache['visao-geral']) {
    tabCache['visao-geral'] = structuredClone(visaoGeralFixture)
  }
  if (tab === 'mailing' && !tabCache.mailing) {
    tabCache.mailing = structuredClone(mailingFixture)
  }
  if (tab === 'trabalhado' && !tabCache.trabalhado) {
    tabCache.trabalhado = structuredClone(trabalhadoFixture)
  }
  if (tab === 'backlog' && !tabCache.backlog) {
    tabCache.backlog = structuredClone(backlogFixture)
  }
  if (tab === 'motoboys' && !tabCache.motoboys) {
    tabCache.motoboys = structuredClone(motoboysFixture)
  }
  if (tab === 'agendamentos' && !tabCache.agendamentos) {
    tabCache.agendamentos = structuredClone(agendamentosFixture)
  }
  if (tab === 'resumo' && !tabCache.resumo) {
    tabCache.resumo = structuredClone(resumoFixture)
  }
}
```

para:

```ts
function ensureTabLoaded(tab: DashboardReversaTabId) {
  visitedTabs.value.add(tab)
  const ratio = operationVolumeRatio(operationId.value)
  if (tab === 'visao-geral' && !tabCache['visao-geral']) {
    tabCache['visao-geral'] = scaleDashboardReversaFixture(visaoGeralFixture, ratio)
  }
  if (tab === 'mailing' && !tabCache.mailing) {
    tabCache.mailing = scaleDashboardReversaFixture(mailingFixture, ratio)
  }
  if (tab === 'trabalhado' && !tabCache.trabalhado) {
    tabCache.trabalhado = scaleDashboardReversaFixture(trabalhadoFixture, ratio)
  }
  if (tab === 'backlog' && !tabCache.backlog) {
    tabCache.backlog = scaleDashboardReversaFixture(backlogFixture, ratio)
  }
  if (tab === 'motoboys' && !tabCache.motoboys) {
    tabCache.motoboys = scaleDashboardReversaFixture(motoboysFixture, ratio)
  }
  if (tab === 'agendamentos' && !tabCache.agendamentos) {
    tabCache.agendamentos = scaleDashboardReversaFixture(agendamentosFixture, ratio)
  }
  if (tab === 'resumo' && !tabCache.resumo) {
    tabCache.resumo = scaleDashboardReversaFixture(resumoFixture, ratio)
  }
}
```

De:

```ts
function applyAgendFilters() {
  loading.value = true
  tabCache.agendamentos = null
  window.setTimeout(() => {
    tabCache.agendamentos = structuredClone(agendamentosFixture)
    loading.value = false
  }, 180)
}
```

para:

```ts
function applyAgendFilters() {
  loading.value = true
  tabCache.agendamentos = null
  window.setTimeout(() => {
    tabCache.agendamentos = scaleDashboardReversaFixture(agendamentosFixture, operationVolumeRatio(operationId.value))
    loading.value = false
  }, 180)
}
```

- [ ] **Step 7: Recarregar todas as abas quando a operação mudar**

Logo depois da função `applyAgendFilters` e antes do `onMounted`, adicionar:

```ts
watch(operationId, () => {
  invalidateAndReload()
})
```

- [ ] **Step 8: Adicionar o `USelectMenu` de Operação na barra de filtros**

No `<template>`, dentro da `<section aria-label="Filtros do Dashboard Reversa">`, logo depois do `USelectMenu` de conta (`v-model="accountId"`) e antes do `USelectMenu` de período por (`v-model="periodKind"`):

De:

```html
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="[...accountFilterOptions]"
        class="w-[220px] [&_button]:h-9 [&_button]:border-via-line-strong [&_button]:bg-via-surface-2 [&_button]:text-[11px]"
        aria-label="Conta"
      />
      <USelectMenu
        v-model="periodKind"
```

para:

```html
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="[...accountFilterOptions]"
        class="w-[220px] [&_button]:h-9 [&_button]:border-via-line-strong [&_button]:bg-via-surface-2 [&_button]:text-[11px]"
        aria-label="Conta"
      />
      <USelectMenu
        v-model="operationId"
        value-key="value"
        :items="[...operationFilterOptions]"
        class="w-[220px] [&_button]:h-9 [&_button]:border-via-line-strong [&_button]:bg-via-surface-2 [&_button]:text-[11px]"
        aria-label="Operação"
      />
      <USelectMenu
        v-model="periodKind"
```

- [ ] **Step 9: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/dashboard-reversa.spec.ts`
Expected: PASS

- [ ] **Step 10: Rodar `nuxt typecheck`**

Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 11: Commit**

```bash
git add app/pages/operacao/dashboard-reversa.vue tests/dashboard-reversa.spec.ts
git commit -m "feat(dashboard-reversa): adiciona filtro de Operação nas 7 abas"
```

---

### Task 6: Indicadores → "Ponto de apoios" — manter apenas métricas

**Files:**
- Modify: `app/pages/dashboards/indicadores.vue`
- Modify: `tests/routes.spec.ts:67`
- Test: `tests/p2-screens.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Em `tests/p2-screens.spec.ts` (já com `existsSync, readFileSync` importados na Task 2), adicionar mais um `describe` ao final do arquivo:

```ts
describe('conteúdo da tela de Indicadores', () => {
  it('remove tabela e gráficos, mantém apenas filtros e métricas', () => {
    const path = 'app/pages/dashboards/indicadores.vue'
    expect(existsSync(path)).toBe(true)
    const source = readFileSync(path, 'utf8')
    expect(source).not.toContain('<DataTable')
    expect(source).not.toContain('<Pagination')
    expect(source).not.toContain('StackedBarChart')
    expect(source).not.toContain('PercentTrendChart')
    expect(source).not.toContain('ChartPanel')
    expect(source).toContain('<MetricsStrip')
    expect(source).toContain('buildIndicadoresMetrics')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/p2-screens.spec.ts`
Expected: FAIL em `not.toContain('<DataTable')`.

- [ ] **Step 3: Substituir o `<script setup>` inteiro**

Substituir todo o conteúdo do bloco `<script setup lang="ts">...</script>` de `app/pages/dashboards/indicadores.vue` por:

```html
<script setup lang="ts">
/**
 * Dashboards → Indicadores (pontos de apoio).
 * A listagem de pontos de apoio e os gráficos de produtividade/concluídos
 * saíram desta tela — mantém-se apenas o painel de métricas agregadas.
 */
import {
  dashboardsAccountOptions,
  dashboardsPaOptions,
  dashboardsPeriodOptions,
  indicadoresPaRows
} from '~/data/demo/dashboards'
import { buildIndicadoresMetrics } from '~/utils/dashboards-metrics'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Indicadores · Dashboards · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const paId = ref('all')
const period = ref('today')

const filteredRows = computed(() => {
  if (paId.value === 'all') return indicadoresPaRows
  return indicadoresPaRows.filter((row) => row.id === paId.value)
})

const listMetrics = computed(() => buildIndicadoresMetrics(filteredRows.value))

function refresh() {
  toast.success('Atualizado', 'Indicadores de pontos de apoio recarregados (mock).')
}
</script>
```

- [ ] **Step 4: Substituir o `<template>` inteiro**

Substituir todo o conteúdo do bloco `<template>...</template>` por:

```html
<template>
  <div class="dashboards-indicadores-page">
    <PageHeader
      title="Indicadores"
      subtitle="Painel operacional por ponto de apoio"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="listMetrics"
      :max-per-row="3"
    />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="dashboardsAccountOptions"
        class="w-[240px]"
      />
      <USelectMenu
        v-model="paId"
        value-key="value"
        :items="dashboardsPaOptions"
        class="w-[240px]"
      />
      <USelectMenu
        v-model="period"
        value-key="value"
        :items="dashboardsPeriodOptions"
        class="w-[180px]"
      />
    </section>
  </div>
</template>
```

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/p2-screens.spec.ts`
Expected: PASS

- [ ] **Step 6: Atualizar `tests/routes.spec.ts` (troca a asserção do componente removido)**

De:

```ts
  ['app/pages/dashboards/indicadores.vue', 'StackedBarChart'],
```

para:

```ts
  ['app/pages/dashboards/indicadores.vue', 'MetricsStrip'],
```

- [ ] **Step 7: Rodar a suíte e o typecheck**

Run: `npm run test:run -- tests/routes.spec.ts tests/p2-screens.spec.ts`
Expected: PASS

Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 8: Commit**

```bash
git add app/pages/dashboards/indicadores.vue tests/routes.spec.ts tests/p2-screens.spec.ts
git commit -m "feat(indicadores): mantém apenas filtros e métricas, remove tabela e gráficos"
```

---

### Task 7: Ocorrências NG — remover os 2 gráficos

**Files:**
- Modify: `app/pages/operacao/ocorrencias-ng.vue`
- Test: `tests/p3-screens.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Em `tests/p3-screens.spec.ts` (já com `existsSync, readFileSync` importados na Task 3), adicionar mais um `describe` ao final do arquivo:

```ts
describe('conteúdo da tela de Ocorrências NG', () => {
  it('remove os gráficos de divergência e alinhamento, mantém tabela e modal', () => {
    const path = 'app/pages/operacao/ocorrencias-ng.vue'
    expect(existsSync(path)).toBe(true)
    const source = readFileSync(path, 'utf8')
    expect(source).not.toContain('VolumeTrendChart')
    expect(source).not.toContain('StatusDistribution')
    expect(source).not.toContain('ChartPanel')
    expect(source).not.toContain('ocorrenciasNgTrend')
    expect(source).toContain('<DataTable')
    expect(source).toContain('<Pagination')
    expect(source).toContain('<AppModal')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: FAIL em `not.toContain('VolumeTrendChart')`.

- [ ] **Step 3: Remover o import órfão e o computed `distribution`**

De:

```ts
import {
  buildOcorrenciasNgDistribution,
  ocorrenciasNgFilterOptions,
  ocorrenciasNgState,
  ocorrenciasNgTrend,
  resendMiletoOccurrence
} from '~/data/demo/ocorrencias-ng'
```

para:

```ts
import {
  ocorrenciasNgFilterOptions,
  ocorrenciasNgState,
  resendMiletoOccurrence
} from '~/data/demo/ocorrencias-ng'
```

E remover a linha:

```ts
const distribution = computed(() => buildOcorrenciasNgDistribution(filteredRows.value))
```

- [ ] **Step 4: Remover a seção "Gráficos" do template**

De:

```html
    <section
      class="grid grid-cols-2 border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Divergências por dia"
          note="volume (fixture)"
        >
          <VolumeTrendChart
            :series="ocorrenciasNgTrend"
            title="Divergências · 7 dias"
            note="Mileto"
            :height="160"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Alinhamento"
          note="pedido × Mileto"
        >
          <StatusDistribution
            :items="distribution"
            title="Alinhamento NG"
            :height="200"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
```

para:

```html
    <DataTable
```

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: PASS

- [ ] **Step 6: Rodar `nuxt typecheck`**

Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 7: Commit**

```bash
git add app/pages/operacao/ocorrencias-ng.vue tests/p3-screens.spec.ts
git commit -m "feat(ocorrencias-ng): remove gráficos de divergência e alinhamento"
```

---

### Task 8: Checklist final do projeto

**Files:** nenhum (apenas verificação)

- [ ] **Step 1: Rodar a suíte completa**

Run: `npm run test:run`
Expected: todos os testes PASS (incluindo `tests/routes.spec.ts`, `tests/lotes-faturas.spec.ts`, `tests/p2-screens.spec.ts`, `tests/p3-screens.spec.ts`, `tests/dashboard-reversa.spec.ts`).

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Rodar o lint**

Run: `npm run lint`
Expected: sem erros (nenhum import/variável órfã deve sobrar nas 6 páginas tocadas).

- [ ] **Step 4: Rodar o build**

Run: `npm run build`
Expected: build concluído sem erros.

- [ ] **Step 5: Rodar a verificação de fundação**

Run: `node scripts/verify-foundation.mjs`
Expected: saída `"status": "ok"` (nenhum dos arquivos obrigatórios listados no script foi tocado por este plano, então não deve haver regressão).

- [ ] **Step 6: Revisão visual manual**

Abrir `npm run dev` e revisar em 1600×1000 e 1366×768, conforme `CLAUDE.md`, as 6 rotas: `/operacao/lotes`, `/calendario`, `/operacao/tratativas`, `/operacao/dashboard-reversa`, `/dashboards/indicadores`, `/operacao/ocorrencias-ng`. Confirmar visualmente que:
- Lotes: sem seção "Volume de importações", tabela e paginação normais.
- Calendário: calendário ocupa 100% da largura, tabela de eventos do dia abaixo continua.
- Tratativas: sem tabela de pedidos, sem botão "Disparo"/"Disparar", 2 gráficos e métricas normais, botão "Monitor" navega para `/operacao/chatbot-monitor`.
- Dashboard Reversa: filtro "Operação" visível na barra de filtros, ao trocar a operação os números das 7 abas mudam proporcionalmente.
- Indicadores: só filtros + métricas, sem tabela nem gráfico.
- Ocorrências NG: sem os 2 gráficos, tabela/paginação/modal de reenvio normais.

- [ ] **Step 7: Commit final (se houver ajustes da revisão visual)**

```bash
git add -A
git commit -m "chore: revisão final da consolidação de telas (lotes, calendário, tratativas, dashboard-reversa, indicadores, ocorrencias-ng)"
```

---

## Self-Review

**1. Cobertura do spec:**
- Lotes (remover "Volume de importações", manter resto) → Task 1. ✅
- Calendário (remover `ChartPanel` direito, grid 1 coluna, manter tabela do dia) → Task 2. ✅
- Tratativas (remover listagem/seleção/disparo, manter `PageHeader`+`MetricsStrip`+filtros+2 gráficos, remover botão Disparo, manter Monitor) → Task 3. ✅
- Dashboard Reversa (filtro de Operação afetando as 7 abas, registrado sem placeholder) → Tasks 4 e 5. ✅
- Indicadores (manter só filtros+métricas) → Task 6. ✅
- Ocorrências NG (remover os 2 gráficos, manter resto) → Task 7. ✅
- Verificar testes existentes que assumem elementos removidos (`tests/routes.spec.ts` linhas 40 e 67) → Tasks 1 e 6. ✅
- Confirmar que `buildIndicadoresMetrics` não depende de nada removido → documentado no Contexto; função e fonte de dados (`indicadoresPaRows`) preservadas intactas na Task 6. ✅
- Checklist final do `CLAUDE.md` → Task 8. ✅
- Não tocar `navigation.ts`/`AppSidebar.vue` → nenhuma task toca esses arquivos. ✅
- Não incluir tasks para a cópia `via-teste` → plano não a referencia. ✅

**2. Placeholder scan:** nenhum "TBD"/"implementar depois" — todo trecho de código mostrado é completo e poderia ser copiado literalmente. A estratégia de "simples client-side" do filtro de Operação (Task 4) está implementada de ponta a ponta (função pura + testes + integração), não é uma promessa vaga.

**3. Consistência de tipos/nomes:** `operationFilterOptions`, `operationVolumeRatio` (declarados na Task 4 em `app/data/demo/operations.ts`) e `scaleDashboardReversaFixture` (Task 4 em `app/utils/dashboard-reversa-filter.ts`) são importados com os mesmos nomes exatos na Task 5 (`app/pages/operacao/dashboard-reversa.vue`) e nos testes da Task 4/5 (`tests/dashboard-reversa.spec.ts`). O ref `operationId` é declarado na Task 5 Step 4 e usado de forma consistente nos Steps 5–8 e no teste da Task 5 Step 1.
