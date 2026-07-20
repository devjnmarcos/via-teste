<script setup lang="ts">
import type { OrderMaterial } from '../../types/domain'

defineProps<{
  materials: OrderMaterial[]
}>()

const th = 'h-[38px] border-b border-via-line bg-via-surface-2 px-3 text-left text-[10px] font-bold tracking-[0.035em] text-via-muted uppercase'
const td = 'h-[58px] border-b border-via-line px-3 align-middle text-xs text-via-ink'
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="m-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">
        Materiais utilizados
      </h2>
    </div>

    <div
      v-if="!materials.length"
      class="grid justify-items-center gap-2 border border-dashed border-via-line-strong px-5 py-9 text-center text-via-muted"
      role="status"
    >
      <UIcon
        name="i-lucide-boxes"
        class="size-[22px] text-via-subtle"
        aria-hidden="true"
      />
      <strong class="text-[13px] text-via-ink">Nenhum material registrado</strong>
      <p class="m-0 max-w-[380px] text-xs leading-[1.45]">
        Embalagens, lacres e insumos usados no pedido aparecem aqui quando lançados na operação.
      </p>
    </div>

    <div
      v-else
      class="min-w-0 overflow-auto"
    >
      <table class="w-full min-w-[420px] table-fixed border-collapse">
        <thead>
          <tr>
            <th :class="th">Material</th>
            <th :class="[th, 'w-[120px] text-right']">Quantidade</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in materials"
            :key="item.id"
          >
            <td :class="td">
              <strong class="block text-xs">{{ item.productName }}</strong>
            </td>
            <td :class="[td, 'numeric w-[120px] text-right']">{{ item.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
