<script setup lang="ts">
/**
 * Grade mensal do calendário operacional (tokens Via).
 */
defineProps<{
  cells: Array<{ day: number | null; key: string }>
  counts: Record<number, number>
  selectedDay: number | null
  todayDay?: number
}>()

const emit = defineEmits<{
  select: [day: number]
}>()

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
</script>

<template>
  <div
    class="via-calendar border-b border-via-line px-[18px] py-4"
    role="grid"
    aria-label="Calendário mensal"
  >
    <div
      class="mb-2 grid grid-cols-7 gap-px"
      role="row"
    >
      <div
        v-for="label in weekdays"
        :key="label"
        class="px-1 py-1 text-center text-[11px] font-bold tracking-wide text-via-muted uppercase"
        role="columnheader"
      >
        {{ label }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-px bg-via-line">
      <button
        v-for="cell in cells"
        :key="cell.key"
        type="button"
        class="min-h-[72px] border-0 bg-via-surface px-2 py-2 text-left transition-colors"
        :class="[
          cell.day == null
            ? 'cursor-default bg-[oklch(97%_0.01_253)] text-transparent'
            : 'cursor-pointer hover:bg-[oklch(96%_0.02_253)]',
          cell.day != null && cell.day === selectedDay
            ? 'bg-[oklch(94%_0.04_253)] ring-1 ring-inset ring-[oklch(55%_0.1_253)]'
            : undefined,
          cell.day != null && cell.day === todayDay
            ? 'font-bold'
            : undefined
        ]"
        :disabled="cell.day == null"
        :aria-pressed="cell.day != null && cell.day === selectedDay"
        :aria-label="cell.day != null ? `Dia ${cell.day}` : undefined"
        @click="cell.day != null && emit('select', cell.day)"
      >
        <template v-if="cell.day != null">
          <span class="numeric block text-sm text-via-ink">{{ cell.day }}</span>
          <span
            v-if="counts[cell.day]"
            class="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-[oklch(35%_0.08_253)] bg-[oklch(92%_0.04_253)]"
          >
            {{ counts[cell.day] }} agend.
          </span>
        </template>
      </button>
    </div>
  </div>
</template>
