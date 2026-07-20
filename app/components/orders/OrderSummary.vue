<script setup lang="ts">
import type { Order, OrderFiscalDocument, OrderLockerInfo } from '../../types/domain'

const props = defineProps<{
  order: Order
  locker?: OrderLockerInfo | null
  fiscal?: OrderFiscalDocument | null
}>()

const fields = computed(() => [
  { label: 'Cliente', icon: 'i-lucide-user-round', value: props.order.client, note: 'Conta principal' },
  { label: 'Operação', icon: 'i-lucide-route', value: props.order.operation, note: `${props.order.items} item` },
  { label: 'Documento', icon: 'i-lucide-file-text', value: props.order.document ?? 'Não informado', note: `Pedido externo ${props.order.externalOrder ?? '—'}` },
  { label: 'Endereço', icon: 'i-lucide-map-pin', value: props.order.address?.split(' · ')[0] ?? 'Não informado', note: props.order.address?.split(' · ').slice(1).join(' · ') ?? '—' },
  { label: 'Ponto de apoio', icon: 'i-lucide-house', value: props.order.supportPoint, note: 'Atribuído às 07:41' },
  { label: 'Transportador', icon: 'i-lucide-truck', value: props.order.transporter ?? props.order.responsible, note: 'Em rota desde 07:58' },
  { label: 'Agendamento', icon: 'i-lucide-calendar-days', value: 'Hoje, 14:30', note: 'Janela até 16:00' },
  { label: 'SLA', icon: 'i-lucide-clock-3', value: props.order.sla, note: 'Meta contratual 2h', danger: props.order.slaTone === 'danger' },
  { label: 'Última atualização', icon: 'i-lucide-refresh-cw', value: props.order.updatedAt, note: 'Há 47 minutos' }
])

const lockerRows = computed(() => {
  if (!props.locker) return []
  return [
    { group: 'Locker | Expedição', rows: [
      { label: 'Expedido em', value: props.locker.expeditionAt },
      { label: 'Id de expedição', value: props.locker.expeditionExtId },
      { label: 'QRCode expedição', value: props.locker.expeditionQrcode }
    ] },
    { group: 'Locker | Retirada', rows: [
      { label: 'Retirado em', value: props.locker.removalAt },
      { label: 'Código para retirada', value: props.locker.removalExtCode },
      { label: 'QRCode retirada', value: props.locker.removalQrcode }
    ] }
  ]
})

const fiscalRows = computed(() => {
  if (!props.fiscal) return []
  return [
    { label: 'Número', value: props.fiscal.number },
    { label: 'Série', value: props.fiscal.series },
    { label: 'N° do pedido', value: props.fiscal.orderId },
    { label: 'Chave de acesso', value: props.fiscal.accessKey },
    { label: 'Quant. de volumes', value: props.fiscal.volumeAmount },
    { label: 'Valor', value: props.fiscal.value },
    { label: 'Valor dos itens', value: props.fiscal.itemsValue },
    { label: 'Data de emissão', value: props.fiscal.emissionDate }
  ]
})
</script>

<template>
  <section>
    <h2 class="m-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">Resumo operacional</h2>
    <div class="grid grid-cols-3 border border-via-line-strong">
      <article
        v-for="(field, index) in fields"
        :key="field.label"
        class="min-h-[94px] border-r border-b border-via-line px-4 py-3.5 max-[1380px]:px-3"
        :class="[
          (index + 1) % 3 === 0 ? 'border-r-0' : undefined,
          index >= fields.length - 3 ? 'border-b-0' : undefined
        ]"
      >
        <span class="inline-flex items-center gap-[7px] text-xs text-via-muted [&_svg]:size-[17px] [&_svg]:text-via-subtle">
          <UIcon
            :name="field.icon"
            aria-hidden="true"
          />{{ field.label }}
        </span>
        <strong
          class="mt-[5px] block text-sm"
          :class="field.danger ? 'text-via-red' : undefined"
        >{{ field.value }}</strong>
        <small class="mt-[3px] block text-[11px] text-via-muted">{{ field.note }}</small>
      </article>
    </div>

    <template v-if="lockerRows.length">
      <h2 class="mt-3 mb-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">
        Locker
      </h2>
      <div class="grid grid-cols-2 gap-0 border border-via-line-strong max-[900px]:grid-cols-1">
        <article
          v-for="(group, groupIndex) in lockerRows"
          :key="group.group"
          class="border-via-line px-4 py-3.5"
          :class="groupIndex === 0 ? 'border-r max-[900px]:border-r-0 max-[900px]:border-b' : undefined"
        >
          <strong class="mb-2 block text-xs text-via-ink">{{ group.group }}</strong>
          <div
            v-for="row in group.rows"
            :key="row.label"
            class="mb-1.5 grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs last:mb-0"
          >
            <span class="text-via-muted">{{ row.label }}</span>
            <strong class="font-[650] text-via-ink break-all">{{ row.value }}</strong>
          </div>
        </article>
      </div>
    </template>

    <template v-if="fiscalRows.length">
      <h2 class="mt-3 mb-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">
        NFe / Faturamento
      </h2>
      <div class="grid grid-cols-2 border border-via-line-strong max-[900px]:grid-cols-1">
        <div
          v-for="row in fiscalRows"
          :key="row.label"
          class="grid min-h-[48px] grid-cols-[140px_minmax(0,1fr)] items-center gap-2 border-b border-r border-via-line px-4 py-2.5 text-xs max-[900px]:border-r-0"
        >
          <span class="text-via-muted">{{ row.label }}</span>
          <strong class="font-[650] break-all text-via-ink">{{ row.value }}</strong>
        </div>
      </div>
    </template>

    <h2 class="mt-3 mb-0 flex min-h-8 items-center text-xs font-[750] tracking-[0.05em] uppercase">Estabelecimentos envolvidos</h2>
    <div class="border-t border-via-line-strong">
      <NuxtLink
        v-for="establishment in order.establishments"
        :key="establishment.role"
        to="#"
        class="grid min-h-[58px] grid-cols-[18px_110px_minmax(0,1fr)_180px_20px] items-center gap-2 border-b border-via-line text-xs text-via-ink no-underline hover:bg-via-blue-soft [&_svg:first-child]:text-via-blue-strong [&_svg:last-child]:text-via-blue-strong"
      >
        <UIcon
          :name="establishment.role === 'Origem' ? 'i-lucide-package-open' : establishment.role === 'Ponto de apoio' ? 'i-lucide-house' : 'i-lucide-warehouse'"
          aria-hidden="true"
        />
        <strong>{{ establishment.role }}</strong>
        <span class="text-via-muted">{{ establishment.name }}</span>
        <span class="text-via-muted">{{ establishment.detail }}</span>
        <UIcon
          name="i-lucide-chevron-right"
          aria-hidden="true"
        />
      </NuxtLink>
    </div>
  </section>
</template>
