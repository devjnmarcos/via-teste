<script setup lang="ts">
/**
 * Configurações → Feature Flags — CRUD de features (mock). O vínculo N:N com Operador
 * (kind 'contas' em cadastros-onda3.ts) vive na página de detalhe
 * (/configuracoes/feature-flags/:id) — "Ver operadores" navega em vez de abrir modal.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Feature } from '~/data/demo/features'
import {
  buildFeatureRankingSeries,
  buildFeaturesMetrics,
  createEmptyFeature,
  featureAdoptionCounts,
  getFeatures,
  linkedOperatorsActiveCount,
  linkedOperatorsCount,
  setFeatures
} from '~/data/demo/features'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Feature Flags · Configurações · Via Reversa' })

type FeatureFlagsTabId = 'tabela' | 'grafico'

interface FeatureDisplayRow extends Record<string, unknown> {
  id: string
  name: string
  code: string
  description: string
  active: boolean
  createdAt: string
  linkedCount: number
  linkedSummary: string
}

const toast = useToast()

const activeTab = ref<FeatureFlagsTabId>('tabela')
const tabs: { id: FeatureFlagsTabId; label: string }[] = [
  { id: 'tabela', label: 'Tabela' },
  { id: 'grafico', label: 'Gráfico' }
]

const rows = ref<Feature[]>(structuredClone(getFeatures()))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<Feature | null>(null)
const form = reactive(createEmptyFeature())

const columns: DataTableColumn<FeatureDisplayRow>[] = [
  { type: 'text', key: 'name', label: 'Nome', width: '20%', secondaryKey: 'description' },
  { type: 'text', key: 'code', label: 'Código', width: '16%' },
  { type: 'text', key: 'createdAt', label: 'Criada em', width: '110px' },
  { type: 'text', key: 'linkedSummary', label: 'Operadores', width: '130px', align: 'right' },
  { type: 'switch', key: 'active', label: 'Ativa', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '210px',
    items: (row) => [
      { key: 'operators', label: 'Ver operadores', icon: 'i-lucide-wallet-cards', variant: 'ghost', ariaLabel: `Ver operadores de ${row.name}` },
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.name}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.name}` }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.code, row.description].some((value) => value.toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildFeaturesMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const displayRows = computed((): FeatureDisplayRow[] =>
  pagedRows.value.map((row) => {
    const linkedCount = linkedOperatorsCount(row.id)
    const activeCount = linkedOperatorsActiveCount(row.id)
    return {
      ...row,
      linkedCount,
      linkedSummary: linkedCount > 0 ? `${linkedCount} (${activeCount} ativos)` : '0'
    }
  })
)

const rankingSeries = computed(() => buildFeatureRankingSeries(filteredRows.value))
const adoption = computed(() => featureAdoptionCounts(filteredRows.value))

watch(search, () => {
  page.value = 1
})

function selectTab(tab: FeatureFlagsTabId) {
  activeTab.value = tab
}

function persist() {
  setFeatures(structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyFeature())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: Feature) {
  editingId.value = row.id
  form.name = row.name
  form.code = row.code
  form.description = row.description
  form.active = row.active
  form.createdAt = row.createdAt
  formOpen.value = true
}

function openDelete(row: Feature) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: FeatureDisplayRow; action: string }) {
  if (payload.action === 'operators') navigateTo(`/configuracoes/feature-flags/${payload.row.id}`)
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: FeatureDisplayRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target) {
    target.active = payload.value
    persist()
  }
}

function saveForm() {
  if (!form.name.trim() || !form.code.trim()) {
    toast.error('Campo obrigatório', 'Informe nome e código antes de salvar.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.code = form.code.trim()
      target.description = form.description.trim()
      target.active = form.active
    }
  }
  else {
    const created: Feature = {
      id: `feat-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      active: form.active,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `Feature ${wasEdit ? 'atualizada' : 'criada'} (mock).`)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  persist()
  toast.success('Excluída', `${pendingDelete.value.name} removida (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="feature-flags-page">
    <PageHeader
      title="Feature Flags"
      subtitle="Recursos habilitados por operador (mock)"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Nova feature
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
        placeholder="Buscar por nome ou código…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <nav
      class="flex min-h-[49px] flex-wrap gap-[18px] border-b border-via-line px-[18px]"
      aria-label="Abas de Feature Flags"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="inline-flex cursor-pointer items-center border-0 border-b-2 border-transparent bg-transparent text-xs text-via-muted transition-[color,border-color] duration-150"
        :class="activeTab === tab.id ? 'border-via-blue font-bold text-via-ink' : undefined"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <template v-if="activeTab === 'tabela'">
      <DataTable
        :columns="columns"
        :rows="displayRows"
        min-width="920px"
        empty-title="Nenhuma feature"
        empty-description="Cadastre a primeira feature ou ajuste a busca."
        @action="onAction"
        @update:switch="onSwitch"
      />

      <Pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="filteredRows.length"
      />
    </template>

    <template v-else>
      <section
        class="grid grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)] border-b border-via-line max-[1100px]:grid-cols-1"
        aria-label="Gráficos de Feature Flags"
      >
        <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
          <ChartPanel
            title="Adoção por operador"
            note="features com × sem vínculo"
          >
            <DonutChart
              :vol="adoption.withOperators"
              :invol="adoption.withoutOperators"
              vol-label="Com operadores"
              invol-label="Sem operadores"
              aria-label="Features com operadores vinculados versus sem vínculo"
              :height="220"
            />
          </ChartPanel>
        </div>
        <div class="min-w-0">
          <ChartPanel
            title="Ranking de features"
            note="operadores ativos × inativos por feature"
          >
            <StackedBarChart
              :series="rankingSeries"
              orientation="horizontal"
              vol-label="Ativos"
              invol-label="Inativos"
              aria-label="Ranking de features por operadores vinculados"
              :height="240"
            />
          </ChartPanel>
        </div>
      </section>
    </template>

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar feature' : 'Nova feature'"
      :description="editingId ? 'Atualize os dados da feature.' : 'Informe os dados da nova feature.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Nome *">
        <UInput
          v-model="form.name"
          placeholder="Ex.: Habilitar empresa"
        />
      </AppFormField>
      <AppFormField label="Código *">
        <UInput
          v-model="form.code"
          placeholder="Ex.: enable_company"
        />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput
          v-model="form.description"
          placeholder="Explique o que a feature libera"
        />
      </AppFormField>
      <AppFormField label="Ativa">
        <USwitch v-model="form.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir feature"
      :description="pendingDelete ? `“${pendingDelete.name}” será removida. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
