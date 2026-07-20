<script setup lang="ts">
/**
 * Público → agendamento curto (/c?token=...).
 */
import {
  confirmPublicSchedule,
  publicScheduleSlots
} from '~/data/demo/compartilhamento-publico'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'public' })

useSeoMeta({ title: 'Agendar coleta · Via Reversa' })

const route = useRoute()
const toast = useToast()

const token = computed(() => {
  const raw = route.query.token
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? '' : ''
})

const selectedSlot = ref('')
const done = ref(false)
const confirmOpen = ref(false)

function openConfirm() {
  if (!token.value) {
    toast.error('Token ausente', 'Abra o link com ?token=demo-coleta')
    return
  }
  if (!selectedSlot.value) {
    toast.error('Escolha um horário', 'Selecione um slot disponível.')
    return
  }
  confirmOpen.value = true
}

function confirm() {
  confirmOpen.value = false
  const slot = confirmPublicSchedule(token.value, selectedSlot.value)
  if (!slot) {
    toast.error('Falha', 'Não foi possível confirmar o agendamento.')
    return
  }
  done.value = true
  toast.success('Agendado', `Coleta marcada para ${slot.label}.`)
}
</script>

<template>
  <div class="publico-agendar">
    <h1 class="m-0 text-[1.45rem] font-[750] tracking-[-0.03em]">
      Agendar coleta
    </h1>
    <p class="mt-2 mb-5 text-sm text-via-muted">
      Escolha um horário disponível. Token demo: <code>demo-coleta</code>
    </p>

    <EmptyState
      v-if="done"
      title="Coleta agendada"
      description="Você receberá a confirmação no canal cadastrado."
      icon="i-lucide-calendar-check"
    />

    <template v-else>
      <AppFormField label="Horário">
        <USelectMenu
          v-model="selectedSlot"
          value-key="value"
          :items="publicScheduleSlots.filter((slot) => slot.available).map((slot) => ({ label: slot.label, value: slot.id }))"
          class="w-full"
          placeholder="Selecione…"
        />
      </AppFormField>

      <div class="mt-4">
        <AppButton
          icon="i-lucide-calendar-plus"
          @click="openConfirm"
        >
          Confirmar horário
        </AppButton>
      </div>
    </template>

    <AppModal
      v-model:open="confirmOpen"
      variant="confirm"
      title="Confirmar agendamento"
      description="Reservar o horário selecionado para a coleta?"
      confirm-label="Confirmar"
      confirm-variant="primary"
      @confirm="confirm"
    />
  </div>
</template>
