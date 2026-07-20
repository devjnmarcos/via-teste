<script setup lang="ts">
/**
 * Público → caixa (box_in).
 */
import { getPublicBox } from '~/data/demo/compartilhamento-publico'

definePageMeta({ layout: 'public' })

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))
const box = computed(() => getPublicBox(id.value))

useSeoMeta({
  title: computed(() =>
    box.value ? `Caixa ${box.value.id} · Via Reversa` : 'Caixa · Via Reversa'
  )
})
</script>

<template>
  <div class="publico-caixa">
    <EmptyState
      v-if="!box"
      title="Caixa não encontrada"
      description="Demo: /publico/caixa/bx-8801"
      icon="i-lucide-box"
    />

    <template v-else>
      <h1 class="m-0 text-[1.45rem] font-[750] tracking-[-0.03em]">
        Caixa {{ box.id }}
      </h1>
      <p class="mt-2 mb-5 text-sm text-via-muted">
        Pedido {{ box.orderId }} · {{ box.statusLabel }}
      </p>
      <dl class="grid gap-3 border border-via-line px-4 py-4 text-sm">
        <div>
          <dt class="m-0 text-via-muted">
            Itens
          </dt>
          <dd class="m-0 mt-0.5 font-semibold">
            {{ box.itemsCount }}
          </dd>
        </div>
        <div>
          <dt class="m-0 text-via-muted">
            Peso (kg)
          </dt>
          <dd class="m-0 mt-0.5 font-semibold">
            {{ box.weightKg }}
          </dd>
        </div>
      </dl>
      <div class="mt-4">
        <AppButton
          :to="`/publico/etiqueta-caixa/${box.id}`"
          icon="i-lucide-printer"
        >
          Ver etiqueta
        </AppButton>
      </div>
    </template>
  </div>
</template>
