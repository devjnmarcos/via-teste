<script setup lang="ts">
/**
 * Resumos → Pedidos por Cliente — ranking de contas × tipo de operação.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ResumoClienteRow } from '~/data/demo/resumos'
import {
  buildClienteDistribution,
  resumosAccountOptions,
  resumosClienteRows,
  resumosPeriodOptions,
  resumosVolumeTrend
} from '~/data/demo/resumos'
import { buildPedidosClienteMetrics } from '~/utils/resumos-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Pedidos por Cliente · Resumos · Via Reversa' })

const toast = useToast()

const accountId = ref('all')
const period = ref('7d')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<ResumoClienteRow>[] = [
  {
    type: 'text',
    key: 'accountName',
    label: 'Cliente / conta',
    width: '28%',
    secondaryKey: 'operationType'
  },
  { type: 'text', key: 'total', label: 'Total', width: '88px', align: 'right' },
  { type: 'text', key: 'emRota', label: 'Em rota', width: '88px', align: 'right' },
  { type: 'text', key: 'concluidos', label: 'Concluídos', width: '100px', align: 'right' },
  { type: 'text', key: 'ocorrencias', label: 'Ocorrências', width: '100px', align: 'right' },
  { type: 'text', key: 'produtividade', label: 'Produtividade', width: '110px', align: 'right' },
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
        ariaLabel: `Ver pedidos de ${row.accountName}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  if (accountId.value === 'all') return resumosClienteRows
  return resumosClienteRows.filter((row) => row.accountId === accountId.value)
})

const listMetrics = computed(() => buildPedidosClienteMetrics(filteredRows.value))
const distribution = computed(() => buildClienteDistribution(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const filterSummary = computed(() => {
  const account =
    resumosAccountOptions.find((item) => item.value === accountId.value)?.label ?? 'Todas'
  const periodLabel =
    resumosPeriodOptions.find((item) => item.value === period.value)?.label ?? period.value
  return `${account} · ${periodLabel}`
})

watch([accountId, period], () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', 'Pedidos por cliente recarregados (mock).')
}

function onAction(payload: { row: ResumoClienteRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({
      path: '/pedidos',
      query: { account_id: payload.row.accountId }
    })
  }
}
</script>

<template>
  <div class="resumos-cliente-page">
    <PageHeader
      title="Pedidos por Cliente"
      :subtitle="`Ranking por conta de origem · ${filterSummary}`"
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
        :items="resumosAccountOptions"
        class="w-[240px]"
      />
      <USelectMenu
        v-model="period"
        value-key="value"
        :items="resumosPeriodOptions"
        class="w-[180px]"
      />
    </section>

    <section
      class="grid grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Volume por cliente"
          note="tendência diária (fixture)"
        >
          <VolumeTrendChart
            :series="resumosVolumeTrend"
            title="Pedidos · 7 dias"
            note="volume consolidado"
            :height="160"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Distribuição"
          note="status agregados"
        >
          <StatusDistribution
            :items="distribution"
            title="Status por cliente"
            :height="180"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="980px"
      empty-title="Nenhum cliente"
      empty-description="Ajuste os filtros para ver o ranking por conta."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
