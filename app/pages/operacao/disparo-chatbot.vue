<script setup lang="ts">
/**
 * Operação → Disparo Chatbot.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ChatbotDispatchRow } from '~/data/demo/chatbot-operacional'
import {
  buildDispatchDistribution,
  chatbotDispatchState,
  dispatchChatbotOrders
} from '~/data/demo/chatbot-operacional'
import { buildChatbotDispatchMetrics } from '~/utils/operacao-p3-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Disparo Chatbot · Operação · Via Reversa' })

const toast = useToast()
const search = ref('')
const selectedIds = ref<string[]>([])
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const confirmOpen = ref(false)

const columns = computed<DataTableColumn<ChatbotDispatchRow>[]>(() => [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '18%' },
  { type: 'text', key: 'accountName', label: 'Conta', width: '20%' },
  { type: 'text', key: 'template', label: 'Template', width: '18%' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '120px' },
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
        disabled: row.status !== 'elegivel',
        ariaLabel: `Alternar pedido ${row.orderId}`
      }
    ]
  }
])

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return chatbotDispatchState.orders
  return chatbotDispatchState.orders.filter((row) =>
    [row.orderId, row.client, row.accountName, row.template]
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

const listMetrics = computed(() =>
  buildChatbotDispatchMetrics(
    filteredRows.value,
    chatbotDispatchState.successToday,
    chatbotDispatchState.failedToday,
    chatbotDispatchState.skippedToday,
    chatbotDispatchState.queued,
    selectedIds.value.length
  )
)

const distribution = computed(() => buildDispatchDistribution(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch(search, () => {
  page.value = 1
})

function onAction(payload: { row: ChatbotDispatchRow; action: string }) {
  if (payload.action !== 'toggle' || payload.row.status !== 'elegivel') return
  const id = payload.row.orderId
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function openConfirm() {
  if (selectedIds.value.length === 0) {
    toast.error('Seleção vazia', 'Inclua pedidos elegíveis para disparo.')
    return
  }
  confirmOpen.value = true
}

function confirmDispatch() {
  const count = dispatchChatbotOrders([...selectedIds.value])
  selectedIds.value = []
  confirmOpen.value = false
  toast.success('Disparo iniciado', `${count} mensagem(ns) enfileirada(s) (mock).`)
}
</script>

<template>
  <div class="disparo-chatbot-page">
    <PageHeader
      title="Disparo Chatbot"
      subtitle="Seleção em lote e envio de templates operacionais"
    >
      <AppButton
        icon="i-lucide-activity"
        variant="ghost"
        to="/operacao/chatbot-monitor"
      >
        Monitor
      </AppButton>
      <AppButton
        icon="i-lucide-messages-square"
        variant="ghost"
        to="/operacao/tratativas"
      >
        Tratativas
      </AppButton>
      <AppButton
        icon="i-lucide-send"
        :disabled="selectedIds.length === 0"
        @click="openConfirm"
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
        placeholder="Buscar pedido, cliente ou template…"
        class="w-[320px]"
      />
    </section>

    <section
      class="border-b border-via-line"
      aria-label="Distribuição"
    >
      <ChartPanel
        title="Status do disparo"
        note="na listagem filtrada"
      >
        <StatusDistribution
          :items="distribution"
          title="Pedidos no disparo"
          :height="200"
        />
      </ChartPanel>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="960px"
      empty-title="Nenhum pedido"
      empty-description="Não há pedidos elegíveis para disparo no momento."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="confirmOpen"
      variant="confirm"
      title="Confirmar disparo"
      description="Os templates selecionados serão enviados imediatamente."
      confirm-label="Disparar agora"
      confirm-variant="primary"
      @confirm="confirmDispatch"
    >
      <p class="text-sm text-via-muted">
        {{ selectedIds.length }} pedido(s) na fila de envio (mock).
      </p>
    </AppModal>
  </div>
</template>
