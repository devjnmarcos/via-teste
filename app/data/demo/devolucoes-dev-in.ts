/**
 * Fixtures DEV IN — caixas de entrada de devolução ao fornecedor.
 * Estado mutável em memória para o fluxo mock list → detalhe → fechar.
 */

import { reactive } from 'vue'

export type DevInBoxStatus = 'Aberto' | 'Fechado'
export type DevInItemType = 'Reversa' | 'Entrega'

export interface DevInItemRow extends Record<string, unknown> {
  id: string
  serial: string
  itemType: DevInItemType
  orderId: string
  productLabel: string
  associatedAtLabel: string
}

export interface DevInBoxRow extends Record<string, unknown> {
  id: string
  companyId: string
  companyName: string
  createdByName: string
  status: DevInBoxStatus
  createdAtLabel: string
  closedAtLabel: string
  totItemsIn: number
  lotOutStatus: string
  notes: string
  items: DevInItemRow[]
}

export const devolucoesCompanyOptions = [
  { label: 'CB · CD Cajamar', value: 'emp-1' },
  { label: 'Renner · POA', value: 'emp-2' },
  { label: 'Via Reversa · Matriz', value: 'emp-3' }
]

const initialBoxes: DevInBoxRow[] = [
  {
    id: '1042',
    companyId: 'emp-1',
    companyName: 'CB · CD Cajamar',
    createdByName: 'Ana Souza',
    status: 'Aberto',
    createdAtLabel: '15/07/2026 09:14',
    closedAtLabel: '—',
    totItemsIn: 2,
    lotOutStatus: '—',
    notes: '',
    items: [
      {
        id: 'item-1',
        serial: 'SN-88421',
        itemType: 'Reversa',
        orderId: '48224',
        productLabel: 'Fone Bluetooth X100',
        associatedAtLabel: '15/07/2026 09:22'
      },
      {
        id: 'item-2',
        serial: 'SN-99102',
        itemType: 'Entrega',
        orderId: '48190',
        productLabel: 'Carregador 65W',
        associatedAtLabel: '15/07/2026 10:05'
      }
    ]
  },
  {
    id: '1038',
    companyId: 'emp-2',
    companyName: 'Renner · POA',
    createdByName: 'Carlos Lima',
    status: 'Fechado',
    createdAtLabel: '12/07/2026 14:40',
    closedAtLabel: '12/07/2026 17:12',
    totItemsIn: 3,
    lotOutStatus: 'Aberto',
    notes: 'Caixa conferida no CD',
    items: [
      {
        id: 'item-3',
        serial: 'SN-22011',
        itemType: 'Reversa',
        orderId: '47001',
        productLabel: 'Camiseta M',
        associatedAtLabel: '12/07/2026 15:01'
      },
      {
        id: 'item-4',
        serial: 'SN-22012',
        itemType: 'Reversa',
        orderId: '47002',
        productLabel: 'Calça 40',
        associatedAtLabel: '12/07/2026 15:18'
      },
      {
        id: 'item-5',
        serial: 'SN-22020',
        itemType: 'Entrega',
        orderId: '47010',
        productLabel: 'Jaqueta P',
        associatedAtLabel: '12/07/2026 16:02'
      }
    ]
  },
  {
    id: '1029',
    companyId: 'emp-1',
    companyName: 'CB · CD Cajamar',
    createdByName: 'Ana Souza',
    status: 'Fechado',
    createdAtLabel: '08/07/2026 11:05',
    closedAtLabel: '08/07/2026 16:48',
    totItemsIn: 1,
    lotOutStatus: 'Devolvido',
    notes: '',
    items: [
      {
        id: 'item-6',
        serial: 'SN-11001',
        itemType: 'Reversa',
        orderId: '46010',
        productLabel: 'Mouse ergonômico',
        associatedAtLabel: '08/07/2026 11:40'
      }
    ]
  },
  {
    id: '1015',
    companyId: 'emp-3',
    companyName: 'Via Reversa · Matriz',
    createdByName: 'Juliana Reis',
    status: 'Aberto',
    createdAtLabel: '17/07/2026 08:30',
    closedAtLabel: '—',
    totItemsIn: 0,
    lotOutStatus: '—',
    notes: '',
    items: []
  }
]

