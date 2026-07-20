<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { StatusKey } from '../../types/domain'
import { statusMeta } from '../../types/domain'
import {
  ensureChartJsRegistered,
  statusChartColor,
  statusDistributionOptions
} from '../../utils/chart-theme'

ensureChartJsRegistered()

const props = withDefaults(defineProps<{
  items: Array<{ status: StatusKey, value: number, label?: string }>
  title?: string
  height?: number
}>(), {
  title: 'Distribuição por status',
  height: 200
})

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.items.map((item) => item.label ?? statusMeta[item.status].label),
  datasets: [{
    label: 'Pedidos',
    data: props.items.map((item) => item.value),
    backgroundColor: props.items.map((item) => statusChartColor(item.status)),
    borderWidth: 0,
    borderSkipped: false,
    barPercentage: 0.72,
    categoryPercentage: 0.78
  }]
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => statusDistributionOptions())
const chartHeight = computed(() => `${Math.max(props.height, props.items.length * 36 + 40)}px`)
</script>

<template>
  <section class="px-5 pt-3 pb-4">
    <header class="mb-[7px] flex items-center justify-between">
      <strong class="text-xs">{{ title }}</strong>
      <span class="text-[11px] text-via-muted">posição atual</span>
    </header>
    <div
      class="relative w-full overflow-visible"
      role="img"
      :aria-label="title"
      :style="{ height: chartHeight }"
    >
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </section>
</template>
