/**
 * Agregações de métricas Devoluções — funções puras sobre fixtures filtradas.
 * Fórmulas mock documentadas; API futura pode divergir em `items_devolved`.
 */

import type { Metric, StatusKey } from '../types/domain'
import type { DevInBoxRow, DevInItemType } from '../data/demo/devolucoes-dev-in'
import type { DevOutLotRow } from '../data/demo/devolucoes-dev-out'

/** Parse de labels DD/MM/YYYY[ HH:mm] usados nas fixtures. */
export function parseDevLabelDate(label: string): Date | null {
  const match = label.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  if (!day || !month || !year) return null
  return new Date(year, month - 1, day)
}

export function mapDevInStatusKey(status: string): StatusKey {
  return status === 'Fechado' ? 'done' : 'backOrder'
}

export function mapDevOutStatusKey(status: string): StatusKey {
  if (status === 'Devolvido') return 'done'
  if (status === 'Fechado') return 'assigned'
  return 'backOrder'
}

export function buildDevInListMetrics(rows: DevInBoxRow[]): Metric[] {
  const open = rows.filter((row) => row.status === 'Aberto').length
  const closed = rows.filter((row) => row.status === 'Fechado').length
  const items = rows.reduce((sum, row) => sum + row.totItemsIn, 0)
  const readyForLot = rows.filter(
    (row) => row.status === 'Fechado' && row.lotOutStatus === '—'
  ).length

  return [
    {
      label: 'Total de caixas',
      value: rows.length,
      note: 'no filtro atual',
      icon: 'i-lucide-package'
    },
    {
      label: 'Caixas abertas',
      value: open,
      note: 'em conferência',
      icon: 'i-lucide-package-plus',
      tone: open > 0 ? 'warning' : undefined
    },
    {
      label: 'Caixas fechadas',
      value: closed,
      note: 'prontas ou em lote',
      icon: 'i-lucide-package-check',
      tone: closed > 0 ? 'success' : undefined
    },
    {
      label: 'Itens conferidos',
      value: items,
      note: readyForLot > 0 ? `${readyForLot} sem vínculo Despachos` : 'soma no filtro',
      icon: 'i-lucide-scan-barcode'
    }
  ]
}

export function buildDevOutListMetrics(rows: DevOutLotRow[]): Metric[] {
  const open = rows.filter((row) => row.status === 'Aberto').length
  const closed = rows.filter((row) => row.status === 'Fechado').length
  const returned = rows.filter((row) => row.status === 'Devolvido').length
  const boxes = rows.reduce((sum, row) => sum + row.totBoxesIn, 0)

  return [
    {
      label: 'Total de lotes',
      value: rows.length,
      note: 'no filtro atual',
      icon: 'i-lucide-layers'
    },
    {
      label: 'Lotes abertos',
      value: open,
      note: 'composição em andamento',
      icon: 'i-lucide-folder-open',
      tone: open > 0 ? 'warning' : undefined
    },
    {
      label: 'Lotes fechados',
      value: closed,
      note: 'aguardando devolução',
      icon: 'i-lucide-folder-lock'
    },
    {
      label: 'Lotes devolvidos',
      value: returned,
      note: 'ciclo concluído',
      icon: 'i-lucide-undo-2',
      tone: returned > 0 ? 'success' : undefined
    },
    {
      label: 'Caixas associadas',
      value: boxes,
      note: 'soma no filtro',
      icon: 'i-lucide-boxes'
    }
  ]
}

export function buildDevInDetailMetrics(box: DevInBoxRow): Metric[] {
  const reversa = box.items.filter((item) => item.itemType === 'Reversa').length
  const entrega = box.items.filter((item) => item.itemType === 'Entrega').length
  const orders = new Set(
    box.items.map((item) => item.orderId).filter((id) => id && id !== '—')
  )

  return [
    {
      label: 'Itens na caixa',
      value: box.totItemsIn,
      note: box.status === 'Aberto' ? 'conferência em andamento' : 'caixa fechada',
      icon: 'i-lucide-package'
    },
    {
      label: 'Itens Reversa',
      value: reversa,
      note: orders.size ? `${orders.size} pedidos distintos` : 'tipo Reversa',
      icon: 'i-lucide-refresh-cw'
    },
    {
      label: 'Itens Entrega',
      value: entrega,
      note: 'tipo Entrega',
      icon: 'i-lucide-truck'
    },
    {
      label: 'Status Despachos',
      value: box.lotOutStatus === '—' ? 'Sem vínculo' : box.lotOutStatus,
      note: box.lotOutStatus === '—' ? 'pronta para lote se fechada' : 'vínculo com lote',
      icon: 'i-lucide-link'
    }
  ]
}

