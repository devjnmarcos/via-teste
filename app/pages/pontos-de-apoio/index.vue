<script setup lang="ts">
/**
 * Gestão → Pontos de apoio (listagem DS).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { PontoApoioRow } from '~/data/demo/gestao-rede'
import {
  buildPontosApoioMetrics,
  createEmptyPontoApoio,
  pontosApoioRows
} from '~/data/demo/gestao-rede'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Pontos de apoio · Via Reversa' })

const toast = useToast()
const rows = ref<PontoApoioRow[]>(structuredClone(pontosApoioRows))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<PontoApoioRow | null>(null)
const form = reactive(createEmptyPontoApoio())

const ufOptions = [
  { label: 'SP', value: 'SP' },
  { label: 'RJ', value: 'RJ' },
  { label: 'RS', value: 'RS' },
  { label: 'PR', value: 'PR' },
  { label: 'BA', value: 'BA' }
]

const columns: DataTableColumn<PontoApoioRow>[] = [
  { type: 'text', key: 'name', label: 'Ponto de apoio', width: '26%', secondaryKey: 'responsible' },
  { type: 'text', key: 'city', label: 'Cidade', width: '16%' },
  {
    type: 'select',
    key: 'state',
    label: 'UF',
    width: '88px',
    options: ufOptions
  },
  { type: 'text', key: 'capacity', label: 'Capacidade', width: '100px', align: 'right' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '100px' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '112px',
    items: [
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: 'Editar ponto de apoio' },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: 'Excluir ponto de apoio' }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.city, row.state, row.responsible]
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildPontosApoioMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch(search, () => {
  page.value = 1
})

function resetForm() {
  Object.assign(form, createEmptyPontoApoio())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: PontoApoioRow) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    city: row.city,
    state: row.state,
    responsible: row.responsible,
    capacity: row.capacity,
    statusLabel: row.statusLabel,
    active: row.active
  })
  formOpen.value = true
}

function onAction(payload: { row: PontoApoioRow; action: string }) {
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') {
    pendingDelete.value = payload.row
    deleteOpen.value = true
  }
}

function onSwitch(payload: { row: PontoApoioRow; key: string; value: boolean }) {
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target && payload.key === 'active') {
    target.active = payload.value
    target.statusLabel = payload.value ? 'Ativo' : 'Pausado'
  }
}

function onSelect(payload: { row: PontoApoioRow; key: string; value: string }) {
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target && payload.key === 'state') target.state = payload.value
}

function saveForm() {
  if (!form.name.trim()) {
    toast.error('Campo obrigatório', 'Informe o nome do ponto de apoio.')
    return
  }
  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) Object.assign(target, { ...form, name: form.name.trim() })
  }
  else {
    rows.value = [
      {
        id: `pa-${Date.now()}`,
        ...form,
        name: form.name.trim(),
        statusLabel: form.active ? 'Ativo' : 'Pausado'
      },
      ...rows.value
    ]
  }
  formOpen.value = false
  resetForm()
  toast.success('Salvo', 'Ponto de apoio atualizado (mock).')
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
  <div class="pontos-apoio-page">
    <PageHeader
      title="Pontos de apoio"
      subtitle="Rede operacional de coleta e consolidação"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo ponto de apoio
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
        placeholder="Buscar ponto, cidade ou responsável…"
        class="w-[300px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="960px"
      empty-title="Nenhum ponto de apoio"
      empty-description="Cadastre o primeiro ponto ou ajuste a busca."
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
      :title="editingId ? 'Editar ponto de apoio' : 'Novo ponto de apoio'"
      description="Dados operacionais da unidade de apoio."
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Nome *">
        <UInput
          v-model="form.name"
          placeholder="Ponto de apoio Zona Sul"
        />
      </AppFormField>
      <div class="grid grid-cols-2 gap-2.5">
        <AppFormField label="Cidade">
          <UInput v-model="form.city" />
        </AppFormField>
        <AppFormField label="UF">
          <USelectMenu
            v-model="form.state"
            value-key="value"
            :items="ufOptions"
          />
        </AppFormField>
      </div>
      <AppFormField label="Responsável">
        <UInput v-model="form.responsible" />
      </AppFormField>
      <AppFormField label="Capacidade (pedidos/dia)">
        <UInput v-model="form.capacity" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir ponto de apoio"
      :description="pendingDelete ? `“${pendingDelete.name}” será removido. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
