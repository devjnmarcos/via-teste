<script setup lang="ts">
/**
 * Dashboard Reversa — Ondas A–D: shell Operação, filtros, métricas, 7 abas com mocks ricos.
 * Charts: Chart.js 4 + vue-chartjs (wrappers em components/charts).
 */
import type { DataTableColumn } from '~/types/data-table'
import type {
  AgendamentoRegionRow,
  AgendamentosFixture,
  AgingStatusRow,
  BacklogFixture,
  BacklogUfRow,
  DashboardCityRow,
  DashboardReversaTabId,
  MailingConsolidadoRow,
  MailingFixture,
  MotoboyAgingRow,
  MotoboyOccRow,
  MotoboyPerfRow,
  MotoboysFixture,
  PeriodKind,
  ResumoContaRow,
  ResumoFixture,
  ResumoSubTabId,
  TrabalhadoFixture,
  TrabalhadoUfRow,
  VisaoGeralFixture
} from '~/types/dashboard-reversa'
import {
  accountFilterOptions,
  agingColumns,
  agendamentosFixture,
  agendRegionColumns,
  backlogFixture,
  backlogUfColumns,
  buildMailingMetrics,
  buildTrabalhadoMetrics,
  buildVisaoGeralMetrics,
  dashboardReversaTabs,
  mailingConsolidadoColumns,
  mailingFixture,
  monthFilterOptions,
  motoboyAgingColumns,
  motoboyOccColumns,
  motoboyPerfColumns,
  motoboysFixture,
  periodKindOptions,
  resumoColumns,
  resumoFixture,
  resumoSubTabs,
  topCityColumns,
  trabalhadoFixture,
  trabalhadoUfColumns,
  visaoGeralFixture
} from '~/data/demo/dashboard-reversa'
import { operationFilterOptions, operationVolumeRatio } from '~/data/demo/operations'
import { scaleDashboardReversaFixture } from '~/utils/dashboard-reversa-filter'

useSeoMeta({ title: 'Dashboard Reversa · Operação · Via Reversa' })

const accountId = ref<string>('all')
const operationId = ref<string>('all')
const periodKind = ref<PeriodKind>('created_at')
const periodStart = ref('2026-07-01')
const periodEnd = ref('2026-07-17')
const activeTab = ref<DashboardReversaTabId>('visao-geral')
const resumoSubTab = ref<ResumoSubTabId>('geral')
const loading = ref(false)

const agendUf = ref('')
const agendYear = ref('2026')
const agendMonth = ref('all')

const visitedTabs = ref<Set<DashboardReversaTabId>>(new Set(['visao-geral']))

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

const pageSubtitle = computed(() => `Painel de indicadores · ${filterSummary.value}`)

const visaoMetrics = computed(() =>
  tabCache['visao-geral'] ? buildVisaoGeralMetrics(tabCache['visao-geral'].kpis) : []
)

const mailingMetrics = computed(() =>
  tabCache.mailing ? buildMailingMetrics(tabCache.mailing.kpis) : []
)

const trabalhadoMetrics = computed(() =>
  tabCache.trabalhado ? buildTrabalhadoMetrics(tabCache.trabalhado.kpis) : []
)

const cityColumns = topCityColumns as DataTableColumn<DashboardCityRow>[]
const mailingCols = mailingConsolidadoColumns as DataTableColumn<MailingConsolidadoRow>[]
const backlogUfCols = backlogUfColumns as DataTableColumn<BacklogUfRow>[]
const motoboyOccCols = motoboyOccColumns as DataTableColumn<MotoboyOccRow>[]
const trabUfCols = trabalhadoUfColumns as DataTableColumn<TrabalhadoUfRow>[]
const agingCols = agingColumns as DataTableColumn<AgingStatusRow>[]
const motoboyAgingCols = motoboyAgingColumns as DataTableColumn<MotoboyAgingRow>[]
const motoboyPerfCols = motoboyPerfColumns as DataTableColumn<MotoboyPerfRow>[]
const agendRegionCols = agendRegionColumns as DataTableColumn<AgendamentoRegionRow>[]
const resumoCols = resumoColumns as DataTableColumn<ResumoContaRow>[]

const resumoRows = computed(() => {
  const data = tabCache.resumo
  if (!data) return []
  return data[resumoSubTab.value]
})

