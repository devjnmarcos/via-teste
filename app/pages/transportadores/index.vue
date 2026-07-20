<script setup lang="ts">
/**
 * Gestão → Transportadores (listagem DS).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { TransportadorRow } from '~/data/demo/gestao-rede'
import {
  buildTransportadoresMetrics,
  createEmptyTransportador,
  transportadoresRows
} from '~/data/demo/gestao-rede'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Transportadores · Via Reversa' })

const toast = useToast()
const rows = ref<TransportadorRow[]>(structuredClone(transportadoresRows))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<TransportadorRow | null>(null)
const form = reactive(createEmptyTransportador())

const typeOptions = [
  { label: 'Motoboy', value: 'Motoboy' },
  { label: 'Van', value: 'Van' },
  { label: 'Carro', value: 'Carro' }
]

const columns: DataTableColumn<TransportadorRow>[] = [
  { type: 'text', key: 'name', label: 'Transportador', width: '22%', secondaryKey: 'phone' },
  {
    type: 'select',
    key: 'type',
    label: 'Tipo',
    width: '120px',
    options: typeOptions
  },
  { type: 'text', key: 'region', label: 'Região', width: '22%' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '100px' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '112px',
    items: [
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: 'Editar transportador' },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: 'Excluir transportador' }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.type, row.region, row.phone]
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildTransportadoresMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch(search, () => {
  page.value = 1
})

function resetForm() {
  Object.assign(form, createEmptyTransportador())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: TransportadorRow) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    type: row.type,
    region: row.region,
    phone: row.phone,
    statusLabel: row.statusLabel,
    active: row.active
  })
  formOpen.value = true
}

function onAction(payload: { row: TransportadorRow; action: string }) {
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') {
    pendingDelete.value = payload.row
    deleteOpen.value = true
  }
}

function onSwitch(payload: { row: TransportadorRow; key: string; value: boolean }) {
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target && payload.key === 'active') {
    target.active = payload.value
    target.statusLabel = payload.value ? 'Ativo' : 'Inativo'
  }
}

function onSelect(payload: { row: TransportadorRow; key: string; value: string }) {
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target && payload.key === 'type') target.type = payload.value
}

function saveForm() {
  if (!form.name.trim()) {
    toast.error('Campo obrigatório', 'Informe o nome do transportador.')
    return
  }
  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) Object.assign(target, { ...form, name: form.name.trim() })
  }
  else {
    rows.value = [
      {
        id: `tr-${Date.now()}`,
        ...form,
        name: form.name.trim(),
        statusLabel: form.active ? 'Ativo' : 'Inativo'
      },
      ...rows.value
    ]
  }
  formOpen.value = false
  resetForm()
  toast.success('Salvo', 'Transportador atualizado (mock).')
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  toast.success('Excluído', `${pendingDelete.value.name} removido (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="transportadores-page">
    <PageHeader
      title="Transportadores"
      subtitle="Rede de coleta e entrega atribuída aos pedidos"
    >
      <AppButton
        to="/cadastros/aprovacoes-pas"
        icon="i-lucide-user-check"
        variant="ghost"
      >
        Aprovações
      </AppButton>
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo transportador
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="listMetrics"
      :max-per-row="3"
    />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar nome, tipo ou região…"
        class="w-[300px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="920px"
      empty-title="Nenhum transportador"
      empty-description="Cadastre o primeiro transportador ou ajuste a busca."
      @action="onAction"
      @update:switch="onSwitch"
      @update:select="onSelect"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar transportador' : 'Novo transportador'"
      description="Dados de contato e modalidade."
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Nome *">
        <UInput
          v-model="form.name"
          placeholder="Marcos L."
        />
      </AppFormField>
      <AppFormField label="Tipo">
        <USelectMenu
          v-model="form.type"
          value-key="value"
          :items="typeOptions"
        />
      </AppFormField>
      <AppFormField label="Região">
        <UInput
          v-model="form.region"
          placeholder="SP · Zona Sul"
        />
      </AppFormField>
      <AppFormField label="Telefone">
        <UInput
          v-model="form.phone"
          placeholder="(11) 90000-0000"
        />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir transportador"
      :description="pendingDelete ? `“${pendingDelete.name}” será removido. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
