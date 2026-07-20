<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  note?: string
}>(), {
  note: undefined
})
</script>

<template>
  <section class="chart-panel min-w-0 bg-via-surface">
    <header class="flex items-start justify-between gap-3 border-b border-via-line px-4 pt-3 pb-2">
      <div>
        <strong class="block text-xs text-via-ink">{{ title }}</strong>
        <p
          v-if="note"
          class="mt-0.5 mb-0 text-[11px] text-via-muted"
        >
          {{ note }}
        </p>
      </div>
      <div
        v-if="$slots.actions"
        class="flex gap-1.5"
      >
        <slot name="actions" />
      </div>
    </header>
    <div class="min-h-40 overflow-visible">
      <slot />
    </div>
  </section>
</template>