const filteredAgendamentos = computed(() => {
  const data = tabCache.agendamentos
  if (!data) return null
  const uf = agendUf.value.trim().toUpperCase()
  let regions = data.byRegion
  if (uf) {
    regions = regions.filter((row) => row.uf === uf)
  }
  return {
    ...data,
    byRegion: regions
  }
})

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

function selectTab(tab: DashboardReversaTabId) {
  activeTab.value = tab
  ensureTabLoaded(tab)
}

function invalidateAndReload() {
  loading.value = true
  tabCache['visao-geral'] = null
  tabCache.mailing = null
  tabCache.trabalhado = null
  tabCache.backlog = null
  tabCache.motoboys = null
  tabCache.agendamentos = null
  tabCache.resumo = null
  visitedTabs.value = new Set()
  window.setTimeout(() => {
    ensureTabLoaded(activeTab.value)
    loading.value = false
  }, 220)
}

function applyAgendFilters() {
  loading.value = true
  tabCache.agendamentos = null
  window.setTimeout(() => {
    tabCache.agendamentos = scaleDashboardReversaFixture(agendamentosFixture, operationVolumeRatio(operationId.value))
    loading.value = false
  }, 180)
}

watch(operationId, () => {
  invalidateAndReload()
})

onMounted(() => {
  ensureTabLoaded('visao-geral')
})
</script>

