<script setup lang="ts">
/**
 * Listagem CRUD Onda 3 — DataTable + MetricsStrip + AppModal + Pagination.
 * Usuários: delete com keyword. Regiões: expand. Aprovações: aprovar/recusar.
 */
import type { DataTableColumn } from '../../types/data-table'
import type { CadastroOnda3Kind, CadastroOnda3Row } from '../../data/demo/cadastros-onda3'
import {
  approveCadastroSolicitacao,
  buildCadastroOnda3Metrics,
  cadastroOnda3Configs,
  createEmptyCadastroOnda3,
  getCadastroOnda3Rows,
  rejectCadastroSolicitacao,
  setCadastroOnda3Rows
} from '../../data/demo/cadastros-onda3'
import { getCadastroMeta } from '../../data/demo/cadastros'
import { DEFAULT_PAGE_SIZE, slicePage } from '../../utils/pagination'
import { useToast } from '../../composables/useToast'

const props = defineProps<{
  kind: CadastroOnda3Kind
}>()

const toast = useToast()
const config = computed(() => cadastroOnda3Configs[props.kind])
const meta = computed(() => getCadastroMeta(props.kind))

const rows = ref<CadastroOnda3Row[]>(structuredClone(getCadastroOnda3Rows(props.kind)))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const expandedKeys = ref<string[]>([])

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<CadastroOnda3Row | null>(null)
const form = reactive(createEmptyCadastroOnda3(props.kind))

watch(
  () => props.kind,
  (kind) => {
    rows.value = structuredClone(getCadastroOnda3Rows(kind))
    search.value = ''
    page.value = 1
    expandedKeys.value = []
    resetForm()
  }
)

const columns = computed((): DataTableColumn<CadastroOnda3Row>[] => {
  const cols: DataTableColumn<CadastroOnda3Row>[] = []
  if (config.value.hasExpand) {
    cols.push({ type: 'expand', key: 'expand', width: '48px' })
  }
  cols.push(
    { type: 'text', key: 'name', label: 'Nome', width: '24%', secondaryKey: 'detail' },
    { type: 'text', key: 'meta', label: 'Detalhe', width: '18%' },
    { type: 'text', key: 'statusLabel', label: 'Status', width: '110px' }
  )
  if (props.kind === 'contas') {
    cols.push({ type: 'text', key: 'tipo', label: 'Tipo', width: '130px' })
  }
  if (props.kind !== 'aprovacoes-pas') {
    cols.push({ type: 'switch', key: 'active', label: 'Ativo', width: '72px' })
  }
  cols.push({
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: config.value.hasApproveActions ? '200px' : '112px',
    items: (row) => {
      const items = [
        { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost' as const, ariaLabel: `Editar ${row.name}` },
        { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost' as const, ariaLabel: `Excluir ${row.name}` }
      ]
      if (config.value.hasApproveActions && row.queueStatus === 'pendente') {
        items.unshift(
          { key: 'approve', label: 'Aprovar', icon: 'i-lucide-check', variant: 'ghost' as const, ariaLabel: `Aprovar ${row.name}` },
          { key: 'reject', label: 'Recusar', icon: 'i-lucide-x', variant: 'ghost' as const, ariaLabel: `Recusar ${row.name}` }
        )
      }
      return items
    }
  })
  return cols
})

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.detail, row.meta, row.statusLabel, row.keyword]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildCadastroOnda3Metrics(filteredRows.value, props.kind))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch(search, () => {
  page.value = 1
})

function persist() {
  setCadastroOnda3Rows(props.kind, structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyCadastroOnda3(props.kind))
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: CadastroOnda3Row) {
  editingId.value = row.id
  form.name = row.name
  form.detail = row.detail
  form.meta = row.meta
  form.active = row.active
  form.statusLabel = row.statusLabel
  form.keyword = row.keyword
  form.queueStatus = row.queueStatus
  form.children = row.children ? structuredClone(row.children) : []
  form.tipo = row.tipo
  form.isTransporter = row.isTransporter
  formOpen.value = true
}

function openDelete(row: CadastroOnda3Row) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: CadastroOnda3Row; action: string }) {
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
  if (payload.action === 'approve') {
    if (approveCadastroSolicitacao(props.kind, payload.row.id)) {
      rows.value = structuredClone(getCadastroOnda3Rows(props.kind))
      toast.success('Aprovado', `${payload.row.name} liberado (mock).`)
    }
  }
  if (payload.action === 'reject') {
    if (rejectCadastroSolicitacao(props.kind, payload.row.id)) {
      rows.value = structuredClone(getCadastroOnda3Rows(props.kind))
      toast.success('Recusado', `${payload.row.name} recusado (mock).`)
    }
  }
}

