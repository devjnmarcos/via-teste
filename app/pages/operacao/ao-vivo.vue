<script setup lang="ts">
import { attentionItems, liveMetrics, liveOrders } from '~/data/demo/orders'

const activeFilter = ref('Todos')
const filters = ['Todos', 'Em rota', 'Ocorrência']

useSeoMeta({ title: 'Operação ao vivo · Via Reversa' })
</script>

<template>
  <div>
    <PageHeader
      title="Operação ao vivo"
      subtitle="Pedidos acontecendo agora, por etapa e tempo de permanência"
      live
    >
      <AppButton icon="i-lucide-filter">Filtrar operação</AppButton>
      <AppButton icon="i-lucide-pause">Pausar atualização</AppButton>
    </PageHeader>

    <MetricsStrip :metrics="liveMetrics" />

    <div class="grid min-h-[510px] grid-cols-[minmax(0,1fr)_310px] max-[1380px]:grid-cols-[minmax(0,1fr)_288px]">
      <section class="min-w-0 border-r border-via-line">
        <header class="flex min-h-[61px] items-center justify-between border-b border-via-line px-[18px] py-2.5">
          <div>
            <strong class="block text-[13px]">Pedidos em andamento agora</strong>
            <span class="mt-0.5 block text-[11px] text-via-muted">146 pedidos ordenados por risco e tempo na etapa</span>
          </div>
          <div class="flex gap-1.5">
            <button
              v-for="filter in filters"
              :key="filter"
              type="button"
              class="min-h-8 cursor-pointer rounded-[5px] border border-via-line-strong bg-via-surface px-2.5 text-[11px] text-via-muted transition-[color,border-color,background-color] duration-150"
              :class="activeFilter === filter
                ? 'border-via-blue bg-via-blue-soft font-bold text-via-blue-strong'
                : undefined"
              @click="activeFilter = filter"
            >{{ filter }}</button>
          </div>
        </header>
        <OrdersTable :orders="liveOrders" live />
      </section>
      <AttentionQueue :items="attentionItems" />
    </div>
  </div>
</template>
