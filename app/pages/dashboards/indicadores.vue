<script setup lang="ts">
/**
 * Dashboards → Indicadores (pontos de apoio).
 * A listagem de pontos de apoio e os gráficos de produtividade/concluídos
 * saíram desta tela — mantém-se apenas o painel de métricas agregadas.
 */
import {
  dashboardsAccountOptions,
  dashboardsPaOptions,
  dashboardsPeriodOptions,
  indicadoresPaRows
} from '~/data/demo/dashboards'
import { buildIndicadoresMetrics } from '~/utils/dashboards-metrics'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Indicadores · Dashboards · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const paId = ref('all')
const period = ref('today')

const filteredRows = computed(() => {
  if (paId.value === 'all') return indicadoresPaRows
  return indicadoresPaRows.filter((row) => row.id === paId.value)
})

const listMetrics = computed(() => buildIndicadoresMetrics(filteredRows.value))

function refresh() {
  toast.success('Atualizado', 'Indicadores de pontos de apoio recarregados (mock).')
}
</script>

<template>
  <div class="dashboards-indicadores-page">
    <PageHeader
      title="Indicadores"
      subtitle="Painel operacional por ponto de apoio"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="listMetrics"
      :max-per-row="3"
    />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="dashboardsAccountOptions"
        class="w-[240px]"
      />
      <USelectMenu
        v-model="paId"
        value-key="value"
        :items="dashboardsPaOptions"
        class="w-[240px]"
      />
      <USelectMenu
        v-model="period"
        value-key="value"
        :items="dashboardsPeriodOptions"
        class="w-[180px]"
      />
    </section>
  </div>
</template>
