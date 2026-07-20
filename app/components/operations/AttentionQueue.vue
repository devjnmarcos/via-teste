<script setup lang="ts">
import type { AttentionItem } from '../../types/domain'

defineProps<{
  items: AttentionItem[]
}>()
</script>

<template>
  <aside class="min-w-0 bg-via-surface">
    <header class="flex min-h-[61px] items-center justify-between border-b border-via-line px-[17px] py-2.5">
      <strong class="text-[13px]">Precisam de ação</strong>
      <b class="numeric text-[17px] text-via-red">{{ items.length }}</b>
    </header>
    <NuxtLink
      v-for="item in items"
      :key="item.orderId"
      :to="`/pedidos/${item.orderId}`"
      class="block min-h-[106px] border-b border-via-line bg-via-surface px-[17px] py-3.5 text-via-ink no-underline hover:bg-via-blue-soft max-[1380px]:min-h-[98px]"
    >
      <span class="flex items-center justify-between gap-3">
        <strong class="text-xs">#{{ item.orderId }}</strong>
        <StatusLabel :status="item.status" :label="item.label" />
      </span>
      <span class="mt-2 mb-[5px] block text-[11px] leading-[1.45]">{{ item.description }}</span>
      <small class="text-[10px] text-via-muted">{{ item.timing }}</small>
    </NuxtLink>
  </aside>
</template>
