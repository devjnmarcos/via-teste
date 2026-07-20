<script setup lang="ts">
/**
 * Público → etiqueta de pedido (print).
 */
import { searchPublicOrder } from '~/data/demo/compartilhamento-publico'

definePageMeta({ layout: 'public' })

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))
const order = computed(() => searchPublicOrder(id.value))

useSeoMeta({ title: 'Etiqueta pedido · Via Reversa' })

function printLabel() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <div class="publico-etiqueta-pedido">
    <EmptyState
      v-if="!order"
      title="Etiqueta indisponível"
      description="Demo: /publico/etiqueta-pedido/53101"
      icon="i-lucide-tag"
    />

    <template v-else>
      <div class="print-surface border-2 border-via-ink bg-white px-5 py-6 text-via-ink">
        <p class="m-0 text-[11px] font-bold uppercase tracking-[0.12em]">
          Via Reversa · Pedido
        </p>
        <p class="mt-3 mb-0 text-2xl font-[800] tracking-[-0.03em]">
          #{{ order.orderId }}
        </p>
        <p class="mt-2 mb-0 text-sm">
          {{ order.client }}
        </p>
        <p class="mt-1 mb-0 text-sm">
          {{ order.supportPoint }}
        </p>
        <p class="mt-1 mb-0 text-sm text-via-muted">
          {{ order.scheduledLabel }}
        </p>
        <p class="mt-4 mb-0 font-mono text-lg tracking-[0.2em]">
          *{{ order.orderId }}*
        </p>
      </div>
      <div class="mt-4 print:hidden">
        <AppButton
          icon="i-lucide-printer"
          @click="printLabel"
        >
          Imprimir
        </AppButton>
      </div>
    </template>
  </div>
</template>
