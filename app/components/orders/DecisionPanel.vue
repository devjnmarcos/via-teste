<script setup lang="ts">
import type { Order } from '../../types/domain'

defineProps<{
  order: Order
}>()
</script>

<template>
  <aside class="min-w-0">
    <section class="border-b border-via-line px-[18px] py-[17px]">
      <span class="text-[10px] font-bold text-via-red">SLA expirado · requer decisão</span>
      <h2 class="my-1.5 text-[15px]">Confirmar novo endereço</h2>
      <p class="m-0 text-[11px] leading-normal">O transportador não localizou o número informado. Confirme os dados com o cliente ou devolva o pedido ao ponto de apoio.</p>
      <div class="mt-[15px] flex justify-between text-[10px] text-via-muted">
        <span>Tempo decorrido</span>
        <strong class="numeric text-via-red">3h18</strong>
      </div>
      <div class="mt-1.5 h-1.5 rounded-[3px] bg-via-surface-3">
        <span class="block h-full w-[82%] rounded-[3px] bg-via-red" />
      </div>
      <div class="mt-3.5 grid grid-cols-[1fr_1.4fr] gap-[7px] [&_button]:min-h-9 [&_button]:whitespace-normal">
        <AppButton variant="primary">Registrar solução</AppButton>
        <AppButton>Devolver ao ponto de apoio</AppButton>
      </div>
    </section>
    <section class="px-[18px] py-4">
      <h3 class="mb-2.5 text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Responsabilidade atual</h3>
      <div class="flex min-h-7 justify-between text-[11px]">
        <span>Responsável</span>
        <strong>{{ order.responsible }}</strong>
      </div>
      <div class="flex min-h-7 justify-between text-[11px]">
        <span>Transportador</span>
        <strong>{{ order.transporter }}</strong>
      </div>
      <div class="flex min-h-7 justify-between text-[11px]">
        <span>Operação</span>
        <strong>{{ order.operation }}</strong>
      </div>
    </section>
  </aside>
</template>
