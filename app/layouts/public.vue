<template>
  <div class="public-layout relative min-h-screen overflow-hidden bg-[oklch(97%_0.008_253)] text-via-ink">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_10%_0%,oklch(92%_0.03_253)_0%,transparent_55%),radial-gradient(ellipse_60%_45%_at_100%_100%,oklch(94%_0.02_220)_0%,transparent_50%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(oklch(40%_0.04_253)_1px,transparent_1px),linear-gradient(90deg,oklch(40%_0.04_253)_1px,transparent_1px)] [background-size:40px_40px]"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-5 py-10 sm:px-8">
      <header class="mb-8 flex items-center gap-3">
        <img
          class="block size-12 object-contain"
          src="/assets/via-reversa-mark.png"
          alt="Via Reversa"
        >
        <div>
          <p class="m-0 text-[1.55rem] font-[800] tracking-[-0.04em] text-via-ink leading-none">
            Via Reversa
          </p>
          <p class="mt-1 mb-0 text-xs text-via-muted">
            Consulta e compartilhamento público
          </p>
        </div>
      </header>

      <main class="flex-1">
        <slot />
      </main>

      <footer class="mt-10 border-t border-via-line pt-4 text-xs text-via-muted">
        Dados exibidos conforme autorização do link. Ambiente demo.
      </footer>
    </div>

    <AppToastHost />
  </div>
</template>
