<script setup lang="ts">
/**
 * Pedido → edição (complemento P4). Reutiliza o wizard de criação em modo edição.
 */
import { featuredOrder, orders } from '~/data/demo/orders'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()
const order = computed(() => orders.find((item) => item.id === String(route.params.id)) ?? featuredOrder)

useSeoMeta({ title: () => `Editar pedido #${order.value.id} · Via Reversa` })

function onCancel() {
  navigateTo(`/pedidos/${order.value.id}`)
}

function onSaved() {
  toast.success('Pedido atualizado', `Alterações do #${order.value.id} salvas (mock).`)
  navigateTo(`/pedidos/${order.value.id}`)
}
</script>

<template>
  <div class="order-edit-page">
    <PageHeader
      :back-to="`/pedidos/${order.id}`"
      :title="`Editar pedido #${order.id}`"
      :subtitle="`${order.client} · ${order.operation}`"
    >
      <AppButton
        icon="i-lucide-x"
        variant="ghost"
        @click="onCancel"
      >
        Cancelar
      </AppButton>
    </PageHeader>

    <OrderEditForm
      :order-id="order.id"
      @saved="onSaved"
      @cancel="onCancel"
    />
  </div>
</template>
