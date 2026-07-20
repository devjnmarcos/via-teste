<script setup lang="ts">
import type { OrderEvent } from '../../types/domain'

defineProps<{
  events: OrderEvent[]
  updatedAt: string
}>()
</script>

<template>
  <section class="grid min-h-[112px] grid-cols-[140px_minmax(0,1fr)] border-b border-via-line px-5 py-3.5">
    <div class="self-center pr-3.5">
      <strong class="block text-xs tracking-[0.05em] uppercase">Jornada do pedido</strong>
      <span class="mt-1 block text-[11px] text-via-muted">Última atualização às {{ updatedAt }}</span>
    </div>
    <div class="min-w-0 overflow-x-auto overflow-y-hidden">
      <div
        v-if="events.length"
        class="grid min-w-[580px] items-start"
        :style="{ gridTemplateColumns: `repeat(${events.length}, minmax(145px, 1fr))` }"
      >
        <article
          v-for="(event, index) in events"
          :key="`${event.time}-${event.name}`"
          class="relative min-w-0 pt-px pr-4"
          :class="event.tone === 'danger' ? 'text-via-red' : undefined"
        >
          <span
            v-if="index < events.length - 1"
            class="absolute top-[25px] right-0 left-6 h-px"
            :class="event.tone === 'danger' ? 'bg-via-line' : 'bg-via-blue'"
            aria-hidden="true"
          />
          <span class="block text-[10px] text-via-muted">{{ event.time }}</span>
          <i
            class="relative z-1 mt-[3px] mb-[5px] grid size-6 place-items-center rounded-full text-via-surface [&_svg]:size-[13px]"
            :class="event.tone === 'danger' ? 'bg-via-red' : 'bg-via-blue'"
            aria-hidden="true"
          >
            <UIcon :name="event.tone === 'danger' ? 'i-lucide-alert-triangle' : 'i-lucide-check'" />
          </i>
          <strong
            class="block text-xs"
            :class="event.tone === 'danger' ? 'text-via-red' : undefined"
          >{{ event.name }}</strong>
          <span
            class="mt-px block text-[11px]"
            :class="event.tone === 'danger' ? 'text-via-red' : 'text-via-muted'"
          >{{ event.description }}</span>
        </article>
      </div>
      <p
        v-else
        class="m-0 text-[11px] text-via-muted"
      >
        Nenhum evento operacional registrado.
      </p>
    </div>
  </section>
</template>
