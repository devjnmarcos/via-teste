<script setup lang="ts">
import { resolveBreadcrumbs } from '../../utils/breadcrumbs'

const route = useRoute()

const crumbs = computed(() =>
  resolveBreadcrumbs(route.path, route.params as Record<string, string | string[] | undefined>)
)
</script>

<template>
  <header
    class="flex h-(--app-topbar-height) items-center justify-between border-b border-via-line bg-via-surface px-5"
  >
    <AppBreadcrumbs :items="crumbs" />
    <div class="flex items-center gap-2">
      <UInput
        icon="i-lucide-search"
        placeholder="Buscar pedido, cliente ou ponto de apoio..."
        aria-label="Busca global"
        class="w-[330px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-xs"
      />
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        aria-label="Notificações"
      />
      <span
        class="grid size-[34px] place-items-center rounded-full bg-via-blue-soft text-[11px] font-extrabold text-via-blue-strong"
        aria-label="Usuário Administrador"
      >AD</span>
    </div>
  </header>
</template>
