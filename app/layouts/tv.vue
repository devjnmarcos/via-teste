<script setup lang="ts">
/**
 * Shell kiosk / TV wall — sem sidebar de propósito.
 * Entrada: `/dashboards/loja-tv?fullscreen=1`.
 * Saída: voltar para `/dashboards/loja-tv` (layout default com sidebar).
 */
</script>

<template>
  <div
    class="min-h-screen bg-via-page bg-[#0f1724] p-0"
    data-testid="layout-tv"
  >
    <div class="grid h-screen grid-cols-1 overflow-hidden bg-via-surface bg-[#fbfdff]">
      <div class="min-h-0 min-w-0 overflow-hidden">
        <AppTopbar />
        <main class="relative h-[calc(100%-var(--app-topbar-height))] overflow-auto bg-via-surface bg-[#fbfdff] text-[15px]">
          <slot />
        </main>
      </div>
    </div>
    <AppToastHost />
  </div>
</template>
