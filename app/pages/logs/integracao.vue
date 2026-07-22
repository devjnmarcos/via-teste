<script setup lang="ts">
/**
 * Gestão → Logs → Integração — histórico somente leitura de IntegrationOrder.
 * Badge de status com ícone + texto (nunca só cor); por isso usa <table> própria
 * em vez do componente de tabela genérico do catálogo, que só suporta colunas
 * de texto puro (sem célula custom para o badge ícone + texto).
 */
import type { IntegrationOrder, IntegrationOrderStatus } from '~/data/demo/integrations'
import {
  buildIntegrationOrdersMetrics,
  getIntegrationOrders,
  getIntegrations,
  integrationOrderStatusMeta
} from '~/data/demo/integrations'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'

useSeoMeta({ title: 'Integração · Logs · Via Reversa' })

const orders = getIntegrationOrders()
const integrations = getIntegrations()

const integrationFilter = ref('Todas')
const statusFilter = ref<'Todos' | IntegrationOrderStatus>('Todos')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const integrationOptions = computed(() => [
  { label: 'Todas as integrações', value: 'Todas' },
  ...integrations.map((item) => ({ label: item.provider, value: item.id }))
])

const statusOptions = [
  { label: 'Todos os status', value: 'Todos' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Erro', value: 'erro' },
  { label: 'Concluído', value: 'concluido' }
]

function providerFor(order: IntegrationOrder): string {
  return integrations.find((item) => item.id === order.integrationId)?.provider ?? order.integrationId
}

const filteredRows = computed(() => orders.filter((row) => {
  if (integrationFilter.value !== 'Todas' && row.integrationId !== integrationFilter.value) return false
  if (statusFilter.value !== 'Todos' && row.status !== statusFilter.value) return false
  return true
}))

const listMetrics = computed(() => buildIntegrationOrdersMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([integrationFilter, statusFilter], () => {
  page.value = 1
})

const statusToneClass: Record<IntegrationOrderStatus, string> = {
  pendente: 'text-[oklch(55%_0.14_73)]',
  enviado: 'text-via-blue-strong',
  erro: 'text-via-red',
  concluido: 'text-via-green'
}

const thClass = 'border-b border-via-line bg-via-surface-2 px-3 py-[11px] text-left text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase'
const tdClass = 'border-b border-via-line px-3 py-[11px] align-middle text-xs text-via-ink'
</script>

<template>
  <div class="logs-integracao-page">
    <PageHeader
      title="Logs · Integração"
      subtitle="Histórico somente leitura de solicitações às integrações"
    />

    <MetricsStrip :metrics="listMetrics" />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <USelectMenu
        v-model="integrationFilter"
        value-key="value"
        :items="integrationOptions"
        class="filter-select filter-select--wide"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="statusOptions"
        class="filter-select"
      />
    </section>

    <EmptyState
      v-if="!pagedRows.length"
      title="Nenhum registro"
      description="Nenhuma solicitação de integração no filtro."
      icon="i-lucide-inbox"
    />
    <div
      v-else
      class="min-w-0 overflow-auto"
    >
      <table
        class="w-full table-fixed border-collapse"
        style="min-width: 960px"
      >
        <colgroup>
          <col class="w-[100px]"><col class="w-[18%]"><col class="w-[140px]"><col><col class="w-[150px]"><col class="w-[150px]">
        </colgroup>
        <thead>
          <tr>
            <th :class="thClass">Pedido</th>
            <th :class="thClass">Integração</th>
            <th :class="thClass">Status</th>
            <th :class="thClass">Erro</th>
            <th :class="thClass">Solicitado em</th>
            <th :class="thClass">Respondido em</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in pagedRows"
            :key="row.id"
          >
            <td :class="[tdClass, 'font-bold']">#{{ row.orderId }}</td>
            <td :class="tdClass">{{ providerFor(row) }}</td>
            <td :class="tdClass">
              <span
                class="inline-flex items-center gap-1.5 font-[650]"
                :class="statusToneClass[row.status]"
              >
                <UIcon
                  :name="integrationOrderStatusMeta[row.status].icon"
                  class="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {{ integrationOrderStatusMeta[row.status].label }}
              </span>
            </td>
            <td :class="tdClass">{{ row.errorMessage ?? '—' }}</td>
            <td :class="tdClass">{{ row.requestedAt }}</td>
            <td :class="tdClass">{{ row.respondedAt ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
