<script setup lang="ts">
import type { ToastItem } from '../../types/toast'

defineProps<{
  toast: ToastItem
}>()

const emit = defineEmits<{
  dismiss: [id: string]
}>()

const toneIcon: Record<ToastItem['tone'], string> = {
  success: 'i-lucide-circle-check',
  error: 'i-lucide-circle-alert',
  info: 'i-lucide-info'
}

const toneBorder: Record<ToastItem['tone'], string> = {
  success: 'border-l-via-green',
  error: 'border-l-via-red',
  info: 'border-l-via-blue'
}

const toneIconColor: Record<ToastItem['tone'], string> = {
  success: 'text-via-green',
  error: 'text-via-red',
  info: 'text-via-blue'
}
</script>

<template>
  <div
    class="app-toast grid min-w-[280px] max-w-[380px] grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5 rounded-via-control border border-via-line border-l-[3px] bg-via-surface py-3 pr-3 pl-3.5 text-via-ink shadow-via-overlay"
    :class="[toneBorder[toast.tone], `app-toast--${toast.tone}`]"
    role="status"
    :data-testid="`app-toast-${toast.tone}`"
  >
    <UIcon
      :name="toneIcon[toast.tone]"
      class="mt-px size-[18px]"
      :class="toneIconColor[toast.tone]"
      aria-hidden="true"
    />
    <div>
      <p class="m-0 text-xs font-bold tracking-[-0.01em]">{{ toast.title }}</p>
      <p
        v-if="toast.description"
        class="mt-[3px] mb-0 text-[11px] leading-[1.4] text-via-muted"
      >
        {{ toast.description }}
      </p>
    </div>
    <button
      type="button"
      class="inline-flex size-6 cursor-pointer items-center justify-center rounded-via-compact border-0 bg-transparent text-via-subtle hover:bg-via-surface-2 hover:text-via-ink"
      aria-label="Fechar notificação"
      @click="emit('dismiss', toast.id)"
    >
      <UIcon name="i-lucide-x" />
    </button>
  </div>
</template>
