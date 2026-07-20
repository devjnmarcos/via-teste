<script setup lang="ts">
import type { OrderItem } from '../../types/domain'

defineProps<{
  items: OrderItem[]
  canBip?: boolean
}>()

const th = 'h-[38px] border-b border-via-line bg-via-surface-2 px-3 text-left text-[10px] font-bold tracking-[0.035em] text-via-muted uppercase'
const td = 'h-[58px] border-b border-via-line px-3 align-middle text-xs text-via-ink'
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="m-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">Itens do pedido</h2>
      <AppButton v-if="canBip !== false" icon="i-lucide-scan-barcode">Ler serial</AppButton>
    </div>

    <div
      v-if="!items.length"
      class="grid justify-items-center gap-1.5 border border-dashed border-via-line-strong px-5 py-9 text-center text-via-muted"
      role="status"
    >
      <UIcon name="i-lucide-package" class="size-[22px] text-via-subtle" aria-hidden="true" />
      <strong class="text-[13px] text-via-ink">Nenhum item neste pedido</strong>
      <p class="m-0 max-w-[360px] text-xs leading-[1.45]">Quando a API de itens estiver ligada, a composição do pedido aparece aqui.</p>
    </div>

    <div
      v-else
      class="min-w-0 overflow-auto"
    >
      <table class="w-full min-w-[760px] table-fixed border-collapse">
        <thead>
          <tr>
            <th :class="th">Descrição</th>
            <th :class="[th, 'w-[140px]']">Serial</th>
            <th :class="[th, 'w-[120px]']">Fabricante</th>
            <th :class="[th, 'w-[120px]']">Categoria</th>
            <th :class="[th, 'w-16 text-right']">Qtd.</th>
            <th :class="[th, 'w-[110px] text-right']">Preço</th>
            <th :class="[th, 'w-[90px] text-right']">Peso (kg)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
          >
            <td :class="td"><strong class="block text-xs">{{ item.description }}</strong></td>
            <td :class="[td, 'numeric w-[140px]']">{{ item.serialNumber }}</td>
            <td :class="[td, 'w-[120px]']">{{ item.manufacturer }}</td>
            <td :class="[td, 'w-[120px]']">{{ item.category }}</td>
            <td :class="[td, 'numeric w-16 text-right']">{{ item.quantity }}</td>
            <td :class="[td, 'numeric w-[110px] text-right']">{{ item.price }}</td>
            <td :class="[td, 'numeric w-[90px] text-right']">{{ item.weightKg }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
