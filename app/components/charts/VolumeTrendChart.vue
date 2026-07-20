<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { TrendPoint } from '../../types/domain'
import { chartColors, ensureChartJsRegistered, volumeTrendOptions } from '../../utils/chart-theme'

ensureChartJsRegistered()

const props = withDefaults(defineProps<{
  series: TrendPoint[]
  title?: string
  note?: string
  height?: number
}>(), {
  title: 'Ritmo das operações · últimos 7 dias',
  note: 'volume consolidado',
  height: 112
})

/** Altura mínima do canvas — Chart.js precisa de espaço para labels. */
const canvasHeight = computed(() => Math.max(props.height, 120))

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.series.map((point) => point.label),
  datasets: [{
    label: props.note || 'Volume',
    data: props.series.map((point) => point.value),
    borderColor: chartColors.agendado,
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
    borderWidth: 2.3,
    pointRadius: (ctx) => (ctx.dataIndex === props.series.length - 1 ? 3.5 : 0),
    pointHoverRadius: 4,
    pointBackgroundColor: chartColors.surface,
    pointBorderColor: chartColors.agendado,
    pointBorderWidth: 2,
    fill: true,
    tension: 0.35
  }]
}))

const chartOptions = computed<ChartOptions<'line'>>(() => volumeTrendOptions())
const chartHeight = computed(() => `${canvasHeight.value}px`)
</script>

<template>
  <section class="min-w-0 px-5 pt-3.5 pb-2.5">
    <header class="mb-1.5 flex items-center justify-between">
      <strong class="text-xs">{{ title }}</strong>
      <span class="text-[11px] text-via-muted">{{ note }}</span>
    </header>
    <div
      class="relative w-full overflow-visible"
      role="img"
      :aria-label="title"
      :style="{ height: chartHeight }"
    >
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </section>
</template>
