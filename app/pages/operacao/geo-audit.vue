<script setup lang="ts">
/**
 * Operação → Auditoria geográfica (geo-audit).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { GeoLogRow } from '~/data/demo/geo-audit'
import {
  buildGeoAuditMetrics,
  enqueueFixInvalidAddresses,
  geoAuditState,
  geoAuditStatusOptions,
  geoAuditTrend
} from '~/data/demo/geo-audit'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Auditoria geográfica · Operação · Via Reversa' })

const toast = useToast()
const search = ref('')
const statusFilter = ref('all')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const fixOpen = ref(false)
const fixing = ref(false)

const columns: DataTableColumn<GeoLogRow>[] = [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'address', label: 'Endereço', width: '28%', secondaryKey: 'city' },
  { type: 'text', key: 'state', label: 'UF', width: '64px' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '110px' },
  { type: 'text', key: 'source', label: 'Origem', width: '110px' },
  { type: 'text', key: 'updatedAt', label: 'Atualizado', width: '110px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '120px',
    items: [
      { key: 'open', label: 'Abrir', icon: 'i-lucide-external-link', variant: 'ghost', ariaLabel: 'Abrir pedido' }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return geoAuditState.rows.filter((row) => {
    if (statusFilter.value !== 'all' && row.status !== statusFilter.value) return false
    if (!query) return true
    return [row.orderId, row.address, row.city, row.state, row.source]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() => buildGeoAuditMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, statusFilter], () => {
  page.value = 1
})

function onAction(payload: { row: GeoLogRow; action: string }) {
  if (payload.action === 'open') navigateTo(`/pedidos/${payload.row.orderId}`)
}

async function confirmFix() {
  fixing.value = true
  const result = enqueueFixInvalidAddresses()
  fixing.value = false
  fixOpen.value = false
  if (result.queued === 0) {
    toast.error('Nada a corrigir', 'Não há endereços pendentes ou falhos na fila.')
    return
  }
  toast.success('Correção enfileirada', `${result.queued} endereço(s) processados (mock).`)
}
</script>

<template>
  <div class="geo-audit-page">
    <PageHeader
      title="Auditoria geográfica"
      subtitle="Logs de geocode e correção de endereços inválidos"
    >
      <AppButton
        icon="i-lucide-wand-sparkles"
        variant="primary"
        @click="fixOpen = true"
      >
        Corrigir inválidos
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
        placeholder="Buscar pedido ou endereço…"
        class="w-[280px]"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="geoAuditStatusOptions"
        class="w-[200px]"
      />
      <span class="text-[11px] text-via-muted">
        Último job: {{ geoAuditState.lastJobAt }}
      </span>
    </section>

    <section
      class="border-b border-via-line"
      aria-label="Tendência"
    >
      <ChartPanel
        title="Correções no tempo"
        note="volume (fixture)"
      >
        <VolumeTrendChart
          :series="geoAuditTrend"
          title="Correções · 7 dias"
          note="geo"
          :height="160"
        />
      </ChartPanel>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="980px"
      empty-title="Nenhum log geográfico"
      empty-description="Ajuste os filtros ou dispare a correção de inválidos."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="fixOpen"
      variant="confirm"
      title="Corrigir endereços inválidos"
      description="Dispara o job de correção nos logs pendentes e falhos."
      confirm-label="Corrigir agora"
      confirm-variant="primary"
      :loading="fixing"
      @confirm="confirmFix"
    >
      <p class="text-sm text-via-muted">
        Pedidos com endereço inválido serão reprocessados (mock assíncrono).
      </p>
    </AppModal>
  </div>
</template>
