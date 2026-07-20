<script setup lang="ts">
/**
 * Resumos → Pedidos por Estado — breakdown por UF + chart de distribuição.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ResumoEstadoRow } from '~/data/demo/resumos'
import {
  buildEstadoDistribution,
  resumosAccountOptions,
  resumosEstadoRows,
  resumosPeriodOptions,
  resumosVolumeTrend
} from '~/data/demo/resumos'
import { buildPedidosEstadoMetrics } from '~/utils/resumos-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Pedidos por Estado · Resumos · Via Reversa' })

const toast = useToast()

const accountId = ref('all')
const period = ref('7d')
const searchUf = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<ResumoEstadoRow>[] = [
  {
    type: 'text',
    key: 'uf',
    label: 'UF',
    width: '72px',
    secondaryKey: 'stateName'
  },
  { type: 'text', key: 'total', label: 'Total', width: '88px', align: 'right' },
  { type: 'text', key: 'emRota', label: 'Em rota', width: '88px', align: 'right' },
  { type: 'text', key: 'concluidos', label: 'Concluídos', width: '100px', align: 'right' },
  { type: 'text', key: 'ocorrencias', label: 'Ocorrências', width: '100px', align: 'right' },
  { type: 'text', key: 'pontosApoio', label: 'Pontos apoio', width: '100px', align: 'right' },
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
        ariaLabel: `Ver pedidos de ${row.uf}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  const ufQuery = searchUf.value.trim().toUpperCase()
  return resumosEstadoRows.filter((row) => {
    if (!ufQuery) return true
    return row.uf.includes(ufQuery) || row.stateName.toUpperCase().includes(ufQuery)
  })
})

const listMetrics = computed(() => buildPedidosEstadoMetrics(filteredRows.value))
const distribution = computed(() => buildEstadoDistribution(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const filterSummary = computed(() => {
  const account =
    resumosAccountOptions.find((item) => item.value === accountId.value)?.label ?? 'Todas'
  const periodLabel =
    resumosPeriodOptions.find((item) => item.value === period.value)?.label ?? period.value
  return `${account} · ${periodLabel}`
})

watch([accountId, period, searchUf], () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', 'Pedidos por estado recarregados (mock).')
}

function onAction(payload: { row: ResumoEstadoRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({
      path: '/pedidos',
      query: { state: payload.row.uf }
    })
  }
}
</script>

<template>
  <div class="resumos-estado-page">
    <PageHeader
      title="Pedidos por Estado"
      :subtitle="`Distribuição geográfica · ${filterSummary}`"
    >
      <AppButton
        icon="i-lucide-map-pin-house"
        variant="ghost"
        @click="navigateTo('/resumos/pontos-de-apoio')"
      >
        Pontos de apoio
      </AppButton>
      <AppButton
        icon="i-lucide-truck"
        variant="ghost"
        @click="navigateTo('/resumos/transportadores')"
      >
        Transportadores
      </AppButton>
      <AppButton
        icon="i-lucide-map"
        variant="ghost"
        @click="navigateTo('/resumos/mapa')"
      >
        Mapa
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
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <UInput
        v-model="searchUf"
        icon="i-lucide-search"
        placeholder="Buscar UF ou estado..."
        class="w-[220px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
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
      class="grid grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Volume no período"
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
          title="Por UF"
          note="top estados no filtro"
        >
          <StatusDistribution
            :items="distribution"
            title="Volume por UF"
            :height="220"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="920px"
      empty-title="Nenhum estado"
      empty-description="Ajuste a busca ou os filtros para ver o breakdown por UF."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
