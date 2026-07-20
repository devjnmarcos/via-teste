<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

withDefaults(defineProps<{
  variant?: ButtonVariant
  icon?: string
  to?: string
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  disabled?: boolean
}>(), {
  variant: 'secondary',
  type: 'button',
  icon: undefined,
  to: undefined,
  ariaLabel: undefined,
  disabled: false
})
</script>

<template>
  <UButton
    :to="to"
    :external="to ? false : undefined"
    :type="type"
    :icon="icon"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :color="variant === 'danger' ? 'error' : variant === 'primary' ? 'primary' : 'neutral'"
    :variant="variant === 'primary' || variant === 'danger' ? 'solid' : variant === 'ghost' ? 'ghost' : 'outline'"
    class="app-button min-h-9 cursor-pointer rounded-via-control px-[13px] text-xs font-[650] tracking-[-0.01em] transition-[background-color,border-color,color,transform] duration-150 ease-in-out hover:enabled:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55 disabled:transform-none"
    :class="[
      `app-button--${variant}`,
      variant === 'primary' || variant === 'danger' ? 'text-via-surface' : undefined
    ]"
  >
    <slot />
  </UButton>
</template>
