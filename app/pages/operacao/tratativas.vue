<script setup lang="ts">
/**
 * Operação → Tratativas (chatbot).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { TratativaOrderRow } from '~/data/demo/tratativas'
import {
  buildTratativasDistribution,
  markTratativaWorked,
  markTratativasDispatched,
  tratativaStatusOptions,
  tratativasState,
  tratativasVolumeTrend
} from '~/data/demo/tratativas'
import { buildTratativasMetrics } from '~/utils/operacao-p3-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Tratativas · Operação · Via Reversa' })

const toast = useToast()
const search = ref('')
const statusFilter = ref('all')
const selectedIds = ref<string[]>([])
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const dispatchOpen = ref(false)

const columns = computed<DataTableColumn<TratativaOrderRow>[]>(() => [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '16%' },
  { type: 'text', key: 'accountName', label: 'Conta', width: '18%' },
  { type: 'text', key: 'channel', label: 'Canal', width: '110px' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '120px' },
  { type: 'text', key: 'lastContactLabel', label: 'Último contato', width: '130px' },
  { type: 'text', key: 'attempts', label: 'Tentativas', width: '100px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '180px',
    items: (row) => [
      {
        key: 'toggle',
        label: selectedIds.value.includes(row.orderId) ? 'Remover' : 'Incluir',
        icon: selectedIds.value.includes(row.orderId) ? 'i-lucide-check' : 'i-lucide-plus',
        variant: 'ghost' as const,
        disabled: row.status === 'disparado',
        ariaLabel: `Alternar pedido ${row.orderId}`
      },
      {
        key: 'work',
        label: 'Trabalhar',
        icon: 'i-lucide-check-check',
        variant: 'ghost' as const,
        disabled: row.status === 'trabalhado',
        ariaLabel: `Marcar pedido ${row.orderId} como trabalhado`
      },
      {
        key: 'open',
        label: 'Abrir',
        icon: 'i-lucide-external-link',
        variant: 'ghost' as const,
        ariaLabel: `Abrir pedido ${row.orderId}`
      }
    ]
  }
])

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return tratativasState.orders.filter((row) => {
    if (statusFilter.value !== 'all' && row.status !== statusFilter.value) return false
    if (!query) return true
    return [row.orderId, row.client, row.accountName, row.channel]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() =>
  buildTratativasMetrics(
    filteredRows.value,
    tratativasState.contactsToday,
    tratativasState.workedToday,
    selectedIds.value.length
  )
)

const distribution = computed(() => buildTratativasDistribution(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, statusFilter], () => {
  page.value = 1
  selectedIds.value = selectedIds.value.filter((id) =>
    filteredRows.value.some((row) => row.orderId === id && row.status !== 'disparado')
  )
})

function onAction(payload: { row: TratativaOrderRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/pedidos/${payload.row.orderId}`)
    return
  }
  if (payload.action === 'work') {
    if (markTratativaWorked(payload.row.orderId)) {
      toast.success('Tratativa registrada', `Pedido ${payload.row.orderId} marcado como trabalhado.`)
    }
    return
  }
  if (payload.action !== 'toggle' || payload.row.status === 'disparado') return
  const id = payload.row.orderId
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function openDispatch() {
  if (selectedIds.value.length === 0) {
    toast.error('Seleção vazia', 'Inclua pedidos pendentes para disparo.')
    return
  }
  dispatchOpen.value = true
}

function confirmDispatch() {
  const count = markTratativasDispatched([...selectedIds.value])
  selectedIds.value = []
  dispatchOpen.value = false
  toast.success('Disparo solicitado', `${count} pedido(s) enfileirados no chatbot (mock).`)
}

function refresh() {
  toast.success('Atualizado', 'Tratativas recarregadas (mock).')
}
</script>

<template>
  <div class="tratativas-page">
    <PageHeader
      title="Tratativas"
      subtitle="Pedidos elegíveis ao chatbot e acompanhamento de contatos"
    >
      <AppButton
        icon="i-lucide-activity"
        variant="ghost"
        to="/operacao/chatbot-monitor"
      >
        Monitor
      </AppButton>
      <AppButton
        icon="i-lucide-bot"
        variant="ghost"
        to="/operacao/disparo-chatbot"
      >
        Disparo
      </AppButton>
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        @click="refresh"
      >
        Atualizar
      </AppButton>
      <AppButton
        icon="i-lucide-send"
        :disabled="selectedIds.length === 0"
        @click="openDispatch"
      >
        Disparar
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
        placeholder="Buscar pedido ou cliente…"
        class="w-[280px]"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="tratativaStatusOptions"
        class="w-[200px]"
      />
    </section>

    <section
      class="grid grid-cols-2 border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Contatos por dia"
          note="volume (fixture)"
        >
          <VolumeTrendChart
            :series="tratativasVolumeTrend"
            title="Contatos · 7 dias"
            note="chatbot"
            :height="160"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Distribuição de tratativas"
          note="status atual"
        >
          <StatusDistribution
            :items="distribution"
            title="Status das tratativas"
            :height="200"
          />
        </ChartPanel>
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1120px"
      empty-title="Nenhuma tratativa"
      empty-description="Ajuste os filtros para ver pedidos elegíveis."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="dispatchOpen"
      variant="confirm"
      title="Disparar chatbot"
      description="Confirma o disparo para os pedidos selecionados?"
      confirm-label="Disparar"
      confirm-variant="primary"
      @confirm="confirmDispatch"
    >
      <p class="text-sm text-via-muted">
        {{ selectedIds.length }} pedido(s) serão enfileirados no canal (mock).
      </p>
    </AppModal>
  </div>
</template>
