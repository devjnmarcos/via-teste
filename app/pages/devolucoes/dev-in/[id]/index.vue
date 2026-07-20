<script setup lang="ts">
/**
 * Detalhe DEV IN — conferência de itens, entrada por serial e fechamento.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { DevInItemRow, DevInItemType } from '~/data/demo/devolucoes-dev-in'
import {
  addDevInItem,
  closeDevInBox,
  getDevInBox,
  removeDevInItem
} from '~/data/demo/devolucoes-dev-in'
import {
  buildDevInDetailMetrics,
  mapDevInStatusKey
} from '~/utils/devolucoes-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'

const route = useRoute()
const boxId = computed(() => String(route.params.id ?? ''))

const box = computed(() => getDevInBox(boxId.value))

if (!box.value) {
  throw createError({ statusCode: 404, statusMessage: 'Caixa não encontrada' })
}

useSeoMeta({ title: () => `DEV IN #${boxId.value} · Devoluções · Via Reversa` })

const closeOpen = ref(false)
const unassignOpen = ref(false)
const pendingItem = ref<DevInItemRow | null>(null)
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const entryType = ref<DevInItemType>('Reversa')
const entrySerial = ref('')

const itemTypeOptions = [
  { label: 'Reversa', value: 'Reversa' },
  { label: 'Entrega', value: 'Entrega' }
]

const metrics = computed(() => (box.value ? buildDevInDetailMetrics(box.value) : []))
const statusKey = computed(() => mapDevInStatusKey(box.value?.status ?? 'Aberto'))

const itemColumns = computed<DataTableColumn<DevInItemRow>[]>(() => [
  { type: 'text', key: 'serial', label: 'Serial', width: '18%' },
  { type: 'text', key: 'itemType', label: 'Tipo', width: '100px' },
  { type: 'text', key: 'orderId', label: 'Pedido', width: '100px' },
  { type: 'text', key: 'productLabel', label: 'Produto' },
  { type: 'text', key: 'associatedAtLabel', label: 'Associado em', width: '140px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '120px',
    items: (row) =>
      box.value?.status === 'Aberto'
        ? [
            {
              key: 'unassign',
              label: 'Desassociar',
              icon: 'i-lucide-unlink',
              variant: 'ghost',
              ariaLabel: `Desassociar ${row.serial}`
            }
          ]
        : []
  }
])

const pagedItems = computed(() =>
  slicePage(box.value?.items ?? [], page.value, pageSize.value)
)

const canClose = computed(
  () => box.value?.status === 'Aberto' && (box.value?.totItemsIn ?? 0) > 0
)

const subtitle = computed(() => {
  const current = box.value
  if (!current) return ''
  return [
    current.companyName,
    `aberto em ${current.createdAtLabel}`,
    `criado por ${current.createdByName}`,
    current.closedAtLabel !== '—' ? `fechado em ${current.closedAtLabel}` : null
  ]
    .filter(Boolean)
    .join(' · ')
})

watch(
  () => box.value?.items.length,
  () => {
    page.value = 1
  }
)

function addItem() {
  if (!box.value || box.value.status !== 'Aberto') return
  const added = addDevInItem(box.value.id, {
    serial: entrySerial.value,
    itemType: entryType.value
  })
  if (added) entrySerial.value = ''
}

function onItemAction(payload: { row: DevInItemRow; action: string }) {
  if (payload.action !== 'unassign') return
  pendingItem.value = payload.row
  unassignOpen.value = true
}

function confirmUnassign() {
  if (!box.value || !pendingItem.value) return
  removeDevInItem(box.value.id, pendingItem.value.id)
  pendingItem.value = null
  unassignOpen.value = false
}

function confirmClose() {
  if (!box.value) return
  closeDevInBox(box.value.id)
  closeOpen.value = false
}
</script>

<template>
  <div
    v-if="box"
    class="devolucao-detail"
  >
    <PageHeader
      back-to="/devolucoes/dev-in"
      :title="`DEV IN #${box.id}`"
      :subtitle="subtitle"
    >
      <StatusLabel
        :status="statusKey"
        :label="box.status"
      />
      <AppButton
        v-if="box.status === 'Fechado'"
        icon="i-lucide-printer"
        :to="`/devolucoes/dev-in/${box.id}/ticket`"
      >
        Ticket
      </AppButton>
      <AppButton
        v-if="canClose"
        variant="primary"
        icon="i-lucide-lock"
        @click="closeOpen = true"
      >
        Fechar caixa
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="metrics" />

    <p
      v-if="box.notes"
      class="m-0 border-b border-via-line bg-via-surface px-[18px] py-3 text-xs text-via-muted"
      role="status"
    >
      {{ box.notes }}
    </p>

    <section
      v-if="box.status === 'Aberto'"
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line bg-via-surface px-[18px] py-[9px]"
      aria-label="Entrada de item"
    >
      <USelectMenu
        v-model="entryType"
        value-key="value"
        :items="itemTypeOptions"
        class="w-[140px]"
      />
      <UInput
        v-model="entrySerial"
        icon="i-lucide-scan-barcode"
        placeholder="Informe o serial do item..."
        class="w-full max-w-[360px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
        @keyup.enter="addItem"
      />
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="addItem"
      >
        Incluir
      </AppButton>
    </section>

    <DataTable
      :columns="itemColumns"
      :rows="pagedItems"
      min-width="860px"
      empty-title="Nenhum item na caixa"
      empty-description="Inclua um serial para iniciar a conferência."
      @action="onItemAction"
    />

    <Pagination
      v-if="box.items.length > 0"
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="box.items.length"
    />

    <AppModal
      v-model:open="closeOpen"
      variant="confirm"
      title="Fechar caixa"
      :description="`A caixa #${box.id} será fechada e deixará de receber novos itens.`"
      confirm-label="Fechar caixa"
      confirm-variant="primary"
      @confirm="confirmClose"
    />

    <AppModal
      v-model:open="unassignOpen"
      variant="confirm"
      title="Desassociar item"
      :description="pendingItem
        ? `O item ${pendingItem.serial} será removido desta caixa.`
        : ''"
      confirm-label="Desassociar"
      @confirm="confirmUnassign"
    />
  </div>
</template>

