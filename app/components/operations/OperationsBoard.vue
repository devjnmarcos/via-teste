<script setup lang="ts">
import type { Operation, StageKey } from '../../types/domain'
import { statusMeta } from '../../types/domain'

defineProps<{
  operations: Operation[]
}>()

const stages: StageKey[] = ['new', 'supportMissing', 'assigned', 'route', 'done']
const rowGrid = 'grid grid-cols-[minmax(190px,1.2fr)_minmax(270px,2fr)_92px_118px_92px_112px_32px] items-center gap-x-4 px-5 max-[1380px]:grid-cols-[minmax(170px,1.05fr)_minmax(210px,1.6fr)_70px_102px_80px_96px_24px] max-[1380px]:gap-x-3 max-[1380px]:px-[18px]'

function stageColor(stage: StageKey) {
  return statusMeta[stage].color
}
</script>

<template>
  <section class="border-b border-via-line bg-via-surface">
    <header class="flex min-h-[58px] items-end justify-between border-b border-via-line px-5 pt-[11px] pb-2.5">
      <div>
        <h2 class="via-section-title">Operações</h2>
        <p class="mt-0.5 mb-0 text-[11px] text-via-muted">Selecione uma operação para analisar clientes, fluxo e distribuição.</p>
      </div>
      <div
        class="flex flex-wrap justify-end gap-3.5 max-[1380px]:gap-[9px]"
        aria-label="Legenda do fluxo"
      >
        <StatusLabel status="new" />
        <StatusLabel status="supportMissing" />
        <StatusLabel status="assigned" />
        <StatusLabel status="route" />
        <StatusLabel status="done" />
      </div>
    </header>

    <div
      :class="[rowGrid, 'min-h-9 bg-via-surface-2 text-[10px] font-bold tracking-[0.045em] text-via-muted uppercase']"
      aria-hidden="true"
    >
      <span>Operação</span><span>Distribuição do fluxo</span><span>No fluxo</span><span>Concluídos hoje</span><span>Ocorrências</span><span>Produtividade</span><span />
    </div>

    <NuxtLink
      v-for="operation in operations"
      :key="operation.slug"
      :to="`/operacoes/${operation.slug}`"
      :class="[rowGrid, 'min-h-16 border-t border-via-line bg-via-surface text-via-ink no-underline transition-colors duration-180 hover:bg-[color-mix(in_oklch,var(--via-blue-soft)_55%,var(--via-surface))]']"
    >
      <span>
        <strong class="block text-[13px] font-bold">{{ operation.name }}</strong>
        <small class="mt-0.5 block text-[11px] text-via-muted">{{ operation.note }}</small>
      </span>
      <span>
        <span class="flex h-[9px] w-full overflow-hidden rounded-via-track bg-via-surface-3">
          <i
            v-for="stage in stages"
            :key="stage"
            class="h-full min-w-0.5"
            :style="{ width: `${operation.flow[stage]}%`, backgroundColor: stageColor(stage) }"
          />
        </span>
        <span class="mt-[5px] flex justify-between text-[11px] text-via-muted">
          <span>abertos {{ 100 - operation.flow.done }}%</span>
          <span>concluídos {{ operation.flow.done }}%</span>
        </span>
      </span>
      <strong class="numeric text-base">{{ operation.total }}</strong>
      <strong class="numeric">{{ operation.completedToday }}</strong>
      <span
        class="inline-flex items-center gap-1.5"
        :class="{
          'text-[oklch(54%_0.14_73)]': operation.riskTone === 'warning',
          'text-via-red': operation.riskTone === 'danger'
        }"
      >
        <i
          class="size-1.5 rounded-full"
          :class="{
            'bg-via-green': operation.riskTone !== 'warning' && operation.riskTone !== 'danger',
            'bg-via-amber': operation.riskTone === 'warning',
            'bg-via-red': operation.riskTone === 'danger'
          }"
          aria-hidden="true"
        />
        <strong class="numeric">{{ operation.occurrences }}</strong>
      </span>
      <strong class="numeric">{{ operation.productivity }}</strong>
      <UIcon
        name="i-lucide-chevron-right"
        class="size-[18px] text-via-blue-strong"
        aria-hidden="true"
      />
    </NuxtLink>
  </section>
</template>
