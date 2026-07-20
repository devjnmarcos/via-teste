<script setup lang="ts">
/**
 * Formulário curto de edição de pedido (mock) — campos principais + itens em DataTable.
 */
import type { DataTableColumn } from '../../types/data-table'
import { featuredOrder, orders } from '../../data/demo/orders'
import { getOrderDetailBundle } from '../../data/demo/order-detail'
import { useToast } from '../../composables/useToast'

const props = defineProps<{
  orderId: string
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const toast = useToast()
const order = computed(() => orders.find((item) => item.id === props.orderId) ?? featuredOrder)
const detail = computed(() => getOrderDetailBundle(order.value.id))

const form = reactive({
  client: order.value.client,
  operation: order.value.operation,
  address: order.value.address ?? '',
  supportPoint: order.value.supportPoint,
  responsible: order.value.responsible,
  transporter: order.value.transporter ?? ''
})

interface ItemRow extends Record<string, unknown> {
  id: string
  sku: string
  description: string
  quantity: string
}

const itemRows = ref<ItemRow[]>(
  detail.value.items.map((item, index) => ({
    id: item.id ?? `it-${index}`,
    sku: item.serialNumber ?? `SKU-${index + 1}`,
    description: item.description,
    quantity: String(item.quantity ?? 1)
  }))
)

const columns: DataTableColumn<ItemRow>[] = [
  { type: 'text', key: 'sku', label: 'SKU', width: '120px' },
  { type: 'text', key: 'description', label: 'Descrição' },
  { type: 'text', key: 'quantity', label: 'Qtd', width: '80px', align: 'right' }
]

function save() {
  if (!form.client.trim() || !form.address.trim()) {
    toast.error('Campos obrigatórios', 'Cliente e endereço são obrigatórios.')
    return
  }
  emit('saved')
}
</script>

<template>
  <div class="order-edit-form border-b border-via-line px-5 py-4">
    <div class="mb-4 grid max-w-3xl grid-cols-2 gap-3 max-[780px]:grid-cols-1">
      <AppFormField label="Cliente *">
        <UInput v-model="form.client" />
      </AppFormField>
      <AppFormField label="Operação">
        <UInput v-model="form.operation" />
      </AppFormField>
      <AppFormField
        class="col-span-2 max-[780px]:col-span-1"
        label="Endereço *"
      >
        <UInput v-model="form.address" />
      </AppFormField>
      <AppFormField label="Ponto de apoio">
        <UInput v-model="form.supportPoint" />
      </AppFormField>
      <AppFormField label="Responsável">
        <UInput v-model="form.responsible" />
      </AppFormField>
      <AppFormField label="Transportador">
        <UInput v-model="form.transporter" />
      </AppFormField>
    </div>

    <h2 class="mb-2 text-[12px] font-bold tracking-[0.04em] text-via-muted uppercase">
      Itens do pedido
    </h2>
    <DataTable
      :columns="columns"
      :rows="itemRows"
      min-width="640px"
      empty-title="Sem itens"
      empty-description="Este pedido não possui itens cadastrados."
    />

    <div class="mt-4 flex gap-2">
      <AppButton
        variant="ghost"
        @click="emit('cancel')"
      >
        Cancelar
      </AppButton>
      <AppButton
        variant="primary"
        icon="i-lucide-save"
        @click="save"
      >
        Salvar alterações
      </AppButton>
    </div>
  </div>
</template>
