<script setup lang="ts">
/**
 * Operação → Ocorrências NG (Mileto).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { OcorrenciaNgRow } from '~/data/demo/ocorrencias-ng'
import {
  ocorrenciasNgFilterOptions,
  ocorrenciasNgState,
  resendMiletoOccurrence
} from '~/data/demo/ocorrencias-ng'
import { buildOcorrenciasNgMetrics } from '~/utils/operacao-p3-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Ocorrências NG · Operação · Via Reversa' })

const toast = useToast()
const search = ref('')
const alignFilter = ref('all')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const resendOpen = ref(false)
const pendingResend = ref<OcorrenciaNgRow | null>(null)

const columns: DataTableColumn<OcorrenciaNgRow>[] = [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '16%' },
  { type: 'text', key: 'viaStatus', label: 'Status Via', width: '140px' },
  { type: 'text', key: 'miletoStatus', label: 'Status Mileto', width: '150px' },
  { type: 'text', key: 'alignLabel', label: 'Alinhamento', width: '130px' },
  { type: 'text', key: 'updatedAtLabel', label: 'Atualizado', width: '120px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '160px',
    items: (row) => [
      {
        key: 'open',
        label: 'Abrir',
        icon: 'i-lucide-external-link',
        variant: 'ghost' as const,
        ariaLabel: `Abrir pedido ${row.orderId}`
      },
      {
        key: 'resend',
        label: 'Reenviar',
        icon: 'i-lucide-refresh-cw',
        variant: 'ghost' as const,
        disabled: !row.canResend,
        ariaLabel: `Reenviar ocorrência ${row.orderId}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return ocorrenciasNgState.rows.filter((row) => {
    if (alignFilter.value !== 'all' && row.align !== alignFilter.value) return false
    if (!query) return true
    return [row.orderId, row.client, row.viaStatus, row.miletoStatus]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() =>
  buildOcorrenciasNgMetrics(
    filteredRows.value,
    ocorrenciasNgState.completed,
    ocorrenciasNgState.cancelled,
    ocorrenciasNgState.withOccurrence,
    ocorrenciasNgState.divergences
  )
)

const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, alignFilter], () => {
  page.value = 1
})

function onAction(payload: { row: OcorrenciaNgRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/pedidos/${payload.row.orderId}`)
    return
  }
  if (payload.action === 'resend' && payload.row.canResend) {
    pendingResend.value = payload.row
    resendOpen.value = true
  }
}

function confirmResend() {
  const row = pendingResend.value
  resendOpen.value = false
  if (!row) return
  if (resendMiletoOccurrence(row.orderId)) {
    toast.success('Reenvio enfileirado', `Pedido ${row.orderId} enviado ao Mileto (mock).`)
  } else {
    toast.error('Falha no reenvio', 'Pedido não elegível para reenvio.')
  }
  pendingResend.value = null
}

function refresh() {
  toast.success('Atualizado', 'Monitor Mileto recarregado (mock).')
}
</script>

<template>
  <div class="ocorrencias-ng-page">
    <PageHeader
      title="Ocorrências NG"
      subtitle="Monitor comparativo Via × Mileto"
    >
      <AppButton
        icon="i-lucide-database-backup"
        variant="ghost"
        to="/operacao/mileto-backfill"
      >
        Backfill
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
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar pedido ou status…"
        class="w-[280px]"
      />
      <USelectMenu
        v-model="alignFilter"
        value-key="value"
        :items="ocorrenciasNgFilterOptions"
        class="w-[200px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1080px"
      empty-title="Nenhuma ocorrência"
      empty-description="Ajuste os filtros para ver o monitor Mileto."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="resendOpen"
      variant="confirm"
      title="Reenviar ao Mileto"
      description="Confirma o reenvio diagnóstico desta ocorrência?"
      confirm-label="Reenviar"
      confirm-variant="primary"
      @confirm="confirmResend"
    >
      <p class="text-sm text-via-muted">
        Pedido {{ pendingResend?.orderId }} entrará na fila de sincronização (mock).
      </p>
    </AppModal>
  </div>
</template>
