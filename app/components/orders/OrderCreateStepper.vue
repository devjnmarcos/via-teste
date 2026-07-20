<script setup lang="ts">
import type { OrderCreateStepMeta } from '../../types/order-create'

defineProps<{
  steps: OrderCreateStepMeta[]
  currentIndex: number
}>()
</script>

<template>
  <ol
    class="m-0 grid list-none grid-cols-5 gap-0 border-b border-via-line bg-via-surface p-0 max-[1100px]:grid-cols-[repeat(5,minmax(140px,1fr))] max-[1100px]:overflow-x-auto"
    aria-label="Etapas da criação do pedido"
  >
    <li
      v-for="(step, index) in steps"
      :key="step.id"
      class="flex min-h-[72px] items-start gap-2.5 border-r border-via-line px-4 py-3.5 text-via-muted last:border-r-0"
      :class="{
        'bg-[color-mix(in_oklab,var(--via-blue-soft)_55%,var(--via-surface))] text-via-ink shadow-[inset_0_-2px_0_var(--via-blue)]': index === currentIndex,
        'text-via-ink': index < currentIndex
      }"
      :aria-current="index === currentIndex ? 'step' : undefined"
    >
      <span
        class="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border border-via-line-strong bg-via-surface text-[11px] font-bold"
        :class="{
          'border-via-blue bg-via-blue text-via-surface': index === currentIndex,
          'border-via-green bg-[color-mix(in_oklab,var(--via-green)_12%,var(--via-surface))] text-via-green': index < currentIndex
        }"
        aria-hidden="true"
      >
        <UIcon v-if="index < currentIndex" name="i-lucide-check" />
        <template v-else>{{ index + 1 }}</template>
      </span>
      <span class="grid min-w-0 gap-0.5">
        <strong class="text-xs font-bold tracking-[-0.01em]">{{ step.label }}</strong>
        <small class="text-[10px] leading-[1.35] text-via-subtle">{{ step.description }}</small>
      </span>
    </li>
  </ol>
</template>
