<template>
  <div
    class="min-h-screen bg-via-page bg-[#e6ecf3] p-0"
    data-testid="layout-default"
  >
    <div
      class="grid h-screen overflow-hidden rounded-none border-0 bg-via-surface bg-[#fbfdff] shadow-none"
      style="grid-template-columns: var(--app-sidebar-width) minmax(0, 1fr)"
    >
      <AppSidebar />
      <div class="min-h-0 min-w-0 overflow-hidden bg-via-surface bg-[#fbfdff]">
        <AppTopbar />
        <main class="relative h-[calc(100%-var(--app-topbar-height))] overflow-auto bg-via-surface bg-[#fbfdff]">
          <slot />
        </main>
      </div>
    </div>
    <AppToastHost />
  </div>
</template>
