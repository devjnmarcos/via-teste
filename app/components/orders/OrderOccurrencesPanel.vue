<script setup lang="ts">
import type { OrderOccurrence } from '../../types/domain'

defineProps<{
  occurrences: OrderOccurrence[]
}>()

const th = 'h-[38px] border-b border-via-line bg-via-surface-2 px-3 text-left text-[10px] font-bold tracking-[0.035em] text-via-muted uppercase'
const td = 'h-[58px] border-b border-via-line px-3 align-middle text-xs text-via-ink'
const toneClass: Record<string, string> = {
  danger: 'text-via-red',
  warning: 'text-via-amber',
  info: 'text-via-blue-strong'
}
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="m-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">Ocorrências do pedido</h2>
      <div class="flex gap-[7px]">
        <AppButton icon="i-lucide-upload">Importar XLSX</AppButton>
        <AppButton icon="i-lucide-plus" variant="primary">Registrar ocorrência</AppButton>
      </div>
    </div>

    <div
      v-if="!occurrences.length"
      class="grid justify-items-center gap-2 border border-dashed border-via-line-strong px-5 py-9 text-center text-via-muted"
      role="status"
    >
      <UIcon name="i-lucide-triangle-alert" class="size-[22px] text-via-subtle" aria-hidden="true" />
      <strong class="text-[13px] text-via-ink">Nenhuma ocorrência registrada</strong>
      <p class="m-0 max-w-[380px] text-xs leading-[1.45]">Eventos de campo, tratativas e baixas aparecem nesta aba conforme o catálogo de ocorrências.</p>
      <AppButton icon="i-lucide-plus" variant="primary">Registrar ocorrência</AppButton>
    </div>

    <div
      v-else
      class="min-w-0 overflow-auto"
    >
      <table class="w-full min-w-[720px] table-fixed border-collapse">
        <thead>
          <tr>
            <th :class="th">Descrição</th>
            <th :class="[th, 'w-[150px]']">Data informada</th>
            <th :class="[th, 'w-[170px]']">Origem</th>
            <th :class="[th, 'w-[150px]']">Criada em</th>
            <th :class="[th, 'w-[88px] text-right']">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="occurrence in occurrences"
            :key="occurrence.id"
          >
            <td :class="td">
              <strong class="block">{{ occurrence.description }}</strong>
              <small
                class="mt-0.5 block text-[10px]"
                :class="toneClass[occurrence.tone]"
              >{{ occurrence.tone === 'danger' ? 'Requer tratativa' : 'Registrada' }}</small>
            </td>
            <td :class="[td, 'w-[150px]']">{{ occurrence.happenedAt }}</td>
            <td :class="[td, 'w-[170px]']">{{ occurrence.origin }}</td>
            <td :class="[td, 'w-[150px]']">{{ occurrence.createdAt }}</td>
            <td :class="[td, 'w-[88px] text-right']">
              <AppButton
                v-if="occurrence.canRemove"
                variant="ghost"
                icon="i-lucide-trash-2"
                aria-label="Remover ocorrência"
              />
              <span
                v-else
                class="text-via-muted"
              >—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
