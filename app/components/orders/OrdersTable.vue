<script setup lang="ts">
import type { Order } from '../../types/domain'

const props = withDefaults(defineProps<{
  orders: Order[]
  live?: boolean
  selectable?: boolean
}>(), {
  live: false,
  selectable: false
})

const selectedIds = defineModel<string[]>('selected', { default: () => [] })

const allSelected = computed(() =>
  props.orders.length > 0 && props.orders.every((order) => selectedIds.value.includes(order.id))
)

const someSelected = computed(() =>
  props.orders.some((order) => selectedIds.value.includes(order.id)) && !allSelected.value
)

function orderPath(order: Order) {
  return order.href || `/pedidos/${order.id}`
}

function openOrder(order: Order) {
  return navigateTo(orderPath(order), { external: false })
}

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

function toggleOne(id: string, event?: Event) {
  event?.stopPropagation()
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  }
  else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = []
    return
  }
  selectedIds.value = props.orders.map((order) => order.id)
}

const thClass = 'h-[38px] border-b border-via-line bg-via-surface-2 px-3 text-left text-[10px] font-bold tracking-[0.035em] text-via-muted uppercase max-[1380px]:px-[9px]'
const tdClass = 'h-[58px] border-b border-via-line px-3 align-middle text-xs text-via-ink max-[1380px]:px-[9px]'
</script>

<template>
  <div class="min-w-0 overflow-auto">
    <table
      class="w-full table-fixed border-collapse"
      :class="live ? 'min-w-[730px]' : 'min-w-[980px]'"
    >
      <colgroup v-if="live">
        <col class="w-[82px]"><col><col class="w-[124px]"><col class="w-[112px]"><col class="w-[18%]"><col class="w-[92px]"><col class="w-[54px]">
      </colgroup>
      <colgroup v-else>
        <col v-if="selectable" class="w-[38px]"><col class="w-[84px]"><col class="w-[124px]"><col class="w-[17%]"><col class="w-[13%]"><col class="w-[18%]"><col class="w-[54px]"><col class="w-[96px]"><col class="w-[92px]"><col class="w-[54px]">
      </colgroup>
      <thead>
        <tr v-if="live">
          <th :class="thClass">Pedido</th>
          <th :class="thClass">Cliente</th>
          <th :class="thClass">Etapa atual</th>
          <th :class="thClass">Tempo na etapa</th>
          <th :class="thClass">Ponto de apoio / responsável</th>
          <th :class="thClass">SLA</th>
          <th :class="thClass"><span class="sr-only">Abrir</span></th>
        </tr>
        <tr v-else>
          <th
            v-if="selectable"
            :class="[thClass, 'w-[38px] text-center']"
          >
            <button
              type="button"
              class="inline-flex size-3.5 cursor-pointer items-center justify-center rounded-[3px] border border-via-line-strong bg-via-surface p-0"
              :class="allSelected || someSelected ? 'border-via-blue bg-via-blue' : undefined"
              :aria-checked="allSelected ? 'true' : someSelected ? 'mixed' : 'false'"
              role="checkbox"
              aria-label="Selecionar todos"
              @click="toggleAll"
            >
              <UIcon
                v-if="allSelected"
                name="i-lucide-check"
                class="size-2.5 text-via-surface"
              />
              <span
                v-else-if="someSelected"
                class="block h-0.5 w-2 bg-via-surface"
              />
            </button>
          </th>
          <th :class="thClass">Pedido</th>
          <th :class="thClass">Status</th>
          <th :class="thClass">Cliente</th>
          <th :class="thClass">Operação</th>
          <th :class="thClass">Ponto de apoio / transportador</th>
          <th :class="thClass">UF</th>
          <th :class="thClass">Criado</th>
          <th :class="thClass">SLA</th>
          <th :class="thClass"><span class="sr-only">Abrir</span></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="order in orders"
          :key="order.id"
          class="cursor-pointer transition-[background-color,box-shadow] duration-220 hover:bg-via-blue-soft hover:shadow-[inset_3px_0_0_var(--via-blue)] focus-visible:bg-via-blue-soft focus-visible:shadow-[inset_3px_0_0_var(--via-blue)]"
          tabindex="0"
          role="link"
          :data-testid="`order-row-${order.id}`"
          :data-order-href="orderPath(order)"
          @click="openOrder(order)"
          @keydown.enter="openOrder(order)"
        >
          <template v-if="live">
            <td :class="[tdClass, 'font-bold']">#{{ order.id }}</td>
            <td :class="tdClass"><strong class="block">{{ order.client }}</strong><small class="mt-0.5 block text-[10px] text-via-muted">{{ order.operation }} · {{ order.state }}</small></td>
            <td :class="tdClass"><StatusLabel :status="order.status" :label="order.statusLabel" /></td>
            <td :class="tdClass"><strong class="block">{{ order.stageDuration }}</strong><small class="mt-0.5 block text-[10px] text-via-muted">desde {{ order.updatedAt }}</small></td>
            <td :class="tdClass"><strong class="block">{{ order.supportPoint }}</strong><small class="mt-0.5 block text-[10px] text-via-muted">{{ order.responsible }}</small></td>
            <td
              :class="[
                tdClass,
                'font-bold',
                order.slaTone === 'warning' ? 'text-[oklch(54%_0.14_73)]' : undefined,
                order.slaTone === 'danger' ? 'text-via-red' : undefined
              ]"
            >
              <strong class="block">{{ order.sla }}</strong>
              <small class="mt-0.5 block text-[10px] text-via-muted">{{ order.slaTone === 'danger' ? 'requer ação' : 'restantes' }}</small>
            </td>
            <td :class="[tdClass, 'text-right font-bold text-via-blue-strong [&_svg]:size-4']"><UIcon name="i-lucide-chevron-right" aria-hidden="true" /></td>
          </template>
          <template v-else>
            <td
              v-if="selectable"
              :class="[tdClass, 'w-[38px] text-center']"
              @click.stop
            >
              <button
                type="button"
                class="inline-flex size-3.5 cursor-pointer items-center justify-center rounded-[3px] border border-via-line-strong bg-via-surface p-0"
                :class="isSelected(order.id) ? 'border-via-blue bg-via-blue' : undefined"
                :aria-checked="isSelected(order.id)"
                role="checkbox"
                :aria-label="`Selecionar pedido ${order.id}`"
                @click="toggleOne(order.id, $event)"
              >
                <UIcon
                  v-if="isSelected(order.id)"
                  name="i-lucide-check"
                  class="size-2.5 text-via-surface"
                />
              </button>
            </td>
            <td :class="[tdClass, 'font-bold']">#{{ order.id }}</td>
            <td :class="tdClass"><StatusLabel :status="order.status" :label="order.statusLabel" /></td>
            <td :class="tdClass">{{ order.client }}</td>
            <td :class="tdClass">{{ order.operation }}</td>
            <td :class="tdClass">{{ order.supportPoint }}</td>
            <td :class="tdClass">{{ order.region }}</td>
            <td :class="tdClass">{{ order.createdAt }}</td>
            <td
              :class="[
                tdClass,
                'font-bold',
                order.slaTone === 'warning' ? 'text-[oklch(54%_0.14_73)]' : undefined,
                order.slaTone === 'danger' ? 'text-via-red' : undefined
              ]"
            >{{ order.sla }}</td>
            <td :class="[tdClass, 'cursor-pointer text-right font-bold text-via-blue-strong']">Abrir</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
