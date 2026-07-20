<script setup lang="ts">
/**
 * Cadastro público de transportador — wizard 5 steps (legado RegisterTransporter).
 * Mock DS — sem upload S3 / API.
 */
import {
  createEmptyTransportadorForm,
  transportadorRegionOptions,
  transportadorStateOptions,
  transportadorSteps,
  transportadorTermsText,
  validateTransportadorStep
} from '~/data/demo/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Cadastro transportador · Via Reversa' })

const toast = useToast()
const form = reactive(createEmptyTransportadorForm())
const stepIndex = ref(0)
const loading = ref(false)
const done = ref(false)

const isFirst = computed(() => stepIndex.value === 0)
const isLast = computed(() => stepIndex.value === transportadorSteps.length - 1)
const currentStep = computed(() => transportadorSteps[stepIndex.value]!)

function onFilePick(field: 'documentFileName' | 'facePhotoFileName', event: Event) {
  const input = event.target as HTMLInputElement
  form[field] = input.files?.[0]?.name ?? ''
}

function toggleRegion(id: string) {
  if (form.regionIds.includes(id)) {
    form.regionIds = form.regionIds.filter((item) => item !== id)
  }
  else {
    form.regionIds = [...form.regionIds, id]
  }
}

function onNext() {
  const error = validateTransportadorStep(stepIndex.value, form)
  if (error) {
    toast.error('Revise os campos', error)
    return
  }
  if (!isLast.value) stepIndex.value += 1
}

function onBack() {
  if (!isFirst.value) stepIndex.value -= 1
}

async function onSubmit() {
  const error = validateTransportadorStep(4, form)
  if (error) {
    toast.error('Revise os campos', error)
    return
  }

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 420))
  loading.value = false
  done.value = true
  toast.success('Cadastro enviado', 'Aguarde a análise da equipe Via Reversa (mock).')
}
</script>

