<script setup lang="ts">
/**
 * Operação → Rotas → detalhe (+ mapa visual mock das paradas).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { RouteOrderRow } from '~/data/demo/roteirizacao'
import { getRouteById, getRouteOrders } from '~/data/demo/roteirizacao'
import { buildRouteDetailMetrics } from '~/utils/operacao-p2-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()
const id = computed(() => String(route.params.id ?? ''))

const routeRow = computed(() => getRouteById(id.value))

if (!routeRow.value) {
  throw createError({ statusCode: 404, statusMessage: 'Rota não encontrada' })
}

useSeoMeta({
  title: () => `${routeRow.value?.code ?? 'Rota'} · Rotas · Via Reversa`
})

const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const orders = computed(() => getRouteOrders(id.value))
const metrics = computed(() =>
  buildRouteDetailMetrics(
    routeRow.value!.ordersCount,
    routeRow.value!.weightKg,
    routeRow.value!.status
  )
)

const mapStops = computed(() =>
  orders.value.map((order, index) => ({
    ...order,
    mapX: order.mapX ?? 20 + index * 18,
    mapY: order.mapY ?? 30 + (index % 3) * 18,
    seq: index + 1
  }))
)

const pathPoints = computed(() =>
  mapStops.value.map((stop) => `${stop.mapX},${stop.mapY}`).join(' ')
)

const columns: DataTableColumn<RouteOrderRow>[] = [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '110px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '22%' },
  { type: 'text', key: 'city', label: 'Cidade', width: '16%' },
  { type: 'text', key: 'weightKg', label: 'Peso (kg)', width: '100px', align: 'right' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '140px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '120px',
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

const pagedRows = computed(() => slicePage(orders.value, page.value, pageSize.value))

function refresh() {
  toast.success('Atualizado', `Rota ${routeRow.value?.code} recarregada (mock).`)
}

function onAction(payload: { row: RouteOrderRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/pedidos/${payload.row.orderId}`)
  }
}
</script>

<template>
  <div
    v-if="routeRow"
    class="rota-detail-page"
  >
    <PageHeader
      :title="routeRow.code"
      :subtitle="`${routeRow.name} · ${routeRow.supportPoint}`"
    >
      <AppButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        @click="navigateTo('/operacao/rotas')"
      >
        Voltar
      </AppButton>
      <AppButton
        icon="i-lucide-refresh-cw"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="metrics"
      :max-per-row="3"
    />

    <section
      class="border-b border-via-line px-[18px] py-4"
      aria-label="Mapa visual da rota"
    >
      <h2 class="m-0 mb-3 text-sm font-bold text-via-ink">
        Mapa da rota
      </h2>
      <div
        v-if="mapStops.length === 0"
        class="border border-via-line px-4 py-8 text-sm text-via-muted"
      >
        Sem paradas para plotar. Associe pedidos pela roteirização.
      </div>
      <div
        v-else
        class="relative mx-auto aspect-[16/7] max-h-[280px] w-full overflow-hidden border border-via-line bg-[linear-gradient(160deg,oklch(96%_0.02_253),oklch(93%_0.03_200))]"
        data-testid="rota-mapa-visual"
      >
        <svg
          class="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            v-if="mapStops.length > 1"
            :points="pathPoints"
            fill="none"
            stroke="oklch(45% 0.12 253)"
            stroke-width="0.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="2 1.2"
          />
        </svg>
        <div
          v-for="stop in mapStops"
          :key="stop.id"
          class="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          :style="{ left: `${stop.mapX}%`, top: `${stop.mapY}%` }"
        >
          <span
            class="flex size-7 items-center justify-center rounded-full bg-[oklch(45%_0.12_253)] text-[11px] font-bold text-white"
            :aria-label="`Parada ${stop.seq}: ${stop.client}`"
          >
            {{ stop.seq }}
          </span>
          <span class="mt-1 max-w-[90px] truncate text-[10px] text-via-ink">
            {{ stop.city }}
          </span>
        </div>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="860px"
      empty-title="Rota sem pedidos"
      empty-description="Associe pedidos pela tela de roteirização."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="orders.length"
    />
  </div>
</template>
