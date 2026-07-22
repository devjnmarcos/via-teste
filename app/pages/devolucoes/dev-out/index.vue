<script setup lang="ts">
/**
 * Listagem DEV OUT — lotes de saída de devolução ao fornecedor.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { DevOutLotRow } from '~/data/demo/devolucoes-dev-out'
import {
  closeDevOutLot,
  createDevOutLot,
  createEmptyDevOutLot,
  deleteDevOutLot,
  devolucoesCompanyOptions,
  distributionCenterOptions,
  devOutState,
  returnDevOutLot
} from '~/data/demo/devolucoes-dev-out'
import { buildDevOutListMetrics } from '~/utils/devolucoes-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'

useSeoMeta({ title: 'Despachos · Remessas · Via Reversa' })

const route = useRoute()

const search = ref('')
const statusFilter = ref<'Todos' | 'Aberto' | 'Fechado' | 'Devolvido'>('Todos')
const companyFilter = ref<string>('Todas')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const closeOpen = ref(false)
const returnOpen = ref(false)
const deleteOpen = ref(false)
const pendingLot = ref<DevOutLotRow | null>(null)
const form = reactive(createEmptyDevOutLot())

const statusOptions = [
  { label: 'Todos os status', value: 'Todos' },
  { label: 'Aberto', value: 'Aberto' },
  { label: 'Fechado', value: 'Fechado' },
  { label: 'Devolvido', value: 'Devolvido' }
]

const companyFilterOptions = computed(() => [
  { label: 'Todas as empresas', value: 'Todas' },
  ...devolucoesCompanyOptions
])

const columns: DataTableColumn<DevOutLotRow>[] = [
  { type: 'text', key: 'id', label: 'Lote', width: '72px' },
  { type: 'text', key: 'companyName', label: 'Empresa destino', width: '18%' },
  { type: 'text', key: 'status', label: 'Status', width: '100px' },
  { type: 'text', key: 'createdAtLabel', label: 'Criado em', width: '130px' },
  { type: 'text', key: 'closedAtLabel', label: 'Fechado em', width: '130px' },
  { type: 'text', key: 'totBoxesIn', label: 'Caixas', width: '72px', align: 'right' },
  { type: 'text', key: 'shippingForecastLabel', label: 'Previsão envio', width: '120px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '160px',
    items: (row) => {
      const actions = [
        {
          key: 'open',
          label: 'Abrir',
          icon: 'i-lucide-eye',
          variant: 'ghost' as const,
          ariaLabel: `Abrir lote ${row.id}`
        }
      ]
      if (row.status === 'Aberto' && row.totBoxesIn > 0) {
        actions.push({
          key: 'close',
          label: 'Fechar',
          icon: 'i-lucide-lock',
          variant: 'ghost' as const,
          ariaLabel: `Fechar lote ${row.id}`
        })
      }
      if (row.status === 'Fechado') {
        actions.push({
          key: 'return',
          label: 'Devolver',
          icon: 'i-lucide-undo-2',
          variant: 'ghost' as const,
          ariaLabel: `Devolver lote ${row.id}`
        })
      }
      if (row.totBoxesIn === 0) {
        actions.push({
          key: 'delete',
          label: 'Excluir',
          icon: 'i-lucide-trash-2',
          variant: 'ghost' as const,
          ariaLabel: `Excluir lote ${row.id}`
        })
      }
      return actions
    }
  }
]

function applyQueryFilters() {
  const status = route.query.status
  if (status === 'Aberto' || status === 'Fechado' || status === 'Devolvido') {
    statusFilter.value = status
  }
}

applyQueryFilters()
watch(() => route.query.status, applyQueryFilters)

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return devOutState.lots.filter((row) => {
    if (statusFilter.value !== 'Todos' && row.status !== statusFilter.value) return false
    if (companyFilter.value !== 'Todas' && row.companyId !== companyFilter.value) return false
    if (!query) return true
    return [row.id, row.companyName, row.status, row.distributionCenter]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() => buildDevOutListMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, statusFilter, companyFilter], () => {
  page.value = 1
})

function openCreate() {
  Object.assign(form, createEmptyDevOutLot())
  formOpen.value = true
}

function saveForm() {
  if (!form.companyId || !form.distributionCenter) return
  const lot = createDevOutLot({
    companyId: form.companyId,
    distributionCenter: form.distributionCenter,
    shippingForecastLabel: form.shippingForecastLabel
  })
  formOpen.value = false
  navigateTo(`/devolucoes/dev-out/${lot.id}`)
}

function onAction(payload: { row: DevOutLotRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/devolucoes/dev-out/${payload.row.id}`)
    return
  }
  pendingLot.value = payload.row
  if (payload.action === 'close') closeOpen.value = true
  if (payload.action === 'return') returnOpen.value = true
  if (payload.action === 'delete') deleteOpen.value = true
}

function confirmClose() {
  if (!pendingLot.value) return
  closeDevOutLot(pendingLot.value.id)
  pendingLot.value = null
  closeOpen.value = false
}

function confirmReturn() {
  if (!pendingLot.value) return
  returnDevOutLot(pendingLot.value.id)
  pendingLot.value = null
  returnOpen.value = false
}

function confirmDelete() {
  if (!pendingLot.value) return
  deleteDevOutLot(pendingLot.value.id)
  pendingLot.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="devolucao-page">
    <PageHeader
      title="Despachos"
      subtitle="Saída de Devolução ao Fornecedor"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo lote
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
        placeholder="Buscar por lote, empresa ou CD..."
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
      min-width="1040px"
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
      description="Informe empresa destino, centro de distribuição e previsão de envio."
      confirm-label="Criar"
      @confirm="saveForm"
    >
      <AppFormField label="Empresa destino *">
        <USelectMenu
          v-model="form.companyId"
          value-key="value"
          :items="devolucoesCompanyOptions"
        />
      </AppFormField>
      <AppFormField label="Centro de distribuição *">
        <USelectMenu
          v-model="form.distributionCenter"
          value-key="value"
          :items="distributionCenterOptions"
        />
      </AppFormField>
      <AppFormField label="Previsão de envio">
        <UInput
          v-model="form.shippingForecastLabel"
          placeholder="Ex.: 22/07/2026"
        />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="closeOpen"
      variant="confirm"
      title="Fechar lote"
      :description="pendingLot
        ? `O lote #${pendingLot.id} será fechado e não aceitará novas caixas.`
        : ''"
      confirm-label="Fechar lote"
      confirm-variant="primary"
      @confirm="confirmClose"
    />

    <AppModal
      v-model:open="returnOpen"
      variant="confirm"
      title="Devolver lote"
      :description="pendingLot
        ? `O lote #${pendingLot.id} passará para o status Devolvido, conforme a operação atual.`
        : ''"
      confirm-label="Devolver"
      confirm-variant="primary"
      @confirm="confirmReturn"
    />

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir lote"
      :description="pendingLot
        ? `O lote #${pendingLot.id} será removido. Esta ação não pode ser desfeita.`
        : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>

