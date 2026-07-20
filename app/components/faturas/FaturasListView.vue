<script setup lang="ts">
/**
 * Listagem compartilhada de Faturas (a receber / a pagar).
 */
import type { DataTableColumn } from '../../types/data-table'
import type { FaturaKind, FaturaRow, FaturaStatus } from '../../data/demo/faturas'
import {
  faturaKindLabel,
  faturasAccountOptions,
  faturasStatusOptions,
  faturasVolumeTrendPay,
  faturasVolumeTrendReceive,
  listFaturasByKind
} from '../../data/demo/faturas'
import { buildFaturasListMetrics } from '../../utils/faturas-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '../../utils/pagination'
import { useToast } from '../../composables/useToast'

const props = defineProps<{
  kind: FaturaKind
}>()

const toast = useToast()

const kindLabel = computed(() => faturaKindLabel(props.kind))
const trendSeries = computed(() =>
  props.kind === 'a-receber' ? faturasVolumeTrendReceive : faturasVolumeTrendPay
)

useSeoMeta({
  title: () => `${kindLabel.value} · Faturas · Via Reversa`
})

const search = ref('')
const statusFilter = ref<'Todos' | FaturaStatus>('Todos')
const accountFilter = ref<string>('Todas')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const accountFilterOptions = computed(() => [
  { label: 'Todas as contas', value: 'Todas' },
  ...faturasAccountOptions
])

const columns: DataTableColumn<FaturaRow>[] = [
  { type: 'text', key: 'id', label: 'ID', width: '72px' },
  { type: 'text', key: 'competenceLabel', label: 'Competência', width: '110px' },
  { type: 'text', key: 'accountName', label: 'Conta', width: '22%' },
  { type: 'text', key: 'valueLabel', label: 'Valor', width: '120px', align: 'right' },
  { type: 'text', key: 'status', label: 'Status', width: '100px' },
  { type: 'text', key: 'dueAtLabel', label: 'Vencimento', width: '120px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '120px',
    items: (row) => [
      {
        key: 'open',
        label: 'Abrir',
        icon: 'i-lucide-eye',
        variant: 'ghost' as const,
        ariaLabel: `Abrir fatura ${row.id}`
      }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return listFaturasByKind(props.kind).filter((row) => {
    if (statusFilter.value !== 'Todos' && row.status !== statusFilter.value) return false
    if (accountFilter.value !== 'Todas' && row.accountId !== accountFilter.value) return false
    if (!query) return true
    return [row.id, row.competenceLabel, row.accountName, row.status, row.valueLabel]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() => buildFaturasListMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([search, statusFilter, accountFilter, () => props.kind], () => {
  page.value = 1
})

function refreshList() {
  toast.success('Atualizado', `Lista de faturas ${kindLabel.value.toLowerCase()} recarregada.`)
}

function onAction(payload: { row: FaturaRow; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/faturas/${payload.row.id}`)
  }
}
</script>

<template>
  <div class="faturas-page">
    <PageHeader
      :title="`Faturas · ${kindLabel}`"
      :subtitle="kind === 'a-receber'
        ? 'Faturas a receber por conta e competência'
        : 'Faturas a pagar por conta e competência'"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        @click="refreshList"
      >
        Atualizar
      </AppButton>
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        :to="`/faturas/nova/${kind}`"
      >
        Nova fatura
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="listMetrics" />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por ID, conta ou competência..."
        class="w-[265px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="faturasStatusOptions"
        class="w-[180px]"
      />
      <USelectMenu
        v-model="accountFilter"
        value-key="value"
        :items="accountFilterOptions"
        class="w-[220px]"
      />
    </section>

    <section
      class="border-b border-via-line bg-via-surface px-[18px] pt-4 pb-2"
      aria-label="Tendência de faturamento"
    >
      <header class="mb-3 [&_h2]:m-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-via-ink [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-xs [&_p]:text-via-muted">
        <h2>Volume mensal</h2>
        <p>Quantidade de faturas {{ kindLabel.toLowerCase() }} por mês (fixture).</p>
      </header>
      <VolumeTrendChart
        :series="trendSeries"
        :title="`Faturas ${kindLabel.toLowerCase()} · 2026`"
        note="quantidade mensal"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="980px"
      empty-title="Nenhuma fatura"
      empty-description="Crie a primeira fatura ou ajuste a busca e os filtros."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
