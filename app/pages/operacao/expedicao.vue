<script setup lang="ts">
/**
 * Operação → Expedição (etiquetas).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ExpedicaoOrderRow } from '~/data/demo/expedicao'
import {
  expedicaoAccountOptions,
  expedicaoState,
  expedicaoStatusOptions,
  expedicaoVolumeTrend,
  markOrdersPrinted
} from '~/data/demo/expedicao'
import { buildExpedicaoMetrics } from '~/utils/operacao-p2-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Expedição · Operação · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const statusFilter = ref('all')
const search = ref('')
const selectedIds = ref<string[]>([])
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const printOpen = ref(false)

const columns = computed<DataTableColumn<ExpedicaoOrderRow>[]>(() => [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '16%' },
  { type: 'text', key: 'accountName', label: 'Conta', width: '18%' },
  { type: 'text', key: 'supportPoint', label: 'Ponto de apoio', width: '16%' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '150px' },
  { type: 'text', key: 'createdAtLabel', label: 'Criado em', width: '120px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Seleção',
    width: '130px',
    items: (row) => [
      {
        key: 'toggle',
        label: selectedIds.value.includes(row.orderId) ? 'Remover' : 'Incluir',
        icon: selectedIds.value.includes(row.orderId) ? 'i-lucide-check' : 'i-lucide-plus',
        variant: 'ghost' as const,
        disabled: row.printed,
        ariaLabel: `Alternar pedido ${row.orderId}`
      }
    ]
  }
])

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return expedicaoState.orders.filter((row) => {
    if (accountId.value !== 'all') {
      const map: Record<string, string> = {
        'acc-1': 'Casas Bahia · Nacional',
        'acc-2': 'Renner · Sul',
        'acc-3': 'Amazon BR · Reversa'
      }
      if (row.accountName !== map[accountId.value]) return false
    }
    if (statusFilter.value === 'ready' && row.printed) return false
    if (statusFilter.value === 'printed' && !row.printed) return false
    if (!query) return true
    return [row.orderId, row.client, row.accountName, row.supportPoint]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() =>
  buildExpedicaoMetrics(
    filteredRows.value,
    selectedIds.value.length,
    expedicaoState.printedToday
  )
)

const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, accountId, statusFilter], () => {
  page.value = 1
  selectedIds.value = selectedIds.value.filter((id) =>
    filteredRows.value.some((row) => row.orderId === id && !row.printed)
  )
})

function onAction(payload: { row: ExpedicaoOrderRow; action: string }) {
  if (payload.action !== 'toggle' || payload.row.printed) return
  const id = payload.row.orderId
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function openPrint() {
  if (selectedIds.value.length === 0) {
    toast.error('Seleção vazia', 'Inclua pedidos prontos para etiqueta.')
    return
  }
  printOpen.value = true
}

function confirmPrint() {
  const count = markOrdersPrinted([...selectedIds.value])
  selectedIds.value = []
  printOpen.value = false
  toast.success(
    'Etiquetas geradas',
    `${count} etiqueta(s) enviada(s) para impressão (mock PDF).`
  )
}

function refresh() {
  toast.success('Atualizado', 'Lista de expedição recarregada (mock).')
}
</script>

<template>
  <div class="expedicao-page">
    <PageHeader
      title="Expedição"
      subtitle="Impressão de etiquetas de pedidos"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        @click="refresh"
      >
        Atualizar
      </AppButton>
      <AppButton
        icon="i-lucide-printer"
        :disabled="selectedIds.length === 0"
        @click="openPrint"
      >
        Imprimir
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
        placeholder="Buscar pedido ou cliente…"
        class="w-[280px]"
      />
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="expedicaoAccountOptions"
        class="w-[240px]"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="expedicaoStatusOptions"
        class="w-[200px]"
      />
    </section>

    <section
      class="border-b border-via-line"
      aria-label="Volume de impressões"
    >
      <ChartPanel
        title="Etiquetas impressas"
        note="volume diário (fixture)"
      >
        <VolumeTrendChart
          :series="expedicaoVolumeTrend"
          title="Impressões · 7 dias"
          note="etiquetas"
          :height="160"
        />
      </ChartPanel>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1080px"
      empty-title="Nenhum pedido"
      empty-description="Ajuste os filtros para ver pedidos elegíveis à etiqueta."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="printOpen"
      variant="confirm"
      title="Imprimir etiquetas"
      description="Confirma o envio das etiquetas selecionadas para impressão?"
      confirm-label="Gerar PDF"
      confirm-variant="primary"
      @confirm="confirmPrint"
    >
      <p class="mb-3 text-sm text-via-muted">
        {{ selectedIds.length }} pedido(s) serão marcados como impressos (mock PDF).
      </p>
      <div
        class="border border-via-line bg-via-surface-2 p-3"
        data-testid="etiqueta-pdf-preview"
        aria-label="Pré-visualização da etiqueta"
      >
        <p class="m-0 text-[10px] font-bold tracking-wide text-via-muted uppercase">
          Pré-visualização · etiqueta 100×150 mm
        </p>
        <div class="mt-2 border border-dashed border-via-line-strong bg-white px-3 py-4">
          <p class="m-0 text-xs font-bold text-via-ink">
            Via Reversa · Etiqueta
          </p>
          <p class="mt-1 mb-0 text-sm text-via-ink">
            Pedido #{{ selectedIds[0] ?? '—' }}
            <span v-if="selectedIds.length > 1">
              (+{{ selectedIds.length - 1 }})
            </span>
          </p>
          <p class="mt-2 mb-0 font-mono text-[11px] tracking-[0.2em] text-via-muted">
            ||||||||||||||||||||
          </p>
          <p class="mt-1 mb-0 text-[10px] text-via-muted">
            Mock PDF — arquivo real na integração de API.
          </p>
        </div>
      </div>
    </AppModal>
  </div>
</template>
