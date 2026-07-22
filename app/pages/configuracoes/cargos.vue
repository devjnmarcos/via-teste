<script setup lang="ts">
/**
 * Configurações → Cargos — CRUD de cargos (mock). O vínculo N:N com Usuário
 * (kind 'usuarios' em cadastros-onda3.ts) vive na página de detalhe
 * (/configuracoes/cargos/:id) — "Ver usuários" navega em vez de abrir modal.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Cargo } from '~/data/demo/cargos'
import {
  buildCargosMetrics,
  createEmptyCargo,
  getCargos,
  linkedUsersCount,
  setCargos
} from '~/data/demo/cargos'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Cargos · Configurações · Via Reversa' })

interface CargoDisplayRow extends Record<string, unknown> {
  id: string
  name: string
  detail: string
  active: boolean
  createdAt: string
  linkedCount: number
}

const toast = useToast()

const rows = ref<Cargo[]>(structuredClone(getCargos()))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<Cargo | null>(null)
const form = reactive(createEmptyCargo())

const columns: DataTableColumn<CargoDisplayRow>[] = [
  { type: 'text', key: 'name', label: 'Cargo', width: '26%', secondaryKey: 'detail' },
  { type: 'text', key: 'createdAt', label: 'Criado em', width: '110px' },
  { type: 'text', key: 'linkedCount', label: 'Usuários', width: '100px', align: 'right' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '210px',
    items: (row) => [
      { key: 'users', label: 'Ver usuários', icon: 'i-lucide-users', variant: 'ghost', ariaLabel: `Ver usuários de ${row.name}` },
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.name}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.name}` }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.detail].some((value) => value.toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildCargosMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const displayRows = computed((): CargoDisplayRow[] =>
  pagedRows.value.map((row) => ({ ...row, linkedCount: linkedUsersCount(row.id) }))
)

watch(search, () => {
  page.value = 1
})

function persist() {
  setCargos(structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyCargo())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: Cargo) {
  editingId.value = row.id
  form.name = row.name
  form.detail = row.detail
  form.active = row.active
  form.createdAt = row.createdAt
  formOpen.value = true
}

function openDelete(row: Cargo) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: CargoDisplayRow; action: string }) {
  if (payload.action === 'users') navigateTo(`/configuracoes/cargos/${payload.row.id}`)
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: CargoDisplayRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target) {
    target.active = payload.value
    persist()
  }
}

function saveForm() {
  if (!form.name.trim()) {
    toast.error('Campo obrigatório', 'Informe o nome do cargo antes de salvar.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.detail = form.detail.trim()
      target.active = form.active
    }
  }
  else {
    const created: Cargo = {
      id: `cgo-${Date.now()}`,
      name: form.name.trim(),
      detail: form.detail.trim(),
      active: form.active,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `Cargo ${wasEdit ? 'atualizado' : 'criado'} (mock).`)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  persist()
  toast.success('Excluído', `${pendingDelete.value.name} removido (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="cargos-page">
    <PageHeader
      title="Cargos"
      subtitle="Cargos vinculados a usuários do sistema (mock)"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo cargo
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="listMetrics" />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar cargo…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="displayRows"
      min-width="760px"
      empty-title="Nenhum cargo"
      empty-description="Cadastre o primeiro cargo ou ajuste a busca."
      @action="onAction"
      @update:switch="onSwitch"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar cargo' : 'Novo cargo'"
      :description="editingId ? 'Atualize os dados do cargo.' : 'Informe os dados do novo cargo.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Nome *">
        <UInput
          v-model="form.name"
          placeholder="Ex.: Coordenador de Operações"
        />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput
          v-model="form.detail"
          placeholder="Descreva a responsabilidade do cargo"
        />
      </AppFormField>
      <AppFormField label="Ativo">
        <USwitch v-model="form.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir cargo"
      :description="pendingDelete ? `“${pendingDelete.name}” será removido. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
