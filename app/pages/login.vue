<script setup lang="ts">
/**
 * Login público — layout auth, mock até API `/users/user_logged`.
 */
import { authenticateMock, DEMO_AUTH, isValidEmailFormat } from '~/data/demo/auth'
import { useAuthSession } from '~/composables/useAuthSession'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Entrar · Via Reversa' })

const toast = useToast()
const { isAuthenticated, login } = useAuthSession()

const email = ref('')
const password = ref('')
const loading = ref(false)

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/')
  }
})

async function onSubmit() {
  if (!isValidEmailFormat(email.value)) {
    toast.error('E-mail inválido', 'Informe um e-mail no formato correto.')
    return
  }
  if (!password.value) {
    toast.error('Senha obrigatória', 'Informe a senha para continuar.')
    return
  }

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 280))

  if (!authenticateMock(email.value, password.value)) {
    loading.value = false
    toast.error('Credenciais inválidas', 'Verifique e-mail e senha e tente novamente.')
    return
  }

  login(email.value)
  loading.value = false
  toast.success('Bem-vindo', 'Sessão iniciada (mock).')
  await navigateTo('/')
}
</script>

<template>
  <div class="auth-login">
    <header class="mb-6">
      <h1 class="m-0 text-[1.35rem] font-[750] tracking-[-0.03em] text-via-ink">
        Entrar
      </h1>
      <p class="mt-1.5 mb-0 text-xs leading-[1.45] text-via-muted">
        Use {{ DEMO_AUTH.email }} / {{ DEMO_AUTH.password }} no ambiente demo.
      </p>
    </header>

    <form
      class="grid gap-4"
      @submit.prevent="onSubmit"
    >
      <AppFormField label="E-mail">
        <UInput
          v-model="email"
          type="email"
          autocomplete="username"
          placeholder="seu@email.com"
          :disabled="loading"
          class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
        />
      </AppFormField>

      <AppFormField label="Senha">
        <UInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          :disabled="loading"
          class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
        />
      </AppFormField>

      <AppButton
        type="submit"
        variant="primary"
        icon="i-lucide-log-in"
        class="mt-1 w-full justify-center"
        :disabled="loading"
      >
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </AppButton>
    </form>

    <nav
      class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-via-line pt-4 text-xs"
      aria-label="Atalhos de autenticação"
    >
      <NuxtLink
        to="/auth/recuperar-senha"
        class="font-[650] text-via-blue-strong no-underline hover:underline"
      >
        Recuperar senha
      </NuxtLink>
      <NuxtLink
        to="/cadastro-transportador"
        class="font-[650] text-via-blue-strong no-underline hover:underline"
      >
        Cadastro transportador
      </NuxtLink>
    </nav>
  </div>
</template>
