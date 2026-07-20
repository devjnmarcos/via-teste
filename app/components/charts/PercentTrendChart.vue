<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { chartColors, ensureChartJsRegistered, percentLineOptions } from '../../utils/chart-theme'

ensureChartJsRegistered()

export interface PercentTrendPoint {
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  series: PercentTrendPoint[]
  height?: number
  label?: string
  ariaLabel?: string
}>(), {
  height: 200,
  label: 'Efetividade %',
  ariaLabel: 'Evolução percentual'
})

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.series.map((point) => point.label),
  datasets: [{
    label: props.label,
    data: props.series.map((point) => point.value),
    borderColor: chartColors.coletado,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderWidth: 2.2,
    pointRadius: 3,
    pointBackgroundColor: chartColors.coletado,
    pointBorderColor: chartColors.surface,
    pointBorderWidth: 1.5,
    fill: true,
    tension: 0.35
  }]
}))

const chartOptions = computed<ChartOptions<'line'>>(() => percentLineOptions())
const chartHeight = computed(() => `${props.height}px`)
</script>

<template>
  <div
    class="relative w-full min-h-[140px] overflow-visible px-2.5 pt-1 pb-2"
    role="img"
    :aria-label="ariaLabel"
    :style="{ height: chartHeight }"
  >
    <Line
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