function onSwitch(payload: { row: CadastroOnda3Row; key: string; value: boolean }) {
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target && payload.key === 'active') {
    target.active = payload.value
    target.statusLabel = payload.value ? 'Ativo' : 'Inativo'
    persist()
  }
}

function saveForm() {
  if (!form.name.trim()) {
    toast.error('Campo obrigatório', 'Informe o nome antes de salvar.')
    return
  }
  if (props.kind === 'usuarios' && !String(form.keyword ?? '').trim()) {
    toast.error('Campo obrigatório', 'Informe o e-mail do usuário.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.detail = form.detail.trim()
      target.meta = form.meta.trim()
      target.active = form.active
      target.statusLabel = form.active ? (target.queueStatus === 'pendente' ? 'Pendente' : 'Ativo') : 'Inativo'
      if (form.keyword !== undefined) target.keyword = String(form.keyword).trim()
      if (form.tipo !== undefined) target.tipo = String(form.tipo)
      if (form.isTransporter !== undefined) target.isTransporter = Boolean(form.isTransporter)
    }
  }
  else {
    const created: CadastroOnda3Row = {
      id: `${props.kind}-${Date.now()}`,
      name: form.name.trim(),
      detail: form.detail.trim(),
      meta: form.meta.trim(),
      active: form.active,
      statusLabel: props.kind === 'aprovacoes-pas' ? 'Pendente' : form.active ? 'Ativo' : 'Inativo',
      keyword: form.keyword ? String(form.keyword).trim() : undefined,
      queueStatus: props.kind === 'aprovacoes-pas' ? 'pendente' : undefined,
      children: props.kind === 'regioes' ? [] : undefined,
      tipo: props.kind === 'contas' ? String(form.tipo) : undefined,
      isTransporter: props.kind === 'usuarios' ? Boolean(form.isTransporter) : undefined
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `${config.value.singular} atualizado (mock).`)
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
  <div class="cadastro-onda3-page">
    <PageHeader
      :title="meta.label"
      :subtitle="meta.description"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        {{ config.createLabel }}
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
        :placeholder="config.searchPlaceholder"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <DataTable
      v-model:expanded-keys="expandedKeys"
      :columns="columns"
      :rows="pagedRows"
      min-width="920px"
      :empty-title="`Nenhum ${config.singular}`"
      empty-description="Cadastre o primeiro registro ou ajuste a busca."
      @action="onAction"
      @update:switch="onSwitch"
    >
      <template
        v-if="config.hasExpand"
        #expand="{ row }"
      >
        <div
          v-if="row.children?.length"
          class="grid gap-1.5"
        >
          <div
            v-for="child in row.children"
            :key="child.id"
            class="flex items-baseline justify-between gap-3 border-b border-via-line py-1.5 text-xs last:border-b-0"
          >
            <strong>{{ child.label }}</strong>
            <span class="text-via-muted">{{ child.detail }}</span>
          </div>
        </div>
        <p
          v-else
          class="m-0 text-xs text-via-muted"
        >
          Sem cidades nesta região.
        </p>
      </template>
    </DataTable>

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? `Editar ${config.singular}` : config.createLabel"
      :description="editingId ? `Atualize os dados de ${config.singular}.` : `Informe os campos do novo ${config.singular}.`"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <template
        v-for="field in config.formFields"
        :key="field.key"
      >
        <AppFormField
          v-if="field.type === 'switch'"
          :label="field.label"
        >
          <USwitch v-model="(form as Record<string, unknown>)[field.key] as boolean" />
        </AppFormField>
        <AppFormField
          v-else-if="field.type === 'select'"
          :label="field.label"
        >
          <USelectMenu
            v-model="(form as Record<string, unknown>)[field.key] as string"
            value-key="value"
            :items="field.options ?? []"
          />
        </AppFormField>
        <AppFormField
          v-else
          :label="field.label"
        >
          <UInput
            v-model="(form as Record<string, unknown>)[field.key] as string"
            :type="field.type === 'email' ? 'email' : 'text'"
            :placeholder="field.placeholder"
          />
        </AppFormField>
      </template>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      :variant="config.deleteMode === 'keyword' ? 'confirm-keyword' : 'confirm'"
      :title="`Excluir ${config.singular}`"
      :description="pendingDelete
        ? (config.deleteMode === 'keyword'
          ? `Para excluir “${pendingDelete.name}”, digite o e-mail exatamente como cadastrado.`
          : `“${pendingDelete.name}” será removido. Esta ação não pode ser desfeita.`)
        : ''"
      :keyword="pendingDelete?.keyword ?? ''"
      keyword-label="Digite o e-mail do usuário"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