<template>
  <div class="dashboard-reversa [&_.empty-state]:m-[18px] [&_.metrics-strip]:gap-0">
    <PageHeader
      title="Logística Reversa"
      :subtitle="pageSubtitle"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        :disabled="loading"
        @click="invalidateAndReload"
      >
        Atualizar
      </AppButton>
    </PageHeader>

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros do Dashboard Reversa"
    >
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
        value-key="value"
        :items="periodKindOptions"
        class="w-40 [&_button]:h-9 [&_button]:border-via-line-strong [&_button]:bg-via-surface-2 [&_button]:text-[11px]"
        aria-label="Período por"
      />
      <UInput
        v-model="periodStart"
        type="date"
        class="w-[150px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
        aria-label="Data inicial"
      />
      <UInput
        v-model="periodEnd"
        type="date"
        class="w-[150px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
        aria-label="Data final"
      />
      <span class="flex-1" />
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="primary"
        :disabled="loading"
        @click="invalidateAndReload"
      >
        Atualizar
      </AppButton>
    </section>

    <nav
      class="flex min-h-[49px] flex-wrap gap-[18px] border-b border-via-line px-[18px]"
      aria-label="Abas do Dashboard Reversa"
    >
      <button
        v-for="tab in dashboardReversaTabs"
        :key="tab.id"
        type="button"
        class="inline-flex cursor-pointer items-center border-0 border-b-2 border-transparent bg-transparent text-xs text-via-muted transition-[color,border-color] duration-150"
        :class="activeTab === tab.id ? 'border-via-blue font-bold text-via-ink' : undefined"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div
      v-if="loading"
      class="px-[18px] py-7 text-[13px] text-via-muted"
      role="status"
    >
      Carregando indicadores…
    </div>

    <!-- Visão Geral -->
    <template v-else-if="activeTab === 'visao-geral' && tabCache['visao-geral']">
      <MetricsStrip :metrics="visaoMetrics" />

      <section class="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-0 border-b border-via-line max-[992px]:grid-cols-1 [&_>_:first-child]:border-r [&_>_:first-child]:border-via-line max-[992px]:[&_>_:first-child]:border-r-0 max-[992px]:[&_>_:first-child]:border-b">
        <ChartPanel
          title="Pedidos por status"
          note="VOL + INVOL empilhados"
        >
          <StackedBarChart
            :series="tabCache['visao-geral'].statusStacked"
            orientation="vertical"
            :height="260"
            aria-label="Pedidos por status VOL e INVOL"
          />
        </ChartPanel>
        <ChartPanel
          title="Voluntário × Involuntário"
          note="participação no período"
        >
          <DonutChart
            :vol="tabCache['visao-geral'].kpis.vol_total"
            :invol="tabCache['visao-geral'].kpis.invol_total"
            :height="260"
          />
        </ChartPanel>
      </section>

      <section class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] gap-0 border-b border-via-line max-[992px]:grid-cols-1 [&_>_:first-child]:border-r [&_>_:first-child]:border-via-line max-[992px]:[&_>_:first-child]:border-r-0 max-[992px]:[&_>_:first-child]:border-b">
        <ChartPanel
          title="Distribuição por UF"
          note="barras horizontais empilhadas"
        >
          <StackedBarChart
            :series="tabCache['visao-geral'].ufStacked"
            orientation="horizontal"
            :height="280"
            aria-label="Distribuição por UF"
          />
        </ChartPanel>
        <ChartPanel
          title="Top cidades"
          note="volume consolidado no período"
        >
          <DataTable
            :columns="cityColumns"
            :rows="tabCache['visao-geral'].topCities"
            min-width="520px"
            empty-title="Sem cidades"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>
    </template>

    <!-- Mailing -->
    <template v-else-if="activeTab === 'mailing' && tabCache.mailing">
      <MetricsStrip :metrics="mailingMetrics" />

      <section class="border-b border-via-line">
        <ChartPanel
          title="Volume diário recebido"
          note="barras VOL/INVOL + linha de agendados"
        >
          <ComboBarLineChart
            :series="tabCache.mailing.byDay"
            :height="280"
          />
        </ChartPanel>
      </section>

      <section class="border-b border-via-line">
        <ChartPanel
          title="Consolidado por conta / mês"
          note="distribuído por UF"
        >
          <DataTable
            :columns="mailingCols"
            :rows="tabCache.mailing.consolidado"
            min-width="1100px"
            empty-title="Sem consolidado"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>
    </template>

    <!-- Trabalhado -->
    <template v-else-if="activeTab === 'trabalhado' && tabCache.trabalhado">
      <MetricsStrip :metrics="trabalhadoMetrics" />

      <section class="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-0 border-b border-via-line max-[992px]:grid-cols-1 [&_>_:first-child]:border-r [&_>_:first-child]:border-via-line max-[992px]:[&_>_:first-child]:border-r-0 max-[992px]:[&_>_:first-child]:border-b">
        <ChartPanel
          title="Evolução da efetividade"
          note="percentual mensal"
        >
          <PercentTrendChart
            :series="tabCache.trabalhado.efetividadeEvolution.map((p) => ({ label: p.mes, value: p.efetividade }))"
            :height="220"
          />
        </ChartPanel>
        <ChartPanel
          title="Tipos de ocorrência"
          note="top ocorrências VOL + INVOL"
        >
          <StackedBarChart
            :series="tabCache.trabalhado.occurrencesBreakdown"
            orientation="horizontal"
            :height="220"
            aria-label="Tipos de ocorrência"
          />
        </ChartPanel>
      </section>

      <section class="border-b border-via-line">
        <ChartPanel
          title="Efetividade por UF"
          note="trabalhado × coletados"
        >
          <DataTable
            :columns="trabUfCols"
            :rows="tabCache.trabalhado.byUf"
            min-width="560px"
            empty-title="Sem UF"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>
    </template>

    <!-- Backlog -->
    <template v-else-if="activeTab === 'backlog' && tabCache.backlog">
      <section class="border-b border-via-line">
        <ChartPanel
          title="Envelhecimento por status"
          note="dias desde a criação"
        >
          <DataTable
            :columns="agingCols"
            :rows="tabCache.backlog.agingMatrix"
            min-width="640px"
            empty-title="Sem backlog"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>

      <section class="grid grid-cols-2 gap-0 border-b border-via-line max-[992px]:grid-cols-1 [&_>_:first-child]:border-r [&_>_:first-child]:border-via-line max-[992px]:[&_>_:first-child]:border-r-0 max-[992px]:[&_>_:first-child]:border-b">
        <ChartPanel
          title="Com agendamento por UF"
          note="backlog com janela"
        >
          <DataTable
            :columns="backlogUfCols"
            :rows="tabCache.backlog.agendadoByUf"
            min-width="360px"
            empty-title="Sem UF"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
        <ChartPanel
          title="Sem agendamento por UF"
          note="backlog sem janela"
        >
          <DataTable
            :columns="backlogUfCols"
            :rows="tabCache.backlog.naoAgendadoByUf"
            min-width="360px"
            empty-title="Sem UF"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>
    </template>

    <!-- Motoboys -->
    <template v-else-if="activeTab === 'motoboys' && tabCache.motoboys">
      <section class="border-b border-via-line">
        <ChartPanel
          title="Envelhecimento do backlog por motoboy"
          note="faixas de idade"
        >
          <DataTable
            :columns="motoboyAgingCols"
            :rows="tabCache.motoboys.backlogAging"
            min-width="640px"
            empty-title="Sem motoboys"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>

      <section class="border-b border-via-line">
        <ChartPanel
          title="Performance por motoboy / UF"
          note="coleta, ocorrência, agenda"
        >
          <DataTable
            :columns="motoboyPerfCols"
            :rows="tabCache.motoboys.performance"
            min-width="980px"
            empty-title="Sem performance"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>

      <section class="border-b border-via-line">
        <ChartPanel
          title="Ocorrências por motoboy / UF"
          note="tipos mais frequentes"
        >
          <DataTable
            :columns="motoboyOccCols"
            :rows="tabCache.motoboys.occurrences"
            min-width="560px"
            empty-title="Sem ocorrências"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>
    </template>

    <!-- Agendamentos -->
    <template v-else-if="activeTab === 'agendamentos'">
      <section
        class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line bg-[color-mix(in_srgb,var(--via-surface-2)_70%,transparent)] px-[18px] py-[9px] [&_button]:cursor-pointer"
        aria-label="Filtros de agendamentos"
      >
        <UInput
          v-model="agendUf"
          maxlength="2"
          placeholder="UF"
          class="w-[72px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
          aria-label="UF"
        />
        <UInput
          v-model="agendYear"
          type="number"
          class="w-[100px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
          aria-label="Ano"
        />
        <USelectMenu
          v-model="agendMonth"
          value-key="value"
          :items="[...monthFilterOptions]"
          class="w-40 [&_button]:h-9 [&_button]:border-via-line-strong [&_button]:bg-via-surface-2 [&_button]:text-[11px]"
          aria-label="Mês"
        />
        <span class="flex-1" />
        <AppButton
          icon="i-lucide-filter"
          :disabled="loading"
          @click="applyAgendFilters"
        >
          Filtrar
        </AppButton>
      </section>

      <template v-if="filteredAgendamentos">
        <section class="border-b border-via-line">
          <ChartPanel
            title="Evolução de cumprimento de agenda"
            note="volume e percentual (eixo dual)"
          >
            <MultiAxisLineChart
              :series="filteredAgendamentos.evolution"
              :height="280"
            />
          </ChartPanel>
        </section>

        <section class="border-b border-via-line">
          <ChartPanel
            title="Cumprimento por região"
            note="UF · cidade"
          >
            <DataTable
              :columns="agendRegionCols"
              :rows="filteredAgendamentos.byRegion"
              min-width="720px"
              empty-title="Sem regiões"
              empty-description="Sem dados para o período selecionado."
            />
          </ChartPanel>
        </section>
      </template>
    </template>

    <!-- Resumo -->
    <template v-else-if="activeTab === 'resumo' && tabCache.resumo">
      <section class="border-b border-via-line">
        <ChartPanel
          title="Resumo por conta"
          note="participação e efetividade"
        >
          <nav
            class="flex flex-wrap gap-1.5 px-4 pt-3"
            aria-label="Subabas do resumo"
          >
            <button
              v-for="sub in resumoSubTabs"
              :key="sub.id"
              type="button"
              class="inline-flex min-h-[30px] cursor-pointer items-center rounded-[5px] border border-via-line bg-via-surface-2 px-3 text-[11px] text-via-muted transition-[color,border-color,background] duration-150"
              :class="resumoSubTab === sub.id ? 'border-via-blue bg-[color-mix(in_srgb,var(--via-blue)_12%,var(--via-surface))] font-bold text-via-ink' : undefined"
              @click="resumoSubTab = sub.id"
            >
              {{ sub.label }}
            </button>
          </nav>

          <DataTable
            :columns="resumoCols"
            :rows="resumoRows"
            min-width="720px"
            empty-title="Sem contas"
            empty-description="Sem dados para o período selecionado."
          />
        </ChartPanel>
      </section>
    </template>

    <EmptyState
      v-else
      title="Sem dados para o período selecionado."
      description="Ajuste os filtros ou atualize para carregar os indicadores."
      icon="i-lucide-layout-dashboard"
    />
  </div>
</template>

