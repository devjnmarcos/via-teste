<script setup lang="ts">
/**
 * Configurações → Externos.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ConfigExternalRow } from '~/data/demo/configuracoes'
import {
  configExternalsState,
  toggleExternalActive
} from '~/data/demo/configuracoes'
import { buildConfigExternalsMetrics } from '~/utils/operacao-p3-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Externos · Configurações · Via Reversa' })

const toast = useToast()
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const disableOpen = ref(false)
const pendingRow = ref<ConfigExternalRow | null>(null)

const columns: DataTableColumn<ConfigExternalRow>[] = [
  { type: 'text', key: 'provider', label: 'Provedor', width: '140px' },
  { type: 'text', key: 'accountName', label: 'Conta', width: '24%' },
  { type: 'text', key: 'apiKeyMasked', label: 'Chave', width: '180px' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '80px' },
  { type: 'text', key: 'lastSyncLabel', label: 'Última sync', width: '130px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '120px',
    items: (row) => [
      {
        key: 'disable',
        label: row.active ? 'Desativar' : 'Ativar',
        icon: row.active ? 'i-lucide-pause' : 'i-lucide-play',
        variant: 'ghost' as const,
        ariaLabel: `${row.active ? 'Desativar' : 'Ativar'} ${row.provider}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return configExternalsState.rows
  return configExternalsState.rows.filter((row) =>
    [row.provider, row.accountName]
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

const metrics = computed(() => buildConfigExternalsMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch(search, () => {
  page.value = 1
})

function onSwitch(payload: { row: ConfigExternalRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  toggleExternalActive(payload.row.id, payload.value)
  toast.success(
    payload.value ? 'Integração ativada' : 'Integração pausada',
    `${payload.row.provider} · ${payload.row.accountName}`
  )
}

function onAction(payload: { row: ConfigExternalRow; action: string }) {
  if (payload.action !== 'disable') return
  pendingRow.value = payload.row
  disableOpen.value = true
}

function confirmToggle() {
  const row = pendingRow.value
  disableOpen.value = false
  if (!row) return
  const next = !row.active
  toggleExternalActive(row.id, next)
  toast.success(
    next ? 'Integração ativada' : 'Integração desativada',
    `${row.provider} atualizado (mock).`
  )
  pendingRow.value = null
}
</script>

<template>
  <div class="config-externos-page">
    <PageHeader
      title="Configurações · Externos"
      subtitle="Integrações por conta — chaves mascaradas"
    />

    <MetricsStrip
      :metrics="metrics"
      :max-per-row="3"
    />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar provedor ou conta…"
        class="w-[280px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="920px"
      empty-title="Sem integrações"
      empty-description="Nenhuma integração externa no filtro."
      @action="onAction"
      @switch="onSwitch"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="disableOpen"
      variant="confirm"
      :title="pendingRow?.active ? 'Desativar integração' : 'Ativar integração'"
      description="Confirma a alteração de status desta integração?"
      :confirm-label="pendingRow?.active ? 'Desativar' : 'Ativar'"
      :confirm-variant="pendingRow?.active ? 'danger' : 'primary'"
      @confirm="confirmToggle"
    >
      <p class="text-sm text-via-muted">
        {{ pendingRow?.provider }} · {{ pendingRow?.accountName }}
      </p>
    </AppModal>
  </div>
</template>
