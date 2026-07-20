<script setup lang="ts">
/**
 * Dashboards → Loja (TV) — tipografia ampliada + auto-refresh mock.
 *
 * Layout:
 * - Padrão (sidebar do app): `/dashboards/loja-tv` — embedded no shell default.
 * - Kiosk fullscreen (sem sidebar): `/dashboards/loja-tv?fullscreen=1`
 *   (legado DashboardStoreTv / TV wall).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { DashboardStoreOrderRow } from '~/data/demo/dashboards'
import {
  buildLojaStatusDistribution,
  lojaQueueRows,
  lojaVolumeTrend
} from '~/data/demo/dashboards'
import { buildLojaMetrics } from '~/utils/dashboards-metrics'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Loja (TV) · Dashboards · Via Reversa' })

const route = useRoute()
const toast = useToast()
const lastRefresh = ref(new Date())
const showClientNumber = ref(true)

const isFullscreen = computed(() => {
  const raw = route.query.fullscreen
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === '1' || value === 'true'
})

watchEffect(() => {
  setPageLayout(isFullscreen.value ? 'tv' : 'default')
})

const visibleRows = computed(() =>
  lojaQueueRows.filter((row) => row.statusKey !== 'done').slice(0, 8)
)

const columns = computed<DataTableColumn<DashboardStoreOrderRow>[]>(() => {
  const cols: DataTableColumn<DashboardStoreOrderRow>[] = [
    { type: 'text', key: 'ticket', label: 'Ticket', width: '100px' },
    { type: 'text', key: 'orderId', label: 'Pedido', width: '120px' },
    { type: 'text', key: 'statusLabel', label: 'Status', width: '22%' },
    { type: 'text', key: 'scheduledLabel', label: 'Horário', width: '110px' },
    { type: 'text', key: 'waitingMinutes', label: 'Espera', width: '100px', align: 'right' }
  ]
  if (showClientNumber.value) {
    cols.splice(2, 0, {
      type: 'text',
      key: 'client',
      label: 'Cliente',
      width: '20%'
    })
  }
  return cols
})

const listMetrics = computed(() => buildLojaMetrics(lojaQueueRows))
const distribution = computed(() => buildLojaStatusDistribution(lojaQueueRows))

const refreshLabel = computed(() =>
  lastRefresh.value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    lastRefresh.value = new Date()
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function refresh() {
  lastRefresh.value = new Date()
  toast.success('Atualizado', 'Painel TV recarregado (mock).')
}
</script>

<template>
  <div class="dashboards-loja-tv-page text-[15px]">
    <div
      v-if="!isFullscreen"
      class="flex flex-wrap items-center justify-between gap-3 border-b border-via-line bg-via-surface-2 px-app-gutter py-2.5"
      role="status"
      data-testid="loja-tv-mode-banner"
    >
      <p class="m-0 text-xs text-via-muted">
        Modo TV embutido no app (sidebar permanece). Use fullscreen para kiosk / TV wall.
      </p>
      <AppButton
        to="/dashboards/loja-tv?fullscreen=1"
        icon="i-lucide-maximize-2"
        variant="secondary"
      >
        Abrir modo TV
      </AppButton>
    </div>

    <PageHeader
      title="Loja (TV)"
      :subtitle="isFullscreen
        ? `Modo kiosk · atualizado às ${refreshLabel}`
        : `Pré-visualização · atualizado às ${refreshLabel}`"
      :back-to="isFullscreen ? '/dashboards/loja-tv' : undefined"
    >
      <AppButton
        v-if="isFullscreen"
        to="/dashboards/loja-tv"
        icon="i-lucide-panel-left"
        variant="ghost"
      >
        Voltar ao app
      </AppButton>
      <AppButton
        icon="i-lucide-refresh-cw"
        @click="refresh"
      >
        Atualizar
      </AppButton>
      <AppButton
        :icon="showClientNumber ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        variant="ghost"
        @click="showClientNumber = !showClientNumber"
      >
        {{ showClientNumber ? 'Ocultar cliente' : 'Mostrar cliente' }}
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="listMetrics"
      :max-per-row="3"
    />

    <section
      class="grid grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Volume por hora"
          note="auto-refresh 30s"
        >
          <VolumeTrendChart
            :series="lojaVolumeTrend"
            title="Volume · hoje"
            note="atendimentos"
            :height="180"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Fila ao vivo"
          note="status atual"
        >
          <StatusDistribution
            :items="distribution"
            title="Status na loja"
            :height="220"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="visibleRows"
      min-width="880px"
      empty-title="Fila vazia"
      empty-description="Nenhum ticket aguardando no painel TV."
    />
  </div>
</template>
