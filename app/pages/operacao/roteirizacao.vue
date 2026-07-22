<script setup lang="ts">
/**
 * Operação → Roteirização (agrupar pedidos em rota).
 */
import type { DataTableColumn } from '~/types/data-table'
import type { ScriptingOrderRow } from '~/data/demo/roteirizacao'
import {
  createRouteFromSelection,
  routesAccountOptions,
  routesState
} from '~/data/demo/roteirizacao'
import { buildRoteirizacaoMetrics } from '~/utils/operacao-p2-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Roteirização · Operação · Via Reversa' })

const toast = useToast()
const accountId = ref('all')
const search = ref('')
const selectedIds = ref<string[]>([])
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const persistOpen = ref(false)
const routeName = ref('')

const columns = computed<DataTableColumn<ScriptingOrderRow>[]>(() => [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '18%' },
  { type: 'text', key: 'city', label: 'Cidade', width: '14%' },
  { type: 'text', key: 'uf', label: 'UF', width: '60px' },
  { type: 'text', key: 'weightKg', label: 'Peso (kg)', width: '90px', align: 'right' },
  { type: 'text', key: 'statusLabel', label: 'Status', width: '120px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Seleção',
    width: '120px',
    items: (row) => [
      {
        key: 'toggle',
        label: selectedIds.value.includes(row.orderId) ? 'Remover' : 'Incluir',
        icon: selectedIds.value.includes(row.orderId) ? 'i-lucide-check' : 'i-lucide-plus',
        variant: 'ghost' as const,
        ariaLabel: `Alternar pedido ${row.orderId}`
      }
    ]
  }
])

const filteredOrders = computed(() => {
  const query = search.value.trim().toLowerCase()
  return routesState.scriptingOrders.filter((row) => {
    if (!query) return true
    return [row.orderId, row.client, row.city, row.uf]
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const selectedOrders = computed(() =>
  routesState.scriptingOrders.filter((order) => selectedIds.value.includes(order.orderId))
)

const openRoutes = computed(
  () => routesState.routes.filter((route) => route.status === 'Aberta').length
)

const listMetrics = computed(() =>
  buildRoteirizacaoMetrics(filteredOrders.value, selectedIds.value, openRoutes.value)
)

const pagedRows = computed(() =>
  slicePage(filteredOrders.value, page.value, pageSize.value)
)

watch([search, accountId], () => {
  page.value = 1
})

function onAction(payload: { row: ScriptingOrderRow; action: string }) {
  if (payload.action !== 'toggle') return
  const id = payload.row.orderId
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function openPersist() {
  if (selectedIds.value.length === 0) {
    toast.error('Seleção vazia', 'Inclua ao menos um pedido na rota.')
    return
  }
  routeName.value = `Rota ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  persistOpen.value = true
}

function confirmPersist() {
  if (!routeName.value.trim()) {
    toast.error('Nome obrigatório', 'Informe um nome para a rota.')
    return
  }
  const created = createRouteFromSelection({
    name: routeName.value,
    orderIds: [...selectedIds.value]
  })
  selectedIds.value = []
  persistOpen.value = false
  toast.success('Rota criada', `${created.code} montada com ${created.ordersCount} pedidos.`)
  navigateTo(`/operacao/rotas/${created.id}`)
}
</script>

<template>
  <div class="roteirizacao-page">
    <PageHeader
      title="Roteirização"
      subtitle="Agrupe pedidos elegíveis em uma nova rota"
    >
      <AppButton
        icon="i-lucide-map-pinned"
        variant="ghost"
        @click="navigateTo('/operacao/rotas')"
      >
        Ver rotas
      </AppButton>
      <AppButton
        icon="i-lucide-save"
        :disabled="selectedIds.length === 0"
        @click="openPersist"
      >
        Persistir rota
      </AppButton>
    </PageHeader>

    <MetricsStrip
      :metrics="listMetrics"
      :max-per-row="4"
    />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar pedido, cliente ou cidade…"
        class="w-[300px]"
      />
      <USelectMenu
        v-model="accountId"
        value-key="value"
        :items="routesAccountOptions"
        class="w-[240px]"
      />
    </section>

    <section
      class="grid grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)] border-b border-via-line max-[1100px]:grid-cols-1"
      aria-label="Montagem"
    >
      <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
        <DataTable
          :columns="columns"
          :rows="pagedRows"
          min-width="860px"
          empty-title="Sem pedidos elegíveis"
          empty-description="Todos os pedidos já foram roteirizados ou ajuste a busca."
          @action="onAction"
        />
        <Pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :total="filteredOrders.length"
        />
      </div>
      <aside
        class="min-w-0 px-[18px] py-4"
        aria-label="Rota em montagem"
      >
        <h2 class="mb-2 text-xs font-bold tracking-wide text-via-muted uppercase">
          Rota em montagem
        </h2>
        <p
          v-if="selectedOrders.length === 0"
          class="text-sm text-via-muted"
        >
          Inclua pedidos pela coluna Seleção.
        </p>
        <ul
          v-else
          class="flex flex-col gap-2"
        >
          <li
            v-for="order in selectedOrders"
            :key="order.orderId"
            class="flex items-center justify-between gap-2 border-b border-via-line py-2 text-sm"
          >
            <span>
              <strong class="block text-via-ink">#{{ order.orderId }}</strong>
              <small class="text-via-muted">{{ order.client }} · {{ order.city }}</small>
            </span>
            <span class="numeric text-via-muted">{{ order.weightKg }} kg</span>
          </li>
        </ul>
      </aside>
    </section>

    <AppModal
      v-model:open="persistOpen"
      title="Persistir rota"
      description="Confirme o nome antes de salvar a montagem."
      confirm-label="Salvar rota"
      @confirm="confirmPersist"
    >
      <AppFormField label="Nome da rota *">
        <UInput
          v-model="routeName"
          placeholder="Ex.: Zona Norte · Manhã"
        />
      </AppFormField>
      <p class="mt-3 text-sm text-via-muted">
        {{ selectedIds.length }} pedido(s) serão associados.
      </p>
    </AppModal>
  </div>
</template>
