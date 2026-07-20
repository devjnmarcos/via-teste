<script setup lang="ts">
import type { CadastroColumn, CadastroRow } from '../../types/domain'

defineProps<{
  columns: CadastroColumn[]
  rows: CadastroRow[]
  emptyTitle?: string
  emptyDescription?: string
}>()

const toneClass: Record<string, string> = {
  success: 'text-via-green',
  warning: 'text-via-amber',
  danger: 'text-via-red',
  info: 'text-via-blue-strong',
  assigned: 'text-via-violet',
  neutral: 'text-via-muted'
}
</script>

<template>
  <EmptyState
    v-if="!rows.length"
    :title="emptyTitle ?? 'Nenhum registro'"
    :description="emptyDescription ?? 'Ajuste os filtros ou cadastre um novo item.'"
    icon="i-lucide-inbox"
  />
  <DataTable
    v-else
    :columns="columns.map((column) => ({ key: column.key, label: column.label }))"
    min-width="860px"
  >
    <tr
      v-for="row in rows"
      :key="row.id"
      class="cursor-pointer"
      tabindex="0"
      @click="navigateTo(row.href)"
      @keydown.enter="navigateTo(row.href)"
    >
      <td><strong>{{ row.primary }}</strong></td>
      <td>{{ row.secondary }}</td>
      <td>{{ row.tertiary }}</td>
      <td>
        <span
          class="font-[650]"
          :class="toneClass[row.statusTone] ?? toneClass.neutral"
        >{{ row.status }}</span>
      </td>
      <td v-if="columns.some((column) => column.key === 'meta')">
        {{ row.meta ?? '—' }}
      </td>
    </tr>
  </DataTable>
</template>
