<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    live?: boolean;
    backTo?: string;
  }>(),
  {
    live: false,
    backTo: undefined,
  },
);
</script>

<template>
  <header
    class="page-header flex min-h-[88px] items-center justify-between border-b border-via-line bg-via-surface px-app-gutter py-3"
  >
    <div class="min-w-0">
      <div class="mt-[5px] flex items-center gap-2 [&_.app-button]:min-h-[30px] [&_.app-button]:px-2">
        <AppButton
          v-if="backTo"
          :to="backTo"
          icon="i-lucide-arrow-left"
          variant="ghost"
          aria-label="Voltar"
        />
        <div>
          <h1 class="via-page-title">{{ title }}</h1>
          <p class="mt-[3px] mb-0 text-xs text-via-muted">{{ subtitle }}</p>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span
        v-if="live"
        class="mr-2 inline-flex items-center gap-[7px] text-[11px] text-via-muted"
      >
        <i
          class="size-[7px] rounded-full bg-via-green"
          aria-hidden="true"
        />
        Atualização automática · 13:42:18
      </span>
      <slot />
    </div>
  </header>
</template>
