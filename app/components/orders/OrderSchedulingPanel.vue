<script setup lang="ts">
import type { OrderSchedulingSlot } from '../../types/domain'

defineProps<{
  slots: OrderSchedulingSlot[]
}>()

const th = 'h-[38px] border-b border-via-line bg-via-surface-2 px-3 text-left text-[10px] font-bold tracking-[0.035em] text-via-muted uppercase'
const td = 'h-[58px] border-b border-via-line px-3 align-middle text-xs text-via-ink'
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="m-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">Agendamento</h2>
      <div class="flex gap-[7px]">
        <AppButton icon="i-lucide-send">Enviar link</AppButton>
        <AppButton icon="i-lucide-calendar-plus" variant="primary">Agendar</AppButton>
      </div>
    </div>

    <div class="mb-4 grid grid-cols-[minmax(220px,280px)_minmax(0,1fr)] items-end gap-3.5 border-b border-via-line pb-3.5">
      <label class="grid gap-1.5">
        <span class="text-[11px] font-[650] text-via-muted">Data do evento</span>
        <UInput placeholder="DD/MM/AAAA HH:mm" icon="i-lucide-calendar-days" />
      </label>
      <p class="mb-1 text-[11px] leading-[1.45] text-via-muted">Informe a data operacional ou envie o link de agendamento ao destinatário.</p>
    </div>

    <div
      v-if="!slots.length"
      class="grid justify-items-center gap-1.5 border border-dashed border-via-line-strong px-5 py-9 text-center text-via-muted"
      role="status"
    >
      <UIcon name="i-lucide-calendar-days" class="size-[22px] text-via-subtle" aria-hidden="true" />
      <strong class="text-[13px] text-via-ink">Sem agendamento</strong>
      <p class="m-0 max-w-[380px] text-xs leading-[1.45]">Nenhuma janela confirmada para este pedido. Envie o link ao destinatário ou registre a data operacionalmente.</p>
    </div>

    <div
      v-else
      class="min-w-0 overflow-auto"
    >
      <table class="w-full min-w-[720px] table-fixed border-collapse">
        <thead>
          <tr>
            <th :class="th">Agendado para</th>
            <th :class="th">Janela</th>
            <th :class="th">Status</th>
            <th :class="th">Canal</th>
            <th :class="th">Observação</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="slot in slots"
            :key="slot.id"
          >
            <td :class="td"><strong>{{ slot.scheduledFor }}</strong></td>
            <td :class="td">{{ slot.window }}</td>
            <td :class="td">
              <span
                class="inline-flex rounded-via-compact px-2 py-0.5 text-[11px] font-bold"
                :class="slot.tone === 'success'
                  ? 'bg-[color-mix(in_srgb,var(--via-green)_14%,transparent)] text-via-green'
                  : 'bg-[color-mix(in_srgb,var(--via-amber)_16%,transparent)] text-[oklch(54%_0.14_73)]'"
              >{{ slot.status }}</span>
            </td>
            <td :class="td">{{ slot.channel }}</td>
            <td :class="td">{{ slot.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
