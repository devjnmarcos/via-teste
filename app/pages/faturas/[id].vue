<script setup lang="ts">
/**
 * Detalhe da fatura — dados, pedidos e documentos fiscais.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { FaturaPedidoRow, FiscalDocumentRow } from '~/data/demo/faturas'
import { faturaKindLabel, getFatura } from '~/data/demo/faturas'
import { buildFaturaDetailMetrics, mapFaturaStatusKey } from '~/utils/faturas-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()
const faturaId = computed(() => String(route.params.id ?? ''))

const invoice = computed(() => getFatura(faturaId.value))

if (!invoice.value) {
  throw createError({ statusCode: 404, statusMessage: 'Fatura não encontrada' })
}

useSeoMeta({
  title: () => `Fatura #${faturaId.value} · Faturas · Via Reversa`
})

const activeTab = ref<'dados' | 'pedidos' | 'documentos'>('dados')
const notesOpen = ref(false)
const deleteOpen = ref(false)
const notesDraft = ref('')
const ordersPage = ref(1)
const ordersPageSize = ref(DEFAULT_PAGE_SIZE)
const docsPage = ref(1)
const docsPageSize = ref(DEFAULT_PAGE_SIZE)

const metrics = computed(() => (invoice.value ? buildFaturaDetailMetrics(invoice.value) : []))
const statusKey = computed(() => mapFaturaStatusKey(invoice.value?.status ?? 'Aberta'))
const listPath = computed(() =>
  invoice.value ? `/faturas/${invoice.value.kind}` : '/faturas/a-receber'
)
const kindLabel = computed(() =>
  invoice.value ? faturaKindLabel(invoice.value.kind) : 'Fatura'
)

const orderColumns: DataTableColumn<FaturaPedidoRow>[] = [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente' },
  { type: 'text', key: 'valueLabel', label: 'Valor', width: '120px', align: 'right' }
]

const documentColumns: DataTableColumn<FiscalDocumentRow>[] = [
  { type: 'text', key: 'number', label: 'Número', width: '120px' },
  { type: 'text', key: 'series', label: 'Série', width: '80px' },
  { type: 'text', key: 'type', label: 'Tipo', width: '100px' },
  { type: 'text', key: 'issuedAtLabel', label: 'Emissão', width: '120px' }
]

const pagedOrders = computed(() =>
  slicePage(invoice.value?.orders ?? [], ordersPage.value, ordersPageSize.value)
)
const pagedDocs = computed(() =>
  slicePage(invoice.value?.documents ?? [], docsPage.value, docsPageSize.value)
)

const subtitle = computed(() => {
  const current = invoice.value
  if (!current) return ''
  return [
    kindLabel.value,
    current.accountName,
    current.competenceLabel,
    `venc. ${current.dueAtLabel}`
  ].join(' · ')
})

const tabs = [
  { key: 'dados' as const, label: 'Dados' },
  { key: 'pedidos' as const, label: 'Pedidos' },
  { key: 'documentos' as const, label: 'Documentos fiscais' }
]

function openNotes() {
  notesDraft.value = invoice.value?.notes ?? ''
  notesOpen.value = true
}

function saveNotes() {
  if (!invoice.value) return
  invoice.value.notes = notesDraft.value.trim()
  notesOpen.value = false
  toast.success('Observação salva', `Fatura #${invoice.value.id} atualizada.`)
}

function confirmDelete() {
  deleteOpen.value = false
  toast.info('Exclusão mock', 'A fatura permanece na fixture nesta onda.')
  navigateTo(listPath.value)
}
</script>

<template>
  <div
    v-if="invoice"
    class="fatura-detail"
  >
    <PageHeader
      :back-to="listPath"
      :title="`Fatura #${invoice.id}`"
      :subtitle="subtitle"
    >
      <StatusLabel
        :status="statusKey"
        :label="invoice.status"
      />
      <AppButton
        icon="i-lucide-pencil"
        @click="openNotes"
      >
        Editar observação
      </AppButton>
      <AppButton
        icon="i-lucide-trash-2"
        @click="deleteOpen = true"
      >
        Excluir
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="metrics" />

    <nav
      class="flex min-h-[49px] gap-6 border-b border-via-line px-[18px]"
      aria-label="Seções da fatura"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="inline-flex cursor-pointer items-center border-0 border-b-2 border-transparent bg-transparent text-xs text-via-muted transition-[color,border-color] duration-150"
        :class="activeTab === tab.key ? 'border-via-blue font-bold text-via-ink' : undefined"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section
      v-if="activeTab === 'dados'"
      class="border-b border-via-line bg-via-surface px-[18px] py-4"
      aria-label="Dados da fatura"
    >
      <dl class="m-0 max-w-xl space-y-3 text-xs">
        <div class="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
          <dt class="m-0 text-via-muted">Tipo</dt>
          <dd class="m-0 font-bold text-via-ink">{{ kindLabel }}</dd>
        </div>
        <div class="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
          <dt class="m-0 text-via-muted">Competência</dt>
          <dd class="m-0 text-via-ink">{{ invoice.competenceLabel }}</dd>
        </div>
        <div class="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
          <dt class="m-0 text-via-muted">Conta</dt>
          <dd class="m-0 text-via-ink">{{ invoice.accountName }}</dd>
        </div>
        <div class="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
          <dt class="m-0 text-via-muted">Valor</dt>
          <dd class="numeric m-0 font-bold text-via-ink">{{ invoice.valueLabel }}</dd>
        </div>
        <div class="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
          <dt class="m-0 text-via-muted">Vencimento</dt>
          <dd class="numeric m-0 text-via-ink">{{ invoice.dueAtLabel }}</dd>
        </div>
        <div class="grid grid-cols-[140px_minmax(0,1fr)] gap-2">
          <dt class="m-0 text-via-muted">Observações</dt>
          <dd class="m-0 text-via-ink">{{ invoice.notes || '—' }}</dd>
        </div>
      </dl>
    </section>

    <section
      v-else-if="activeTab === 'pedidos'"
      class="border-b border-via-line bg-via-surface px-[18px] pt-4 pb-0"
      aria-label="Pedidos da fatura"
    >
      <DataTable
        :columns="orderColumns"
        :rows="pagedOrders"
        min-width="640px"
        empty-title="Nenhum pedido"
        empty-description="Esta fatura não possui pedidos vinculados."
      />
      <Pagination
        v-if="invoice.orders.length > 0"
        v-model:page="ordersPage"
        v-model:page-size="ordersPageSize"
        :total="invoice.orders.length"
      />
    </section>

    <section
      v-else
      class="border-b border-via-line bg-via-surface px-[18px] pt-4 pb-0"
      aria-label="Documentos fiscais"
    >
      <DataTable
        :columns="documentColumns"
        :rows="pagedDocs"
        min-width="640px"
        empty-title="Nenhum documento"
        empty-description="Não há documentos fiscais vinculados a esta fatura."
      />
      <Pagination
        v-if="invoice.documents.length > 0"
        v-model:page="docsPage"
        v-model:page-size="docsPageSize"
        :total="invoice.documents.length"
      />
    </section>

    <AppModal
      v-model:open="notesOpen"
      variant="form"
      title="Editar observação"
      description="Atualize a observação operacional da fatura."
      confirm-label="Salvar"
      @confirm="saveNotes"
    >
      <AppFormField label="Observação">
        <UInput
          v-model="notesDraft"
          placeholder="Texto livre"
        />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir fatura"
      :description="`Confirma a exclusão mock da fatura #${invoice.id}?`"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
