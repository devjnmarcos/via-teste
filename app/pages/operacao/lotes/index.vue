<script setup lang="ts">
/**
 * Listagem de Lotes de importação — Operação → Lotes.
 * Modal de criação/upload; detalhe em página dedicada.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { LotRow, LotStatus } from '~/data/demo/lotes'
import {
  createEmptyLotForm,
  createLot,
  lotesAccountOptions,
  lotesState,
  lotesStatusOptions
} from '~/data/demo/lotes'
import { buildLotesListMetrics } from '~/utils/lotes-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Lotes · Operação · Via Reversa' })

const toast = useToast()

const search = ref('')
const statusFilter = ref<'Todos' | LotStatus>('Todos')
const accountFilter = ref<string>('Todas')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const form = reactive(createEmptyLotForm())

const accountFilterOptions = computed(() => [
  { label: 'Todas as contas', value: 'Todas' },
  ...lotesAccountOptions
])

const columns: DataTableColumn<LotRow>[] = [
  { type: 'text', key: 'id', label: 'ID', width: '72px' },
  { type: 'text', key: 'reference', label: 'Referência', width: '18%' },
  { type: 'text', key: 'status', label: 'Status', width: '110px' },
  { type: 'text', key: 'accountName', label: 'Conta', width: '20%' },
  { type: 'text', key: 'createdAtLabel', label: 'Criado em', width: '140px' },
  { type: 'text', key: 'ordersCreated', label: 'Pedidos', width: '80px', align: 'right' },
  { type: 'text', key: 'errorsCount', label: 'Erros', width: '72px', align: 'right' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '120px',
    items: (row) => [
      {
        key: 'open',
        label: 'Abrir',
        icon: 'i-lucide-eye',
        variant: 'ghost' as const,
        ariaLabel: `Abrir lote ${row.id}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return lotesState.lots.filter((row) => {
    if (statusFilter.value !== 'Todos' && row.status !== statusFilter.value) return false
    if (accountFilter.value !== 'Todas' && row.accountId !== accountFilter.value) return false
    if (!query) return true
    return [row.id, row.reference, row.status, row.accountName]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() => buildLotesListMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, statusFilter, accountFilter], () => {
  page.value = 1
})

function openCreate() {
  Object.assign(form, createEmptyLotForm())
  formOpen.value = true
}

function refreshList() {
  toast.success('Atualizado', 'Lista de lotes recarregada (mock).')
}

function saveForm() {
  if (!form.accountId || !form.reference.trim()) {
    toast.error('Campos obrigatórios', 'Informe a referência e a conta.')
    return
  }
  const lot = createLot({
    reference: form.reference,
    accountId: form.accountId,
    fileName: form.fileName || undefined
  })
  formOpen.value = false
  toast.success('Lote criado', `#${lot.id} · ${lot.reference}`)
  navigateTo(`/operacao/lotes/${lot.id}`)
}

function onAction(payload: { row: LotRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/operacao/lotes/${payload.row.id}`)
  }
}
</script>

<template>
  <div class="lotes-page">
    <PageHeader
      title="Lotes"
      subtitle="Importação de pedidos por planilha"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        @click="refreshList"
      >
        Atualizar
      </AppButton>
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo lote
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="listMetrics"
      :max-per-row="4"
    />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por ID, referência ou conta..."
        class="w-[265px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="lotesStatusOptions"
        class="w-[180px]"
      />
      <USelectMenu
        v-model="accountFilter"
        value-key="value"
        :items="accountFilterOptions"
        class="w-[220px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1080px"
      empty-title="Nenhum lote"
      empty-description="Crie o primeiro lote ou ajuste a busca e os filtros."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="formOpen"
      variant="form"
      title="Novo lote"
      description="Informe a referência, a conta e, se quiser, o nome do arquivo XLS."
      confirm-label="Criar"
      @confirm="saveForm"
    >
      <AppFormField label="Referência *">
        <UInput
          v-model="form.reference"
          placeholder="Ex.: IMP-CB-JUL-02"
        />
      </AppFormField>
      <AppFormField label="Conta *">
        <USelectMenu
          v-model="form.accountId"
          value-key="value"
          :items="lotesAccountOptions"
        />
      </AppFormField>
      <AppFormField label="Arquivo (nome mock)">
        <UInput
          v-model="form.fileName"
          placeholder="planilha.xlsx — opcional"
        />
      </AppFormField>
    </AppModal>
  </div>
</template>
