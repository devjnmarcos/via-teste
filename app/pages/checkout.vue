<script setup lang="ts">
/**
 * Público → checkout QR (Kangu).
 */
import {
  payPublicCheckout,
  publicCheckoutSessions
} from '~/data/demo/compartilhamento-publico'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'public' })

useSeoMeta({ title: 'Checkout · Via Reversa' })

const route = useRoute()
const toast = useToast()
const confirmOpen = ref(false)

const token = computed(() => {
  const raw = route.query.token
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? 'kangu-demo' : 'kangu-demo'
})

const session = computed(() => publicCheckoutSessions[token.value] ?? null)

function openPay() {
  if (!session.value || session.value.status !== 'pending') return
  confirmOpen.value = true
}

function confirmPay() {
  confirmOpen.value = false
  const paid = payPublicCheckout(token.value)
  if (!paid) {
    toast.error('Pagamento não concluído', 'Sessão inválida ou já paga.')
    return
  }
  toast.success('Pagamento confirmado', `Pedido ${paid.orderId} · ${paid.amountLabel}`)
}
</script>

<template>
  <div class="publico-checkout">
    <EmptyState
      v-if="!session"
      title="Checkout inválido"
      description="Token demo: ?token=kangu-demo"
      icon="i-lucide-qr-code"
    />

    <template v-else>
      <h1 class="m-0 text-[1.45rem] font-[750] tracking-[-0.03em]">
        Checkout
      </h1>
      <p class="mt-2 mb-5 text-sm text-via-muted">
        Frete {{ session.carrier }} · Pedido {{ session.orderId }}
      </p>

      <div class="border border-via-line bg-via-surface px-4 py-5">
        <p class="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-via-muted">
          Valor
        </p>
        <p class="mt-2 mb-0 text-3xl font-[800] tracking-[-0.04em]">
          {{ session.amountLabel }}
        </p>
        <p class="mt-2 mb-0 text-sm font-semibold">
          {{ session.statusLabel }}
        </p>
      </div>

      <div class="mt-5">
        <AppButton
          v-if="session.status === 'pending'"
          icon="i-lucide-credit-card"
          @click="openPay"
        >
          Pagar agora
        </AppButton>
        <EmptyState
          v-else
          title="Pagamento concluído"
          description="Este checkout já foi liquidado."
          icon="i-lucide-circle-check"
        />
      </div>
    </template>

    <AppModal
      v-model:open="confirmOpen"
      variant="confirm"
      title="Confirmar pagamento"
      description="Simular pagamento do frete via QR?"
      confirm-label="Pagar"
      confirm-variant="primary"
      @confirm="confirmPay"
    />
  </div>
</template>
