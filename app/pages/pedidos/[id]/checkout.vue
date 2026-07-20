<script setup lang="ts">
/**
 * Pedido → checkout autenticado (agendamento / confirmação).
 */
import type { Metric } from '~/types/domain'
import { featuredOrder, orders } from '~/data/demo/orders'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()
const order = computed(() => orders.find((item) => item.id === String(route.params.id)) ?? featuredOrder)

const confirmOpen = ref(false)
const form = reactive({
  date: '',
  window: 'manha',
  notes: ''
})

const windowOptions = [
  { label: 'Manhã (08h–12h)', value: 'manha' },
  { label: 'Tarde (12h–18h)', value: 'tarde' },
  { label: 'Noite (18h–21h)', value: 'noite' }
]

const metrics = computed((): Metric[] => [
  { label: 'Itens', value: order.value.items, note: 'no pedido', icon: 'i-lucide-package' },
  { label: 'Ocorrências', value: order.value.occurrences, note: 'abertas', icon: 'i-lucide-triangle-alert', tone: order.value.occurrences ? 'warning' : undefined },
  { label: 'SLA', value: order.value.sla, note: 'atual', icon: 'i-lucide-timer', tone: order.value.slaTone }
])

useSeoMeta({ title: () => `Checkout · Pedido #${order.value.id} · Via Reversa` })

function openConfirm() {
  if (!form.date) {
    toast.error('Data obrigatória', 'Escolha a data de agendamento.')
    return
  }
  confirmOpen.value = true
}

function confirmCheckout() {
  confirmOpen.value = false
  toast.success('Checkout concluído', `Pedido #${order.value.id} agendado (mock).`)
  navigateTo(`/pedidos/${order.value.id}`)
}
</script>

<template>
  <div class="order-checkout-page">
    <PageHeader
      :back-to="`/pedidos/${order.id}`"
      :title="`Checkout · #${order.id}`"
      :subtitle="`${order.client} · agendamento autenticado`"
    >
      <StatusLabel :status="order.status" />
    </PageHeader>

    <MetricsStrip
      :metrics="metrics"
      :max-per-row="3"
    />

    <section class="grid max-w-2xl gap-3 border-b border-via-line px-5 py-4">
      <AppFormField label="Data do agendamento *">
        <UInput
          v-model="form.date"
          type="date"
        />
      </AppFormField>
      <AppFormField label="Janela">
        <USelectMenu
          v-model="form.window"
          value-key="value"
          :items="windowOptions"
        />
      </AppFormField>
      <AppFormField label="Observações">
        <UTextarea
          v-model="form.notes"
          :rows="3"
          placeholder="Instruções para coleta ou entrega…"
        />
      </AppFormField>
      <div class="flex gap-2 pt-1">
        <AppButton
          :to="`/pedidos/${order.id}`"
          variant="ghost"
        >
          Voltar
        </AppButton>
        <AppButton
          variant="primary"
          icon="i-lucide-calendar-check"
          @click="openConfirm"
        >
          Confirmar agendamento
        </AppButton>
      </div>
    </section>

    <AppModal
      v-model:open="confirmOpen"
      variant="confirm"
      title="Confirmar checkout"
      :description="`Agendar pedido #${order.id} para ${form.date}?`"
      confirm-label="Confirmar"
      confirm-variant="primary"
      @confirm="confirmCheckout"
    >
      <p class="text-sm text-via-muted">
        Janela:
        {{ windowOptions.find((item) => item.value === form.window)?.label }}
      </p>
    </AppModal>
  </div>
</template>
