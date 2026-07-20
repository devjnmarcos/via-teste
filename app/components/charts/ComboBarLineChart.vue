<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { MailingDayPoint } from '../../types/dashboard-reversa'
import { chartColors, comboBarLineOptions, ensureChartJsRegistered } from '../../utils/chart-theme'

ensureChartJsRegistered()

const props = withDefaults(defineProps<{
  series: MailingDayPoint[]
  height?: number
  ariaLabel?: string
}>(), {
  height: 260,
  ariaLabel: 'Volume diário recebido'
})

const chartData = computed<ChartData>(() => ({
  labels: props.series.map((point) => point.dia),
  datasets: [
    {
      type: 'bar' as const,
      label: 'Voluntário',
      data: props.series.map((point) => point.vol),
      backgroundColor: chartColors.vol,
      stack: 'volinvol',
      order: 2
    },
    {
      type: 'bar' as const,
      label: 'Involuntário',
      data: props.series.map((point) => point.invol),
      backgroundColor: chartColors.invol,
      stack: 'volinvol',
      order: 2
    },
    {
      type: 'line' as const,
      label: 'Agendado',
      data: props.series.map((point) => point.agendado),
      borderColor: chartColors.agendado,
      backgroundColor: 'rgba(37, 99, 235, 0.12)',
      borderWidth: 2.2,
      pointRadius: 2.5,
      pointBackgroundColor: chartColors.agendado,
      fill: false,
      tension: 0.35,
      order: 1
    }
  ]
}))

const chartOptions = computed<ChartOptions>(() => comboBarLineOptions())
const chartHeight = computed(() => `${props.height}px`)
</script>

<template>
  <div
    class="relative w-full min-h-[180px] overflow-visible px-2.5 pt-1 pb-2"
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