export function buildDevOutDetailMetrics(
  lot: DevOutLotRow,
  availableCount: number
): Metric[] {
  const totalItems = lot.boxes.reduce((sum, box) => sum + box.totItemsIn, 0)
  const metrics: Metric[] = [
    {
      label: 'Caixas no lote',
      value: lot.totBoxesIn,
      note: lot.status === 'Aberto' ? 'composição em andamento' : `status ${lot.status}`,
      icon: 'i-lucide-boxes'
    },
    {
      label: 'Itens totais',
      value: totalItems,
      note: 'soma das caixas',
      icon: 'i-lucide-scan-barcode'
    }
  ]

  if (lot.status === 'Aberto') {
    metrics.push({
      label: 'Disponíveis',
      value: availableCount,
      note: 'caixas fechadas sem lote',
      icon: 'i-lucide-package-plus',
      tone: availableCount > 0 ? 'warning' : undefined
    })
  }

  metrics.push({
    label: 'Previsão de envio',
    value: lot.shippingForecastLabel === '—' ? '—' : lot.shippingForecastLabel,
    note: lot.distributionCenter,
    icon: 'i-lucide-calendar-range'
  })

  return metrics
}

export interface AcompanhamentoScopeInput {
  boxes: DevInBoxRow[]
  companyId: string
  itemType: 'Todos' | DevInItemType
  periodMode: 'mensal' | 'custom'
  month: number
  year: number
  startDate: string
  endDate: string
}

function boxInPeriod(box: DevInBoxRow, input: AcompanhamentoScopeInput): boolean {
  const created = parseDevLabelDate(box.createdAtLabel)
  if (!created) return true

  if (input.periodMode === 'mensal') {
    return created.getMonth() + 1 === input.month && created.getFullYear() === input.year
  }

  const start = parseDevLabelDate(input.startDate)
  const end = parseDevLabelDate(input.endDate)
  if (!start && !end) return true
  if (start && created < start) return false
  if (end) {
    const endOfDay = new Date(end)
    endOfDay.setHours(23, 59, 59, 999)
    if (created > endOfDay) return false
  }
  return true
}

export function filterAcompanhamentoBoxes(input: AcompanhamentoScopeInput): DevInBoxRow[] {
  return input.boxes.filter((box) => {
    if (input.companyId !== 'Todas' && box.companyId !== input.companyId) return false
    if (!boxInPeriod(box, input)) return false
    if (input.itemType === 'Todos') return true
    return box.items.some((item) => item.itemType === input.itemType)
  })
}

/**
 * Cards de caixas alinhados ao dashboard legado + itens coletados.
 * `items_devolved` omitido (fórmula API necessita validação de negócio).
 */
export function buildAcompanhamentoMetrics(
  boxes: DevInBoxRow[],
  itemType: 'Todos' | DevInItemType
): { boxMetrics: Metric[]; itemMetrics: Metric[] } {
  const open = boxes.filter((box) => box.status === 'Aberto').length
  const closed = boxes.filter((box) => box.status === 'Fechado').length
  const withDevOut = boxes.filter((box) => box.lotOutStatus !== '—').length
  const devolved = boxes.filter((box) => box.lotOutStatus === 'Devolvido').length
  const collected = boxes.reduce((sum, box) => {
    if (itemType === 'Todos') return sum + box.totItemsIn
    return sum + box.items.filter((item) => item.itemType === itemType).length
  }, 0)

  const boxMetrics: Metric[] = [
    {
      label: 'Caixas criadas',
      value: boxes.length,
      note: 'no período filtrado',
      icon: 'i-lucide-package',
      to: '/devolucoes/dev-in'
    },
    {
      label: 'Abertas',
      value: open,
      note: 'DEV IN em conferência',
      icon: 'i-lucide-package-plus',
      tone: open > 0 ? 'warning' : undefined,
      to: '/devolucoes/dev-in?status=Aberto'
    },
    {
      label: 'Fechadas',
      value: closed,
      note: 'prontas para DEV OUT',
      icon: 'i-lucide-package-check',
      tone: closed > 0 ? 'success' : undefined,
      to: '/devolucoes/dev-in?status=Fechado'
    },
    {
      label: 'Com DEV OUT',
      value: withDevOut,
      note: 'vinculadas a lote',
      icon: 'i-lucide-link',
      to: '/devolucoes/dev-out'
    },
    {
      label: 'Devolvidas',
      value: devolved,
      note: 'lote no status Devolvido',
      icon: 'i-lucide-undo-2',
      tone: devolved > 0 ? 'success' : undefined,
      to: '/devolucoes/dev-out?status=Devolvido'
    }
  ]

  const itemMetrics: Metric[] = [
    {
      label: 'Itens coletados',
      value: collected,
      note: itemType === 'Todos' ? 'todos os tipos' : `tipo ${itemType}`,
      icon: 'i-lucide-scan-barcode'
    }
  ]

  return { boxMetrics, itemMetrics }
}
