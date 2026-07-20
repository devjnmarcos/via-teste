/**
 * Agregações de métricas de Lotes — funções puras sobre fixtures filtradas.
 */

import type { Metric, StatusKey } from '../types/domain'
import type { LotRow, LotStatus } from '../data/demo/lotes'

export function mapLotStatusKey(status: LotStatus): StatusKey {
  if (status === 'Concluído') return 'done'
  if (status === 'Importando') return 'route'
  if (status === 'Com erro') return 'occurrence'
  return 'new'
}

export function buildLotesListMetrics(rows: LotRow[]): Metric[] {
  const importing = rows.filter((row) => row.status === 'Importando').length
  const withError = rows.filter((row) => row.status === 'Com erro').length
  const orders = rows.reduce((sum, row) => sum + row.ordersCreated, 0)
  const draft = rows.filter((row) => row.status === 'Rascunho').length

  return [
    {
      label: 'Total de lotes',
      value: rows.length,
      note: 'no filtro atual',
      icon: 'i-lucide-layers'
    },
    {
      label: 'Importando',
      value: importing,
      note: 'em processamento',
      icon: 'i-lucide-loader-circle',
      tone: importing > 0 ? 'info' : undefined
    },
    {
      label: 'Com erro',
      value: withError,
      note: 'requerem atenção',
      icon: 'i-lucide-triangle-alert',
      tone: withError > 0 ? 'danger' : undefined
    },
    {
      label: 'Pedidos gerados',
      value: orders,
      note: draft > 0 ? `${draft} rascunho(s)` : 'soma no filtro',
      icon: 'i-lucide-package'
    }
  ]
}

export function buildLotDetailMetrics(lot: LotRow): Metric[] {
  return [
    {
      label: 'Linhas OK',
      value: lot.linesOk,
      note: `de ${lot.linesTotal} no arquivo`,
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Linhas com erro',
      value: lot.linesError,
      note: lot.linesError > 0 ? 'ver log abaixo' : 'sem falhas',
      icon: 'i-lucide-circle-x',
      tone: lot.linesError > 0 ? 'danger' : undefined
    },
    {
      label: 'Pedidos criados',
      value: lot.ordersCreated,
      note: 'gerados neste lote',
      icon: 'i-lucide-package-check'
    },
    {
      label: 'Erros no log',
      value: lot.errorsCount,
      note: `${lot.logs.length} evento(s)`,
      icon: 'i-lucide-scroll-text',
      tone: lot.errorsCount > 0 ? 'warning' : undefined
    }
  ]
}
