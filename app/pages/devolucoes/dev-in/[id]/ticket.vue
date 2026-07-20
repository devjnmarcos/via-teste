<script setup lang="ts">
/**
 * Ticket da caixa (Onda D) — superfície de impressão operacional mínima.
 */
import { getDevInBox } from '~/data/demo/devolucoes-dev-in'

const route = useRoute()
const boxId = computed(() => String(route.params.id ?? ''))
const box = computed(() => getDevInBox(boxId.value))

if (!box.value) {
  throw createError({ statusCode: 404, statusMessage: 'Caixa não encontrada' })
}

useSeoMeta({ title: () => `Ticket caixa #${boxId.value} · Via Reversa` })

function printTicket() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <div v-if="box">
    <PageHeader
      class="print:[&_.page-header]:[&_button]:hidden"
      :back-to="`/devolucoes/dev-in/${box.id}`"
      :title="`Ticket · Caixa #${box.id}`"
      :subtitle="`${box.companyName} · ${box.status} · ${box.totItemsIn} itens`"
    >
      <AppButton
        class="print:hidden"
        icon="i-lucide-printer"
        variant="primary"
        @click="printTicket"
      >
        Imprimir
      </AppButton>
    </PageHeader>

    <section class="px-app-gutter pt-[18px] pb-7">
      <dl class="mb-5 grid grid-cols-5 gap-3 max-[960px]:grid-cols-2">
        <div>
          <dt class="text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Empresa</dt>
          <dd class="mt-1 mb-0 text-[13px] font-[650]">{{ box.companyName }}</dd>
        </div>
        <div>
          <dt class="text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Status</dt>
          <dd class="mt-1 mb-0 text-[13px] font-[650]">{{ box.status }}</dd>
        </div>
        <div>
          <dt class="text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Aberto em</dt>
          <dd class="mt-1 mb-0 text-[13px] font-[650]">{{ box.createdAtLabel }}</dd>
        </div>
        <div>
          <dt class="text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Fechado em</dt>
          <dd class="mt-1 mb-0 text-[13px] font-[650]">{{ box.closedAtLabel }}</dd>
        </div>
        <div>
          <dt class="text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Criado por</dt>
          <dd class="mt-1 mb-0 text-[13px] font-[650]">{{ box.createdByName }}</dd>
        </div>
      </dl>

      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="border-b border-via-line px-3 py-2.5 text-left text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Serial</th>
            <th class="border-b border-via-line px-3 py-2.5 text-left text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Tipo</th>
            <th class="border-b border-via-line px-3 py-2.5 text-left text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Pedido</th>
            <th class="border-b border-via-line px-3 py-2.5 text-left text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase">Produto</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in box.items"
            :key="item.id"
          >
            <td class="border-b border-via-line px-3 py-2.5 text-left text-xs">{{ item.serial }}</td>
            <td class="border-b border-via-line px-3 py-2.5 text-left text-xs">{{ item.itemType }}</td>
            <td class="border-b border-via-line px-3 py-2.5 text-left text-xs">{{ item.orderId }}</td>
            <td class="border-b border-via-line px-3 py-2.5 text-left text-xs">{{ item.productLabel }}</td>
          </tr>
        </tbody>
      </table>

      <p
        v-if="!box.items.length"
        class="mt-4 text-xs text-via-muted"
      >
        Nenhum item associado a esta caixa.
      </p>
    </section>
  </div>
</template>
