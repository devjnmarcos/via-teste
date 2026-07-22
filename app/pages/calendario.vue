<script setup lang="ts">
/**
 * Calendário operacional — agenda mensal/semanal com drill para pedidos.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { CalendarEvent } from '~/data/demo/calendario'
import {
  buildMonthCells,
  buildWeekCells,
  calendarioAccountOptions,
  calendarioEvents,
  calendarioMonthIndex,
  calendarioMonthLabel,
  calendarioYear,
  countEventsByDay,
  eventsForDay,
  weekRangeLabel
} from '~/data/demo/calendario'
import { buildCalendarioMetrics } from '~/utils/operacao-p2-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Calendário · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const selectedDay = ref(18)
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const viewMode = ref<'month' | 'week'>('month')

const cells = computed(() => buildMonthCells(calendarioYear, calendarioMonthIndex))
const weekCells = computed(() =>
  buildWeekCells(calendarioYear, calendarioMonthIndex, selectedDay.value)
)
const counts = computed(() => countEventsByDay(accountId.value))

const filteredEvents = computed(() => {
  if (accountId.value === 'all') return calendarioEvents
  return calendarioEvents.filter((event) => event.accountId === accountId.value)
})

const dayEvents = computed(() => eventsForDay(selectedDay.value, accountId.value))
const listMetrics = computed(() =>
  buildCalendarioMetrics(filteredEvents.value, dayEvents.value.length)
)
const pagedRows = computed(() => slicePage(dayEvents.value, page.value, pageSize.value))

const eventsByDay = computed(() => {
  const map: Record<number, Array<{ id: string; timeLabel: string; client: string }>> = {}
  for (const event of filteredEvents.value) {
    if (!map[event.day]) map[event.day] = []
    map[event.day]!.push({
      id: event.id,
      timeLabel: event.timeLabel,
      client: event.client
    })
  }
  return map
})

const headerTitle = computed(() =>
  viewMode.value === 'week'
    ? weekRangeLabel(calendarioYear, calendarioMonthIndex, selectedDay.value)
    : calendarioMonthLabel
)

const columns: DataTableColumn<CalendarEvent>[] = [
  { type: 'text', key: 'timeLabel', label: 'Horário', width: '90px' },
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '18%' },
  { type: 'text', key: 'accountName', label: 'Conta', width: '22%' },
  { type: 'text', key: 'situation', label: 'Situação', width: '100px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '140px',
    items: (row) => [
      {
        key: 'open',
        label: 'Abrir',
        icon: 'i-lucide-eye',
        variant: 'ghost' as const,
        ariaLabel: `Abrir pedido ${row.orderId}`
      },
      {
        key: 'list',
        label: 'Lista',
        icon: 'i-lucide-list-filter',
        variant: 'ghost' as const,
        ariaLabel: `Filtrar pedidos do horário ${row.timeLabel}`
      }
    ]
  }
]

watch([accountId, selectedDay], () => {
  page.value = 1
})

function onSelectDay(day: number) {
  selectedDay.value = day
}

function setView(mode: 'month' | 'week') {
  viewMode.value = mode
}

function shiftWeek(delta: number) {
  const next = selectedDay.value + delta * 7
  const daysInMonth = new Date(calendarioYear, calendarioMonthIndex + 1, 0).getDate()
  selectedDay.value = Math.min(daysInMonth, Math.max(1, next))
}

function refresh() {
  toast.success('Atualizado', 'Calendário recarregado (mock).')
}

function onAction(payload: { row: CalendarEvent; action: string }) {
  if (payload.action === 'open') {
    navigateTo(`/pedidos/${payload.row.orderId}`)
    return
  }
  if (payload.action === 'list') {
    navigateTo({
      path: '/pedidos',
      query: {
        scheduled_time: payload.row.timeLabel,
        account_id: payload.row.accountId,
        situation: payload.row.situation
      }
    })
  }
}
</script>

<template>
  <div class="calendario-page">
    <PageHeader
      :title="headerTitle"
      subtitle="Agenda operacional de pedidos agendados"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="listMetrics"
      :max-per-row="3"
    />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="calendarioAccountOptions"
        class="w-[260px]"
      />
      <div
        class="inline-flex border border-via-line"
        role="group"
        aria-label="Vista do calendário"
      >
        <AppButton
          :variant="viewMode === 'month' ? 'primary' : 'ghost'"
          icon="i-lucide-calendar"
          @click="setView('month')"
        >
          Mês
        </AppButton>
        <AppButton
          :variant="viewMode === 'week' ? 'primary' : 'ghost'"
          icon="i-lucide-calendar-range"
          data-testid="calendario-view-week"
          @click="setView('week')"
        >
          Semana
        </AppButton>
      </div>
      <template v-if="viewMode === 'week'">
        <AppButton
          icon="i-lucide-chevron-left"
          variant="ghost"
          aria-label="Semana anterior"
          @click="shiftWeek(-1)"
        />
        <AppButton
          icon="i-lucide-chevron-right"
          variant="ghost"
          aria-label="Próxima semana"
          @click="shiftWeek(1)"
        />
      </template>
      <span class="text-sm text-via-muted">
        Dia selecionado: <strong class="text-via-ink">{{ selectedDay }}/07</strong>
      </span>
    </section>

    <section
      class="grid grid-cols-1 border-b border-via-line"
      aria-label="Agenda"
    >
      <div class="min-w-0">
        <ViaCalendar
          v-if="viewMode === 'month'"
          :cells="cells"
          :counts="counts"
          :selected-day="selectedDay"
          :today-day="18"
          @select="onSelectDay"
        />
        <ViaCalendarWeek
          v-else
          :cells="weekCells"
          :counts="counts"
          :selected-day="selectedDay"
          :today-day="18"
          :events-by-day="eventsByDay"
          @select="onSelectDay"
        />
      </div>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="880px"
      empty-title="Sem agendamentos no dia"
      empty-description="Selecione outro dia ou ajuste a conta."
      @action="onAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="dayEvents.length"
    />
  </div>
</template>
