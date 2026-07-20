<script setup lang="ts">
/**
 * Público → Consulta de pedido.
 */
import type { PublicOrderSummary } from '~/data/demo/compartilhamento-publico'
import { searchPublicOrder } from '~/data/demo/compartilhamento-publico'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'public' })

useSeoMeta({ title: 'Consulta de pedido · Via Reversa' })

const toast = useToast()
const query = ref('')
const result = ref<PublicOrderSummary | null>(null)
const searched = ref(false)

function onSearch() {
  searched.value = true
  const found = searchPublicOrder(query.value)
  result.value = found
  if (!found) {
    toast.error('Não encontrado', 'Verifique o código ou número do pedido. Demo: abc123 / 53101')
  }
}
</script>

<template>
  <div class="publico-consulta">
    <h1 class="m-0 text-[1.45rem] font-[750] tracking-[-0.03em] text-via-ink">
      Consulta de pedido
    </h1>
    <p class="mt-2 mb-6 text-sm text-via-muted">
      Informe o código do link ou o número do pedido para ver o status.
    </p>

    <form
      class="grid gap-3"
      @submit.prevent="onSearch"
    >
      <AppFormField label="Código ou pedido">
        <UInput
          v-model="query"
          icon="i-lucide-search"
          placeholder="Ex.: abc123 ou 53101"
          class="w-full"
        />
      </AppFormField>
      <AppButton
        type="submit"
        icon="i-lucide-search"
      >
        Consultar
      </AppButton>
    </form>

    <div
      v-if="result"
      class="mt-6 border border-via-line bg-via-surface px-4 py-4"
    >
      <p class="m-0 text-[11px] font-bold tracking-[0.08em] text-via-muted uppercase">
        Resultado
      </p>
      <p class="mt-2 mb-0 text-lg font-[750]">
        Pedido {{ result.orderId }}
      </p>
      <p class="mt-1 mb-0 text-sm text-via-muted">
        {{ result.client }} · {{ result.statusLabel }}
      </p>
      <p class="mt-3 mb-0 text-sm">
        {{ result.accountName }}
      </p>
      <p class="mt-1 mb-0 text-sm text-via-muted">
        {{ result.supportPoint }} · {{ result.scheduledLabel }}
      </p>
      <div class="mt-4">
        <AppButton
          :to="`/publico/pedido/${result.hash}`"
          icon="i-lucide-external-link"
          variant="ghost"
        >
          Ver detalhes
        </AppButton>
      </div>
    </div>

    <EmptyState
      v-else-if="searched"
      class="mt-6"
      title="Nenhum pedido"
      description="Não encontramos um pedido com esse identificador."
      icon="i-lucide-package-x"
    />
  </div>
</template>
