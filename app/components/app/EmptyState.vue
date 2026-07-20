<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div
    class="empty-state grid justify-items-center gap-1.5 border border-dashed border-via-line-strong px-5 py-9 text-center text-via-muted"
    role="status"
  >
    <UIcon
      :name="icon ?? 'i-lucide-inbox'"
      class="size-[22px] text-via-subtle"
      aria-hidden="true"
    />
    <strong class="text-[13px] text-via-ink">{{ title }}</strong>
    <p
      v-if="description"
      class="m-0 max-w-[360px] text-xs leading-[1.45]"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="mt-2"
    >
      <slot />
    </div>
  </div>
</template>
