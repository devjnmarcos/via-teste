<script setup lang="ts">
/**
 * Cadastro público modo loja — legado /auth/register-client-store.
 */
import {
  createEmptyLojaForm,
  validateLojaForm
} from '~/data/demo/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Cadastro loja · Via Reversa' })

const toast = useToast()
const form = reactive(createEmptyLojaForm())
const loading = ref(false)
const done = ref(false)

async function onSubmit() {
  const error = validateLojaForm(form)
  if (error) {
    toast.error('Campos obrigatórios', error)
    return
  }

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 320))
  loading.value = false
  done.value = true
  toast.success('Cadastro enviado', 'Aguarde a liberação da conta de loja (mock).')
}
</script>

<template>
  <div class="auth-loja-register">
    <EmptyState
      v-if="done"
      title="Cadastro recebido"
      description="Recebemos os dados do cliente de loja. A liberação segue o fluxo de contas."
      icon="i-lucide-store"
    >
      <AppButton
        to="/login"
        variant="primary"
        icon="i-lucide-log-in"
      >
        Ir para o login
      </AppButton>
    </EmptyState>

    <template v-else>
      <header class="mb-6">
        <h1 class="m-0 text-[1.35rem] font-[750] tracking-[-0.03em] text-via-ink">
          Cadastro loja
        </h1>
        <p class="mt-1.5 mb-0 text-xs leading-[1.45] text-via-muted">
          Registro público de cliente em modo loja (mock).
        </p>
      </header>

      <form
        class="grid gap-4"
        @submit.prevent="onSubmit"
      >
        <AppFormField label="Nome *">
          <UInput
            v-model="form.fullName"
            placeholder="Nome completo"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppFormField label="E-mail *">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="voce@email.com"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppFormField label="Telefone *">
          <UInput
            v-model="form.phone"
            placeholder="(11) 90000-0000"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppFormField label="Loja / conta *">
          <UInput
            v-model="form.storeName"
            placeholder="Nome da loja"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppFormField label="CPF ou CNPJ *">
          <UInput
            v-model="form.document"
            placeholder="Documento"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppButton
          type="submit"
          variant="primary"
          icon="i-lucide-send"
          :loading="loading"
          class="w-full"
        >
          Enviar cadastro
        </AppButton>

        <p class="m-0 text-center text-xs text-via-muted">
          Já tem conta?
          <NuxtLink
            to="/login"
            class="text-via-blue-strong"
          >
            Entrar
          </NuxtLink>
        </p>
      </form>
    </template>
  </div>
</template>
