<script setup lang="ts">
/**
 * Piloto SLA — create/edit em modal (formulário curto, sem abas/relações pesadas).
 * Delete: confirmação simples. Expand nativo da DataTable para termos/subitens.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { SlaConfigRow } from '~/data/demo/sla'
import { createEmptySla, slaDemoRows } from '~/data/demo/sla'

useSeoMeta({ title: 'SLA · Cadastros · Via Reversa' })

const rows = ref<SlaConfigRow[]>(structuredClone(slaDemoRows))
const search = ref('')
const expandedKeys = ref<string[]>([])

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<SlaConfigRow | null>(null)

const form = reactive(createEmptySla())

const columns: DataTableColumn<SlaConfigRow>[] = [
  { type: 'expand', key: 'expand', width: '48px' },
  { type: 'text', key: 'name', label: 'Conta', width: '22%' },
  { type: 'text', key: 'cutoffTime', label: 'Corte', width: '90px' },
  { type: 'text', key: 'toleranceTime', label: 'Tolerância', width: '100px' },
  { type: 'text', key: 'endTime', label: 'Término', width: '90px' },
  { type: 'text', key: 'blockedWeekdays', label: 'Dias bloqueados' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '112px',
    items: [
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: 'Editar SLA' },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: 'Excluir SLA' }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.cutoffTime, row.blockedWeekdays]
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

function resetForm() {
  Object.assign(form, createEmptySla())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: SlaConfigRow) {
  editingId.value = row.id
  form.name = row.name
  form.cutoffTime = row.cutoffTime
  form.toleranceTime = row.toleranceTime
  form.endTime = row.endTime
  form.blockedWeekdays = row.blockedWeekdays
  form.active = row.active
  formOpen.value = true
}

function openDelete(row: SlaConfigRow) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: SlaConfigRow; action: string }) {
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: SlaConfigRow; key: string; value: boolean }) {
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target && payload.key === 'active') target.active = payload.value
}

function saveForm() {
  if (!form.name.trim()) return
  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.cutoffTime = form.cutoffTime
      target.toleranceTime = form.toleranceTime
      target.endTime = form.endTime
      target.blockedWeekdays = form.blockedWeekdays
      target.active = form.active
    }
  }
  else {
    rows.value = [
      {
        id: `sla-${Date.now()}`,
        name: form.name.trim(),
        cutoffTime: form.cutoffTime,
        toleranceTime: form.toleranceTime,
        endTime: form.endTime,
        blockedWeekdays: form.blockedWeekdays,
        active: form.active,
        terms: []
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
      title="SLA"
      subtitle="Tabelas de SLA por conta — corte, tolerância e termos por cidade"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo SLA
      </AppButton>
    </PageHeader>

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por conta ou dias bloqueados..."
        class="w-[265px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <DataTable
      v-model:expanded-keys="expandedKeys"
      :columns="columns"
      :rows="filteredRows"
      min-width="920px"
      empty-title="Nenhuma tabela de SLA"
      empty-description="Cadastre a primeira tabela ou ajuste a busca."
      @action="onAction"
      @update:switch="onSwitch"
    >
      <template #expand="{ row }">
        <div
          v-if="row.terms.length"
          class="sla-terms"
        >
          <table class="w-full border-collapse [&_td]:border-b [&_td]:border-via-line [&_td]:px-2.5 [&_td]:py-2 [&_td]:text-left [&_td]:text-xs [&_th]:border-b [&_th]:border-via-line [&_th]:px-2.5 [&_th]:py-2 [&_th]:text-left [&_th]:text-[10px] [&_th]:font-bold [&_th]:tracking-[0.04em] [&_th]:text-via-muted [&_th]:uppercase">
            <thead>
              <tr>
                <th>Cidade</th>
                <th>Estado</th>
                <th>SLA</th>
                <th>Feriados</th>
                <th>Dia / Hora</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="term in row.terms"
                :key="term.id"
              >
                <td>{{ term.city }}</td>
                <td>{{ term.state }}</td>
                <td>{{ term.slaHours }}</td>
                <td>{{ term.holidaysBlocked ? 'Bloqueados' : 'Ignorados' }}</td>
                <td>{{ term.dayHour }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          v-else
          class="m-0 text-xs text-via-muted"
        >
          Sem termos cadastrados nesta tabela.
        </p>
      </template>
    </DataTable>

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar SLA' : 'Novo SLA'"
      :description="editingId ? 'Atualize os parâmetros da tabela de SLA.' : 'Informe conta e horários da nova tabela.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Conta *">
        <UInput
          v-model="form.name"
          placeholder="Ex.: CB · CD Cajamar"
        />
      </AppFormField>
      <div class="grid grid-cols-3 gap-2.5">
        <AppFormField label="Corte">
          <UInput
            v-model="form.cutoffTime"
            type="time"
          />
        </AppFormField>
        <AppFormField label="Tolerância">
          <UInput
            v-model="form.toleranceTime"
            type="time"
          />
        </AppFormField>
        <AppFormField label="Término">
          <UInput
            v-model="form.endTime"
            type="time"
          />
        </AppFormField>
      </div>
      <AppFormField label="Dias bloqueados">
        <UInput
          v-model="form.blockedWeekdays"
          placeholder="Ex.: Sáb, Dom"
        />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir SLA"
      :description="pendingDelete ? `A tabela “${pendingDelete.name}” e seus termos serão removidos. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>

