<script setup lang="ts">
/**
 * Configurações → SLA → Auditoria.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ConfigSlaAuditRow } from '~/data/demo/configuracoes'
import {
  configAuditTrend,
  configSlaAuditRows
} from '~/data/demo/configuracoes'
import { buildConfigAuditMetrics } from '~/utils/operacao-p3-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Auditoria SLA · Configurações · Via Reversa' })

const toast = useToast()
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<ConfigSlaAuditRow>[] = [
  { type: 'text', key: 'changedAtLabel', label: 'Quando', width: '130px' },
  { type: 'text', key: 'user', label: 'Usuário', width: '140px' },
  { type: 'text', key: 'field', label: 'Campo', width: '18%' },
  { type: 'text', key: 'before', label: 'Antes', width: '16%' },
  { type: 'text', key: 'after', label: 'Depois', width: '16%' }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return configSlaAuditRows
  return configSlaAuditRows.filter((row) =>
    [row.user, row.field, row.before, row.after]
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

const metrics = computed(() => buildConfigAuditMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch(search, () => {
  page.value = 1
})

function refresh() {
  toast.success('Atualizado', 'Histórico de auditoria recarregado (mock).')
}
</script>

<template>
  <div class="config-sla-audit-page">
    <PageHeader
      title="Auditoria SLA"
      subtitle="Histórico de alterações dos parâmetros de módulo"
    >
      <AppButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        to="/configuracoes/sla"
      >
        Voltar
      </AppButton>
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>

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
        placeholder="Buscar usuário ou campo…"
        class="w-[280px]"
      />
    </section>

    <section
      class="border-b border-via-line"
      aria-label="Tendência"
    >
      <ChartPanel
        title="Alterações por dia"
        note="últimos 7 dias"
      >
        <VolumeTrendChart
          :series="configAuditTrend"
          title="Auditoria · 7 dias"
          note="alterações"
          :height="160"
        />
      </ChartPanel>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="860px"
      empty-title="Sem alterações"
      empty-description="Nenhum registro de auditoria no filtro atual."
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
