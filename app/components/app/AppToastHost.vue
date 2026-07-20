<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>

<template>
  <div
    class="pointer-events-none fixed top-[calc(var(--app-topbar-height)+16px)] right-5 z-80"
    aria-live="polite"
    aria-relevant="additions text"
  >
    <TransitionGroup
      name="via-toast"
      tag="div"
      class="pointer-events-auto flex flex-col gap-2"
    >
      <AppToast
        v-for="toast in toasts"
        :key="toast.id"
        :toast="toast"
        @dismiss="dismiss"
      />
    </TransitionGroup>
  </div>
</template>
