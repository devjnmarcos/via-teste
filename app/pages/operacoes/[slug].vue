<script setup lang="ts">
import { operationClients, operationMetrics, operations, operationStages, trendSeries } from '~/data/demo/operations'

const route = useRoute()
const operation = computed(() => operations.find(item => item.slug === route.params.slug) ?? operations[0]!)

const distribution = [
  { status: 'new' as const, value: 14 },
  { status: 'supportMissing' as const, value: 10 },
  { status: 'assigned' as const, value: 28 },
  { status: 'route' as const, value: 53 },
  { status: 'done' as const, value: 93, label: 'Concluído hoje' }
]

useSeoMeta({ title: () => `${operation.value.name} · Via Reversa` })

const th = 'h-[34px] bg-via-surface-2 px-3 text-left text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase first:w-[31%] first:pl-5'
const td = 'h-[51px] border-t border-via-line px-3 text-[11px] first:w-[31%] first:pl-5'
</script>

<template>
  <div class="min-h-full">
    <PageHeader
      :title="operation.name"
      :subtitle="`${operation.clientsCount} clientes · ${operation.total} pedidos no fluxo`"
    >
      <AppButton icon="i-lucide-list-filter">Trocar operação</AppButton>
      <AppButton to="/" icon="i-lucide-arrow-left">Voltar à visão geral</AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="operationMetrics"
      :max-per-row="3"
    />
    <OperationFlow :stages="operationStages" />

    <section class="grid min-h-[345px] grid-cols-[minmax(620px,1.55fr)_minmax(320px,0.8fr)] max-[1380px]:grid-cols-[minmax(600px,1.45fr)_minmax(300px,0.75fr)]">
      <div class="min-w-0 border-r border-via-line">
        <header class="flex min-h-[52px] items-center justify-between border-b border-via-line px-5 py-2.5">
          <div>
            <strong class="block text-[13px]">Clientes nesta operação</strong>
            <span class="mt-0.5 block text-[11px] text-via-muted">{{ operation.clientsCount }} clientes ordenados por risco e volume</span>
          </div>
          <UButton color="primary" variant="link">Ver todos os clientes</UButton>
        </header>
        <table class="w-full table-fixed border-collapse">
          <thead>
            <tr>
              <th :class="th">Cliente / conta</th>
              <th :class="th">No fluxo</th>
              <th :class="th">Em rota</th>
              <th :class="th">Ocorrências</th>
              <th :class="th">SLA</th>
              <th :class="th">Produtividade</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="client in operationClients"
              :key="client.name"
              class="cursor-pointer"
            >
              <td :class="td"><strong class="block text-xs">{{ client.name }}</strong><small class="mt-0.5 block text-[10px] text-via-muted">{{ client.account }}</small></td>
              <td :class="[td, 'numeric']">{{ client.total }}</td>
              <td :class="[td, 'numeric']">{{ client.route }}</td>
              <td :class="[td, 'numeric']">{{ client.occurrences }}</td>
              <td :class="td">
                <span
                  class="inline-flex items-center gap-[5px]"
                  :class="client.slaTone === 'success' ? 'text-via-green' : 'text-[oklch(55%_0.14_73)]'"
                ><i class="size-1.5 rounded-full bg-current" />{{ client.sla }}</span>
              </td>
              <td :class="[td, 'numeric']">{{ client.productivity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <aside class="min-w-0 [&_>_:first-child]:border-b [&_>_:first-child]:border-via-line">
        <VolumeTrendChart :series="trendSeries" title="Volume da operação · 7 dias" note="pedidos recebidos" :height="136" />
        <StatusDistribution :items="distribution" />
      </aside>
    </section>
  </div>
</template>
