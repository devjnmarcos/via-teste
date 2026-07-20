<template>
  <div class="auth-layout relative min-h-screen overflow-hidden bg-[oklch(22%_0.04_253)] text-[oklch(96%_0.01_253)]">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_20%,oklch(38%_0.09_253)_0%,transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_80%,oklch(32%_0.06_220)_0%,transparent_50%),linear-gradient(165deg,oklch(20%_0.035_253)_0%,oklch(26%_0.045_253)_45%,oklch(18%_0.03_253)_100%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(oklch(90%_0.02_253)_1px,transparent_1px),linear-gradient(90deg,oklch(90%_0.02_253)_1px,transparent_1px)] [background-size:48px_48px]"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto grid min-h-screen w-full max-w-[1120px] items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_minmax(0,420px)] lg:gap-16 lg:px-10">
      <section
        class="auth-brand max-lg:text-center"
        aria-label="Marca Via Reversa"
      >
        <img
          class="mb-5 block size-[72px] object-contain max-lg:mx-auto lg:size-[88px]"
          src="/assets/via-reversa-mark.png"
          alt="Via Reversa"
        >
        <p class="m-0 text-[clamp(2.4rem,5vw,3.6rem)] font-[800] tracking-[-0.045em] text-[oklch(98%_0.008_253)] leading-[1.05]">
          Via Reversa
        </p>
        <p class="mt-3 mb-0 max-w-[28rem] text-[15px] leading-[1.5] text-[oklch(82%_0.03_253)] max-lg:mx-auto">
          Operação logística de logística reversa — entre para acompanhar pedidos, lotes e indicadores.
        </p>
      </section>

      <section class="auth-panel w-full rounded-none border border-[oklch(40%_0.04_253)] bg-[oklch(97%_0.006_253)] p-7 text-via-ink shadow-[0_24px_48px_-28px_oklch(12%_0.04_253)] sm:p-8">
        <slot />
      </section>
    </div>

    <AppToastHost />
  </div>
</template>
