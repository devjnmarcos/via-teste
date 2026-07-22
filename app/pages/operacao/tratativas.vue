<script setup lang="ts">
/**
 * Operação → Tratativas (chatbot).
 * A listagem de pedidos elegíveis e o disparo em lote foram migrados para a
 * listagem de pedidos (plano irmão); esta tela mantém apenas indicadores e
 * gráficos de acompanhamento.
 */
import {
  buildTratativasDistribution,
  tratativaStatusOptions,
  tratativasState,
  tratativasVolumeTrend
} from '~/data/demo/tratativas'
import { buildTratativasMetrics } from '~/utils/operacao-p3-metrics'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Tratativas · Operação · Via Reversa' })

const toast = useToast()
const search = ref('')
const statusFilter = ref('all')

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return tratativasState.orders.filter((row) => {
    if (statusFilter.value !== 'all' && row.status !== statusFilter.value) return false
    if (!query) return true
    return [row.orderId, row.client, row.accountName, row.channel]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const listMetrics = computed(() =>
  buildTratativasMetrics(
    filteredRows.value,
    tratativasState.contactsToday,
    tratativasState.workedToday,
    // Seleção e disparo em lote saíram desta tela (migrados para /pedidos);
    // não há mais seleção local, então o indicador de "Selecionados" fica zerado.
    0
  )
)

const distribution = computed(() => buildTratativasDistribution(filteredRows.value))

function refresh() {
  toast.success('Atualizado', 'Tratativas recarregadas (mock).')
}
</script>

<template>
  <div class="tratativas-page">
    <PageHeader
      title="Tratativas"
      subtitle="Pedidos elegíveis ao chatbot e acompanhamento de contatos"
    >
      <AppButton
        icon="i-lucide-activity"
        variant="ghost"
        to="/operacao/chatbot-monitor"
      >
        Monitor
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
      :metrics="listMetrics"
      :max-per-row="3"
    />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar pedido ou cliente…"
        class="w-[280px]"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="tratativaStatusOptions"
        class="w-[200px]"
      />
    </section>

    <section
      class="grid grid-cols-2 border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Gráficos"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <ChartPanel
          title="Contatos por dia"
          note="volume (fixture)"
        >
          <VolumeTrendChart
            :series="tratativasVolumeTrend"
            title="Contatos · 7 dias"
            note="chatbot"
            :height="160"
          />
        </ChartPanel>
      </div>
      <div class="min-w-0">
        <ChartPanel
          title="Distribuição de tratativas"
          note="status atual"
        >
          <StatusDistribution
            :items="distribution"
            title="Status das tratativas"
            :height="200"
          />
        </ChartPanel>
      </div>
    </section>
  </div>
</template>
