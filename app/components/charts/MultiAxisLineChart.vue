<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { AgendamentoEvolutionPoint } from '../../types/dashboard-reversa'
import { chartColors, ensureChartJsRegistered, multiAxisLineOptions } from '../../utils/chart-theme'

ensureChartJsRegistered()

const props = withDefaults(defineProps<{
  series: AgendamentoEvolutionPoint[]
  height?: number
  ariaLabel?: string
}>(), {
  height: 280,
  ariaLabel: 'Evolução de cumprimento de agenda'
})

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.series.map((point) => point.mes),
  datasets: [
    {
      label: 'Agendamentos',
      data: props.series.map((point) => point.agendamentos),
      borderColor: chartColors.agendado,
      backgroundColor: 'rgba(37, 99, 235, 0.10)',
      borderWidth: 2.2,
      pointRadius: 2.5,
      fill: true,
      tension: 0.35,
      yAxisID: 'y'
    },
    {
      label: 'Cumpridos',
      data: props.series.map((point) => point.cumpridos),
      borderColor: chartColors.coletado,
      backgroundColor: 'rgba(22, 163, 74, 0.10)',
      borderWidth: 2.2,
      pointRadius: 2.5,
      fill: true,
      tension: 0.35,
      yAxisID: 'y'
    },
    {
      label: '% Cumprimento',
      data: props.series.map((point) => point.pct_cumprimento),
      borderColor: chartColors.pct,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 4],
      pointRadius: 2.5,
      fill: false,
      tension: 0.35,
      yAxisID: 'y1'
    }
  ]
}))

const chartOptions = computed<ChartOptions<'line'>>(() => multiAxisLineOptions())
const chartHeight = computed(() => `${props.height}px`)
</script>

<template>
  <div
    class="relative w-full min-h-[200px] overflow-visible px-2.5 pt-1 pb-2"
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
