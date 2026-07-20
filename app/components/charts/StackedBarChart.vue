<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { StackedSeriesPoint } from '../../types/dashboard-reversa'
import { chartColors, ensureChartJsRegistered, stackedBarOptions } from '../../utils/chart-theme'

ensureChartJsRegistered()

const props = withDefaults(defineProps<{
  series: StackedSeriesPoint[]
  orientation?: 'vertical' | 'horizontal'
  height?: number
  volLabel?: string
  involLabel?: string
  ariaLabel?: string
}>(), {
  orientation: 'vertical',
  height: 240,
  volLabel: 'Voluntário',
  involLabel: 'Involuntário',
  ariaLabel: 'Gráfico de barras empilhadas'
})

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.series.map((point) => point.label),
  datasets: [
    {
      label: props.volLabel,
      data: props.series.map((point) => point.vol),
      backgroundColor: chartColors.vol,
      borderWidth: 0,
      borderSkipped: false,
      barPercentage: 0.78,
      categoryPercentage: 0.72
    },
    {
      label: props.involLabel,
      data: props.series.map((point) => point.invol),
      backgroundColor: chartColors.invol,
      borderWidth: 0,
      borderSkipped: false,
      barPercentage: 0.78,
      categoryPercentage: 0.72
    }
  ]
}))

const chartOptions = computed<ChartOptions<'bar'>>(() =>
  stackedBarOptions(props.orientation === 'horizontal')
)

const chartHeight = computed(() => `${props.height}px`)
</script>

<template>
  <div
    class="relative w-full min-h-40 overflow-visible px-2.5 pt-1 pb-2"
    role="img"
    :aria-label="ariaLabel"
    :style="{ height: chartHeight }"
  >
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
