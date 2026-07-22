<script setup lang="ts">
/**
 * Configurações → Cargos → detalhe — informações do cargo + gestão dos vínculos com
 * Usuário (kind 'usuarios' em cadastros-onda3.ts). Substitui o antigo modal "Usuários"
 * da listagem.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { CadastroOnda3Row } from '~/data/demo/cadastros-onda3'
import { getCadastroOnda3Rows } from '~/data/demo/cadastros-onda3'
import type { Cargo, CargoUserLink } from '~/data/demo/cargos'
import {
  buildCargoDetailMetrics,
  cargoUserOptions,
  getCargoLinks,
  getCargos,
  setCargoLinks,
  setCargos
} from '~/data/demo/cargos'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

interface UserLinkRow extends Record<string, unknown> {
  id: string
  userId: string
  name: string
  detail: string
  meta: string
  keyword: string
  isTransporterLabel: string
  active: boolean
  linkedAt: string
}

const route = useRoute()
const toast = useToast()
const cargoId = computed(() => String(route.params.id ?? ''))

const cargo = ref<Cargo | null>(null)

function loadCargo() {
  const found = getCargos().find((row) => row.id === cargoId.value)
  cargo.value = found ? structuredClone(found) : null
}
loadCargo()

if (!cargo.value) {
  throw createError({ statusCode: 404, statusMessage: 'Cargo não encontrado' })
}

useSeoMeta({ title: () => `${cargo.value?.name ?? 'Cargo'} · Configurações · Via Reversa` })

const links = ref<CargoUserLink[]>(structuredClone(getCargoLinks(cargoId.value)))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const editOpen = ref(false)
const editForm = reactive({ name: '', detail: '', active: true })

const pickerOpen = ref(false)
const selectedUserIds = ref<string[]>([])

const usersById = computed(() => new Map(getCadastroOnda3Rows('usuarios').map((row) => [row.id, row])))

const linkedUserRows = computed(() =>
  links.value
    .map((link) => {
      const user: CadastroOnda3Row | undefined = usersById.value.get(link.userId)
      return user ? { link, user } : null
    })
    .filter((entry): entry is { link: CargoUserLink; user: CadastroOnda3Row } => entry !== null)
)

const enrichedLinks = computed((): UserLinkRow[] =>
  linkedUserRows.value.map(({ link, user }) => ({
    id: link.id,
    userId: link.userId,
    name: user.name,
    detail: user.detail,
    meta: user.meta,
    keyword: user.keyword ?? '—',
    isTransporterLabel: user.isTransporter ? 'Sim' : 'Não',
    active: user.active,
    linkedAt: link.linkedAt
  }))
)

const filteredLinks = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return enrichedLinks.value
  return enrichedLinks.value.filter((row) =>
    [row.name, row.detail, row.meta, row.keyword].some((value) => value.toLowerCase().includes(query))
  )
})

const pagedLinks = computed(() => slicePage(filteredLinks.value, page.value, pageSize.value))
const metrics = computed(() =>
  cargo.value ? buildCargoDetailMetrics(cargo.value, linkedUserRows.value.map(({ user }) => user)) : []
)

const availableUserOptions = computed(() =>
  cargoUserOptions().filter((opt) => !links.value.some((link) => link.userId === opt.value))
)

const linkColumns: DataTableColumn<UserLinkRow>[] = [
  { type: 'text', key: 'name', label: 'Usuário', width: '20%', secondaryKey: 'detail' },
  { type: 'text', key: 'meta', label: 'Papel', width: '14%' },
  { type: 'text', key: 'keyword', label: 'E-mail', width: '22%' },
  { type: 'text', key: 'isTransporterLabel', label: 'Transportador', width: '120px' },
  { type: 'text', key: 'linkedAt', label: 'Vinculado em', width: '130px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '90px',
    items: (row) => [
      { key: 'remove', label: 'Remover', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Remover ${row.name}` }
    ]
  }
]

watch(search, () => {
  page.value = 1
})

function openEditCargo() {
  if (!cargo.value) return
  editForm.name = cargo.value.name
  editForm.detail = cargo.value.detail
  editForm.active = cargo.value.active
  editOpen.value = true
}

function saveEditCargo() {
  if (!cargo.value) return
  if (!editForm.name.trim()) {
    toast.error('Campo obrigatório', 'Informe o nome do cargo antes de salvar.')
    return
  }
  const updatedId = cargo.value.id
  const rows = getCargos().map((row) =>
    row.id === updatedId
      ? { ...row, name: editForm.name.trim(), detail: editForm.detail.trim(), active: editForm.active }
      : row
  )
  setCargos(rows)
  loadCargo()
  editOpen.value = false
  toast.success('Salvo', 'Cargo atualizado (mock).')
}

function openPicker() {
  selectedUserIds.value = []
  pickerOpen.value = true
}

function confirmPicker() {
  if (!selectedUserIds.value.length) {
    toast.error('Selecione ao menos 1 usuário', 'Escolha na lista antes de vincular.')
    return
  }
  const created = selectedUserIds.value.map((userId) => ({
    id: `cul-${Date.now()}-${userId}`,
    cargoId: cargoId.value,
    userId,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }))
  links.value = [...created, ...links.value]
  setCargoLinks(cargoId.value, links.value)
  pickerOpen.value = false
  selectedUserIds.value = []
  toast.success('Vinculado', 'Usuários vinculados ao cargo (mock).')
}

function onLinkAction(payload: { row: UserLinkRow; action: string }) {
  if (payload.action !== 'remove') return
  links.value = links.value.filter((link) => link.id !== payload.row.id)
  setCargoLinks(cargoId.value, links.value)
  toast.success('Removido', 'Vínculo de usuário removido (mock).')
}
</script>

<template>
  <div
    v-if="cargo"
    class="cargo-detail"
  >
    <PageHeader
      back-to="/configuracoes/cargos"
      :title="cargo.name"
      :subtitle="cargo.active ? 'Ativo' : 'Inativo'"
    >
      <AppButton
        icon="i-lucide-pencil"
        @click="openEditCargo"
      >
        Editar
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="metrics" />

    <dl class="m-0 grid gap-3 border-b border-via-line bg-via-surface px-[18px] py-4 md:grid-cols-2">
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Status</dt>
        <dd
          class="m-0 font-bold"
          :class="cargo.active ? 'text-via-green' : 'text-via-red'"
        >
          {{ cargo.active ? 'Ativo' : 'Inativo' }}
        </dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Criado em</dt>
        <dd class="numeric m-0 text-via-ink">{{ cargo.createdAt }}</dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs md:col-span-2">
        <dt class="m-0 text-via-muted">Descrição</dt>
        <dd class="m-0 text-via-ink">{{ cargo.detail || '—' }}</dd>
      </div>
    </dl>

    <section
      class="flex min-h-[58px] items-center justify-between gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar usuário…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <AppButton
        variant="secondary"
        icon="i-lucide-plus"
        @click="openPicker"
      >
        Vincular usuários
      </AppButton>
    </section>

    <DataTable
      :columns="linkColumns"
      :rows="pagedLinks"
      min-width="880px"
      empty-title="Nenhum usuário vinculado"
      empty-description="Vincule usuários a este cargo ou ajuste a busca."
      @action="onLinkAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredLinks.length"
    />

    <AppModal
      v-model:open="editOpen"
      variant="form"
      title="Editar cargo"
      description="Atualize os dados do cargo."
      confirm-label="Salvar"
      @confirm="saveEditCargo"
    >
      <AppFormField label="Nome *">
        <UInput v-model="editForm.name" />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput v-model="editForm.detail" />
      </AppFormField>
      <AppFormField label="Ativo">
        <USwitch v-model="editForm.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="pickerOpen"
      variant="form"
      title="Vincular usuários"
      description="Selecione usuários para vincular a este cargo."
      confirm-label="Vincular"
      @confirm="confirmPicker"
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
    </AppModal>
  </div>
</template>
