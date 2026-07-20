<script setup lang="ts">
/**
 * Acompanhamento de Devoluções — métricas de caixas/itens, período e top transportadores.
 */
import type { DevInItemType } from '~/data/demo/devolucoes-dev-in'
import { devolucoesCompanyOptions, devInState } from '~/data/demo/devolucoes-dev-in'
import {
  acompanhamentoTopTransporters,
  acompanhamentoVolumeTrend,
  monthOptions,
  periodModeOptions,
  topTransporterColumns,
  yearOptions
} from '~/data/demo/devolucoes-acompanhamento'
import {
  buildAcompanhamentoMetrics,
  filterAcompanhamentoBoxes
} from '~/utils/devolucoes-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'

useSeoMeta({ title: 'Acompanhamento · Devoluções · Via Reversa' })

const companyFilter = ref<string>('Todas')
const typeFilter = ref<'Todos' | DevInItemType>('Todos')
const periodMode = ref<'mensal' | 'custom'>('mensal')
const month = ref(7)
const year = ref(2026)
const startDate = ref('01/07/2026')
const endDate = ref('31/07/2026')
const transporterPage = ref(1)
const transporterPageSize = ref(DEFAULT_PAGE_SIZE)

const companyFilterOptions = computed(() => [
  { label: 'Todas as empresas', value: 'Todas' },
  ...devolucoesCompanyOptions
])

const typeOptions = [
  { label: 'Todos os tipos', value: 'Todos' },
  { label: 'Reversa', value: 'Reversa' },
  { label: 'Entrega', value: 'Entrega' }
]

const scopedBoxes = computed(() =>
  filterAcompanhamentoBoxes({
    boxes: devInState.boxes,
    companyId: companyFilter.value,
    itemType: typeFilter.value,
    periodMode: periodMode.value,
    month: month.value,
    year: year.value,
    startDate: startDate.value,
    endDate: endDate.value
  })
)

const metricsPack = computed(() =>
  buildAcompanhamentoMetrics(scopedBoxes.value, typeFilter.value)
)

/** 5 caixas + 1 item = 6 cards em duas faixas de 3 (sem órfão em linha inteira). */
const stripMetrics = computed(() => [
  ...metricsPack.value.boxMetrics,
  ...metricsPack.value.itemMetrics
])

const pagedTransporters = computed(() =>
  slicePage(acompanhamentoTopTransporters, transporterPage.value, transporterPageSize.value)
)

watch([companyFilter, typeFilter, periodMode, month, year, startDate, endDate], () => {
  transporterPage.value = 1
})
</script>

<template>
  <div class="devolucao-page">
    <PageHeader
      title="Acompanhamento de Devoluções"
      subtitle="Visão agregada DEV IN — caixas, itens, período e transportadores"
    />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <USelectMenu
        v-model="companyFilter"
        value-key="value"
        :items="companyFilterOptions"
        class="w-[220px]"
      />
      <USelectMenu
        v-model="typeFilter"
        value-key="value"
        :items="typeOptions"
        class="w-40"
      />
      <USelectMenu
        v-model="periodMode"
        value-key="value"
        :items="periodModeOptions"
        class="w-40"
      />
      <template v-if="periodMode === 'mensal'">
        <USelectMenu
          v-model="month"
          value-key="value"
          :items="monthOptions"
          class="w-40"
        />
        <USelectMenu
          v-model="year"
          value-key="value"
          :items="yearOptions"
          class="w-[110px]"
        />
      </template>
      <template v-else>
        <UInput
          v-model="startDate"
          placeholder="Início DD/MM/AAAA"
          class="w-[150px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
          aria-label="Data inicial"
        />
        <UInput
          v-model="endDate"
          placeholder="Fim DD/MM/AAAA"
          class="w-[150px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
          aria-label="Data final"
        />
      </template>
    </section>

    <MetricsStrip
      :metrics="stripMetrics"
      :max-per-row="3"
    />

    <section
      class="border-b border-via-line bg-via-surface px-[18px] pt-4 pb-2"
      aria-label="Tendência de volume"
    >
      <header class="mb-3 [&_h2]:m-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-via-ink [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-xs [&_p]:text-via-muted">
        <h2>Caixas criadas no mês</h2>
        <p>Série mock alinhada aos labels de abertura (julho/2026).</p>
      </header>
      <VolumeTrendChart
        :series="acompanhamentoVolumeTrend"
        title="Caixas criadas · julho/2026"
        note="volume diário (fixture)"
      />
    </section>

    <section
      class="border-b border-via-line bg-via-surface px-[18px] pt-4 pb-0"
      aria-label="Top transportadores"
    >
      <header class="mb-3 [&_h2]:m-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-via-ink [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-xs [&_p]:text-via-muted">
        <h2>Top transportadores</h2>
        <p>Participação demo no período — fixture determinística.</p>
      </header>

      <DataTable
        :columns="topTransporterColumns"
        :rows="pagedTransporters"
        min-width="640px"
        empty-title="Nenhum transportador"
        empty-description="Não há transportadores no escopo selecionado."
      />

      <Pagination
        v-model:page="transporterPage"
        v-model:page-size="transporterPageSize"
        :total="acompanhamentoTopTransporters.length"
      />
    </section>
  </div>
</template>

