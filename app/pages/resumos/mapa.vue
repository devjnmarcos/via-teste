<script setup lang="ts">
/**
 * Resumos → Mapa (drill) — legado visitors_google_maps (mock visual, sem Google Maps).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ResumoMapPoint } from '~/data/demo/resumos'
import {
  resumosAccountOptions,
  resumosMapPoints,
  resumosPeriodOptions
} from '~/data/demo/resumos'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'
import type { Metric } from '~/types/domain'

useSeoMeta({ title: 'Mapa · Resumos · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const period = ref('7d')
const selectedId = ref(resumosMapPoints[0]?.id ?? '')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const selected = computed(
  () => resumosMapPoints.find((point) => point.id === selectedId.value) ?? resumosMapPoints[0]
)

const listMetrics = computed<Metric[]>(() => {
  const total = resumosMapPoints.reduce((acc, point) => acc + point.orders, 0)
  const ufs = new Set(resumosMapPoints.map((point) => point.uf)).size
  return [
    {
      label: 'Pontos',
      value: resumosMapPoints.length,
      note: 'clusters no mapa',
      icon: 'i-lucide-map-pinned',
      tone: 'info'
    },
    {
      label: 'Pedidos',
      value: total,
      note: 'volume plotado',
      icon: 'i-lucide-package',
      tone: 'info'
    },
    {
      label: 'UFs',
      value: ufs,
      note: 'cobertas',
      icon: 'i-lucide-map',
      tone: 'info'
    }
  ]
})

const columns: DataTableColumn<ResumoMapPoint>[] = [
  { type: 'text', key: 'label', label: 'Cluster', width: '28%', secondaryKey: 'city' },
  { type: 'text', key: 'uf', label: 'UF', width: '72px' },
  { type: 'text', key: 'orders', label: 'Pedidos', width: '100px', align: 'right' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '140px',
    items: (row) => [
      {
        key: 'focus',
        label: 'Focar',
        icon: 'i-lucide-crosshair',
        variant: 'ghost' as const,
        ariaLabel: `Focar ${row.label}`
      },
      {
        key: 'orders',
        label: 'Pedidos',
        icon: 'i-lucide-package-search',
        variant: 'ghost' as const,
        ariaLabel: `Ver pedidos de ${row.label}`
      }
    ]
  }
]

const pagedRows = computed(() => slicePage(resumosMapPoints, page.value, pageSize.value))

function refresh() {
  toast.success('Atualizado', 'Mapa de pedidos recarregado (mock).')
}

function onAction(payload: { row: ResumoMapPoint; action: string }) {
  if (payload.action === 'focus') {
    selectedId.value = payload.row.id
    return
  }
  if (payload.action === 'orders') {
    navigateTo({
      path: '/pedidos',
      query: { uf: payload.row.uf, city: payload.row.city }
    })
  }
}

function pointRadius(orders: number) {
  return Math.min(18, 6 + Math.round(orders / 12))
}
</script>

<template>
  <div class="resumos-mapa-page">
    <PageHeader
      title="Mapa de pedidos"
      subtitle="Drill de Resumos · clusters mock (sem Google Maps até API)"
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
      <span
        v-if="selected"
        class="text-sm text-via-muted"
      >
        Selecionado: <strong class="text-via-ink">{{ selected.label }}</strong>
        · {{ selected.orders }} pedidos
      </span>
    </section>

    <section
      class="border-b border-via-line px-[18px] py-4"
      aria-label="Mapa visual"
    >
      <div
        class="relative mx-auto aspect-[16/9] max-h-[420px] w-full overflow-hidden border border-via-line bg-[linear-gradient(160deg,oklch(96%_0.02_253),oklch(92%_0.03_200)_45%,oklch(94%_0.02_140))]"
        data-testid="resumos-mapa-canvas"
      >
        <svg
          class="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            v-for="n in 4"
            :key="`h-${n}`"
            :x1="0"
            :y1="n * 20"
            :x2="100"
            :y2="n * 20"
            stroke="oklch(80% 0.02 253)"
            stroke-width="0.15"
          />
          <line
            v-for="n in 4"
            :key="`v-${n}`"
            :x1="n * 20"
            :y1="0"
            :x2="n * 20"
            :y2="100"
            stroke="oklch(80% 0.02 253)"
            stroke-width="0.15"
          />
        </svg>

        <button
          v-for="point in resumosMapPoints"
          :key="point.id"
          type="button"
          class="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-0 transition-transform hover:scale-110"
          :class="
            point.id === selectedId
              ? 'bg-[oklch(45%_0.12_253)] ring-2 ring-[oklch(70%_0.08_253)]'
              : 'bg-[oklch(55%_0.1_253)]'
          "
          :style="{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: `${pointRadius(point.orders) * 2}px`,
            height: `${pointRadius(point.orders) * 2}px`
          }"
          :aria-label="`${point.label}: ${point.orders} pedidos`"
          :aria-pressed="point.id === selectedId"
          @click="selectedId = point.id"
        />
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="720px"
      empty-title="Sem clusters"
      empty-description="Não há pontos no período."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="resumosMapPoints.length"
    />
  </div>
</template>
