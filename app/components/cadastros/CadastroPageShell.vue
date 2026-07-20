<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  createTo?: string
  createLabel?: string
  searchPlaceholder?: string
}>()

const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <div>
    <PageHeader
      back-to="/cadastros"
      :title="title"
      :subtitle="subtitle"
    >
      <slot name="actions" />
      <AppButton
        v-if="createTo"
        :to="createTo"
        icon="i-lucide-plus"
        variant="primary"
      >
        {{ createLabel ?? 'Novo' }}
      </AppButton>
    </PageHeader>

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        :placeholder="searchPlaceholder ?? 'Buscar...'"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <AppButton icon="i-lucide-list-filter">Filtros</AppButton>
      <span class="flex-1" />
      <slot name="toolbar" />
    </section>

    <div class="pb-2">
      <slot />
    </div>
  </div>
</template>
