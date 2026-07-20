<script setup lang="ts">
/**
 * Modal CRUD do design system.
 * Variantes: form | confirm | confirm-keyword
 *
 * UModal só como overlay/portal. Layout visual é nosso (#content):
 *   .app-modal
 *     .app-modal__header  (title, description, close absolute)
 *     .app-modal__body    (opcional)
 *     .app-modal__footer
 */
import { Comment, Fragment, Text, type VNode } from 'vue'

export type AppModalVariant = 'form' | 'confirm' | 'confirm-keyword'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    variant?: AppModalVariant
    /** Texto que o usuário deve digitar para habilitar exclusão (confirm-keyword). */
    keyword?: string
    keywordLabel?: string
    keywordPlaceholder?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: 'primary' | 'danger'
    loading?: boolean
    /** Em testes, use `false` para evitar teleport. */
    portal?: boolean
  }>(),
  {
    variant: 'form',
    description: undefined,
    keyword: '',
    keywordLabel: 'Digite o identificador para confirmar',
    keywordPlaceholder: undefined,
    confirmLabel: undefined,
    cancelLabel: 'Cancelar',
    confirmVariant: undefined,
    loading: false,
    portal: true
  }
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const slots = useSlots()
const keywordInput = ref('')

watch(open, (value) => {
  if (!value) keywordInput.value = ''
})

const keywordMatches = computed(() => {
  if (props.variant !== 'confirm-keyword') return true
  return keywordInput.value.trim() === (props.keyword ?? '').trim()
})

const resolvedConfirmLabel = computed(() => {
  if (props.confirmLabel) return props.confirmLabel
  if (props.variant === 'form') return 'Salvar'
  return 'Excluir'
})

const resolvedConfirmVariant = computed(() => {
  if (props.confirmVariant) return props.confirmVariant
  return props.variant === 'form' ? 'primary' : 'danger'
})

const confirmDisabled = computed(() => {
  if (props.loading) return true
  if (props.variant === 'confirm-keyword') return !keywordMatches.value
  return false
})

/** Conteúdo real no default slot (ignora comentários / fragmentos vazios). */
function hasDefaultSlotContent(): boolean {
  const render = slots.default
  if (!render) return false
  return render().some((node: VNode) => {
    if (node.type === Comment || node.type === Text) return false
    if (node.type === Fragment) {
      return Array.isArray(node.children) && node.children.length > 0
    }
    return true
  })
}

/**
 * Body só quando há miolo útil.
 * confirm sem slot → compacto (aviso fica na description do header).
 * confirm-keyword sempre tem campo; form sempre tem campos.
 */
const showBody = computed(() => {
  if (props.variant === 'confirm-keyword') return true
  if (props.variant === 'form') return true
  return hasDefaultSlotContent()
})

/** Shell do DialogContent: só posicionamento/tamanho do UModal; padding é nosso. */
const modalUi = {
  content: 'max-w-[520px] overflow-hidden rounded-via-control bg-via-surface p-0'
}

function close() {
  open.value = false
}

function onCancel() {
  emit('cancel')
  close()
}

function onConfirm() {
  if (confirmDisabled.value) return
  emit('confirm')
}

function onCloseClick(closeModal: () => void) {
  onCancel()
  closeModal()
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :portal="portal"
    :close="false"
    :ui="modalUi"
  >
    <template #content="{ close: closeModal }">
      <div
        class="app-modal flex w-full max-h-inherit flex-col bg-via-surface"
        data-testid="app-modal"
      >
        <header class="app-modal__header relative shrink-0 border-b border-via-line py-5 pr-12 pl-5">
          <div class="app-modal__heading flex min-w-0 flex-col gap-1">
            <h2
              class="app-modal__title m-0 text-[15px] font-bold leading-[1.35] tracking-[-0.01em] text-via-ink"
              aria-hidden="true"
            >
              {{ title }}
            </h2>
            <p
              v-if="description"
              class="app-modal__description m-0 text-xs leading-[1.45] text-via-muted"
              aria-hidden="true"
            >
              {{ description }}
            </p>
          </div>

          <button
            type="button"
            class="app-modal__close absolute top-3.5 right-3.5 m-0 inline-flex size-8 cursor-pointer items-center justify-center rounded-via-control border-none bg-transparent p-0 text-via-muted transition-[background-color,color] duration-150 hover:bg-via-surface-2 hover:text-via-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-via-blue-strong"
            aria-label="Fechar"
            data-testid="app-modal-close"
            @click="onCloseClick(closeModal)"
          >
            <UIcon
              name="i-lucide-x"
              class="app-modal__close-icon size-4"
            />
          </button>
        </header>

        <div
          v-if="showBody"
          class="app-modal__body min-h-0 flex-none p-5"
          data-testid="app-modal-body"
        >
          <div
            v-if="variant === 'form'"
            class="app-modal__form grid gap-4"
          >
            <slot />
          </div>

          <div
            v-else
            class="app-modal__confirm grid gap-3"
          >
            <slot />
            <label
              v-if="variant === 'confirm-keyword'"
              class="app-modal__keyword mt-1 grid gap-1.5"
            >
              <span class="text-[11px] font-[650] text-via-muted">{{ keywordLabel }}</span>
              <UInput
                v-model="keywordInput"
                :placeholder="keywordPlaceholder ?? keyword"
                autocomplete="off"
                data-testid="app-modal-keyword"
              />
            </label>
          </div>
        </div>

        <footer
          class="app-modal__footer box-border flex w-full shrink-0 justify-end gap-2 border-t border-via-line px-5 py-4"
          :class="{ 'app-modal__footer--compact border-t-0': !showBody }"
          data-testid="app-modal-footer"
        >
          <slot name="footer">
            <AppButton
              variant="secondary"
              :disabled="loading"
              @click="onCancel(); closeModal()"
            >
              {{ cancelLabel }}
            </AppButton>
            <AppButton
              :variant="resolvedConfirmVariant"
              :disabled="confirmDisabled"
              data-testid="app-modal-confirm"
              @click="onConfirm()"
            >
              {{ resolvedConfirmLabel }}
            </AppButton>
          </slot>
        </footer>
      </div>
    </template>
  </UModal>
</template>

