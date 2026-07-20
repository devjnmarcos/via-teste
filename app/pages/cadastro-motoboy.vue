<script setup lang="ts">
/**
 * Cadastro público de motoboy — legado /register-motoboy.
 */
import {
  createEmptyMotoboyForm,
  validateMotoboyForm
} from '~/data/demo/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Cadastro motoboy · Via Reversa' })

const toast = useToast()
const form = reactive(createEmptyMotoboyForm())
const loading = ref(false)
const done = ref(false)

async function onSubmit() {
  const error = validateMotoboyForm(form)
  if (error) {
    toast.error('Campos obrigatórios', error)
    return
  }

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 320))
  loading.value = false
  done.value = true
  toast.success('Cadastro enviado', 'Aguarde a análise da equipe Via Reversa (mock).')
}
</script>

<template>
  <div class="auth-motoboy-register">
    <EmptyState
      v-if="done"
      title="Cadastro recebido"
      description="Recebemos os dados do motoboy. A aprovação segue o fluxo operacional de transportadores."
      icon="i-lucide-bike"
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
          Cadastro motoboy
        </h1>
        <p class="mt-1.5 mb-0 text-xs leading-[1.45] text-via-muted">
          Formulário público (mock). Upload de documentos entra com a API.
        </p>
      </header>

      <form
        class="grid gap-4"
        @submit.prevent="onSubmit"
      >
        <AppFormField label="Nome completo *">
          <UInput
            v-model="form.fullName"
            placeholder="Nome e sobrenome"
            :disabled="loading"
            class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
          />
        </AppFormField>

        <AppFormField label="CPF *">
          <UInput
            v-model="form.cpf"
            placeholder="000.000.000-00"
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

        <AppFormField label="Cidade *">
          <UInput
            v-model="form.city"
            placeholder="São Paulo"
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
