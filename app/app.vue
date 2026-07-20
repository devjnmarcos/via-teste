<template>
  <UApp class="min-h-screen bg-[#e6ecf3]">
    <NuxtLayout>
      <!-- Sem mode out-in: evita tela em branco entre rotas (parece full refresh). -->
      <NuxtPage :transition="{ name: 'via-page' }" />
    </NuxtLayout>
  </UApp>
</template>
