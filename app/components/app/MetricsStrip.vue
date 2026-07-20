<script setup lang="ts">
import type { Metric } from '../../types/domain'

const props = withDefaults(defineProps<{
  metrics: Metric[]
  showIcons?: boolean
  compact?: boolean
  /** Quando definido, quebra a faixa em linhas de no máximo N cards (ex.: 3 → layout 3/3). */
  maxPerRow?: number
}>(), {
  showIcons: true,
  compact: false,
  maxPerRow: undefined
})

const columns = computed(() => {
  const count = props.maxPerRow
    ? Math.min(props.maxPerRow, Math.max(props.metrics.length, 1))
    : Math.max(props.metrics.length, 1)
  return {
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`
  }
})

function isRowEnd(index: number): boolean {
  if (!props.maxPerRow) return index === props.metrics.length - 1
  return (index + 1) % props.maxPerRow === 0 || index === props.metrics.length - 1
}

function isWrappedRow(index: number): boolean {
  return Boolean(props.maxPerRow && index >= props.maxPerRow)
}

const toneValueClass: Record<string, string> = {
  warning: 'text-[oklch(55%_0.14_73)]',
  success: 'text-via-green',
  danger: 'text-via-red'
}
</script>

<template>
  <section
    class="metrics-strip m-0 grid min-h-[84px] gap-0 border-b border-via-line bg-via-surface"
    :class="{ 'metrics-strip--compact': compact, 'metrics-strip--no-icons': !showIcons }"
    :style="columns"
    aria-label="Indicadores"
  >
    <template
      v-for="(metric, index) in metrics"
      :key="metric.label"
    >
      <NuxtLink
        v-if="metric.to"
        :to="metric.to"
        data-metric-item
        class="metric-item metric-item--link m-0 grid min-w-0 cursor-pointer grid-cols-[34px_minmax(0,1fr)] items-center gap-2 rounded-none border-r border-via-line px-5 py-3.5 text-inherit no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--via-blue-soft)_22%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-via-blue max-[1380px]:px-3.5"
        :class="[
          metric.tone ? `metric-item--${metric.tone}` : undefined,
          !showIcons ? 'block px-[18px] py-[13px]' : undefined,
          isRowEnd(index) ? 'border-r-0' : undefined,
          isWrappedRow(index) ? 'border-t border-via-line' : undefined
        ]"
      >
        <UIcon
          v-if="showIcons && metric.icon"
          :name="metric.icon"
          class="metric-item__icon size-[22px] text-via-subtle"
          aria-hidden="true"
        />
        <div class="min-w-0">
          <div
            class="flex items-baseline gap-[9px]"
            :class="compact || !showIcons ? 'block' : undefined"
          >
            <strong
              class="metric-item__value numeric font-[750] tracking-[-0.035em] text-via-ink"
              :class="[
                compact ? 'text-xl' : !showIcons ? 'mb-px block text-[22px]' : 'text-[25px] leading-[1.1]',
                metric.tone ? toneValueClass[metric.tone] : undefined
              ]"
            >{{ metric.value }}</strong>
            <span
              v-if="!compact"
              class="metric-item__label block min-w-0 text-[13px] font-bold leading-[1.3]"
            >{{ metric.label }}</span>
          </div>
          <strong
            v-if="compact"
            class="metric-item__label block min-w-0 text-[10px] font-bold tracking-[0.045em] text-via-muted uppercase"
          >{{ metric.label }}</strong>
          <span class="metric-item__note mt-px block overflow-hidden text-xs leading-[1.35] text-ellipsis whitespace-nowrap text-via-muted">{{ metric.note }}</span>
        </div>
      </NuxtLink>
      <article
        v-else
        data-metric-item
        class="metric-item m-0 grid min-w-0 grid-cols-[34px_minmax(0,1fr)] items-center gap-2 rounded-none border-r border-via-line px-5 py-3.5 max-[1380px]:px-3.5"
        :class="[
          metric.tone ? `metric-item--${metric.tone}` : undefined,
          !showIcons ? 'block px-[18px] py-[13px]' : undefined,
          isRowEnd(index) ? 'border-r-0' : undefined,
          isWrappedRow(index) ? 'border-t border-via-line' : undefined
        ]"
      >
        <UIcon
          v-if="showIcons && metric.icon"
          :name="metric.icon"
          class="metric-item__icon size-[22px] text-via-subtle"
          aria-hidden="true"
        />
        <div class="min-w-0">
          <div
            class="flex items-baseline gap-[9px]"
            :class="compact || !showIcons ? 'block' : undefined"
          >
            <strong
              class="metric-item__value numeric font-[750] tracking-[-0.035em] text-via-ink"
              :class="[
                compact ? 'text-xl' : !showIcons ? 'mb-px block text-[22px]' : 'text-[25px] leading-[1.1]',
                metric.tone ? toneValueClass[metric.tone] : undefined
              ]"
            >{{ metric.value }}</strong>
            <span
              v-if="!compact"
              class="metric-item__label block min-w-0 text-[13px] font-bold leading-[1.3]"
            >{{ metric.label }}</span>
          </div>
          <strong
            v-if="compact"
            class="metric-item__label block min-w-0 text-[10px] font-bold tracking-[0.045em] text-via-muted uppercase"
          >{{ metric.label }}</strong>
          <span class="metric-item__note mt-px block overflow-hidden text-xs leading-[1.35] text-ellipsis whitespace-nowrap text-via-muted">{{ metric.note }}</span>
        </div>
      </article>
    </template>
  </section>
</template>
