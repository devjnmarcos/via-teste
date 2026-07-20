<script setup lang="ts">
/**
 * Operação → Mileto backfill (deep-link).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { MiletoBackfillJob } from '~/data/demo/chatbot-operacional'
import {
  miletoBackfillState,
  startMiletoBackfill
} from '~/data/demo/chatbot-operacional'
import { buildMiletoBackfillMetrics } from '~/utils/operacao-p3-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Mileto backfill · Operação · Via Reversa' })

const toast = useToast()
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const confirmOpen = ref(false)
const pendingJob = ref<MiletoBackfillJob | null>(null)

const columns: DataTableColumn<MiletoBackfillJob>[] = [
  { type: 'text', key: 'rangeLabel', label: 'Intervalo', width: '22%' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '140px' },
  { type: 'text', key: 'progress', label: 'Progresso (%)', width: '130px' },
  { type: 'text', key: 'processed', label: 'Processados', width: '120px' },
  { type: 'text', key: 'total', label: 'Total', width: '100px' },
  { type: 'text', key: 'startedAtLabel', label: 'Início', width: '130px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '140px',
    items: (row) => [
      {
        key: 'start',
        label: 'Iniciar',
        icon: 'i-lucide-play',
        variant: 'ghost' as const,
        disabled: row.status === 'running' || row.status === 'done',
        ariaLabel: `Iniciar backfill ${row.rangeLabel}`
      }
    ]
  }
]

const metrics = computed(() => buildMiletoBackfillMetrics(miletoBackfillState.jobs))
const pagedRows = computed(() => slicePage(miletoBackfillState.jobs, page.value, pageSize.value))

function onAction(payload: { row: MiletoBackfillJob; action: string }) {
  if (payload.action !== 'start') return
  if (payload.row.status === 'running' || payload.row.status === 'done') return
  pendingJob.value = payload.row
  confirmOpen.value = true
}

function confirmStart() {
  const job = pendingJob.value
  confirmOpen.value = false
  if (!job) return
  if (startMiletoBackfill(job.id)) {
    toast.success('Backfill iniciado', `Intervalo ${job.rangeLabel} em execução (mock).`)
  } else {
    toast.error('Não iniciado', 'Job indisponível para execução.')
  }
  pendingJob.value = null
}
</script>

<template>
  <div class="mileto-backfill-page">
    <PageHeader
      title="Mileto backfill"
      subtitle="Reprocessamento histórico de ocorrências Mileto"
    >
      <AppButton
        icon="i-lucide-radar"
        variant="ghost"
        to="/operacao/ocorrencias-ng"
      >
        Ocorrências NG
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="metrics"
      :max-per-row="3"
    />

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="980px"
      empty-title="Sem jobs"
      empty-description="Nenhum backfill agendado."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="miletoBackfillState.jobs.length"
    />

    <AppModal
      v-model:open="confirmOpen"
      variant="confirm"
      title="Iniciar backfill"
      description="Confirma o reprocessamento do intervalo selecionado?"
      confirm-label="Iniciar"
      confirm-variant="primary"
      @confirm="confirmStart"
    >
      <p class="text-sm text-via-muted">
        Intervalo {{ pendingJob?.rangeLabel }} — progresso atual {{ pendingJob?.progress }}%.
      </p>
    </AppModal>
  </div>
</template>
