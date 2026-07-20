<script setup lang="ts">
/**
 * Detalhe DEV OUT — composição do lote, associar/remover caixas e status.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { DevOutBoxLinkRow } from '~/data/demo/devolucoes-dev-out'
import {
  associateBoxToLot,
  closeDevOutLot,
  getDevOutLot,
  listAvailableClosedBoxes,
  removeBoxFromLot,
  returnDevOutLot
} from '~/data/demo/devolucoes-dev-out'
import {
  buildDevOutDetailMetrics,
  mapDevOutStatusKey
} from '~/utils/devolucoes-metrics'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'

const route = useRoute()
const lotId = computed(() => String(route.params.id ?? ''))
const lot = computed(() => getDevOutLot(lotId.value))

if (!lot.value) {
  throw createError({ statusCode: 404, statusMessage: 'Lote não encontrado' })
}

useSeoMeta({ title: () => `DEV OUT #${lotId.value} · Devoluções · Via Reversa` })

const boxToAssociate = ref<string | undefined>()
const removeOpen = ref(false)
const closeOpen = ref(false)
const returnOpen = ref(false)
const pendingBox = ref<DevOutBoxLinkRow | null>(null)
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const availableBoxes = computed(() => listAvailableClosedBoxes())
const availableBoxOptions = computed(() =>
  availableBoxes.value.map((box) => ({
    label: `#${box.id} · ${box.companyName} · ${box.totItemsIn} itens`,
    value: box.id
  }))
)

const metrics = computed(() =>
  lot.value
    ? buildDevOutDetailMetrics(lot.value, availableBoxes.value.length)
    : []
)
const statusKey = computed(() => mapDevOutStatusKey(lot.value?.status ?? 'Aberto'))

const boxColumns = computed<DataTableColumn<DevOutBoxLinkRow>[]>(() => [
  { type: 'text', key: 'boxId', label: 'Caixa', width: '90px' },
  { type: 'text', key: 'companyName', label: 'Empresa' },
  { type: 'text', key: 'totItemsIn', label: 'Itens', width: '80px', align: 'right' },
  { type: 'text', key: 'closedAtLabel', label: 'Fechada em', width: '140px' },
  { type: 'text', key: 'associatedAtLabel', label: 'Associada em', width: '140px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '120px',
    items: () =>
      lot.value?.status === 'Aberto'
        ? [
            {
              key: 'remove',
              label: 'Remover',
              icon: 'i-lucide-minus',
              variant: 'ghost',
              ariaLabel: 'Remover caixa do lote'
            }
          ]
        : []
  }
])

const pagedBoxes = computed(() =>
  slicePage(lot.value?.boxes ?? [], page.value, pageSize.value)
)

const subtitle = computed(() => {
  const current = lot.value
  if (!current) return ''
  return [
    current.companyName,
    current.distributionCenter,
    `criado em ${current.createdAtLabel}`,
    current.shippingForecastLabel !== '—'
      ? `previsão ${current.shippingForecastLabel}`
      : null,
    current.closedAtLabel !== '—' ? `fechado em ${current.closedAtLabel}` : null
  ]
    .filter(Boolean)
    .join(' · ')
})

const canClose = computed(
  () => lot.value?.status === 'Aberto' && (lot.value?.totBoxesIn ?? 0) > 0
)
const canReturn = computed(() => lot.value?.status === 'Fechado')

watch(
  () => lot.value?.boxes.length,
  () => {
    page.value = 1
  }
)

function associateBox() {
  if (!lot.value || !boxToAssociate.value) return
  const ok = associateBoxToLot(lot.value.id, boxToAssociate.value)
  if (ok) boxToAssociate.value = undefined
}

function onBoxAction(payload: { row: DevOutBoxLinkRow; action: string }) {
  if (payload.action !== 'remove') return
  pendingBox.value = payload.row
  removeOpen.value = true
}

function confirmRemove() {
  if (!lot.value || !pendingBox.value) return
  removeBoxFromLot(lot.value.id, pendingBox.value.boxId)
  pendingBox.value = null
  removeOpen.value = false
}

function confirmClose() {
  if (!lot.value) return
  closeDevOutLot(lot.value.id)
  closeOpen.value = false
}

function confirmReturn() {
  if (!lot.value) return
  returnDevOutLot(lot.value.id)
  returnOpen.value = false
}
</script>

<template>
  <div
    v-if="lot"
    class="devolucao-detail"
  >
    <PageHeader
      back-to="/devolucoes/dev-out"
      :title="`DEV OUT #${lot.id}`"
      :subtitle="subtitle"
    >
      <StatusLabel
        :status="statusKey"
        :label="lot.status"
      />
      <AppButton
        v-if="canClose"
        variant="primary"
        icon="i-lucide-lock"
        @click="closeOpen = true"
      >
        Fechar lote
      </AppButton>
      <AppButton
        v-if="canReturn"
        variant="primary"
        icon="i-lucide-undo-2"
        @click="returnOpen = true"
      >
        Devolver
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="metrics" />

    <p
      v-if="lot.status === 'Devolvido' && lot.autoScheduleNote"
      class="m-0 border-b border-via-line bg-via-surface px-[18px] py-3 text-xs text-via-muted"
      role="status"
    >
      {{ lot.autoScheduleNote }}
    </p>

    <section
      v-if="lot.status === 'Aberto'"
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line bg-via-surface px-[18px] py-[9px]"
      aria-label="Associar caixa"
    >
      <USelectMenu
        v-model="boxToAssociate"
        value-key="value"
        :items="availableBoxOptions"
        placeholder="Selecione uma caixa fechada disponível..."
        class="w-full max-w-[420px]"
      />
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        :disabled="!boxToAssociate"
        @click="associateBox"
      >
        Associar
      </AppButton>
    </section>

    <DataTable
      :columns="boxColumns"
      :rows="pagedBoxes"
      min-width="860px"
      empty-title="Nenhuma caixa no lote"
      empty-description="Associe caixas fechadas disponíveis para montar a composição."
      @action="onBoxAction"
    />

    <Pagination
      v-if="lot.boxes.length > 0"
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="lot.boxes.length"
    />

    <AppModal
      v-model:open="removeOpen"
      variant="confirm"
      title="Remover caixa"
      :description="pendingBox
        ? `A caixa #${pendingBox.boxId} será removida deste lote.`
        : ''"
      confirm-label="Remover"
      @confirm="confirmRemove"
    />

    <AppModal
      v-model:open="closeOpen"
      variant="confirm"
      title="Fechar lote"
      :description="`O lote #${lot.id} será fechado e não aceitará novas caixas.`"
      confirm-label="Fechar lote"
      confirm-variant="primary"
      @confirm="confirmClose"
    />

    <AppModal
      v-model:open="returnOpen"
      variant="confirm"
      title="Devolver lote"
      :description="`O lote #${lot.id} passará para o status Devolvido.`"
      confirm-label="Devolver"
      confirm-variant="primary"
      @confirm="confirmReturn"
    />
  </div>
</template>

