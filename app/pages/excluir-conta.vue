<script setup lang="ts">
/**
 * Exclusão de conta (privacidade) — legado /excluir-conta.
 */
import {
  createEmptyExcluirContaForm,
  validateExcluirContaForm
} from '~/data/demo/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Excluir conta · Via Reversa' })

const toast = useToast()
const form = reactive(createEmptyExcluirContaForm())
const loading = ref(false)
const confirmOpen = ref(false)
const done = ref(false)

function requestDelete() {
  const error = validateExcluirContaForm(form)
  if (error) {
    toast.error('Confirmação incompleta', error)
    return
  }
  confirmOpen.value = true
}

async function confirmDelete() {
  confirmOpen.value = false
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 320))
  loading.value = false
  done.value = true
  toast.success('Solicitação registrada', 'A exclusão será processada pela equipe (mock).')
}
</script>

<template>
  <div class="auth-excluir-conta">
    <EmptyState
      v-if="done"
      title="Solicitação enviada"
      description="Registramos o pedido de exclusão. Você receberá confirmação por e-mail quando a API estiver ligada."
      icon="i-lucide-shield-check"
    >
      <AppButton
        to="/login"
        variant="primary"
        icon="i-lucide-log-in"
      >
        Voltar ao login
      </AppButton>
    </EmptyState>

    <template v-else>
      <header class="mb-6">
        <h1 class="m-0 text-[1.35rem] font-[750] tracking-[-0.03em] text-via-ink">
          Excluir conta
        </h1>
        <p class="mt-1.5 mb-0 text-xs leading-[1.45] text-via-muted">
          Fluxo de privacidade (mock). Digite EXCLUIR para confirmar.
        </p>
      </header>

      <form
        class="grid gap-4"
        @submit.prevent="requestDelete"
      >
        <AppFormField label="E-mail da conta *">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="voce@email.com"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppFormField label="Motivo *">
          <UTextarea
            v-model="form.reason"
            :rows="3"
            placeholder="Por que deseja excluir a conta?"
            :disabled="loading"
            class="w-full"
          />
        </AppFormField>

        <AppFormField label="Confirmação *">
          <UInput
            v-model="form.confirmText"
            placeholder="Digite EXCLUIR"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppButton
          type="submit"
          variant="primary"
          icon="i-lucide-trash-2"
          :loading="loading"
          class="w-full"
        >
          Solicitar exclusão
        </AppButton>
      </form>
    </template>

    <AppModal
      v-model:open="confirmOpen"
      variant="confirm"
      title="Confirmar exclusão"
      description="Esta ação solicita a remoção permanente da conta."
      confirm-label="Excluir"
      confirm-variant="danger"
      @confirm="confirmDelete"
    >
      <p class="text-sm text-via-muted">
        Conta: <strong class="text-via-ink">{{ form.email }}</strong>
      </p>
    </AppModal>
  </div>
</template>
