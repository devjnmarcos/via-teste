/**
 * Agregações de métricas de Faturas — funções puras sobre fixtures filtradas.
 */

import type { Metric, StatusKey } from '../types/domain'
import type { FaturaRow, FaturaStatus } from '../data/demo/faturas'
import { formatBrl } from '../data/demo/faturas'

export function mapFaturaStatusKey(status: FaturaStatus): StatusKey {
  if (status === 'Paga') return 'done'
  if (status === 'Vencida') return 'occurrence'
  if (status === 'Cancelada') return 'cancelled'
  return 'backOrder'
}

export function buildFaturasListMetrics(rows: FaturaRow[]): Metric[] {
  const open = rows.filter((row) => row.status === 'Aberta')
  const overdue = rows.filter((row) => row.status === 'Vencida')
  const openValue = open.reduce((sum, row) => sum + row.value, 0)

  return [
    {
      label: 'Faturas abertas',
      value: open.length,
      note: 'no filtro atual',
      icon: 'i-lucide-file-text',
      tone: open.length > 0 ? 'warning' : undefined
    },
    {
      label: 'Valor em aberto',
      value: formatBrl(openValue),
      note: 'soma das abertas',
      icon: 'i-lucide-banknote',
      tone: 'info'
    },
    {
      label: 'Vencidas',
      value: overdue.length,
      note: overdue.length > 0 ? 'requerem cobrança' : 'nenhuma no filtro',
      icon: 'i-lucide-alarm-clock',
      tone: overdue.length > 0 ? 'danger' : undefined
    }
  ]
}

export function buildFaturaDetailMetrics(invoice: FaturaRow): Metric[] {
  return [
    {
      label: 'Valor',
      value: invoice.valueLabel,
      note: invoice.competenceLabel,
      icon: 'i-lucide-banknote',
      tone: 'info'
    },
    {
      label: 'Pedidos',
      value: invoice.orders.length,
      note: 'vinculados à fatura',
      icon: 'i-lucide-package',
      tone: 'assigned'
    },
    {
      label: 'Documentos fiscais',
      value: invoice.documents.length,
      note: invoice.documents.length > 0 ? 'emitidos' : 'pendentes',
      icon: 'i-lucide-file-check',
      tone: invoice.documents.length === 0 ? 'warning' : 'success'
    }
  ]
}