/** Volume extra para paginação/métricas (mantém as 4 caixas canônicas acima). */
const extraBoxes: DevInBoxRow[] = Array.from({ length: 28 }, (_, index) => {
  const n = index + 1
  const company = devolucoesCompanyOptions[n % devolucoesCompanyOptions.length]!
  const closed = n % 3 !== 0
  const lotStatuses = ['—', 'Aberto', 'Fechado', 'Devolvido'] as const
  const lotOutStatus = closed ? lotStatuses[n % lotStatuses.length]! : '—'
  const day = String((n % 28) + 1).padStart(2, '0')
  const itemCount = closed ? (n % 4) + 1 : n % 3
  const items = Array.from({ length: itemCount }, (_, itemIndex) => ({
    id: `extra-item-${n}-${itemIndex}`,
    serial: `SN-X${n}${itemIndex}`,
    itemType: (itemIndex % 2 === 0 ? 'Reversa' : 'Entrega') as DevInItemType,
    orderId: String(45000 + n * 10 + itemIndex),
    productLabel: `Produto demo ${n}.${itemIndex + 1}`,
    associatedAtLabel: `${day}/07/2026 11:${String(itemIndex * 5).padStart(2, '0')}`
  }))

  return {
    id: String(1100 + n),
    companyId: company.value,
    companyName: company.label,
    createdByName: n % 2 === 0 ? 'Operador demo' : 'Ana Souza',
    status: closed ? ('Fechado' as const) : ('Aberto' as const),
    createdAtLabel: `${day}/07/2026 08:${String(n % 60).padStart(2, '0')}`,
    closedAtLabel: closed ? `${day}/07/2026 16:${String(n % 60).padStart(2, '0')}` : '—',
    totItemsIn: items.length,
    lotOutStatus,
    notes: n % 5 === 0 ? 'Observação operacional demo' : '',
    items
  }
})

const seedBoxes: DevInBoxRow[] = [...initialBoxes, ...extraBoxes]

function cloneBoxes(): DevInBoxRow[] {
  return structuredClone(seedBoxes)
}

/** Estado compartilhado list ↔ detalhe (mock). */
export const devInState = reactive({
  boxes: cloneBoxes()
})

export function createEmptyDevInBox() {
  return {
    companyId: devolucoesCompanyOptions[0]?.value ?? '',
    notes: ''
  }
}

export function getDevInBox(id: string): DevInBoxRow | undefined {
  return devInState.boxes.find((box) => box.id === id)
}

export function companyNameById(companyId: string): string {
  return devolucoesCompanyOptions.find((item) => item.value === companyId)?.label ?? companyId
}

export function createDevInBox(input: { companyId: string; notes?: string }): DevInBoxRow {
  const box: DevInBoxRow = {
    id: String(1000 + devInState.boxes.length + Math.floor(Math.random() * 80)),
    companyId: input.companyId,
    companyName: companyNameById(input.companyId),
    createdByName: 'Operador demo',
    status: 'Aberto',
    createdAtLabel: formatNowLabel(),
    closedAtLabel: '—',
    totItemsIn: 0,
    lotOutStatus: '—',
    notes: input.notes?.trim() ?? '',
    items: []
  }
  devInState.boxes = [box, ...devInState.boxes]
  return box
}

export function closeDevInBox(id: string): boolean {
  const box = getDevInBox(id)
  if (!box || box.status === 'Fechado' || box.totItemsIn <= 0) return false
  box.status = 'Fechado'
  box.closedAtLabel = formatNowLabel()
  return true
}

export function addDevInItem(
  boxId: string,
  input: { serial: string; itemType: DevInItemType }
): DevInItemRow | null {
  const box = getDevInBox(boxId)
  if (!box || box.status !== 'Aberto') return null
  const serial = input.serial.trim()
  if (!serial) return null
  const item: DevInItemRow = {
    id: `item-${Date.now()}`,
    serial,
    itemType: input.itemType,
    orderId: '—',
    productLabel: 'Item conferido (mock)',
    associatedAtLabel: formatNowLabel()
  }
  box.items = [...box.items, item]
  box.totItemsIn = box.items.length
  return item
}

export function removeDevInItem(boxId: string, itemId: string): boolean {
  const box = getDevInBox(boxId)
  if (!box || box.status !== 'Aberto') return false
  const next = box.items.filter((item) => item.id !== itemId)
  if (next.length === box.items.length) return false
  box.items = next
  box.totItemsIn = next.length
  return true
}

function formatNowLabel(): string {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}
