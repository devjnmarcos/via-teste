/**
 * Fixtures DEV OUT — lotes de saída de devolução ao fornecedor.
 * Estado mutável em memória para o fluxo mock list → detalhe → status.
 */

import { reactive } from 'vue'
import {
  companyNameById,
  devolucoesCompanyOptions,
  devInState,
  getDevInBox,
  type DevInBoxRow
} from './devolucoes-dev-in'

export type DevOutLotStatus = 'Aberto' | 'Fechado' | 'Devolvido'

export interface DevOutBoxLinkRow extends Record<string, unknown> {
  id: string
  boxId: string
  companyName: string
  closedAtLabel: string
  totItemsIn: number
  associatedAtLabel: string
}

export interface DevOutLotRow extends Record<string, unknown> {
  id: string
  companyId: string
  companyName: string
  status: DevOutLotStatus
  createdAtLabel: string
  closedAtLabel: string
  distributionCenter: string
  shippingForecastLabel: string
  totBoxesIn: number
  autoScheduleNote: string
  boxes: DevOutBoxLinkRow[]
}

export const distributionCenterOptions = [
  { label: 'CD Cajamar', value: 'CD Cajamar' },
  { label: 'CD Extrema', value: 'CD Extrema' },
  { label: 'CD Porto Alegre', value: 'CD Porto Alegre' }
]

const initialLots: DevOutLotRow[] = [
  {
    id: '220',
    companyId: 'emp-2',
    companyName: 'Renner · POA',
    status: 'Aberto',
    createdAtLabel: '13/07/2026 10:20',
    closedAtLabel: '—',
    distributionCenter: 'CD Porto Alegre',
    shippingForecastLabel: '20/07/2026',
    totBoxesIn: 1,
    autoScheduleNote: '',
    boxes: [
      {
        id: 'link-1',
        boxId: '1038',
        companyName: 'Renner · POA',
        closedAtLabel: '12/07/2026 17:12',
        totItemsIn: 3,
        associatedAtLabel: '13/07/2026 10:35'
      }
    ]
  },
  {
    id: '215',
    companyId: 'emp-1',
    companyName: 'CB · CD Cajamar',
    status: 'Fechado',
    createdAtLabel: '09/07/2026 09:00',
    closedAtLabel: '10/07/2026 15:40',
    distributionCenter: 'CD Cajamar',
    shippingForecastLabel: '11/07/2026',
    totBoxesIn: 1,
    autoScheduleNote: '',
    boxes: [
      {
        id: 'link-2',
        boxId: '1029',
        companyName: 'CB · CD Cajamar',
        closedAtLabel: '08/07/2026 16:48',
        totItemsIn: 1,
        associatedAtLabel: '09/07/2026 09:15'
      }
    ]
  },
  {
    id: '210',
    companyId: 'emp-3',
    companyName: 'Via Reversa · Matriz',
    status: 'Devolvido',
    createdAtLabel: '01/07/2026 08:10',
    closedAtLabel: '02/07/2026 11:00',
    distributionCenter: 'CD Extrema',
    shippingForecastLabel: '03/07/2026',
    totBoxesIn: 0,
    autoScheduleNote: 'Agendamento automático gerado conforme operação atual.',
    boxes: []
  },
  {
    id: '205',
    companyId: 'emp-1',
    companyName: 'CB · CD Cajamar',
    status: 'Aberto',
    createdAtLabel: '16/07/2026 16:00',
    closedAtLabel: '—',
    distributionCenter: 'CD Cajamar',
    shippingForecastLabel: '—',
    totBoxesIn: 0,
    autoScheduleNote: '',
    boxes: []
  }
]

/** Volume extra para paginação/métricas (mantém os 4 lotes canônicos acima). */
const extraLots: DevOutLotRow[] = Array.from({ length: 22 }, (_, index) => {
  const n = index + 1
  const company = devolucoesCompanyOptions[n % devolucoesCompanyOptions.length]!
  const statuses: DevOutLotStatus[] = ['Aberto', 'Fechado', 'Devolvido']
  const status = statuses[n % statuses.length]!
  const day = String((n % 27) + 1).padStart(2, '0')
  const boxCount = status === 'Aberto' && n % 4 === 0 ? 0 : (n % 3) + 1
  const boxes = Array.from({ length: boxCount }, (_, boxIndex) => ({
    id: `extra-link-${n}-${boxIndex}`,
    boxId: String(2000 + n * 10 + boxIndex),
    companyName: company.label,
    closedAtLabel: `${day}/07/2026 15:00`,
    totItemsIn: (n % 5) + 1,
    associatedAtLabel: `${day}/07/2026 16:${String(boxIndex * 10).padStart(2, '0')}`
  }))

  return {
    id: String(300 + n),
    companyId: company.value,
    companyName: company.label,
    status,
    createdAtLabel: `${day}/07/2026 09:${String(n % 60).padStart(2, '0')}`,
    closedAtLabel: status === 'Aberto' ? '—' : `${day}/07/2026 17:00`,
    distributionCenter: distributionCenterOptions[n % distributionCenterOptions.length]!.value,
    shippingForecastLabel: status === 'Aberto' && n % 5 === 0 ? '—' : `${String((n % 27) + 1).padStart(2, '0')}/08/2026`,
    totBoxesIn: boxes.length,
    autoScheduleNote: status === 'Devolvido' ? 'Agendamento automático gerado conforme operação atual.' : '',
    boxes
  }
})

