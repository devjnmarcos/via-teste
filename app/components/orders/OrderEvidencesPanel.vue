<script setup lang="ts">
import type { OrderEvidence } from '../../types/domain'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  evidences: OrderEvidence[]
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const toast = useToast()
const localEvidences = ref<OrderEvidence[]>([...props.evidences])
const removeOpen = ref(false)
const pending = ref<OrderEvidence | null>(null)

watch(
  () => props.evidences,
  (value) => {
    localEvidences.value = [...value]
  }
)

const kindLabel: Record<OrderEvidence['kind'], string> = {
  foto: 'Foto',
  documento: 'Documento',
  assinatura: 'Assinatura'
}

const kindIcon: Record<OrderEvidence['kind'], string> = {
  foto: 'i-lucide-camera',
  documento: 'i-lucide-file-text',
  assinatura: 'i-lucide-pen-line'
}

function askRemove(evidence: OrderEvidence) {
  pending.value = evidence
  removeOpen.value = true
}

function confirmRemove() {
  if (!pending.value) return
  const id = pending.value.id
  localEvidences.value = localEvidences.value.filter((item) => item.id !== id)
  emit('remove', id)
  toast.success('Evidência removida', `${kindLabel[pending.value.kind]} removida (mock).`)
  pending.value = null
  removeOpen.value = false
}
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="m-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">Evidências</h2>
      <AppButton
        icon="i-lucide-image-plus"
        variant="primary"
      >
        Adicionar foto
      </AppButton>
    </div>

    <div
      v-if="!localEvidences.length"
      class="grid justify-items-center gap-2 border border-dashed border-via-line-strong px-5 py-9 text-center text-via-muted"
      role="status"
    >
      <UIcon
        name="i-lucide-camera"
        class="size-[22px] text-via-subtle"
        aria-hidden="true"
      />
      <strong class="text-[13px] text-via-ink">Nenhuma evidência anexada</strong>
      <p class="m-0 max-w-[380px] text-xs leading-[1.45]">
        Fotos, documentos e assinaturas do pedido ficam disponíveis para auditoria e tratativa.
      </p>
      <AppButton
        icon="i-lucide-image-plus"
        variant="primary"
      >
        Adicionar foto
      </AppButton>
    </div>

    <div
      v-else
      class="border-t border-via-line-strong"
    >
      <div
        v-for="evidence in localEvidences"
        :key="evidence.id"
        class="grid min-h-[58px] grid-cols-[18px_110px_minmax(0,1fr)_180px_auto] items-center gap-2 border-b border-via-line text-xs text-via-ink hover:bg-via-blue-soft max-[900px]:grid-cols-[18px_90px_minmax(0,1fr)_auto] [&_svg:first-child]:text-via-cyan"
      >
        <UIcon
          :name="kindIcon[evidence.kind]"
          aria-hidden="true"
        />
        <strong>{{ kindLabel[evidence.kind] }}</strong>
        <span class="text-via-muted">{{ evidence.filename }} · {{ evidence.localization }}</span>
        <span class="text-via-muted max-[900px]:hidden">{{ evidence.createdAt }} · {{ evidence.author }}</span>
        <AppButton
          icon="i-lucide-trash-2"
          variant="ghost"
          @click="askRemove(evidence)"
        >
          Remover
        </AppButton>
      </div>
    </div>

    <AppModal
      v-model:open="removeOpen"
      variant="confirm"
      title="Remover evidência?"
      :description="pending ? `Remover “${pending.filename}”? Esta ação não pode ser desfeita.` : ''"
      confirm-label="Remover"
      @confirm="confirmRemove"
    />
  </section>
</template>
