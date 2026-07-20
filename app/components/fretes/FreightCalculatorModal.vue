<script setup lang="ts">
/**
 * Calculadora de frete multi-step (legado ViaFreightPriceCalculator) em AppModal.
 */
import {
  calcFreightMock,
  createEmptyFreightCalc,
  formatFreightPrice,
  freightCalcClients,
  freightCalcSteps,
  freightPackageOptions,
  freightSystemOptions,
  validateFreightCalcStep,
  type FreightCalcResult
} from '~/data/demo/freight-calc'
import { useToast } from '~/composables/useToast'

const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const stepIndex = ref(0)
const form = reactive(createEmptyFreightCalc())
const result = ref<FreightCalcResult | null>(null)
const loading = ref(false)

const isFirst = computed(() => stepIndex.value === 0)
const isLast = computed(() => stepIndex.value === freightCalcSteps.length - 1)
const currentStep = computed(() => freightCalcSteps[stepIndex.value]!)

watch(open, (value) => {
  if (!value) return
  Object.assign(form, createEmptyFreightCalc())
  stepIndex.value = 0
  result.value = null
})

async function onNext() {
  const error = validateFreightCalcStep(stepIndex.value, form)
  if (error) {
    toast.error('Revise os campos', error)
    return
  }

  if (stepIndex.value === 2) {
    loading.value = true
    await new Promise((resolve) => setTimeout(resolve, 360))
    result.value = calcFreightMock(form)
    loading.value = false
  }

  if (!isLast.value) {
    stepIndex.value += 1
  }
}

function onBack() {
  if (!isFirst.value) stepIndex.value -= 1
}

function onClose() {
  open.value = false
}
</script>

<template>
  <AppModal
    v-model:open="open"
    variant="form"
    title="Calculadora de frete"
    :description="`${currentStep.label} — ${currentStep.description}`"
  >
    <ol
      class="m-0 mb-1 grid list-none grid-cols-4 gap-1 p-0"
      aria-label="Etapas da calculadora"
    >
      <li
        v-for="(step, index) in freightCalcSteps"
        :key="step.id"
        class="rounded-via-control border px-2 py-1.5 text-center text-[10px] font-bold tracking-[0.02em] uppercase"
        :class="index === stepIndex
          ? 'border-via-blue bg-via-blue-soft text-via-ink'
          : index < stepIndex
            ? 'border-via-green/40 bg-[color-mix(in_oklab,var(--via-green)_10%,var(--via-surface))] text-via-green'
            : 'border-via-line text-via-muted'"
      >
        {{ step.label }}
      </li>
    </ol>

    <template v-if="stepIndex === 0">
      <AppFormField label="CEP de origem *">
        <UInput
          v-model="form.originZip"
          placeholder="00000-000"
        />
      </AppFormField>
      <AppFormField label="CEP de destino *">
        <UInput
          v-model="form.destinyZip"
          placeholder="00000-000"
        />
      </AppFormField>
      <AppFormField label="Cliente *">
        <USelectMenu
          v-model="form.clientId"
          value-key="value"
          :items="freightCalcClients"
        />
      </AppFormField>
    </template>

    <template v-else-if="stepIndex === 1">
      <div class="grid grid-cols-2 gap-2.5">
        <AppFormField label="Embalagem *">
          <USelectMenu
            v-model="form.packageType"
            value-key="value"
            :items="freightPackageOptions"
          />
        </AppFormField>
        <AppFormField label="Peso (kg) *">
          <UInput
            v-model="form.weight"
            type="number"
            min="0"
            step="0.1"
          />
        </AppFormField>
      </div>
      <div class="grid grid-cols-3 gap-2.5">
        <AppFormField label="Altura (cm) *">
          <UInput
            v-model="form.sizeX"
            type="number"
            min="0"
          />
        </AppFormField>
        <AppFormField label="Largura (cm) *">
          <UInput
            v-model="form.sizeY"
            type="number"
            min="0"
          />
        </AppFormField>
        <AppFormField label="Comprimento (cm) *">
          <UInput
            v-model="form.sizeZ"
            type="number"
            min="0"
          />
        </AppFormField>
      </div>
    </template>

    <template v-else-if="stepIndex === 2">
      <AppFormField label="Valor da mercadoria (R$) *">
        <UInput
          v-model="form.itemPrice"
          type="number"
          min="0"
          step="0.01"
        />
      </AppFormField>
      <AppFormField label="Sistema *">
        <USelectMenu
          v-model="form.system"
          value-key="value"
          :items="freightSystemOptions"
        />
      </AppFormField>
      <label class="flex cursor-pointer items-center gap-2 text-xs text-via-ink">
        <input
          v-model="form.needSecurity"
          type="checkbox"
          class="size-3.5 accent-[var(--via-blue)]"
        >
        Deseja seguro?
      </label>
      <label class="flex cursor-pointer items-center gap-2 text-xs text-via-ink">
        <input
          v-model="form.needPackage"
          type="checkbox"
          class="size-3.5 accent-[var(--via-blue)]"
        >
        Deseja embalagem?
      </label>
    </template>

    <template v-else>
      <div
        v-if="result?.status === 'success'"
        class="rounded-via-control border border-via-line bg-via-surface-2 px-4 py-5 text-center"
      >
        <p class="m-0 text-[11px] font-bold tracking-[0.04em] text-via-muted uppercase">
          Valor do frete
        </p>
        <strong class="mt-2 block text-[28px] tracking-[-0.03em] text-via-ink">
          {{ formatFreightPrice(result.price) }}
        </strong>
      </div>
      <ul
        v-if="result?.messages.length"
        class="m-0 grid list-none gap-1.5 p-0 text-xs text-via-muted"
      >
        <li
          v-for="(message, index) in result.messages"
          :key="index"
        >
          {{ message }}
        </li>
      </ul>
    </template>

    <template #footer>
      <AppButton
        variant="secondary"
        :disabled="loading"
        @click="onClose"
      >
        Fechar
      </AppButton>
      <AppButton
        v-if="!isFirst && !isLast"
        variant="secondary"
        :disabled="loading"
        @click="onBack"
      >
        Voltar
      </AppButton>
      <AppButton
        v-if="!isLast"
        variant="primary"
        :disabled="loading"
        @click="onNext"
      >
        {{ stepIndex === 2 ? (loading ? 'Calculando…' : 'Calcular') : 'Próximo' }}
      </AppButton>
      <AppButton
        v-else
        variant="primary"
        @click="onClose"
      >
        Concluir
      </AppButton>
    </template>
  </AppModal>
</template>
