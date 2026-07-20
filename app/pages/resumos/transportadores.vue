<script setup lang="ts">
/**
 * Resumos → Transportadores (drill) — legado visitors_transporters_summary.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ResumoTransportadorRow } from '~/data/demo/resumos'
import {
  buildTransportadorDistribution,
  resumosAccountOptions,
  resumosPeriodOptions,
  resumosTransportadorRows,
  resumosVolumeTrend
} from '~/data/demo/resumos'
import { buildPedidosTransportadorMetrics } from '~/utils/resumos-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Transportadores · Resumos · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const period = ref('7d')
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<ResumoTransportadorRow>[] = [
  {
    type: 'text',
    key: 'name',
    label: 'Transportador',
    width: '24%',
    secondaryKey: 'modality'
  },
  { type: 'text', key: 'total', label: 'Total', width: '88px', align: 'right' },
  { type: 'text', key: 'emRota', label: 'Em rota', width: '88px', align: 'right' },
  { type: 'text', key: 'concluidos', label: 'Concluídos', width: '100px', align: 'right' },
  { type: 'text', key: 'ocorrencias', label: 'Ocorrências', width: '100px', align: 'right' },
  { type: 'text', key: 'slaPct', label: 'SLA', width: '80px', align: 'right' },
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
        ariaLabel: `Ver pedidos de ${row.name}`
      },
      {
        key: 'sla',
        label: 'SLA',
        icon: 'i-lucide-timer',
        variant: 'ghost' as const,
        ariaLabel: `Abrir SLA de ${row.name}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return resumosTransportadorRows.filter((row) => {
    if (!query) return true
    return [row.name, row.modality].some((value) =>
      String(value).toLowerCase().includes(query)
    )
  })
})

const listMetrics = computed(() => buildPedidosTransportadorMetrics(filteredRows.value))
const distribution = computed(() => buildTransportadorDistribution(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([accountId, period, search], () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', 'Resumo por transportadores recarregado (mock).')
}

function onAction(payload: { row: ResumoTransportadorRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({
      path: '/pedidos',
      query: { transporter: payload.row.name }
    })
    return
  }
  if (payload.action === 'sla') {
    navigateTo('/sla/por-transportador')
  }
}
</script>

<template>
  <div class="resumos-transportadores-page">
    <PageHeader
      title="Transportadores"
      subtitle="Drill de Resumos · volume e SLA por transportador"
    >
      <AppButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        @click="navigateTo('/resumos/pedidos-por-estado')"
      >
        Estados
      </AppButton>
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
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar transportador…"
        class="w-[260px]"
      />
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
      class="grid grid-cols-2 border-b border-via-line max-[980px]:grid-cols-1"
      aria-label="Distribuição"
    >
      <ChartPanel
        title="Volume por transportador"
        note="top do filtro"
      >
        <StatusDistribution
          :items="distribution"
          title="Transportadores · pedidos"
        />
      </ChartPanel>
      <ChartPanel
        title="Tendência"
        note="7 dias"
      >
        <VolumeTrendChart
          :series="resumosVolumeTrend"
          title="Pedidos · semana"
          note="pedidos"
          :height="180"
        />
      </ChartPanel>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1000px"
      empty-title="Nenhum transportador"
      empty-description="Ajuste a busca ou o período."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
