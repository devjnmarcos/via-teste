<script setup lang="ts">
/**
 * Solicitação de recuperação de senha — mock `require_new_password`.
 */
import { isValidEmailFormat } from '~/data/demo/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Recuperar senha · Via Reversa' })

const toast = useToast()
const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function onSubmit() {
  if (!isValidEmailFormat(email.value)) {
    toast.error('E-mail inválido', 'Informe um e-mail no formato correto.')
    return
  }

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 320))
  loading.value = false
  sent.value = true
  toast.success(
    'Solicitação enviada',
    'Se existir conta com este e-mail, enviaremos as instruções.'
  )
}
</script>

<template>
  <div class="auth-recovery">
    <header class="mb-6">
      <h1 class="m-0 text-[1.35rem] font-[750] tracking-[-0.03em] text-via-ink">
        Recuperar senha
      </h1>
      <p class="mt-1.5 mb-0 text-xs leading-[1.45] text-via-muted">
        Informe o e-mail da conta. Por segurança, a mensagem é a mesma se o e-mail existir ou não.
      </p>
    </header>

    <form
      v-if="!sent"
      class="grid gap-4"
      @submit.prevent="onSubmit"
    >
      <AppFormField label="E-mail">
        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="seu@email.com"
          :disabled="loading"
          class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
        />
      </AppFormField>

      <AppButton
        type="submit"
        variant="primary"
        icon="i-lucide-mail"
        class="mt-1 w-full justify-center"
        :disabled="loading"
      >
        {{ loading ? 'Enviando…' : 'Enviar link' }}
      </AppButton>
    </form>

    <EmptyState
      v-else
      title="Verifique seu e-mail"
      description="Se a conta existir, você receberá um link para redefinir a senha. No demo, use /auth/nova-senha?token=reset-demo-ok"
      icon="i-lucide-mail-check"
    >
      <AppButton
        to="/login"
        variant="primary"
        icon="i-lucide-arrow-left"
      >
        Voltar ao login
      </AppButton>
    </EmptyState>

    <nav
      v-if="!sent"
      class="mt-5 border-t border-via-line pt-4 text-xs"
    >
      <NuxtLink
        to="/login"
        class="font-[650] text-via-blue-strong no-underline hover:underline"
      >
        Voltar ao login
      </NuxtLink>
    </nav>
  </div>
</template>
