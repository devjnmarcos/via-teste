<script setup lang="ts">
/**
 * Configurações → Processamento.
 */
import { configProcessForm, saveConfigProcessSnapshot } from '~/data/demo/configuracoes'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Processamento · Configurações · Via Reversa' })

const toast = useToast()
const form = reactive({ ...configProcessForm })
const resetOpen = ref(false)

function save() {
  if (form.maxBatchSize < 1 || form.retryAttempts < 0) {
    toast.error('Valores inválidos', 'Revise tamanho do lote e tentativas.')
    return
  }
  Object.assign(configProcessForm, saveConfigProcessSnapshot(form))
  toast.success('Configuração salva', 'Parâmetros de processamento atualizados (mock).')
}

function confirmReset() {
  resetOpen.value = false
  form.autoAssignSupportPoint = true
  form.allowManualRouteOverride = true
  form.maxBatchSize = 250
  form.retryAttempts = 3
  form.notifyOnFailure = true
  form.holdOnOccurrence = true
  toast.success('Restaurado', 'Valores padrão de processamento reaplicados.')
}
</script>

<template>
  <div class="config-processo-page">
    <PageHeader
      title="Configurações · Processamento"
      subtitle="Flags e limites do processamento de pedidos"
    >
      <AppButton
        icon="i-lucide-rotate-ccw"
        variant="ghost"
        @click="resetOpen = true"
      >
        Restaurar
      </AppButton>
      <AppButton
        icon="i-lucide-save"
        @click="save"
      >
        Salvar
      </AppButton>
    </PageHeader>

    <section
      class="mx-auto grid max-w-[720px] gap-4 px-[18px] py-5"
      aria-label="Formulário processamento"
    >
      <AppFormField label="Atribuir ponto de apoio automaticamente">
        <USwitch v-model="form.autoAssignSupportPoint" />
      </AppFormField>

      <AppFormField label="Permitir override manual de rota">
        <USwitch v-model="form.allowManualRouteOverride" />
      </AppFormField>

      <AppFormField label="Tamanho máximo do lote">
        <UInput
          v-model.number="form.maxBatchSize"
          type="number"
          min="1"
          class="w-full max-w-[200px]"
        />
      </AppFormField>

      <AppFormField label="Tentativas de retry">
        <UInput
          v-model.number="form.retryAttempts"
          type="number"
          min="0"
          class="w-full max-w-[200px]"
        />
      </AppFormField>

      <AppFormField label="Notificar em falha">
        <USwitch v-model="form.notifyOnFailure" />
      </AppFormField>

      <AppFormField label="Segurar em ocorrência">
        <USwitch v-model="form.holdOnOccurrence" />
      </AppFormField>
    </section>

    <AppModal
      v-model:open="resetOpen"
      variant="confirm"
      title="Restaurar padrões"
      description="Descartar alterações não salvas e voltar aos valores padrão?"
      confirm-label="Restaurar"
      confirm-variant="danger"
      @confirm="confirmReset"
    />
  </div>
</template>
