<script setup lang="ts">
/**
 * Operação → Check In de loja.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { CheckInHistoryRow, CheckInLookupResult } from '~/data/demo/loja-check-in'
import {
  confirmCheckIn,
  lookupCheckInOrder,
  lojaCheckInState,
  lojaCheckInVolumeTrend
} from '~/data/demo/loja-check-in'
import { buildLojaCheckInMetrics } from '~/utils/operacao-p3-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Check In · Operação · Via Reversa' })

const toast = useToast()
const query = ref('')
const result = ref<CheckInLookupResult | null>(null)
const confirmOpen = ref(false)
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const columns: DataTableColumn<CheckInHistoryRow>[] = [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '18%' },
  { type: 'text', key: 'store', label: 'Loja', width: '20%' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '130px' },
  { type: 'text', key: 'checkedAtLabel', label: 'Horário', width: '130px' },
  { type: 'text', key: 'operator', label: 'Operador', width: '140px' }
]

const metrics = computed(() =>
  buildLojaCheckInMetrics(
    lojaCheckInState.checkInsToday,
    lojaCheckInState.queue,
    lojaCheckInState.divergences,
    lojaCheckInState.history
  )
)

const pagedRows = computed(() => slicePage(lojaCheckInState.history, page.value, pageSize.value))

function searchOrder() {
  const found = lookupCheckInOrder(query.value)
  result.value = found
  if (!found) {
    toast.error('Busca inválida', 'Informe um número de pedido (ex.: 52120).')
    return
  }
  if (found.status === 'nao_encontrado') {
    toast.error('Não encontrado', `Pedido ${found.orderId} não está elegível ao check-in.`)
  }
}

function openConfirm() {
  if (!result.value?.canConfirm) return
  confirmOpen.value = true
}

function confirm() {
  const orderId = result.value?.orderId
  confirmOpen.value = false
  if (!orderId) return
  const row = confirmCheckIn(orderId)
  if (!row) {
    toast.error('Falha', 'Não foi possível confirmar o check-in.')
    return
  }
  toast.success('Check-in confirmado', `Pedido ${row.orderId} registrado na loja.`)
  page.value = 1
}
</script>

<template>
  <div class="loja-check-in-page">
    <PageHeader
      title="Check In"
      subtitle="Confirmação de chegada de pedidos na loja"
    >
      <AppButton
        icon="i-lucide-store"
        variant="ghost"
        to="/dashboards/loja"
      >
        Dashboard Loja
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="metrics"
      :max-per-row="3"
    />

    <section
      class="grid gap-4 border-b border-via-line px-[18px] py-4 md:grid-cols-[minmax(0,360px)_1fr]"
      aria-label="Busca de pedido"
    >
      <form
        class="grid gap-3"
        @submit.prevent="searchOrder"
      >
        <AppFormField label="Pedido">
          <UInput
            v-model="query"
            icon="i-lucide-scan-line"
            placeholder="Demo: 52120 · 52121 · 52103"
            class="w-full"
          />
        </AppFormField>
        <div class="flex flex-wrap gap-2">
          <AppButton
            type="submit"
            icon="i-lucide-search"
          >
            Buscar
          </AppButton>
          <AppButton
            icon="i-lucide-check"
            :disabled="!result?.canConfirm"
            @click="openConfirm"
          >
            Confirmar
          </AppButton>
        </div>
      </form>

      <div
        v-if="result"
        class="border border-via-line bg-via-surface-2 px-4 py-3"
        aria-live="polite"
      >
        <p class="m-0 text-[11px] font-bold tracking-[0.08em] text-via-muted uppercase">
          Resultado
        </p>
        <p class="mt-2 mb-0 text-lg font-[750] text-via-ink">
          Pedido {{ result.orderId }}
        </p>
        <p class="mt-1 mb-0 text-sm text-via-muted">
          {{ result.client }} · {{ result.store }}
        </p>
        <p class="mt-2 mb-0 text-sm font-semibold text-via-ink">
          {{ result.statusLabel }}
        </p>
      </div>
      <EmptyState
        v-else
        title="Aguardando leitura"
        description="Busque um pedido para confirmar o check-in na loja."
        icon="i-lucide-scan-line"
      />
    </section>

    <section
      class="border-b border-via-line"
      aria-label="Volume"
    >
      <ChartPanel
        title="Check-ins por hora"
        note="hoje (fixture)"
      >
        <VolumeTrendChart
          :series="lojaCheckInVolumeTrend"
          title="Volume · hoje"
          note="check-ins"
          :height="160"
        />
      </ChartPanel>
    </section>

    <DataTable
      :columns="columns"
      :rows="pagedRows"
      min-width="920px"
      empty-title="Sem histórico"
      empty-description="Ainda não há check-ins recentes."
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="lojaCheckInState.history.length"
    />

    <AppModal
      v-model:open="confirmOpen"
      variant="confirm"
      title="Confirmar check-in"
      description="Registrar a chegada deste pedido na loja?"
      confirm-label="Confirmar"
      confirm-variant="primary"
      @confirm="confirm"
    >
      <p class="text-sm text-via-muted">
        Pedido {{ result?.orderId }} · {{ result?.store }}
      </p>
    </AppModal>
  </div>
</template>
