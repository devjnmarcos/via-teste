<script setup lang="ts">
import type { OrderBarcode } from '../../types/domain'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  barcodes: OrderBarcode[]
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const toast = useToast()
const removeOpen = ref(false)
const pending = ref<OrderBarcode | null>(null)
const localBarcodes = ref<OrderBarcode[]>([...props.barcodes])

watch(
  () => props.barcodes,
  (value) => {
    localBarcodes.value = [...value]
  }
)

function askRemove(item: OrderBarcode) {
  pending.value = item
  removeOpen.value = true
}

function confirmRemove() {
  if (!pending.value) return
  const id = pending.value.id
  localBarcodes.value = localBarcodes.value.filter((item) => item.id !== id)
  emit('remove', id)
  toast.success('Código removido', `Barcode ${pending.value.barcode} removido (mock).`)
  pending.value = null
  removeOpen.value = false
}
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="m-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">
        QR Code / Barras do pedido
      </h2>
    </div>

    <div
      v-if="!localBarcodes.length"
      class="grid justify-items-center gap-2 border border-dashed border-via-line-strong px-5 py-9 text-center text-via-muted"
      role="status"
    >
      <UIcon
        name="i-lucide-scan-barcode"
        class="size-[22px] text-via-subtle"
        aria-hidden="true"
      />
      <strong class="text-[13px] text-via-ink">Nenhuma leitura registrada</strong>
      <p class="m-0 max-w-[380px] text-xs leading-[1.45]">
        Leituras de código de barras e QR Code do pedido ficam disponíveis para auditoria.
      </p>
    </div>

    <div
      v-else
      class="border-t border-via-line-strong"
    >
      <div
        v-for="item in localBarcodes"
        :key="item.id"
        class="grid min-h-[58px] grid-cols-[minmax(0,1fr)_180px_auto] items-center gap-2 border-b border-via-line px-1 text-xs text-via-ink max-[900px]:grid-cols-[minmax(0,1fr)_auto]"
      >
        <div>
          <strong class="block">Lido: {{ item.barcode }}</strong>
          <span class="text-via-muted">{{ item.localization }} · {{ item.createdAt }}</span>
        </div>
        <span class="text-via-muted max-[900px]:hidden">{{ item.createdAt }}</span>
        <AppButton
          icon="i-lucide-trash-2"
          variant="ghost"
          @click="askRemove(item)"
        >
          Remover
        </AppButton>
      </div>
    </div>

    <AppModal
      v-model:open="removeOpen"
      variant="confirm"
      title="Remover evidência?"
      :description="pending ? `Remover a leitura “${pending.barcode}”? Esta ação não pode ser desfeita.` : ''"
      confirm-label="Remover"
      @confirm="confirmRemove"
    />
  </section>
</template>
