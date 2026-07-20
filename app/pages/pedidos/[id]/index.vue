<script setup lang="ts">
import { featuredOrder, orders } from '~/data/demo/orders'
import { getOrderDetailBundle } from '~/data/demo/order-detail'
import type { OrderDetailTabId } from '~/types/domain'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()
const order = computed(() => orders.find((item) => item.id === String(route.params.id)) ?? featuredOrder)
const detail = computed(() => getOrderDetailBundle(order.value.id))
const journeyEvents = computed(() => (order.value.events.length ? order.value.events : featuredOrder.events))

const tabs = computed(() => [
  { id: 'overview' as const, label: 'Visão geral' },
  { id: 'items' as const, label: `Itens · ${order.value.items}` },
  { id: 'occurrences' as const, label: `Ocorrências · ${order.value.occurrences}` },
  { id: 'evidences' as const, label: `Evidências · ${detail.value.evidences.length || order.value.evidences}` },
  { id: 'materials' as const, label: `Materiais · ${detail.value.materials.length}` },
  { id: 'barcodes' as const, label: `Barras · ${detail.value.barcodes.length}` },
  { id: 'scheduling' as const, label: 'Agendamento' },
  { id: 'history' as const, label: 'Histórico' }
])

const activeTab = ref<OrderDetailTabId>('overview')
const isOverview = computed(() => activeTab.value === 'overview')

const processOpen = ref(false)
const processLoading = ref(false)

useSeoMeta({ title: () => `Pedido #${order.value.id} · Via Reversa` })

async function confirmProcess() {
  processLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 480))
  processLoading.value = false
  processOpen.value = false
  toast.success('Pedido processado', `Pedido #${order.value.id} processado com sucesso (mock).`)
}
</script>

<template>
  <div>
    <PageHeader
      back-to="/pedidos"
      :title="`Pedido #${order.id}`"
      :subtitle="`${order.client} · ${order.operation} · criado em ${order.createdAt}`"
    >
      <StatusLabel :status="order.status" />
      <AppButton
        :to="`/pedidos/${order.id}/editar`"
        icon="i-lucide-pencil"
      >
        Editar
      </AppButton>
      <AppButton
        :to="`/pedidos/${order.id}/checkout`"
        icon="i-lucide-calendar-check"
      >
        Checkout
      </AppButton>
      <AppButton
        icon="i-lucide-play"
        variant="primary"
        @click="processOpen = true"
      >
        Processar
      </AppButton>
      <AppButton>Reatribuir</AppButton>
      <AppButton>Resolver ocorrência</AppButton>
    </PageHeader>

    <OrderJourney
      :events="journeyEvents"
      :updated-at="order.updatedAt"
    />

    <section class="grid min-h-[62px] grid-cols-4 border-b border-via-line max-[980px]:grid-cols-2">
      <article class="flex items-center gap-2.5 border-r border-via-line px-5 [&_svg]:size-[18px] [&_svg]:text-via-blue-strong">
        <UIcon name="i-lucide-package" /><strong class="numeric text-[22px]">{{ order.items }}</strong><span class="text-xs text-via-muted">item</span>
      </article>
      <article class="flex items-center gap-2.5 border-r border-via-line px-5 text-via-red [&_svg]:size-[18px] [&_svg]:text-via-red [&_strong]:text-via-red">
        <UIcon name="i-lucide-triangle-alert" /><strong class="numeric text-[22px]">{{ order.occurrences }}</strong><span class="text-xs text-via-muted">ocorrências</span>
      </article>
      <article class="flex items-center gap-2.5 border-r border-via-line px-5 [&_svg]:size-[18px] [&_svg]:text-via-cyan">
        <UIcon name="i-lucide-camera" /><strong class="numeric text-[22px]">{{ order.evidences }}</strong><span class="text-xs text-via-muted">evidências</span>
      </article>
      <article class="flex items-center gap-2.5 px-5 [&_svg]:size-[18px] [&_svg]:text-via-green">
        <UIcon name="i-lucide-calendar-days" /><strong class="numeric text-[22px]">{{ order.scheduling }}</strong><span class="text-xs text-via-muted">agendamento</span>
      </article>
    </section>

    <nav
      class="flex min-h-12 gap-[22px] border-b border-via-line px-5 max-[980px]:gap-4 max-[980px]:overflow-x-auto"
      aria-label="Conteúdo do pedido"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="inline-flex cursor-pointer items-center border-0 border-b-2 border-transparent bg-transparent text-[11px] text-via-muted transition-[color,border-color] duration-150 max-[980px]:whitespace-nowrap"
        :class="activeTab === tab.id ? 'border-via-blue font-bold text-via-ink' : undefined"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div
      class="grid min-h-[358px]"
      :class="isOverview
        ? 'grid-cols-[minmax(0,1fr)_322px] max-[1380px]:grid-cols-[minmax(0,1fr)_300px] max-[980px]:grid-cols-1'
        : 'grid-cols-1'"
    >
      <main
        class="min-w-0 px-5 pt-4 pb-[22px]"
        :class="isOverview ? 'border-r border-via-line max-[980px]:border-r-0 max-[980px]:border-b' : undefined"
      >
        <OrderSummary
          v-if="isOverview"
          :order="order"
          :locker="detail.locker"
          :fiscal="detail.fiscal"
        />
        <OrderItemsPanel
          v-else-if="activeTab === 'items'"
          :items="detail.items"
        />
        <OrderOccurrencesPanel
          v-else-if="activeTab === 'occurrences'"
          :occurrences="detail.occurrences"
        />
        <OrderEvidencesPanel
          v-else-if="activeTab === 'evidences'"
          :evidences="detail.evidences"
        />
        <OrderMaterialsPanel
          v-else-if="activeTab === 'materials'"
          :materials="detail.materials"
        />
        <OrderBarcodesPanel
          v-else-if="activeTab === 'barcodes'"
          :barcodes="detail.barcodes"
        />
        <OrderSchedulingPanel
          v-else-if="activeTab === 'scheduling'"
          :slots="detail.scheduling"
        />
        <OrderHistoryPanel
          v-else-if="activeTab === 'history'"
          :entries="detail.history"
        />
      </main>
      <DecisionPanel
        v-if="isOverview"
        :order="order"
      />
    </div>

    <AppModal
      v-model:open="processOpen"
      variant="confirm"
      title="Quer realmente processar?"
      description="É mais fácil corrigir os pedidos antes de processar. Confirme para seguir com o processamento deste pedido."
      confirm-label="Sim, processar!"
      confirm-variant="primary"
      :loading="processLoading"
      @confirm="confirmProcess"
    />
  </div>
</template>
