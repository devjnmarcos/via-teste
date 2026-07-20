<script setup lang="ts">
/**
 * Dashboards → Loja.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { DashboardStoreOrderRow } from '~/data/demo/dashboards'
import {
  buildLojaStatusDistribution,
  dashboardsAccountOptions,
  lojaQueueRows,
  lojaVolumeTrend
} from '~/data/demo/dashboards'
import { buildLojaMetrics } from '~/utils/dashboards-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Loja · Dashboards · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<DashboardStoreOrderRow>[] = [
  { type: 'text', key: 'ticket', label: 'Ticket', width: '80px' },
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '18%' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '18%' },
  { type: 'text', key: 'scheduledLabel', label: 'Agendado', width: '100px' },
  { type: 'text', key: 'waitingMinutes', label: 'Espera (min)', width: '110px', align: 'right' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '140px',
    items: (row) => [
      {
        key: 'open',
        label: 'Abrir',
        icon: 'i-lucide-eye',
        variant: 'ghost' as const,
        ariaLabel: `Abrir pedido ${row.orderId}`
      }
    ]
  }
]

const listMetrics = computed(() => buildLojaMetrics(lojaQueueRows))
const distribution = computed(() => buildLojaStatusDistribution(lojaQueueRows))
const pagedRows = computed(() => slicePage(lojaQueueRows, page.value, pageSize.value))

watch(accountId, () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', 'Fila da loja recarregada (mock).')
}

function onAction(payload: { row: DashboardStoreOrderRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/pedidos/${payload.row.orderId}`)
  }
}
</script>

<template>
  <div class="dashboards-loja-page">
    <PageHeader
      title="Loja"
      subtitle="Fila operacional da conta · check-in em onda futura"
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
    </section>

    <section
      class="grid grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Volume por hora"
          note="check-ins (fixture)"
        >
          <VolumeTrendChart
            :series="lojaVolumeTrend"
            title="Volume · hoje"
            note="atendimentos"
            :height="160"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Distribuição da fila"
          note="status atual"
        >
          <StatusDistribution
            :items="distribution"
            title="Status na loja"
            :height="200"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="920px"
      empty-title="Fila vazia"
      empty-description="Não há pedidos na fila da loja no momento."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="lojaQueueRows.length"
    />
  </div>
</template>
