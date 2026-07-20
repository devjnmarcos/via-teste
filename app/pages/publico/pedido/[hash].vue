<script setup lang="ts">
/**
 * Público → detalhe do pedido por hash.
 */
import { getPublicOrderByHash } from '~/data/demo/compartilhamento-publico'

definePageMeta({ layout: 'public' })

const route = useRoute()
const hash = computed(() => String(route.params.hash ?? ''))
const order = computed(() => getPublicOrderByHash(hash.value))

useSeoMeta({
  title: computed(() =>
    order.value
      ? `Pedido ${order.value.orderId} · Via Reversa`
      : 'Pedido não encontrado · Via Reversa'
  )
})
</script>

<template>
  <div class="publico-pedido">
    <EmptyState
      v-if="!order"
      title="Link inválido"
      description="Este hash não corresponde a um pedido público. Demo: /publico/pedido/abc123"
      icon="i-lucide-link-2-off"
    >
      <AppButton
        to="/publico/consulta-pedido"
        icon="i-lucide-search"
      >
        Consultar pedido
      </AppButton>
    </EmptyState>

    <template v-else>
      <p class="m-0 text-[11px] font-bold tracking-[0.08em] text-via-muted uppercase">
        Pedido público
      </p>
      <h1 class="mt-2 mb-0 text-[1.55rem] font-[750] tracking-[-0.03em]">
        #{{ order.orderId }}
      </h1>
      <p class="mt-2 mb-6 text-sm text-via-muted">
        {{ order.client }} · {{ order.statusLabel }}
      </p>

      <dl class="grid gap-3 border border-via-line bg-via-surface px-4 py-4 text-sm">
        <div>
          <dt class="m-0 text-via-muted">
            Conta
          </dt>
          <dd class="m-0 mt-0.5 font-semibold">
            {{ order.accountName }}
          </dd>
        </div>
        <div>
          <dt class="m-0 text-via-muted">
            Ponto de apoio
          </dt>
          <dd class="m-0 mt-0.5 font-semibold">
            {{ order.supportPoint }}
          </dd>
        </div>
        <div>
          <dt class="m-0 text-via-muted">
            Agendamento
          </dt>
          <dd class="m-0 mt-0.5 font-semibold">
            {{ order.scheduledLabel }}
          </dd>
        </div>
        <div>
          <dt class="m-0 text-via-muted">
            Endereço
          </dt>
          <dd class="m-0 mt-0.5 font-semibold">
            {{ order.addressSnippet }}
          </dd>
        </div>
      </dl>

      <div class="mt-5 flex flex-wrap gap-2">
        <AppButton
          :to="`/publico/etiqueta-pedido/${order.orderId}`"
          icon="i-lucide-tag"
          variant="ghost"
        >
          Etiqueta
        </AppButton>
        <AppButton
          to="/publico/consulta-pedido"
          icon="i-lucide-search"
          variant="ghost"
        >
          Nova consulta
        </AppButton>
      </div>
    </template>
  </div>
</template>