<template>
  <div class="auth-transporter-register">
    <EmptyState
      v-if="done"
      title="Cadastro recebido"
      description="Recebemos os dados do transportador. A aprovação segue o fluxo operacional da Via Reversa."
      icon="i-lucide-building-2"
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
      <header class="mb-5">
        <h1 class="m-0 text-[1.35rem] font-[750] tracking-[-0.03em] text-via-ink">
          Cadastro transportador
        </h1>
        <p class="mt-1.5 mb-0 text-xs leading-[1.45] text-via-muted">
          {{ currentStep.label }} — {{ currentStep.description }}
        </p>
      </header>

      <ol
        class="m-0 mb-5 grid list-none grid-cols-5 gap-1 p-0"
        aria-label="Etapas do cadastro"
      >
        <li
          v-for="(step, index) in transportadorSteps"
          :key="step.id"
          class="rounded-via-control border px-1.5 py-1.5 text-center text-[9px] font-bold tracking-[0.02em] uppercase"
          :class="index === stepIndex
            ? 'border-via-blue bg-via-blue-soft text-via-ink'
            : index < stepIndex
              ? 'border-via-green/40 text-via-green'
              : 'border-via-line text-via-muted'"
        >
          {{ index + 1 }}
        </li>
      </ol>

      <form
        class="grid gap-4"
        @submit.prevent="isLast ? onSubmit() : onNext()"
      >
        <template v-if="stepIndex === 0">
          <AppFormField label="Nome completo *">
            <UInput
              v-model="form.name"
              placeholder="Nome completo"
              :disabled="loading"
              class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
            />
          </AppFormField>
          <AppFormField label="E-mail *">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              :disabled="loading"
              class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
            />
          </AppFormField>
          <AppFormField label="Celular *">
            <UInput
              v-model="form.cellphone"
              placeholder="(11) 90000-0000"
              :disabled="loading"
              class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
            />
          </AppFormField>
          <AppFormField label="CPF *">
            <UInput
              v-model="form.federalId"
              placeholder="000.000.000-00"
              :disabled="loading"
              class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
            />
          </AppFormField>
        </template>

        <template v-else-if="stepIndex === 1">
          <AppFormField label="CEP *">
            <UInput
              v-model="form.zipCode"
              placeholder="00000-000"
              :disabled="loading"
              class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
            />
          </AppFormField>
          <AppFormField label="Rua / Avenida *">
            <UInput
              v-model="form.address"
              placeholder="Endereço"
              :disabled="loading"
              class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
            />
          </AppFormField>
          <div class="grid grid-cols-2 gap-3">
            <AppFormField label="Número *">
              <UInput
                v-model="form.number"
                placeholder="Nº"
                :disabled="loading"
                class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
              />
            </AppFormField>
            <AppFormField label="Complemento">
              <UInput
                v-model="form.complement"
                placeholder="Apto, sala…"
                :disabled="loading"
                class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
              />
            </AppFormField>
          </div>
          <AppFormField label="Bairro *">
            <UInput
              v-model="form.quarter"
              placeholder="Bairro"
              :disabled="loading"
              class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
            />
          </AppFormField>
          <div class="grid grid-cols-2 gap-3">
            <AppFormField label="Cidade *">
              <UInput
                v-model="form.city"
                placeholder="Cidade"
                :disabled="loading"
                class="w-full [&_input]:h-10 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2"
              />
            </AppFormField>
            <AppFormField label="UF *">
              <USelectMenu
                v-model="form.stateCode"
                value-key="value"
                :items="transportadorStateOptions"
                :disabled="loading"
              />
            </AppFormField>
          </div>
        </template>

        <template v-else-if="stepIndex === 2">
          <AppFormField label="CNH ou RG *">
            <input
              type="file"
              accept="image/*,application/pdf"
              class="block w-full cursor-pointer text-xs text-via-muted file:mr-3 file:cursor-pointer file:rounded-via-control file:border file:border-via-line-strong file:bg-via-surface-2 file:px-3 file:py-2 file:text-xs file:font-[650] file:text-via-ink"
              :disabled="loading"
              @change="onFilePick('documentFileName', $event)"
            >
            <p
              v-if="form.documentFileName"
              class="m-0 mt-1.5 text-[11px] text-via-ink"
            >
              Selecionado: {{ form.documentFileName }}
            </p>
          </AppFormField>
          <AppFormField label="Foto do rosto">
            <input
              type="file"
              accept="image/*"
              class="block w-full cursor-pointer text-xs text-via-muted file:mr-3 file:cursor-pointer file:rounded-via-control file:border file:border-via-line-strong file:bg-via-surface-2 file:px-3 file:py-2 file:text-xs file:font-[650] file:text-via-ink"
              :disabled="loading"
              @change="onFilePick('facePhotoFileName', $event)"
            >
            <p
              v-if="form.facePhotoFileName"
              class="m-0 mt-1.5 text-[11px] text-via-ink"
            >
              Selecionado: {{ form.facePhotoFileName }}
            </p>
          </AppFormField>
          <p class="m-0 text-[11px] leading-[1.45] text-via-muted">
            CNH/RG: imagem ou PDF. Foto do rosto: JPEG/PNG. Máx. 5MB (mock).
          </p>
        </template>

        <template v-else-if="stepIndex === 3">
          <p class="m-0 text-xs text-via-muted">
            Selecione as regiões onde deseja atuar ({{ form.regionIds.length }} selecionada(s)).
          </p>
          <div class="grid gap-2">
            <button
              v-for="region in transportadorRegionOptions"
              :key="region.id"
              type="button"
              class="flex cursor-pointer items-center gap-2 rounded-via-control border px-3 py-2.5 text-left text-xs transition-[background-color,border-color] duration-150"
              :class="form.regionIds.includes(region.id)
                ? 'border-via-blue bg-via-blue-soft text-via-ink'
                : 'border-via-line bg-via-surface text-via-muted hover:bg-via-surface-2'"
              :disabled="loading"
              @click="toggleRegion(region.id)"
            >
              <UIcon
                :name="form.regionIds.includes(region.id) ? 'i-lucide-check-square' : 'i-lucide-square'"
                class="size-4 shrink-0"
              />
              {{ region.label }}
            </button>
          </div>
        </template>

        <template v-else>
          <AppFormField label="Termos e condições">
            <textarea
              :value="transportadorTermsText"
              readonly
              rows="10"
              class="w-full resize-y rounded-via-control border border-via-line-strong bg-via-surface-2 px-3 py-2.5 text-[11px] leading-[1.45] text-via-muted"
            />
          </AppFormField>
          <label class="flex cursor-pointer items-start gap-2 text-xs text-via-ink">
            <input
              v-model="form.termsAccepted"
              type="checkbox"
              class="mt-0.5 size-3.5 accent-[var(--via-blue)]"
              :disabled="loading"
            >
            Li e aceito os Termos e Condições de Uso
          </label>
        </template>

        <div class="mt-1 flex gap-2">
          <AppButton
            v-if="!isFirst"
            type="button"
            variant="secondary"
            :disabled="loading"
            @click="onBack"
          >
            Voltar
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            class="flex-1 justify-center"
            :disabled="loading"
            :icon="isLast ? 'i-lucide-send' : 'i-lucide-chevron-right'"
          >
            {{ isLast ? (loading ? 'Enviando…' : 'Finalizar cadastro') : 'Próximo' }}
          </AppButton>
        </div>
      </form>

      <nav class="mt-5 border-t border-via-line pt-4 text-xs">
        <NuxtLink
          to="/login"
          class="font-[650] text-via-blue-strong no-underline hover:underline"
        >
          Já tenho conta — entrar
        </NuxtLink>
      </nav>
    </template>
  </div>
</template>
