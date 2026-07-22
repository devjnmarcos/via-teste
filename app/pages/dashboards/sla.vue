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
