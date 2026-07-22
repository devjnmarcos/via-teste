<script setup lang="ts">
import type { Metric } from '../../types/domain'

const props = withDefaults(defineProps<{
  metrics: Metric[]
  showIcons?: boolean
  compact?: boolean
  /** Quando definido, quebra a faixa em linhas de no máximo N cards (ex.: 3 → layout 3/3). */
  maxPerRow?: number
  /** Quando definido, cada linha tem sua própria contagem de colunas (ex.: [3, 2] → linha 1 com 3 cards, linha 2 com 2 cards ocupando 50% cada). Tem prioridade sobre maxPerRow. */
  rowSizes?: number[]
}>(), {
  showIcons: true,
  compact: false,
  maxPerRow: undefined,
  rowSizes: undefined
})

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

/** Menor nº de colunas que acomoda todas as linhas de rowSizes com spans inteiros. */
const rowLayout = computed(() => {
  if (!props.rowSizes?.length) return null
  const totalColumns = props.rowSizes.reduce((acc, size) => lcm(acc, size), 1)
  return { totalColumns, rowSizes: props.rowSizes }
})

const columns = computed(() => {
  if (rowLayout.value) {
    return { gridTemplateColumns: `repeat(${rowLayout.value.totalColumns}, minmax(0, 1fr))` }
  }
  const count = props.maxPerRow
    ? Math.min(props.maxPerRow, Math.max(props.metrics.length, 1))
    : Math.max(props.metrics.length, 1)
  return {
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`
  }
})

/** Linha (0-based) e tamanho declarado dela para o index de um metric, com fallback pra última linha em overflow. */
function rowForIndex(index: number, rowSizes: number[]): { rowStart: number, rowSize: number } {
  let cursor = 0
  for (const size of rowSizes) {
    if (index < cursor + size) return { rowStart: cursor, rowSize: size }
    cursor += size
  }
  return { rowStart: cursor - (rowSizes[rowSizes.length - 1] ?? 1), rowSize: rowSizes[rowSizes.length - 1] ?? 1 }
}

function itemStyle(index: number): Record<string, string> | undefined {
  if (!rowLayout.value) return undefined
  const { totalColumns, rowSizes } = rowLayout.value
  const { rowSize } = rowForIndex(index, rowSizes)
  return { gridColumn: `span ${totalColumns / rowSize}` }
}

function isRowEnd(index: number): boolean {
  if (rowLayout.value) {
    const { rowStart, rowSize } = rowForIndex(index, rowLayout.value.rowSizes)
    return index === rowStart + rowSize - 1 || index === props.metrics.length - 1
  }
  if (!props.maxPerRow) return index === props.metrics.length - 1
  return (index + 1) % props.maxPerRow === 0 || index === props.metrics.length - 1
}

function isWrappedRow(index: number): boolean {
  if (rowLayout.value) {
    return index >= (rowLayout.value.rowSizes[0] ?? 0)
  }
  return Boolean(props.maxPerRow && index >= props.maxPerRow)
}

const toneValueClass: Record<string, string> = {
  warning: 'text-[oklch(55%_0.14_73)]',
  success: 'text-via-green',
  danger: 'text-via-red'
}

/** Cor do ícone por tone — mesma paleta semântica usada no valor, estendida pros tones sem cor no valor (neutral/info/assigned). */
const toneIconClass: Record<string, string> = {
  neutral: 'text-via-subtle',
  info: 'text-via-blue',
  assigned: 'text-via-violet',
  success: 'text-via-green',
  warning: 'text-[oklch(55%_0.14_73)]',
  danger: 'text-via-red'
}

function iconClass(metric: Metric): string {
  return metric.tone ? toneIconClass[metric.tone] ?? 'text-via-subtle' : 'text-via-subtle'
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
        :style="itemStyle(index)"
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
          class="metric-item__icon size-[22px]"
          :class="iconClass(metric)"
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
        :style="itemStyle(index)"
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
          class="metric-item__icon size-[22px]"
          :class="iconClass(metric)"
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
