<script setup lang="ts">
/**
 * Resumos → Totais por Operação — MetricsStrip 3/3 + charts + DataTable.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ResumoOperacaoRow } from '~/data/demo/resumos'
import {
  buildOperacaoDistribution,
  resumosAccountOptions,
  resumosOperacaoRows,
  resumosOperationOptions,
  resumosPeriodOptions,
  resumosVolumeTrend
} from '~/data/demo/resumos'
import { buildTotaisOperacaoMetrics } from '~/utils/resumos-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Totais por Operação · Resumos · Via Reversa' })

const toast = useToast()

const accountId = ref('all')
const operationId = ref('all')
const period = ref('7d')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<ResumoOperacaoRow>[] = [
  { type: 'text', key: 'operationName', label: 'Operação', width: '18%' },
  { type: 'text', key: 'novos', label: 'Novos', width: '72px', align: 'right' },
  { type: 'text', key: 'semPa', label: 'Sem apoio', width: '88px', align: 'right' },
  { type: 'text', key: 'atribuidos', label: 'Atribuídos', width: '88px', align: 'right' },
  { type: 'text', key: 'emEstoque', label: 'Estoque', width: '72px', align: 'right' },
  { type: 'text', key: 'emRota', label: 'Em rota', width: '72px', align: 'right' },
  { type: 'text', key: 'concluidosHoje', label: 'Concluídos', width: '88px', align: 'right' },
  { type: 'text', key: 'ocorrenciasHoje', label: 'Ocorrências', width: '92px', align: 'right' },
  { type: 'text', key: 'produtividade', label: 'Produtividade', width: '100px', align: 'right' },
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
        ariaLabel: `Ver pedidos de ${row.operationName}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  return resumosOperacaoRows.filter((row) => {
    if (operationId.value === 'all') return true
    const slug = operationId.value
    if (slug === 'logistica-reversa') return row.id === 'op-1'
    if (slug === 'coleta-agendada') return row.id === 'op-2'
    if (slug === 'troca-loja') return row.id === 'op-3'
    return true
  })
})

const listMetrics = computed(() => buildTotaisOperacaoMetrics(filteredRows.value))
const distribution = computed(() => buildOperacaoDistribution(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const filterSummary = computed(() => {
  const account =
    resumosAccountOptions.find((item) => item.value === accountId.value)?.label ?? 'Todas'
  const periodLabel =
    resumosPeriodOptions.find((item) => item.value === period.value)?.label ?? period.value
  return `${account} · ${periodLabel}`
})

watch([accountId, operationId, period], () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', 'Totais por operação recarregados (mock).')
}

function onAction(payload: { row: ResumoOperacaoRow; action: string }) {
  if (payload.action === 'orders') {
    navigateTo({
      path: '/pedidos',
      query: { operation: payload.row.operationName }
    })
  }
}
</script>

<template>
  <div class="resumos-totais-page">
    <PageHeader
      title="Totais por Operação"
      :subtitle="`Resumo analítico · ${filterSummary}`"
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
        v-model="operationId"
        value-key="value"
        :items="resumosOperationOptions"
        class="w-[220px]"
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
          title="Concluídos no período"
          note="volume diário (fixture)"
        >
          <VolumeTrendChart
            :series="resumosVolumeTrend"
            title="Concluídos · 7 dias"
            note="pedidos finalizados"
            :height="160"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Distribuição atual"
          note="posição consolidada"
        >
          <StatusDistribution
            :items="distribution"
            title="Status por operação"
            :height="220"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1180px"
      empty-title="Nenhuma operação"
      empty-description="Ajuste os filtros para ver o breakdown por operação."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
