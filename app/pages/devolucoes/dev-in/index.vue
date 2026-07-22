<script setup lang="ts">
/**
 * Listagem DEV IN — caixas de entrada de devolução ao fornecedor.
 * Create em AppModal; fechar via confirm; detalhe em página dedicada.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { DevInBoxRow } from '~/data/demo/devolucoes-dev-in'
import {
  closeDevInBox,
  createDevInBox,
  createEmptyDevInBox,
  devolucoesCompanyOptions,
  devInState
} from '~/data/demo/devolucoes-dev-in'
import { buildDevInListMetrics } from '~/utils/devolucoes-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'

useSeoMeta({ title: 'Caixas · Remessas · Via Reversa' })

const route = useRoute()

const search = ref('')
const statusFilter = ref<'Todos' | 'Aberto' | 'Fechado'>('Todos')
const companyFilter = ref<string>('Todas')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const closeOpen = ref(false)
const pendingClose = ref<DevInBoxRow | null>(null)
const form = reactive(createEmptyDevInBox())

const statusOptions = [
  { label: 'Todos os status', value: 'Todos' },
  { label: 'Aberto', value: 'Aberto' },
  { label: 'Fechado', value: 'Fechado' }
]

const companyFilterOptions = computed(() => [
  { label: 'Todas as empresas', value: 'Todas' },
  ...devolucoesCompanyOptions
])

const columns: DataTableColumn<DevInBoxRow>[] = [
  { type: 'text', key: 'id', label: 'Caixa', width: '72px' },
  { type: 'text', key: 'companyName', label: 'Empresa', width: '18%' },
  { type: 'text', key: 'createdByName', label: 'Criado por', width: '12%' },
  { type: 'text', key: 'status', label: 'Status', width: '90px' },
  { type: 'text', key: 'createdAtLabel', label: 'Aberto em', width: '130px' },
  { type: 'text', key: 'closedAtLabel', label: 'Fechado em', width: '130px' },
  { type: 'text', key: 'totItemsIn', label: 'Itens', width: '72px', align: 'right' },
  { type: 'text', key: 'lotOutStatus', label: 'Status Despachos', width: '120px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '148px',
    items: (row) => {
      const actions = [
        {
          key: 'open',
          label: 'Abrir',
          icon: 'i-lucide-eye',
          variant: 'ghost' as const,
          ariaLabel: `Abrir caixa ${row.id}`
        }
      ]
      if (row.status === 'Aberto' && row.totItemsIn > 0) {
        actions.push({
          key: 'close',
          label: 'Fechar',
          icon: 'i-lucide-lock',
          variant: 'ghost' as const,
          ariaLabel: `Fechar caixa ${row.id}`
        })
      }
      if (row.status === 'Fechado') {
        actions.push({
          key: 'ticket',
          label: 'Ticket',
          icon: 'i-lucide-printer',
          variant: 'ghost' as const,
          ariaLabel: `Ticket da caixa ${row.id}`
        })
      }
      return actions
    }
  }
]

function applyQueryFilters() {
  const status = route.query.status
  if (status === 'Aberto' || status === 'Fechado') {
    statusFilter.value = status
  }
}

applyQueryFilters()
watch(() => route.query.status, applyQueryFilters)

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return devInState.boxes.filter((row) => {
    if (statusFilter.value !== 'Todos' && row.status !== statusFilter.value) return false
    if (companyFilter.value !== 'Todas' && row.companyId !== companyFilter.value) return false
    if (!query) return true
    return [row.id, row.companyName, row.createdByName, row.status, row.lotOutStatus]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() => buildDevInListMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, statusFilter, companyFilter], () => {
  page.value = 1
})

function openCreate() {
  Object.assign(form, createEmptyDevInBox())
  formOpen.value = true
}

function saveForm() {
  if (!form.companyId) return
  const box = createDevInBox({ companyId: form.companyId, notes: form.notes })
  formOpen.value = false
  navigateTo(`/devolucoes/dev-in/${box.id}`)
}

function openClose(row: DevInBoxRow) {
  pendingClose.value = row
  closeOpen.value = true
}

function confirmClose() {
  if (!pendingClose.value) return
  closeDevInBox(pendingClose.value.id)
  pendingClose.value = null
  closeOpen.value = false
}

function onAction(payload: { row: DevInBoxRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/devolucoes/dev-in/${payload.row.id}`)
    return
  }
  if (payload.action === 'close') {
    openClose(payload.row)
    return
  }
  if (payload.action === 'ticket') {
    navigateTo(`/devolucoes/dev-in/${payload.row.id}/ticket`)
  }
}
</script>

<template>
  <div class="devolucao-page">
    <PageHeader
      title="Caixas"
      subtitle="Entrada de Devolução ao Fornecedor"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Nova caixa
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="listMetrics" />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por caixa, empresa ou responsável..."
        class="w-[265px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="statusOptions"
        class="filter-select"
      />
      <USelectMenu
        v-model="companyFilter"
        value-key="value"
        :items="companyFilterOptions"
        class="filter-select filter-select--wide"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="1080px"
      empty-title="Nenhuma caixa"
      empty-description="Crie a primeira caixa ou ajuste a busca e os filtros."
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
      title="Nova caixa"
      description="Selecione a empresa e, se quiser, uma observação operacional."
      confirm-label="Criar"
      @confirm="saveForm"
    >
      <AppFormField label="Empresa *">
        <USelectMenu
          v-model="form.companyId"
          value-key="value"
          :items="devolucoesCompanyOptions"
        />
      </AppFormField>
      <AppFormField label="Observação">
        <UInput
          v-model="form.notes"
          placeholder="Opcional"
        />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="closeOpen"
      variant="confirm"
      title="Fechar caixa"
      :description="pendingClose
        ? `A caixa #${pendingClose.id} será fechada e deixará de receber novos itens. Confirme apenas se a conferência estiver concluída.`
        : ''"
      confirm-label="Fechar caixa"
      confirm-variant="primary"
      @confirm="confirmClose"
    />
  </div>
</template>

