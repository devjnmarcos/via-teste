<script setup lang="ts">
/**
 * Dashboards → Indicadores (pontos de apoio).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { DashboardPaRow } from '~/data/demo/dashboards'
import {
  dashboardsAccountOptions,
  dashboardsPaOptions,
  dashboardsPeriodOptions,
  indicadoresPaRows,
  indicadoresProductivityTrend,
  indicadoresStackedSeries
} from '~/data/demo/dashboards'
import { buildIndicadoresMetrics } from '~/utils/dashboards-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Indicadores · Dashboards · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const paId = ref('all')
const period = ref('today')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<DashboardPaRow>[] = [
  { type: 'text', key: 'name', label: 'Ponto de apoio', width: '22%', secondaryKey: 'city' },
  { type: 'text', key: 'invited', label: 'Convidados', width: '96px', align: 'right' },
  { type: 'text', key: 'assigned', label: 'Atribuídos', width: '96px', align: 'right' },
  { type: 'text', key: 'stock', label: 'Estoque', width: '80px', align: 'right' },
  { type: 'text', key: 'route', label: 'Em rota', width: '80px', align: 'right' },
  { type: 'text', key: 'done', label: 'Concluídos', width: '96px', align: 'right' },
  { type: 'text', key: 'oldestHours', label: 'Mais antigo (h)', width: '110px', align: 'right' },
  { type: 'text', key: 'productivity', label: 'Produtividade', width: '110px', align: 'right' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '120px',
    items: (row) => [
      {
        key: 'orders',
        label: 'Pedidos',
        icon: 'i-lucide-package-search',
        variant: 'ghost' as const,
        ariaLabel: `Ver pedidos de ${row.name}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  if (paId.value === 'all') return indicadoresPaRows
  return indicadoresPaRows.filter((row) => row.id === paId.value)
})

const listMetrics = computed(() => buildIndicadoresMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([accountId, paId, period], () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', 'Indicadores de pontos de apoio recarregados (mock).')
}

function onAction(payload: { row: DashboardPaRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({ path: '/pedidos', query: { supportPoint: payload.row.name } })
  }
}
</script>

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

    <section
      class="grid grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Produtividade no tempo"
          note="% concluídos (fixture)"
        >
          <PercentTrendChart
            :series="indicadoresProductivityTrend"
            label="Produtividade %"
            :height="180"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Concluídos × pendências"
          note="por ponto de apoio"
        >
          <StackedBarChart
            :series="indicadoresStackedSeries"
            vol-label="Concluídos"
            invol-label="Pendências"
            :height="220"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1100px"
      empty-title="Nenhum ponto de apoio"
      empty-description="Ajuste os filtros para ver os indicadores."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
