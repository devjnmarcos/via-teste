<script setup lang="ts">
/**
 * Grade semanal do calendário operacional (tokens Via).
 */
defineProps<{
  cells: Array<{ day: number | null; key: string; weekdayLabel: string }>
  counts: Record<number, number>
  selectedDay: number | null
  todayDay?: number
  eventsByDay?: Record<number, Array<{ id: string; timeLabel: string; client: string }>>
}>()

const emit = defineEmits<{
  select: [day: number]
}>()
</script>

<template>
  <div
    class="via-calendar-week border-b border-via-line px-[18px] py-4"
    role="grid"
    aria-label="Calendário semanal"
    data-testid="via-calendar-week"
  >
    <div class="grid grid-cols-7 gap-px bg-via-line">
      <button
        v-for="cell in cells"
        :key="cell.key"
        type="button"
        class="min-h-[140px] border-0 bg-via-surface px-2 py-2 text-left transition-colors"
        :class="[
          cell.day == null
            ? 'cursor-default bg-[oklch(97%_0.01_253)] text-via-muted'
            : 'cursor-pointer hover:bg-[oklch(96%_0.02_253)]',
          cell.day != null && cell.day === selectedDay
            ? 'bg-[oklch(94%_0.04_253)] ring-1 ring-inset ring-[oklch(55%_0.1_253)]'
            : undefined,
          cell.day != null && cell.day === todayDay ? 'font-bold' : undefined
        ]"
        :disabled="cell.day == null"
        :aria-pressed="cell.day != null && cell.day === selectedDay"
        :aria-label="cell.day != null ? `${cell.weekdayLabel} dia ${cell.day}` : cell.weekdayLabel"
        @click="cell.day != null && emit('select', cell.day)"
      >
        <span class="block text-[11px] font-bold tracking-wide text-via-muted uppercase">
          {{ cell.weekdayLabel }}
        </span>
        <span
          v-if="cell.day != null"
          class="numeric mt-1 block text-sm text-via-ink"
        >
          {{ cell.day }}
        </span>
        <span
          v-else
          class="mt-1 block text-xs text-via-muted"
        >
          —
        </span>
        <ul
          v-if="cell.day != null && eventsByDay?.[cell.day]?.length"
          class="mt-2 m-0 list-none space-y-1 p-0"
        >
          <li
            v-for="event in eventsByDay[cell.day]!.slice(0, 3)"
            :key="event.id"
            class="truncate rounded px-1.5 py-0.5 text-[10px] text-[oklch(35%_0.08_253)] bg-[oklch(92%_0.04_253)]"
          >
            {{ event.timeLabel }} · {{ event.client }}
          </li>
          <li
            v-if="(eventsByDay[cell.day]?.length ?? 0) > 3"
            class="text-[10px] text-via-muted"
          >
            +{{ (eventsByDay[cell.day]?.length ?? 0) - 3 }} mais
          </li>
        </ul>
        <span
          v-else-if="cell.day != null && counts[cell.day]"
          class="mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-[oklch(35%_0.08_253)] bg-[oklch(92%_0.04_253)]"
        >
          {{ counts[cell.day] }} agend.
        </span>
      </button>
    </div>
  </div>
</template>
