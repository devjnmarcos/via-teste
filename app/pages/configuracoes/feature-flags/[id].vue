<script setup lang="ts">
/**
 * Configurações → Feature Flags → detalhe — informações da feature + gestão dos
 * vínculos com Operador (kind 'contas' em cadastros-onda3.ts). Substitui o antigo
 * modal "Operadores" da listagem.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { CadastroOnda3Row } from '~/data/demo/cadastros-onda3'
import { getCadastroOnda3Rows } from '~/data/demo/cadastros-onda3'
import type { Feature, FeatureOperatorLink } from '~/data/demo/features'
import {
  buildFeatureDetailMetrics,
  featureOperatorOptions,
  getFeatureLinks,
  getFeatures,
  setFeatureLinks,
  setFeatures
} from '~/data/demo/features'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

interface OperatorLinkRow extends Record<string, unknown> {
  id: string
  accountId: string
  name: string
  detail: string
  meta: string
  tipo: string
  linkedAt: string
  active: boolean
}

const route = useRoute()
const toast = useToast()
const featureId = computed(() => String(route.params.id ?? ''))

const feature = ref<Feature | null>(null)

function loadFeature() {
  const found = getFeatures().find((row) => row.id === featureId.value)
  feature.value = found ? structuredClone(found) : null
}
loadFeature()

if (!feature.value) {
  throw createError({ statusCode: 404, statusMessage: 'Feature não encontrada' })
}

useSeoMeta({ title: () => `${feature.value?.name ?? 'Feature'} · Configurações · Via Reversa` })

const links = ref<FeatureOperatorLink[]>(structuredClone(getFeatureLinks(featureId.value)))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const editOpen = ref(false)
const editForm = reactive({ name: '', code: '', description: '', active: true })

const pickerOpen = ref(false)
const selectedOperatorIds = ref<string[]>([])

const accountsById = computed(() => new Map(getCadastroOnda3Rows('contas').map((row) => [row.id, row])))

const enrichedLinks = computed((): OperatorLinkRow[] =>
  links.value.map((link) => {
    const account: CadastroOnda3Row | undefined = accountsById.value.get(link.accountId)
    return {
      id: link.id,
      accountId: link.accountId,
      name: account?.name ?? link.accountId,
      detail: account?.detail ?? '—',
      meta: account?.meta ?? '—',
      tipo: account?.tipo ?? '—',
      linkedAt: link.linkedAt,
      active: link.active
    }
  })
)

const filteredLinks = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return enrichedLinks.value
  return enrichedLinks.value.filter((row) =>
    [row.name, row.detail, row.meta, row.tipo].some((value) => value.toLowerCase().includes(query))
  )
})

const pagedLinks = computed(() => slicePage(filteredLinks.value, page.value, pageSize.value))
const metrics = computed(() => (feature.value ? buildFeatureDetailMetrics(feature.value, links.value) : []))

const availableOperatorOptions = computed(() =>
  featureOperatorOptions().filter((opt) => !links.value.some((link) => link.accountId === opt.value))
)

const linkColumns: DataTableColumn<OperatorLinkRow>[] = [
  { type: 'text', key: 'name', label: 'Operador', width: '22%', secondaryKey: 'detail' },
  { type: 'text', key: 'meta', label: 'Operação / UF', width: '16%' },
  { type: 'text', key: 'tipo', label: 'Tipo', width: '120px' },
  { type: 'text', key: 'linkedAt', label: 'Vinculado em', width: '130px' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '80px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '100px',
    items: (row) => [
      { key: 'remove', label: 'Remover', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Remover ${row.name}` }
    ]
  }
]

watch(search, () => {
  page.value = 1
})

function openEditFeature() {
  if (!feature.value) return
  editForm.name = feature.value.name
  editForm.code = feature.value.code
  editForm.description = feature.value.description
  editForm.active = feature.value.active
  editOpen.value = true
}

function saveEditFeature() {
  if (!feature.value) return
  if (!editForm.name.trim() || !editForm.code.trim()) {
    toast.error('Campo obrigatório', 'Informe nome e código antes de salvar.')
    return
  }
  const updatedId = feature.value.id
  const rows = getFeatures().map((row) =>
    row.id === updatedId
      ? { ...row, name: editForm.name.trim(), code: editForm.code.trim(), description: editForm.description.trim(), active: editForm.active }
      : row
  )
  setFeatures(rows)
  loadFeature()
  editOpen.value = false
  toast.success('Salvo', 'Feature atualizada (mock).')
}

function openPicker() {
  selectedOperatorIds.value = []
  pickerOpen.value = true
}

function confirmPicker() {
  if (!selectedOperatorIds.value.length) {
    toast.error('Selecione ao menos 1 operador', 'Escolha na lista antes de vincular.')
    return
  }
  const created = selectedOperatorIds.value.map((accountId) => ({
    id: `flk-${Date.now()}-${accountId}`,
    featureId: featureId.value,
    accountId,
    active: true,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }))
  links.value = [...created, ...links.value]
  setFeatureLinks(featureId.value, links.value)
  pickerOpen.value = false
  selectedOperatorIds.value = []
  toast.success('Vinculado', 'Operadores vinculados à feature (mock).')
}

function onLinkSwitch(payload: { row: OperatorLinkRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = links.value.find((link) => link.id === payload.row.id)
  if (target) {
    target.active = payload.value
    setFeatureLinks(featureId.value, links.value)
  }
}

function onLinkAction(payload: { row: OperatorLinkRow; action: string }) {
  if (payload.action !== 'remove') return
  links.value = links.value.filter((link) => link.id !== payload.row.id)
  setFeatureLinks(featureId.value, links.value)
  toast.success('Removido', 'Vínculo de operador removido (mock).')
}
</script>

<template>
  <div
    v-if="feature"
    class="feature-flag-detail"
  >
    <PageHeader
      back-to="/configuracoes/feature-flags"
      :title="feature.name"
      :subtitle="`${feature.code} · ${feature.active ? 'Ativa' : 'Inativa'}`"
    >
      <AppButton
        icon="i-lucide-pencil"
        @click="openEditFeature"
      >
        Editar
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="metrics" />

    <dl class="m-0 grid gap-3 border-b border-via-line bg-via-surface px-[18px] py-4 md:grid-cols-2">
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Código</dt>
        <dd class="numeric m-0 text-via-ink">{{ feature.code }}</dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Status</dt>
        <dd
          class="m-0 font-bold"
          :class="feature.active ? 'text-via-green' : 'text-via-red'"
        >
          {{ feature.active ? 'Ativa' : 'Inativa' }}
        </dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs md:col-span-2">
        <dt class="m-0 text-via-muted">Descrição</dt>
        <dd class="m-0 text-via-ink">{{ feature.description || '—' }}</dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Criada em</dt>
        <dd class="numeric m-0 text-via-ink">{{ feature.createdAt }}</dd>
      </div>
    </dl>

    <section
      class="flex min-h-[58px] items-center justify-between gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar operador…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <AppButton
        variant="secondary"
        icon="i-lucide-plus"
        @click="openPicker"
      >
        Vincular operadores
      </AppButton>
    </section>

    <DataTable
      :columns="linkColumns"
      :rows="pagedLinks"
      min-width="880px"
      empty-title="Nenhum operador vinculado"
      empty-description="Vincule operadores a esta feature ou ajuste a busca."
      @action="onLinkAction"
      @update:switch="onLinkSwitch"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredLinks.length"
    />

    <AppModal
      v-model:open="editOpen"
      variant="form"
      title="Editar feature"
      description="Atualize os dados da feature."
      confirm-label="Salvar"
      @confirm="saveEditFeature"
    >
      <AppFormField label="Nome *">
        <UInput v-model="editForm.name" />
      </AppFormField>
      <AppFormField label="Código *">
        <UInput v-model="editForm.code" />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput v-model="editForm.description" />
      </AppFormField>
      <AppFormField label="Ativa">
        <USwitch v-model="editForm.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="pickerOpen"
      variant="form"
      title="Vincular operadores"
      description="Selecione operadores para vincular a esta feature."
      confirm-label="Vincular"
      @confirm="confirmPicker"
    >
      <AppFormField label="Operadores *">
        <USelectMenu
          v-model="selectedOperatorIds"
          multiple
          value-key="value"
          :items="availableOperatorOptions"
          placeholder="Selecione um ou mais operadores"
        />
      </AppFormField>
    </AppModal>
  </div>
</template>
