<script setup lang="ts">
/**
 * Cadastros → Cargos — CRUD de cargos + vínculo N:N com Usuário (kind 'usuarios').
 * Sem abas/gráfico (fora de escopo). Vínculos geridos no modal "Usuários".
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Cargo, CargoUserLink } from '~/data/demo/cargos'
import {
  buildCargosMetrics,
  cargoUserOptions,
  createEmptyCargo,
  getCargoLinks,
  getCargos,
  linkedUsersCount,
  resolveUserLabel,
  setCargoLinks,
  setCargos
} from '~/data/demo/cargos'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Cargos · Cadastros · Via Reversa' })

interface CargoDisplayRow extends Record<string, unknown> {
  id: string
  name: string
  detail: string
  active: boolean
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

const usersOpen = ref(false)
const usersCargo = ref<Cargo | null>(null)
const linkRows = ref<CargoUserLink[]>([])
const linkPickerOpen = ref(false)
const selectedUserIds = ref<string[]>([])

const columns: DataTableColumn<CargoDisplayRow>[] = [
  { type: 'text', key: 'name', label: 'Cargo', width: '30%', secondaryKey: 'detail' },
  { type: 'text', key: 'linkedCount', label: 'Usuários', width: '110px', align: 'right' },
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
  formOpen.value = true
}

function openDelete(row: Cargo) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: CargoDisplayRow; action: string }) {
  if (payload.action === 'users') openUsers(payload.row)
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
      active: form.active
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

const availableUserOptions = computed(() =>
  cargoUserOptions().filter((opt) => !linkRows.value.some((link) => link.userId === opt.value))
)

function openUsers(row: Cargo) {
  usersCargo.value = row
  linkRows.value = structuredClone(getCargoLinks(row.id))
  linkPickerOpen.value = false
  selectedUserIds.value = []
  usersOpen.value = true
}

function openLinkPicker() {
  selectedUserIds.value = []
  linkPickerOpen.value = true
}

function addSelectedUsers() {
  if (!selectedUserIds.value.length) {
    toast.error('Selecione ao menos 1 usuário', 'Escolha na lista antes de vincular.')
    return
  }
  const created = selectedUserIds.value.map((userId) => ({
    id: `cul-${Date.now()}-${userId}`,
    cargoId: usersCargo.value!.id,
    userId,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }))
  linkRows.value = [...created, ...linkRows.value]
  linkPickerOpen.value = false
  selectedUserIds.value = []
}

function removeUserLink(link: CargoUserLink) {
  linkRows.value = linkRows.value.filter((row) => row.id !== link.id)
  toast.success('Removido', 'Vínculo de usuário removido (mock).')
}

function saveUsers() {
  if (!usersCargo.value) return
  setCargoLinks(usersCargo.value.id, linkRows.value)
  usersOpen.value = false
  toast.success('Salvo', `Vínculos de ${usersCargo.value.name} atualizados (mock).`)
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
      min-width="720px"
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
      v-model:open="usersOpen"
      variant="form"
      :title="usersCargo ? `Usuários · ${usersCargo.name}` : 'Usuários do cargo'"
      :description="usersCargo ? `Usuários vinculados a ${usersCargo.name}.` : ''"
      confirm-label="Salvar"
      @confirm="saveUsers"
    >
      <div class="grid gap-2">
        <div
          v-for="link in linkRows"
          :key="link.id"
          class="flex items-center justify-between gap-3 border-b border-via-line py-2 text-xs last:border-b-0"
        >
          <div class="min-w-0">
            <strong class="block truncate">{{ resolveUserLabel(link.userId) }}</strong>
            <small class="block text-via-muted">Vinculado em {{ link.linkedAt }}</small>
          </div>
          <AppButton
            variant="ghost"
            icon="i-lucide-trash-2"
            aria-label="Remover vínculo"
            @click="removeUserLink(link)"
          />
        </div>
        <p
          v-if="!linkRows.length"
          class="m-0 text-xs text-via-muted"
        >
          Nenhum usuário vinculado a este cargo.
        </p>

        <AppButton
          variant="secondary"
          icon="i-lucide-plus"
          class="justify-self-start"
          @click="openLinkPicker"
        >
          Vincular usuários
        </AppButton>

        <div
          v-if="linkPickerOpen"
          class="grid gap-3 border-t border-via-line pt-3"
        >
          <AppFormField label="Usuários *">
            <USelectMenu
              v-model="selectedUserIds"
              multiple
              value-key="value"
              :items="availableUserOptions"
              placeholder="Selecione um ou mais usuários"
            />
          </AppFormField>
          <div class="flex justify-end gap-2">
            <AppButton
              variant="secondary"
              @click="linkPickerOpen = false"
            >
              Cancelar
            </AppButton>
            <AppButton
              variant="primary"
              @click="addSelectedUsers"
            >
              Adicionar vínculos
            </AppButton>
          </div>
        </div>
      </div>
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
