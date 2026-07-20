<script setup lang="ts">
/**
 * Redefinição de senha com token na query — mock `new_password`.
 */
import { DEMO_AUTH, isValidResetToken } from '~/data/demo/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Nova senha · Via Reversa' })

const route = useRoute()
const toast = useToast()

const token = computed(() => {
  const raw = route.query.token
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined
})

const tokenOk = computed(() => isValidResetToken(token.value))

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const done = ref(false)

async function onSubmit() {
  if (!tokenOk.value) return

  if (password.value.length < 6) {
    toast.error('Senha curta', 'Use pelo menos 6 caracteres.')
    return
  }
  if (password.value !== confirm.value) {
    toast.error('Confirmação diferente', 'As senhas precisam ser iguais.')
    return
  }

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 280))
  loading.value = false
  done.value = true
  toast.success('Senha alterada', 'Você já pode entrar com a nova senha.')
}
</script>

<template>
  <div class="auth-new-password">
    <EmptyState
      v-if="!tokenOk"
      title="Link inválido ou expirado"
      description="Solicite um novo link de recuperação. Token demo válido: reset-demo-ok"
      icon="i-lucide-link-2-off"
    >
      <AppButton
        to="/auth/recuperar-senha"
        variant="primary"
        icon="i-lucide-mail"
      >
        Recuperar senha
      </AppButton>
    </EmptyState>

    <template v-else-if="done">
      <EmptyState
        title="Senha redefinida"
        description="Sua senha foi atualizada com sucesso (mock)."
        icon="i-lucide-circle-check"
      >
        <AppButton
          to="/login"
          variant="primary"
          icon="i-lucide-log-in"
        >
          Ir para o login
        </AppButton>
      </EmptyState>
    </template>

    <template v-else>
      <header class="mb-6">
        <h1 class="m-0 text-[1.35rem] font-[750] tracking-[-0.03em] text-via-ink">
          Nova senha
        </h1>
        <p class="mt-1.5 mb-0 text-xs leading-[1.45] text-via-muted">
          Defina uma nova senha para a conta. Token demo: {{ DEMO_AUTH.validResetToken }}
        </p>
      </header>

      <form
        class="grid gap-4"
        @submit.prevent="onSubmit"
      >
        <AppFormField label="Nova senha">
          <UInput
            v-model="password"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppFormField label="Confirmar senha">
          <UInput
            v-model="confirm"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppButton
          type="submit"
          variant="primary"
          icon="i-lucide-key-round"
          class="mt-1 w-full justify-center"
          :disabled="loading"
        >
          {{ loading ? 'Salvando…' : 'Salvar nova senha' }}
        </AppButton>
      </form>
    </template>
  </div>
</template>
