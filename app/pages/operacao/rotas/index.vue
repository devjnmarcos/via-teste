<script setup lang="ts">
/**
 * Operação → Rotas (listagem).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { RouteRow } from '~/data/demo/roteirizacao'
import {
  buildRoutesDistribution,
  deleteRouteIfEmpty,
  routesAccountOptions,
  routesState,
  routesVolumeTrend
} from '~/data/demo/roteirizacao'
import { buildRoutesListMetrics } from '~/utils/operacao-p2-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Rotas · Operação · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const deleteOpen = ref(false)
const pendingDelete = ref<RouteRow | null>(null)

const columns = computed<DataTableColumn<RouteRow>[]>(() => [
  { type: 'text', key: 'code', label: 'Código', width: '90px' },
  { type: 'text', key: 'name', label: 'Nome', width: '22%' },
  { type: 'text', key: 'status', label: 'Status', width: '120px' },
  { type: 'text', key: 'supportPoint', label: 'Ponto de apoio', width: '18%' },
  { type: 'text', key: 'ordersCount', label: 'Pedidos', width: '90px', align: 'right' },
  { type: 'text', key: 'weightKg', label: 'Peso (kg)', width: '100px', align: 'right' },
  { type: 'text', key: 'createdAtLabel', label: 'Criada em', width: '130px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '180px',
    items: (row) => [
      {
        key: 'open',
        label: 'Abrir',
        icon: 'i-lucide-eye',
        variant: 'ghost' as const,
        ariaLabel: `Abrir rota ${row.code}`
      },
      {
        key: 'delete',
        label: 'Excluir',
        icon: 'i-lucide-trash-2',
        variant: 'ghost' as const,
        disabled: row.ordersCount > 0,
        ariaLabel: `Excluir rota ${row.code}`
      }
    ]
  }
])

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return routesState.routes.filter((row) => {
    if (!query) return true
    return [row.code, row.name, row.status, row.supportPoint]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() => buildRoutesListMetrics(filteredRows.value))
const distribution = computed(() => buildRoutesDistribution(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, accountId], () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', 'Lista de rotas recarregada (mock).')
}

function onAction(payload: { row: RouteRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/operacao/rotas/${payload.row.id}`)
    return
  }
  if (payload.action === 'delete') {
    if (payload.row.ordersCount > 0) {
      toast.error('Não permitido', 'Só é possível excluir rotas sem pedidos.')
      return
    }
    pendingDelete.value = payload.row
    deleteOpen.value = true
  }
}

function confirmDelete() {
  const route = pendingDelete.value
  if (!route) return
  const ok = deleteRouteIfEmpty(route.id)
  deleteOpen.value = false
  pendingDelete.value = null
  if (!ok) {
    toast.error('Falha', 'A rota ainda possui pedidos.')
    return
  }
  toast.success('Rota excluída', `${route.code} removida (mock).`)
}
</script>

<template>
  <div class="rotas-list-page">
    <PageHeader
      title="Rotas"
      subtitle="Rotas montadas e em operação"
    >
      <AppButton
        icon="i-lucide-route"
        @click="navigateTo('/operacao/roteirizacao')"
      >
        Roteirizar
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
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar código, nome ou ponto de apoio…"
        class="w-[280px]"
      />
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="routesAccountOptions"
        class="w-[240px]"
      />
    </section>

    <section
      class="grid grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Rotas criadas"
          note="volume diário"
        >
          <VolumeTrendChart
            :series="routesVolumeTrend"
            title="Rotas · 7 dias"
            note="criações"
            :height="160"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Distribuição"
          note="status das rotas"
        >
          <StatusDistribution
            :items="distribution"
            title="Status das rotas"
            :height="200"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1080px"
      empty-title="Nenhuma rota"
      empty-description="Crie uma rota pela tela de roteirização."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir rota"
      description="A exclusão só é permitida quando a rota não possui pedidos."
      confirm-label="Excluir"
      @confirm="confirmDelete"
    >
      <p class="text-sm text-via-muted">
        Confirma a exclusão de
        <strong class="text-via-ink">{{ pendingDelete?.code }}</strong>?
      </p>
    </AppModal>
  </div>
</template>
