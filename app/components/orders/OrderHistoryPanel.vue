<script setup lang="ts">
import type { OrderHistoryEntry } from '../../types/domain'

defineProps<{
  entries: OrderHistoryEntry[]
  loading?: boolean
}>()

const th = 'h-[38px] border-b border-via-line bg-via-surface-2 px-3 text-left text-[10px] font-bold tracking-[0.035em] text-via-muted uppercase'
const td = 'h-[58px] border-b border-via-line px-3 align-middle text-xs text-via-ink'
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="m-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">Histórico do pedido</h2>
    </div>

    <div
      v-if="loading"
      class="grid gap-2"
      aria-busy="true"
    >
      <USkeleton class="h-[42px] rounded-via-track" />
      <USkeleton class="h-[42px] rounded-via-track" />
      <USkeleton class="h-[42px] rounded-via-track" />
    </div>

    <div
      v-else-if="!entries.length"
      class="grid justify-items-center gap-1.5 border border-dashed border-via-line-strong px-5 py-9 text-center text-via-muted"
      role="status"
    >
      <UIcon name="i-lucide-history" class="size-[22px] text-via-subtle" aria-hidden="true" />
      <strong class="text-[13px] text-via-ink">Sem registros no histórico</strong>
      <p class="m-0 max-w-[380px] text-xs leading-[1.45]">Alterações de versão do pedido (versions) aparecem aqui quando disponíveis.</p>
    </div>

    <div
      v-else
      class="min-w-0 overflow-auto"
    >
      <table class="w-full min-w-[640px] table-fixed border-collapse">
        <thead>
          <tr>
            <th :class="[th, 'w-[72px]']">#</th>
            <th :class="[th, 'w-[170px]']">Data da ocorrência</th>
            <th :class="th">Descrição</th>
            <th :class="[th, 'w-[180px]']">Criado por</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in entries"
            :key="entry.id"
          >
            <td :class="[td, 'numeric w-[72px]']">{{ entry.id.replace('vh-', '') }}</td>
            <td :class="[td, 'w-[170px]']">{{ entry.createdAt }}</td>
            <td :class="td">{{ entry.description }}</td>
            <td :class="[td, 'w-[180px]']">{{ entry.username }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