const seedLots: DevOutLotRow[] = [...initialLots, ...extraLots]

function cloneLots(): DevOutLotRow[] {
  return structuredClone(seedLots)
}

export const devOutState = reactive({
  lots: cloneLots()
})

export { devolucoesCompanyOptions }

export function createEmptyDevOutLot() {
  return {
    companyId: devolucoesCompanyOptions[0]?.value ?? '',
    distributionCenter: distributionCenterOptions[0]?.value ?? '',
    shippingForecastLabel: ''
  }
}

export function getDevOutLot(id: string): DevOutLotRow | undefined {
  return devOutState.lots.find((lot) => lot.id === id)
}

export function createDevOutLot(input: {
  companyId: string
  distributionCenter: string
  shippingForecastLabel?: string
}): DevOutLotRow {
  const lot: DevOutLotRow = {
    id: String(200 + devOutState.lots.length + Math.floor(Math.random() * 40)),
    companyId: input.companyId,
    companyName: companyNameById(input.companyId),
    status: 'Aberto',
    createdAtLabel: formatNowLabel(),
    closedAtLabel: '—',
    distributionCenter: input.distributionCenter,
    shippingForecastLabel: input.shippingForecastLabel?.trim() || '—',
    totBoxesIn: 0,
    autoScheduleNote: '',
    boxes: []
  }
  devOutState.lots = [lot, ...devOutState.lots]
  return lot
}

export function closeDevOutLot(id: string): boolean {
  const lot = getDevOutLot(id)
  if (!lot || lot.status !== 'Aberto' || lot.totBoxesIn <= 0) return false
  lot.status = 'Fechado'
  lot.closedAtLabel = formatNowLabel()
  return true
}

export function returnDevOutLot(id: string): boolean {
  const lot = getDevOutLot(id)
  if (!lot || lot.status !== 'Fechado') return false
  lot.status = 'Devolvido'
  lot.autoScheduleNote = 'Agendamento automático gerado conforme operação atual.'
  return true
}

export function deleteDevOutLot(id: string): boolean {
  const lot = getDevOutLot(id)
  if (!lot || lot.totBoxesIn > 0) return false
  devOutState.lots = devOutState.lots.filter((item) => item.id !== id)
  return true
}

/** Caixas fechadas ainda não vinculadas a nenhum lote. */
export function listAvailableClosedBoxes(): DevInBoxRow[] {
  const linked = new Set(
    devOutState.lots.flatMap((lot) => lot.boxes.map((box) => box.boxId))
  )
  return devInState.boxes.filter(
    (box) => box.status === 'Fechado' && !linked.has(box.id)
  )
}

export function associateBoxToLot(lotId: string, boxId: string): boolean {
  const lot = getDevOutLot(lotId)
  if (!lot || lot.status !== 'Aberto') return false
  if (lot.boxes.some((box) => box.boxId === boxId)) return false
  const box = getDevInBox(boxId)
  if (!box || box.status !== 'Fechado') return false
  const alreadyLinked = devOutState.lots.some((other) =>
    other.boxes.some((link) => link.boxId === boxId)
  )
  if (alreadyLinked) return false

  lot.boxes = [
    ...lot.boxes,
    {
      id: `link-${Date.now()}`,
      boxId: box.id,
      companyName: box.companyName,
      closedAtLabel: box.closedAtLabel,
      totItemsIn: box.totItemsIn,
      associatedAtLabel: formatNowLabel()
    }
  ]
  lot.totBoxesIn = lot.boxes.length
  box.lotOutStatus = lot.status
  return true
}

export function removeBoxFromLot(lotId: string, boxId: string): boolean {
  const lot = getDevOutLot(lotId)
  if (!lot || lot.status !== 'Aberto') return false
  const next = lot.boxes.filter((box) => box.boxId !== boxId)
  if (next.length === lot.boxes.length) return false
  lot.boxes = next
  lot.totBoxesIn = next.length
  const box = getDevInBox(boxId)
  if (box) box.lotOutStatus = '—'
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
