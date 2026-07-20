<script setup lang="ts">
import type { OperationStage } from "../../types/domain";

defineProps<{
  stages: OperationStage[];
}>();
</script>

<template>
  <section class="border-b border-via-line bg-via-surface px-5 pt-[15px] pb-4">
    <header class="mb-3.5 flex items-center justify-between">
      <strong class="text-[15px]">Fluxo da operação</strong>
      <span class="text-[11px] text-via-muted">posição atual dos pedidos</span>
    </header>
    <div class="grid grid-cols-5">
      <article
        v-for="(stage, index) in stages"
        :key="stage.key"
        class="relative min-w-0 border-r border-via-line px-[18px] pt-3 pb-[18px] last:border-r-0 last:pr-0 first:pl-0"
        :style="{
          '--stage-color': stage.color,
          background: 'color-mix(in srgb, var(--stage-color) 5%, transparent)'
        }"
      >
        <span class="flex items-start gap-[7px] text-xs font-bold leading-[1.25] text-via-muted">
          <i
            class="mt-[3px] size-[7px] shrink-0 rounded-full"
            :style="{ backgroundColor: stage.color }"
            aria-hidden="true"
          />
          {{ stage.label }}
        </span>
        <strong class="numeric mt-1 block text-2xl leading-[1.1]">{{ stage.count }}</strong>
        <span class="text-xs text-via-muted">{{ stage.share }}% do fluxo</span>
        <span
          class="absolute right-[18px] bottom-2 left-[18px] h-[3px] bg-via-surface-3"
          :class="[
            index === 0 ? 'left-0' : undefined,
            index === stages.length - 1 ? 'right-0' : undefined
          ]"
        >
          <i
            class="block h-full"
            :style="{ width: `${stage.progress}%`, backgroundColor: stage.color }"
          />
        </span>
      </article>
    </div>
  </section>
</template>
