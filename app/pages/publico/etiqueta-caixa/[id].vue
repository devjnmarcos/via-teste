<script setup lang="ts">
/**
 * Público → etiqueta de caixa (print).
 */
import { getPublicBox } from '~/data/demo/compartilhamento-publico'

definePageMeta({ layout: 'public' })

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))
const box = computed(() => getPublicBox(id.value))

useSeoMeta({ title: 'Etiqueta caixa · Via Reversa' })

function printLabel() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <div class="publico-etiqueta-caixa">
    <EmptyState
      v-if="!box"
      title="Etiqueta indisponível"
      description="Demo: /publico/etiqueta-caixa/bx-8801"
      icon="i-lucide-tag"
    />

    <template v-else>
      <div class="print-surface border-2 border-via-ink bg-white px-5 py-6 text-via-ink">
        <p class="m-0 text-[11px] font-bold uppercase tracking-[0.12em]">
          Via Reversa · Caixa
        </p>
        <p class="mt-3 mb-0 text-2xl font-[800] tracking-[-0.03em]">
          {{ box.id }}
        </p>
        <p class="mt-2 mb-0 text-sm">
          Pedido {{ box.orderId }}
        </p>
        <p class="mt-1 mb-0 text-sm">
          {{ box.itemsCount }} itens · {{ box.weightKg }} kg
        </p>
        <p class="mt-4 mb-0 font-mono text-lg tracking-[0.2em]">
          *{{ box.id }}*
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
