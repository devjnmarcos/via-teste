<script setup lang="ts">
import { homeMetrics, operations, periodSummary, trendSeries } from '~/data/demo/operations'

useSeoMeta({ title: 'Visão geral operacional · Via Reversa' })
</script>

<template>
  <div class="min-h-full bg-via-surface">
    <PageHeader
      title="Visão geral operacional"
      subtitle="Panorama das operações e acesso aos recortes de análise"
      live
    >
      <AppButton icon="i-lucide-filter">Filtrar período</AppButton>
      <AppButton icon="i-lucide-refresh-cw">Atualizar</AppButton>
    </PageHeader>

    <MetricsStrip :metrics="homeMetrics" />
    <OperationsBoard :operations="operations" />

    <section class="grid min-h-[172px] grid-cols-[minmax(0,1.7fr)_minmax(270px,0.75fr)] [&_>_:first-child]:border-r [&_>_:first-child]:border-via-line">
      <VolumeTrendChart :series="trendSeries" />
      <div class="grid grid-cols-2 content-center px-5 py-[18px]">
        <article
          v-for="(item, index) in periodSummary"
          :key="item.label"
          class="min-h-[58px] border-b border-via-line px-3 py-2"
          :class="[
            index % 2 === 0 ? 'border-r border-via-line pl-0' : 'pr-0',
            index >= periodSummary.length - 2 ? 'border-b-0' : undefined
          ]"
        >
          <strong class="numeric block text-[17px]">{{ item.value }}</strong>
          <span class="block text-[10px] text-via-muted">{{ item.label }}</span>
        </article>
      </div>
    </section>
  </div>
</template>
