<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { chartColors, donutOptions, ensureChartJsRegistered } from '../../utils/chart-theme'

ensureChartJsRegistered()

const props = withDefaults(defineProps<{
  vol: number
  invol: number
  height?: number
  ariaLabel?: string
  volLabel?: string
  involLabel?: string
}>(), {
  height: 240,
  ariaLabel: 'Voluntário versus Involuntário',
  volLabel: 'Voluntário',
  involLabel: 'Involuntário'
})

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: [props.volLabel, props.involLabel],
  datasets: [{
    data: [props.vol, props.invol],
    backgroundColor: [chartColors.vol, chartColors.invol],
    borderWidth: 2,
    borderColor: chartColors.surface,
    hoverOffset: 4
  }]
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => donutOptions())
const chartHeight = computed(() => `${props.height}px`)
</script>

<template>
  <div
    class="relative w-full min-h-40 overflow-visible px-3 pt-2 pb-1"
    role="img"
    :aria-label="ariaLabel"
    :style="{ height: chartHeight }"
  >
    <Doughnut
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
