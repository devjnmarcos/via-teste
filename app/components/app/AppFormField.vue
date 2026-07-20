<script setup lang="ts">
/**
 * Campo de formulário do DS — padrão do modal Novo/Editar SLA.
 * Label 11px/650 muted + gap-2 até o controle. Usar dentro de AppModal variant="form".
 */
defineProps<{
  label: string
}>()
</script>

<template>
  <label class="app-form-field grid gap-2 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted">
    <span>{{ label }}</span>
    <slot />
  </label>
</template>
