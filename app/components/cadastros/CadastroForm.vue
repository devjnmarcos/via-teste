<script setup lang="ts">
import type { CadastroFormField } from '../../types/domain'

const props = defineProps<{
  fields: CadastroFormField[]
  submitLabel?: string
  cancelTo?: string
}>()

const model = reactive<Record<string, string>>(
  Object.fromEntries(props.fields.map((field) => [field.key, field.value ?? '']))
)

watch(
  () => props.fields,
  (fields) => {
    for (const field of fields) {
      model[field.key] = field.value ?? ''
    }
  },
  { deep: true }
)

function onSubmit() {
  // Mock: formulário navegável sem persistência até a API V2.
}

function onCancel() {
  if (props.cancelTo) {
    return navigateTo(props.cancelTo)
  }
  return navigateTo(-1)
}
</script>

<template>
  <form
    class="px-5 pt-4 pb-6"
    @submit.prevent="onSubmit"
  >
    <div class="grid max-w-[880px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
      <label
        v-for="field in fields"
        :key="field.key"
        class="grid gap-1.5"
        :class="field.type === 'textarea' ? 'col-span-full' : undefined"
      >
        <span class="text-[11px] font-[650] text-via-muted">
          {{ field.label }}<abbr
            v-if="field.required"
            class="ml-0.5 text-via-red no-underline"
            title="Obrigatório"
          >*</abbr>
        </span>
        <UTextarea
          v-if="field.type === 'textarea'"
          v-model="model[field.key]"
          :placeholder="field.placeholder"
          :rows="3"
        />
        <USelectMenu
          v-else-if="field.type === 'select'"
          v-model="model[field.key]"
          value-key="value"
          :items="(field.options ?? []).map((option) => ({ label: option.label, value: option.value }))"
          :placeholder="field.placeholder ?? 'Selecione'"
        />
        <UInput
          v-else
          v-model="model[field.key]"
          :type="field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'"
          :placeholder="field.placeholder"
          :required="field.required"
        />
      </label>
    </div>
    <div class="mt-[18px] flex gap-2">
      <AppButton type="button" @click="onCancel">Cancelar</AppButton>
      <AppButton type="submit" variant="primary">{{ submitLabel ?? 'Salvar' }}</AppButton>
    </div>
  </form>
</template>
