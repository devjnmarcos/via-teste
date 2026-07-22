<script setup lang="ts">
/**
 * Configurações → Integrações — CRUD completo (substitui a antiga tela Externos).
 * Padrão visual de CadastroOnda3Page.vue: MetricsStrip + busca + DataTable + AppModal.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Integration, IntegrationOperator } from '~/data/demo/integrations'
import {
  buildIntegrationsMetrics,
  createEmptyIntegration,
  createEmptyIntegrationOperator,
  getIntegrationOperators,
  getIntegrations,
  integrationAccountOptions,
  integrationKindLabels,
  integrationKindOptions,
  resolveAccountLabel,
  setIntegrationOperators,
  setIntegrations
} from '~/data/demo/integrations'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Integrações · Configurações · Via Reversa' })

interface IntegrationDisplayRow extends Record<string, unknown> {
  id: string
  provider: string
  kind: Integration['kind']
  label: string
  active: boolean
  createdAt: string
  kindLabel: string
}

const toast = useToast()

const rows = ref<Integration[]>(structuredClone(getIntegrations()))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<Integration | null>(null)
const form = reactive(createEmptyIntegration())

const configureOpen = ref(false)
const configuringIntegration = ref<Integration | null>(null)
const operatorRows = ref<IntegrationOperator[]>([])
const operatorFormOpen = ref(false)
const editingOperatorId = ref<string | null>(null)
const operatorForm = reactive(createEmptyIntegrationOperator(''))
const accountOptions = integrationAccountOptions()

const columns: DataTableColumn<IntegrationDisplayRow>[] = [
  { type: 'text', key: 'provider', label: 'Provedor', width: '22%', secondaryKey: 'label' },
  { type: 'text', key: 'kindLabel', label: 'Tipo', width: '16%' },
  { type: 'text', key: 'createdAt', label: 'Criado em', width: '120px' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '80px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '168px',
    items: (row) => [
      { key: 'configure', label: 'Configurar', icon: 'i-lucide-settings-2', variant: 'ghost', ariaLabel: `Configurar ${row.provider}` },
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.provider}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.provider}` }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.provider, row.label, integrationKindLabels[row.kind]].some((value) => String(value).toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildIntegrationsMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const displayRows = computed((): IntegrationDisplayRow[] =>
  pagedRows.value.map((row) => ({ ...row, kindLabel: integrationKindLabels[row.kind] }))
)

watch(search, () => {
  page.value = 1
})

function persist() {
  setIntegrations(structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyIntegration())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: Integration) {
  editingId.value = row.id
  form.provider = row.provider
  form.kind = row.kind
  form.label = row.label
  form.active = row.active
  form.createdAt = row.createdAt
  formOpen.value = true
}

function openDelete(row: Integration) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: IntegrationDisplayRow; action: string }) {
  if (payload.action === 'configure') openConfigure(payload.row)
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: IntegrationDisplayRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target) {
    target.active = payload.value
    persist()
  }
}

function saveForm() {
  if (!form.provider.trim() || !form.label.trim()) {
    toast.error('Campo obrigatório', 'Informe provedor e rótulo antes de salvar.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.provider = form.provider.trim()
      target.kind = form.kind
      target.label = form.label.trim()
      target.active = form.active
    }
  }
  else {
    const created: Integration = {
      id: `int-${Date.now()}`,
      provider: form.provider.trim(),
      kind: form.kind,
      label: form.label.trim(),
      active: form.active,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `Integração ${wasEdit ? 'atualizada' : 'criada'} (mock).`)
}

function resetOperatorForm() {
  Object.assign(operatorForm, createEmptyIntegrationOperator(configuringIntegration.value?.id ?? ''))
  editingOperatorId.value = null
}

function openConfigure(row: Integration) {
  configuringIntegration.value = row
  operatorRows.value = structuredClone(getIntegrationOperators(row.id))
  operatorFormOpen.value = false
  resetOperatorForm()
  configureOpen.value = true
}

function openAddOperator() {
  resetOperatorForm()
  operatorFormOpen.value = true
}

function openEditOperator(op: IntegrationOperator) {
  editingOperatorId.value = op.id
  operatorForm.accountId = op.accountId
  operatorForm.apiKeyMasked = op.apiKeyMasked
  operatorForm.active = op.active
  operatorFormOpen.value = true
}

function saveOperatorInline() {
  if (!operatorForm.accountId) {
    toast.error('Campo obrigatório', 'Selecione a conta.')
    return
  }
  if (editingOperatorId.value) {
    const target = operatorRows.value.find((op) => op.id === editingOperatorId.value)
    if (target) {
      target.accountId = operatorForm.accountId
      target.apiKeyMasked = operatorForm.apiKeyMasked.trim()
      target.active = operatorForm.active
    }
  }
  else {
    operatorRows.value = [
      {
        id: `iop-${Date.now()}`,
        integrationId: configuringIntegration.value!.id,
        accountId: operatorForm.accountId,
        apiKeyMasked: operatorForm.apiKeyMasked.trim() || '••••••••',
        config: {},
        active: operatorForm.active,
        lastSyncLabel: 'Nunca sincronizado'
      },
      ...operatorRows.value
    ]
  }
  operatorFormOpen.value = false
  resetOperatorForm()
}

function removeOperator(op: IntegrationOperator) {
  operatorRows.value = operatorRows.value.filter((row) => row.id !== op.id)
  toast.success('Removido', 'Vínculo de conta removido (mock).')
}

function toggleOperatorActive(op: IntegrationOperator, value: boolean) {
  const target = operatorRows.value.find((row) => row.id === op.id)
  if (target) target.active = value
}

function saveConfigure() {
  if (!configuringIntegration.value) return
  setIntegrationOperators(configuringIntegration.value.id, operatorRows.value)
  configureOpen.value = false
  toast.success('Salvo', `Vínculos de ${configuringIntegration.value.provider} atualizados (mock).`)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  persist()
  toast.success('Excluído', `${pendingDelete.value.provider} removido (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="config-integracoes-page">
    <PageHeader
      title="Configurações · Integrações"
      subtitle="Provedores de transportadora, marketplace, chatbot e geolocalização"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Nova integração
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
        placeholder="Buscar provedor ou tipo…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="displayRows"
      min-width="880px"
      empty-title="Nenhuma integração"
      empty-description="Cadastre a primeira integração ou ajuste a busca."
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
      :title="editingId ? 'Editar integração' : 'Nova integração'"
      :description="editingId ? 'Atualize os dados da integração.' : 'Informe os dados da nova integração.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Provedor *">
        <UInput
          v-model="form.provider"
          placeholder="Ex.: Kangu"
        />
      </AppFormField>
      <AppFormField label="Tipo *">
        <USelectMenu
          v-model="form.kind"
          value-key="value"
          :items="integrationKindOptions"
        />
      </AppFormField>
      <AppFormField label="Rótulo *">
        <UInput
          v-model="form.label"
          placeholder="Ex.: Kangu · Frete nacional"
        />
      </AppFormField>
      <AppFormField label="Ativa">
        <USwitch v-model="form.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="configureOpen"
      variant="form"
      :title="configuringIntegration ? `Configurar · ${configuringIntegration.provider}` : 'Configurar integração'"
      :description="configuringIntegration ? `Contas vinculadas a ${configuringIntegration.label}.` : ''"
      confirm-label="Salvar"
      @confirm="saveConfigure"
    >
      <div class="grid gap-2">
        <div
          v-for="op in operatorRows"
          :key="op.id"
          class="flex items-center justify-between gap-3 border-b border-via-line py-2 text-xs last:border-b-0"
        >
          <div class="min-w-0">
            <strong class="block truncate">{{ resolveAccountLabel(op.accountId) }}</strong>
            <small class="block text-via-muted">{{ op.apiKeyMasked }} · {{ op.lastSyncLabel }}</small>
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            <USwitch
              :model-value="op.active"
              size="sm"
              @update:model-value="toggleOperatorActive(op, Boolean($event))"
            />
            <AppButton
              variant="ghost"
              icon="i-lucide-pencil"
              aria-label="Editar vínculo"
              @click="openEditOperator(op)"
            />
            <AppButton
              variant="ghost"
              icon="i-lucide-trash-2"
              aria-label="Remover vínculo"
              @click="removeOperator(op)"
            />
          </div>
        </div>
        <p
          v-if="!operatorRows.length"
          class="m-0 text-xs text-via-muted"
        >
          Nenhuma conta vinculada a esta integração.
        </p>

        <AppButton
          variant="secondary"
          icon="i-lucide-plus"
          class="justify-self-start"
          @click="openAddOperator"
        >
          Vincular conta
        </AppButton>

        <div
          v-if="operatorFormOpen"
          class="grid gap-3 border-t border-via-line pt-3"
        >
          <AppFormField label="Conta *">
            <USelectMenu
              v-model="operatorForm.accountId"
              value-key="value"
              :items="accountOptions"
            />
          </AppFormField>
          <AppFormField label="Chave de API">
            <UInput
              v-model="operatorForm.apiKeyMasked"
              placeholder="sk_••••••••1234"
            />
          </AppFormField>
          <AppFormField label="Ativo">
            <USwitch v-model="operatorForm.active" />
          </AppFormField>
          <div class="flex justify-end gap-2">
            <AppButton
              variant="secondary"
              @click="operatorFormOpen = false"
            >
              Cancelar
            </AppButton>
            <AppButton
              variant="primary"
              @click="saveOperatorInline"
            >
              {{ editingOperatorId ? 'Salvar vínculo' : 'Adicionar vínculo' }}
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir integração"
      :description="pendingDelete ? `“${pendingDelete.provider}” será removida. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
