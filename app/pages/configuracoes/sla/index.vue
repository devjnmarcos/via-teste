<script setup lang="ts">
/**
 * Configurações → SLA (módulo).
 */
import { configSlaForm, saveConfigSlaSnapshot } from '~/data/demo/configuracoes'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'SLA · Configurações · Via Reversa' })

const toast = useToast()
const form = reactive({ ...configSlaForm })
const resetOpen = ref(false)

function save() {
  Object.assign(configSlaForm, saveConfigSlaSnapshot(form))
  toast.success('Configuração salva', 'Parâmetros de SLA do módulo atualizados (mock).')
}

function confirmReset() {
  resetOpen.value = false
  form.cutoffHour = '15:00'
  form.toleranceMinutes = 45
  form.endHour = '21:00'
  form.considerHolidays = true
  form.considerWeekends = false
  form.auditEnabled = true
  toast.success('Restaurado', 'Valores padrão de SLA reaplicados.')
}
</script>

<template>
  <div class="config-sla-page">
    <PageHeader
      title="Configurações · SLA"
      subtitle="Parâmetros de função SLA / horas do módulo (distinto de Cadastros → SLA)"
    >
      <AppButton
        icon="i-lucide-scroll-text"
        variant="ghost"
        to="/configuracoes/sla/auditoria"
      >
        Auditoria
      </AppButton>
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
      aria-label="Formulário SLA"
    >
      <AppFormField label="Horário de corte">
        <UInput
          v-model="form.cutoffHour"
          class="w-full max-w-[200px]"
        />
      </AppFormField>

      <AppFormField label="Tolerância (minutos)">
        <UInput
          v-model.number="form.toleranceMinutes"
          type="number"
          min="0"
          class="w-full max-w-[200px]"
        />
      </AppFormField>

      <AppFormField label="Horário de término">
        <UInput
          v-model="form.endHour"
          class="w-full max-w-[200px]"
        />
      </AppFormField>

      <AppFormField label="Considerar feriados">
        <USwitch v-model="form.considerHolidays" />
      </AppFormField>

      <AppFormField label="Considerar fins de semana">
        <USwitch v-model="form.considerWeekends" />
      </AppFormField>

      <AppFormField label="Auditoria ativa">
        <USwitch v-model="form.auditEnabled" />
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
