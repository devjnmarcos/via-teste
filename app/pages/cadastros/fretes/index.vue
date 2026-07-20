<script setup lang="ts">
/**
 * Piloto Fretes — create/edit em modal (formulário curto).
 * Delete: confirmação simples. Reutiliza DataTable + AppModal do DS.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { FreteRow } from '~/data/demo/fretes'
import { createEmptyFrete, fretesDemoRows } from '~/data/demo/fretes'

useSeoMeta({ title: 'Fretes · Cadastros · Via Reversa' })

const rows = ref<FreteRow[]>(structuredClone(fretesDemoRows))
const search = ref('')

const formOpen = ref(false)
const deleteOpen = ref(false)
const calcOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<FreteRow | null>(null)

const form = reactive(createEmptyFrete())

const ufOptions = [
  { label: 'SP', value: 'SP' },
  { label: 'RJ', value: 'RJ' },
  { label: 'MG', value: 'MG' },
  { label: 'RS', value: 'RS' },
  { label: 'PR', value: 'PR' }
]

const columns: DataTableColumn<FreteRow>[] = [
  { type: 'text', key: 'description', label: 'Descrição', width: '22%' },
  {
    type: 'select',
    key: 'originState',
    label: 'UF origem',
    width: '96px',
    options: ufOptions
  },
  { type: 'text', key: 'originCity', label: 'Cidade origem', width: '18%' },
  { type: 'text', key: 'kmLimit', label: 'Limite KM', width: '90px', align: 'right' },
  { type: 'text', key: 'weightMaxKg', label: 'Peso máx. (kg)', width: '110px', align: 'right' },
  { type: 'text', key: 'maxDimension', label: 'Dimensão máx.', width: '130px' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '112px',
    items: [
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: 'Editar frete' },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: 'Excluir frete' }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.description, row.originState, row.originCity]
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

function resetForm() {
  Object.assign(form, createEmptyFrete())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: FreteRow) {
  editingId.value = row.id
  Object.assign(form, {
    description: row.description,
    originState: row.originState,
    originCity: row.originCity,
    kmLimit: row.kmLimit,
    weightMinKg: row.weightMinKg,
    weightMaxKg: row.weightMaxKg,
    maxDimension: row.maxDimension,
    active: row.active
  })
  formOpen.value = true
}

function openDelete(row: FreteRow) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: FreteRow; action: string }) {
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: FreteRow; key: string; value: boolean }) {
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target && payload.key === 'active') target.active = payload.value
}

function onSelect(payload: { row: FreteRow; key: string; value: string }) {
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target && payload.key === 'originState') target.originState = payload.value
}

function saveForm() {
  if (!form.description.trim() || !form.originCity.trim()) return
  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.description = form.description.trim()
      target.originState = form.originState
      target.originCity = form.originCity.trim()
      target.kmLimit = form.kmLimit
      target.weightMinKg = form.weightMinKg
      target.weightMaxKg = form.weightMaxKg
      target.maxDimension = form.maxDimension
      target.active = form.active
    }
  }
  else {
    rows.value = [
      {
        id: `fr-${Date.now()}`,
        description: form.description.trim(),
        originState: form.originState,
        originCity: form.originCity.trim(),
        kmLimit: form.kmLimit,
        weightMinKg: form.weightMinKg,
        weightMaxKg: form.weightMaxKg,
        maxDimension: form.maxDimension,
        active: form.active
      },
      ...rows.value
    ]
  }
  formOpen.value = false
  resetForm()
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  pendingDelete.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="cadastro-pilot">
    <PageHeader
      title="Fretes"
      subtitle="Tabelas de preço de frete por origem, KM, peso e dimensão"
    >
      <AppButton
        icon="i-lucide-calculator"
        @click="calcOpen = true"
      >
        Calculadora
      </AppButton>
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo frete
      </AppButton>
    </PageHeader>

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por descrição, UF ou cidade..."
        class="w-[265px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="filteredRows"
      min-width="980px"
      empty-title="Nenhuma tabela de frete"
      empty-description="Cadastre a primeira tabela ou ajuste a busca."
      @action="onAction"
      @update:switch="onSwitch"
      @update:select="onSelect"
    />

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar frete' : 'Novo frete'"
      :description="editingId ? 'Atualize os parâmetros da tabela de frete.' : 'Informe origem e limites da nova tabela.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Descrição *">
        <UInput
          v-model="form.description"
          placeholder="Ex.: Grande SP · leve"
        />
      </AppFormField>
      <div class="grid grid-cols-2 gap-2.5">
        <AppFormField label="UF origem">
          <USelectMenu
            v-model="form.originState"
            value-key="value"
            :items="ufOptions"
          />
        </AppFormField>
        <AppFormField label="Cidade origem *">
          <UInput
            v-model="form.originCity"
            placeholder="Cidade"
          />
        </AppFormField>
      </div>
      <div class="grid grid-cols-3 gap-2.5">
        <AppFormField label="Limite KM">
          <UInput v-model="form.kmLimit" />
        </AppFormField>
        <AppFormField label="Peso mín. (kg)">
          <UInput v-model="form.weightMinKg" />
        </AppFormField>
        <AppFormField label="Peso máx. (kg)">
          <UInput v-model="form.weightMaxKg" />
        </AppFormField>
      </div>
      <AppFormField label="Dimensão máx. (L×A×C cm)">
        <UInput
          v-model="form.maxDimension"
          placeholder="60×60×60"
        />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir frete"
      :description="pendingDelete ? `A tabela “${pendingDelete.description}” e seus itens serão removidos. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />

    <FreightCalculatorModal v-model:open="calcOpen" />
  </div>
</template>

