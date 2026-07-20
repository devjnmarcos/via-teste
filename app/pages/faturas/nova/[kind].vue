<script setup lang="ts">
/**
 * Nova fatura — formulário longo com seleção de pedidos elegíveis.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { EligibleOrderRow, FaturaKind } from '~/data/demo/faturas'
import {
  createEmptyFaturaForm,
  createFatura,
  eligibleOrdersForInvoice,
  faturaKindLabel,
  faturasAccountOptions,
  formatBrl,
  isFaturaKind
} from '~/data/demo/faturas'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()

const kindParam = computed(() => String(route.params.kind ?? ''))
const kind = computed<FaturaKind | null>(() =>
  isFaturaKind(kindParam.value) ? kindParam.value : null
)

if (!kind.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tipo de fatura inválido' })
}

const kindLabel = computed(() => faturaKindLabel(kind.value!))
const listPath = computed(() => `/faturas/${kind.value}`)

useSeoMeta({
  title: () => `Nova fatura ${kindLabel.value.toLowerCase()} · Faturas · Via Reversa`
})

const form = reactive(createEmptyFaturaForm(kind.value!))
const selectedOrderIds = ref<string[]>([])
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const cancelOpen = ref(false)

const orderColumns = computed<DataTableColumn<EligibleOrderRow>[]>(() => [
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'client', label: 'Cliente', width: '18%' },
  { type: 'text', key: 'valueLabel', label: 'Valor', width: '120px', align: 'right' },
  { type: 'text', key: 'createdAtLabel', label: 'Criado em', width: '120px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Seleção',
    width: '120px',
    items: (row) => [
      {
        key: 'toggle',
        label: selectedOrderIds.value.includes(row.orderId) ? 'Remover' : 'Incluir',
        icon: selectedOrderIds.value.includes(row.orderId)
          ? 'i-lucide-check'
          : 'i-lucide-plus',
        variant: 'ghost' as const,
        ariaLabel: `Alternar pedido ${row.orderId}`
      }
    ]
  }
])

const scopedOrders = computed(() => {
  if (!form.accountId) return eligibleOrdersForInvoice
  return eligibleOrdersForInvoice.filter((order) => order.accountId === form.accountId)
})

const pagedOrders = computed(() =>
  slicePage(scopedOrders.value, page.value, pageSize.value)
)

const selectedOrders = computed(() =>
  eligibleOrdersForInvoice.filter((order) => selectedOrderIds.value.includes(order.orderId))
)

const selectedValue = computed(() =>
  selectedOrders.value.reduce((sum, order) => sum + order.value, 0)
)

const selectionMetrics = computed(() => [
  {
    label: 'Pedidos selecionados',
    value: selectedOrders.value.length,
    note: 'na fatura',
    icon: 'i-lucide-package'
  },
  {
    label: 'Valor selecionado',
    value: formatBrl(selectedValue.value),
    note: 'soma dos pedidos',
    icon: 'i-lucide-banknote'
  },
  {
    label: 'Elegíveis no filtro',
    value: scopedOrders.value.length,
    note: form.accountId ? 'conta filtrada' : 'todas as contas',
    icon: 'i-lucide-list-filter'
  }
])

watch(
  () => form.accountId,
  () => {
    page.value = 1
    selectedOrderIds.value = selectedOrderIds.value.filter((orderId) =>
      scopedOrders.value.some((order) => order.orderId === orderId)
    )
  }
)

function onOrderAction(payload: { row: EligibleOrderRow; action: string }) {
  if (payload.action !== 'toggle') return
  const id = payload.row.orderId
  if (selectedOrderIds.value.includes(id)) {
    selectedOrderIds.value = selectedOrderIds.value.filter((item) => item !== id)
  }
  else {
    selectedOrderIds.value = [...selectedOrderIds.value, id]
  }
}

function saveInvoice() {
  if (!kind.value) return
  if (!form.accountId || !form.competenceLabel.trim() || !form.dueAtLabel.trim()) {
    toast.error('Campos obrigatórios', 'Informe competência, conta e vencimento.')
    return
  }
  if (selectedOrderIds.value.length === 0) {
    toast.error('Sem pedidos', 'Selecione ao menos um pedido elegível.')
    return
  }

  const invoice = createFatura({
    kind: kind.value,
    competenceLabel: form.competenceLabel,
    accountId: form.accountId,
    dueAtLabel: form.dueAtLabel,
    notes: form.notes,
    orderIds: selectedOrderIds.value
  })

  toast.success('Fatura criada', `#${invoice.id} · ${invoice.valueLabel}`)
  navigateTo(`/faturas/${invoice.id}`)
}

function confirmCancel() {
  cancelOpen.value = false
  navigateTo(listPath.value)
}
</script>

<template>
  <div class="fatura-nova">
    <PageHeader
      :back-to="listPath"
      :title="`Nova fatura ${kindLabel.toLowerCase()}`"
      subtitle="Defina período, conta e pedidos elegíveis"
    >
      <AppButton @click="cancelOpen = true">
        Cancelar
      </AppButton>
      <AppButton
        variant="primary"
        icon="i-lucide-check"
        @click="saveInvoice"
      >
        Salvar
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="selectionMetrics" />

    <section
      class="grid gap-0 border-b border-via-line bg-via-surface md:grid-cols-2"
      aria-label="Dados da fatura"
    >
      <div class="space-y-3 border-b border-via-line px-[18px] py-4 md:border-r md:border-b-0">
        <AppFormField label="Competência *">
          <UInput
            v-model="form.competenceLabel"
            placeholder="Ex.: Jul/2026"
          />
        </AppFormField>
        <AppFormField label="Conta *">
          <USelectMenu
            v-model="form.accountId"
            value-key="value"
            :items="faturasAccountOptions"
          />
        </AppFormField>
      </div>
      <div class="space-y-3 px-[18px] py-4">
        <AppFormField label="Vencimento *">
          <UInput
            v-model="form.dueAtLabel"
            placeholder="DD/MM/AAAA"
          />
        </AppFormField>
        <AppFormField label="Observações">
          <UInput
            v-model="form.notes"
            placeholder="Opcional"
          />
        </AppFormField>
      </div>
    </section>

    <section
      class="border-b border-via-line bg-via-surface px-[18px] pt-4 pb-0"
      aria-label="Pedidos elegíveis"
    >
      <header class="mb-3 [&_h2]:m-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-via-ink [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-xs [&_p]:text-via-muted">
        <h2>Pedidos elegíveis</h2>
        <p>Inclua ou remova pedidos da fatura. Filtre por conta no formulário acima.</p>
      </header>

      <DataTable
        :columns="orderColumns"
        :rows="pagedOrders"
        min-width="720px"
        empty-title="Nenhum pedido elegível"
        empty-description="Ajuste a conta ou aguarde novos pedidos elegíveis."
        @action="onOrderAction"
      />

      <Pagination
        v-if="scopedOrders.length > 0"
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="scopedOrders.length"
      />
    </section>

    <AppModal
      v-model:open="cancelOpen"
      variant="confirm"
      title="Descartar fatura"
      description="As informações preenchidas serão perdidas. Deseja voltar à listagem?"
      confirm-label="Descartar"
      @confirm="confirmCancel"
    />
  </div>
</template>
