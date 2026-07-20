<script setup lang="ts">
/**
 * Detalhe do lote de importação — resumo, métricas, log e arquivo.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ImportLogRow } from '~/data/demo/lotes'
import { getLot } from '~/data/demo/lotes'
import { buildLotDetailMetrics, mapLotStatusKey } from '~/utils/lotes-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()
const lotId = computed(() => String(route.params.id ?? ''))

const lot = computed(() => getLot(lotId.value))

if (!lot.value) {
  throw createError({ statusCode: 404, statusMessage: 'Lote não encontrado' })
}

useSeoMeta({ title: () => `Lote #${lotId.value} · Operação · Via Reversa` })

const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const reuploadOpen = ref(false)
const reuploadFileName = ref('')

const metrics = computed(() => (lot.value ? buildLotDetailMetrics(lot.value) : []))
const statusKey = computed(() => mapLotStatusKey(lot.value?.status ?? 'Rascunho'))

const logColumns: DataTableColumn<ImportLogRow>[] = [
  { type: 'text', key: 'line', label: 'Linha', width: '72px', align: 'right' },
  { type: 'text', key: 'severity', label: 'Severidade', width: '110px' },
  { type: 'text', key: 'message', label: 'Mensagem' },
  { type: 'text', key: 'atLabel', label: 'Quando', width: '140px' }
]

const pagedLogs = computed(() =>
  slicePage(lot.value?.logs ?? [], page.value, pageSize.value)
)

const subtitle = computed(() => {
  const current = lot.value
  if (!current) return ''
  return [
    current.reference,
    current.accountName,
    `criado em ${current.createdAtLabel}`
  ].join(' · ')
})

watch(
  () => lot.value?.logs.length,
  () => {
    page.value = 1
  }
)

function confirmReupload() {
  if (!lot.value || !reuploadFileName.value.trim()) {
    toast.error('Arquivo obrigatório', 'Informe o nome do arquivo para reenvio mock.')
    return
  }
  lot.value.file = {
    name: reuploadFileName.value.trim(),
    sizeLabel: '—',
    uploadedAtLabel: lot.value.createdAtLabel
  }
  lot.value.status = 'Importando'
  reuploadOpen.value = false
  reuploadFileName.value = ''
  toast.success('Arquivo reenviado', 'Fila de importação atualizada (mock).')
}

function downloadExample() {
  toast.info('Planilha exemplo', 'Download mock do template XLS.')
}
</script>

<template>
  <div
    v-if="lot"
    class="lote-detail"
  >
    <PageHeader
      back-to="/operacao/lotes"
      :title="`Lote #${lot.id}`"
      :subtitle="subtitle"
    >
      <StatusLabel
        :status="statusKey"
        :label="lot.status"
      />
      <AppButton
        icon="i-lucide-download"
        @click="downloadExample"
      >
        Planilha exemplo
      </AppButton>
      <AppButton
        variant="primary"
        icon="i-lucide-upload"
        @click="reuploadOpen = true"
      >
        Reenviar arquivo
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="metrics"
      :max-per-row="3"
    />

    <section
      class="grid gap-0 border-b border-via-line bg-via-surface md:grid-cols-2"
      aria-label="Resumo do lote"
    >
      <dl class="m-0 border-b border-via-line px-[18px] py-4 md:border-r md:border-b-0">
        <div class="mb-3 grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
          <dt class="m-0 text-via-muted">Referência</dt>
          <dd class="m-0 font-bold text-via-ink">{{ lot.reference }}</dd>
        </div>
        <div class="mb-3 grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
          <dt class="m-0 text-via-muted">Conta</dt>
          <dd class="m-0 text-via-ink">{{ lot.accountName }}</dd>
        </div>
        <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
          <dt class="m-0 text-via-muted">Criado em</dt>
          <dd class="numeric m-0 text-via-ink">{{ lot.createdAtLabel }}</dd>
        </div>
      </dl>
      <div class="px-[18px] py-4">
        <h2 class="via-section-title m-0 mb-2 text-sm font-bold text-via-ink">Arquivo</h2>
        <template v-if="lot.file">
          <p class="m-0 text-xs text-via-ink">{{ lot.file.name }}</p>
          <p class="via-helper m-0 mt-1 text-via-muted">
            {{ lot.file.sizeLabel }} · enviado em {{ lot.file.uploadedAtLabel }}
          </p>
        </template>
        <p
          v-else
          class="m-0 text-xs text-via-muted"
        >
          Nenhum arquivo anexado — lote em rascunho.
        </p>
      </div>
    </section>

    <section
      class="border-b border-via-line bg-via-surface px-[18px] pt-4 pb-0"
      aria-label="Log de importação"
    >
      <header class="mb-3 [&_h2]:m-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-via-ink [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-xs [&_p]:text-via-muted">
        <h2>Log de importação</h2>
        <p>Eventos e erros por linha do arquivo.</p>
      </header>

      <DataTable
        :columns="logColumns"
        :rows="pagedLogs"
        min-width="720px"
        empty-title="Log vazio"
        empty-description="Ainda não há eventos de importação para este lote."
      />

      <Pagination
        v-if="lot.logs.length > 0"
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="lot.logs.length"
      />
    </section>

    <AppModal
      v-model:open="reuploadOpen"
      variant="form"
      title="Reenviar arquivo"
      description="Informe o nome do arquivo para simular o reenvio (mock)."
      confirm-label="Reenviar"
      @confirm="confirmReupload"
    >
      <AppFormField label="Nome do arquivo *">
        <UInput
          v-model="reuploadFileName"
          placeholder="lote_corrigido.xlsx"
        />
      </AppFormField>
    </AppModal>
  </div>
</template>
