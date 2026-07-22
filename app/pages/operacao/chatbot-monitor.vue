<script setup lang="ts">
/**
 * Operação → Monitor de saúde do chatbot (deep-link).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ChatbotQueueRow } from '~/data/demo/chatbot-operacional'
import {
  chatbotHealthTrend,
  chatbotMonitorQueues
} from '~/data/demo/chatbot-operacional'
import { buildChatbotMonitorMetrics } from '~/utils/operacao-p3-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Monitor Chatbot · Operação · Via Reversa' })

const toast = useToast()
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<ChatbotQueueRow>[] = [
  { type: 'text', key: 'queue', label: 'Fila', width: '28%' },
  { type: 'text', key: 'waiting', label: 'Aguardando', width: '120px' },
  { type: 'text', key: 'processing', label: 'Processando', width: '120px' },
  { type: 'text', key: 'failed', label: 'Falhas', width: '100px' },
  { type: 'text', key: 'latencyMs', label: 'Latência (ms)', width: '130px' }
]

const metrics = computed(() => buildChatbotMonitorMetrics(chatbotMonitorQueues))
const pagedRows = computed(() => slicePage(chatbotMonitorQueues, page.value, pageSize.value))

function refresh() {
  toast.success('Atualizado', 'Filas do chatbot recarregadas (mock).')
}
</script>

<template>
  <div class="chatbot-monitor-page">
    <PageHeader
      title="Monitor Chatbot"
      subtitle="Saúde das filas de disparo e webhooks"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
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
      class="border-b border-via-line"
      aria-label="Saúde"
    >
      <ChartPanel
        title="Taxa de sucesso"
        note="últimas horas (fixture)"
      >
        <PercentTrendChart
          :series="chatbotHealthTrend"
          label="Sucesso %"
          :height="160"
        />
      </ChartPanel>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="820px"
      empty-title="Sem filas"
      empty-description="Nenhuma fila monitorada no momento."
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="chatbotMonitorQueues.length"
    />
  </div>
</template>
