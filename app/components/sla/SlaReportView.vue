<script setup lang="ts">
/**
 * View compartilhada das telas de SLA Analytics (cliente, estado, ponto de apoio, transportador).
 */
import type { DataTableColumn } from '../../types/data-table'
import type {
  SlaDateRow,
  SlaEntityRow,
  SlaReportVariant
} from '../../data/demo/sla-analytics'
import {
  buildSlaStackedSeries,
  dateRowsForDimension,
  entitiesForDimension,
  slaAccountOptions,
  slaOperationOptions,
  slaPercentTrend,
  slaPeriodOptions,
  slaVariantMeta
} from '../../data/demo/sla-analytics'
import {
  buildSlaDateMetrics,
  buildSlaEntityMetrics
} from '../../utils/sla-analytics-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '../../utils/pagination'
import { useToast } from '../../composables/useToast'

const props = defineProps<{
  variant: SlaReportVariant
}>()

const toast = useToast()
const meta = computed(() => slaVariantMeta[props.variant])

useSeoMeta({
  title: () => `${meta.value.title} · SLA · Via Reversa`
})

const accountId = ref('all')
const operationId = ref('all')
const period = ref('7d')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const entityRows = computed(() => entitiesForDimension(meta.value.dimension))
const dateRows = computed(() => dateRowsForDimension(meta.value.dimension))

const listMetrics = computed(() =>
  meta.value.mode === 'by-date'
    ? buildSlaDateMetrics(dateRows.value)
    : buildSlaEntityMetrics(entityRows.value)
)

const stackedSeries = computed(() => buildSlaStackedSeries(entityRows.value))
const donutAttended = computed(() =>
  entityRows.value.reduce((acc, row) => acc + row.attended, 0)
)
const donutExpired = computed(() =>
  entityRows.value.reduce((acc, row) => acc + row.expired, 0)
)

const entityColumns = computed<DataTableColumn<SlaEntityRow>[]>(() => [
  {
    type: 'text',
    key: 'entityLabel',
    label: meta.value.entityColumn,
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
  {
    type: 'text',
    key: 'entityLabel',
    label: meta.value.entityColumn,
    width: '24%'
  },
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

const pagedEntityRows = computed(() =>
  slicePage(entityRows.value, page.value, pageSize.value)
)
const pagedDateRows = computed(() =>
  slicePage(dateRows.value, page.value, pageSize.value)
)

const filterSummary = computed(() => {
  const account =
    slaAccountOptions.find((item) => item.value === accountId.value)?.label ?? 'Todas'
  const periodLabel =
    slaPeriodOptions.find((item) => item.value === period.value)?.label ?? period.value
  return `${account} · ${periodLabel}`
})

watch([accountId, operationId, period, () => props.variant], () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', `${meta.value.title} recarregado (mock).`)
}

function onEntityAction(payload: { row: SlaEntityRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({
      path: '/pedidos',
      query: { slaEntity: payload.row.entityLabel }
    })
  }
}

function onDateAction(payload: { row: SlaDateRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({
      path: '/pedidos',
      query: {
        slaEntity: payload.row.entityLabel,
        slaDate: payload.row.dateLabel
      }
    })
  }
}
</script>

<template>
  <div class="sla-report-page">
    <PageHeader
      :title="meta.title"
      :subtitle="`Relatório SLA · ${filterSummary}`"
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

    <section
      v-if="meta.mode === 'by-date'"
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

    <section
      v-else
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
      v-if="meta.mode === 'by-date'"
      :columns="dateColumns"
      :rows="pagedDateRows"
      min-width="980px"
      empty-title="Sem buckets no período"
      empty-description="Ajuste os filtros para ver o SLA por data."
      @action="onDateAction"
    />
    <DataTable
      v-else
      :columns="entityColumns"
      :rows="pagedEntityRows"
      min-width="1100px"
      empty-title="Sem entidades"
      empty-description="Ajuste os filtros para ver o ranking de SLA."
      @action="onEntityAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="meta.mode === 'by-date' ? dateRows.length : entityRows.length"
    />
  </div>
</template>
