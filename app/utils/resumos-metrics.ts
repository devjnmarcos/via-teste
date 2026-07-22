/**
 * Agregações de métricas de Resumos — funções puras sobre fixtures filtradas.
 */

import type { Metric } from '../types/domain'
import type {
  ResumoClienteRow,
  ResumoEstadoRow,
  ResumoOperacaoRow,
  ResumoPaRow,
  ResumoTransportadorRow
} from '../data/demo/resumos'

export function buildTotaisOperacaoMetrics(rows: ResumoOperacaoRow[]): Metric[] {
  const sum = (key: keyof ResumoOperacaoRow) =>
    rows.reduce((acc, row) => acc + Number(row[key] ?? 0), 0)

  const novos = sum('novos')
  const semPa = sum('semPa')
  const atribuidos = sum('atribuidos')
  const emEstoque = sum('emEstoque')
  const emRota = sum('emRota')
  const concluidos = sum('concluidosHoje')
  const ocorrencias = sum('ocorrenciasHoje')
  const cancelados = sum('cancelados')
  const total = sum('total')
  const produtividade =
    total > 0 ? `${Math.round((concluidos / Math.max(total, 1)) * 100)}%` : '—'

  return [
    {
      label: 'Novos',
      value: novos,
      note: 'ainda não processados',
      icon: 'i-lucide-sparkles',
      tone: novos > 0 ? 'warning' : undefined
    },
    {
      label: 'Sem ponto de apoio',
      value: semPa,
      note: 'ponto de apoio pendente',
      icon: 'i-lucide-map-pin-off',
      tone: semPa > 0 ? 'warning' : undefined
    },
    {
      label: 'Atribuídos',
      value: atribuidos,
      note: 'com responsável',
      icon: 'i-lucide-user-check',
      tone: 'assigned'
    },
    {
      label: 'Em estoque',
      value: emEstoque,
      note: 'aguardando expedição',
      icon: 'i-lucide-warehouse',
      tone: 'info'
    },
    {
      label: 'Em rota',
      value: emRota,
      note: 'em campo',
      icon: 'i-lucide-truck',
      tone: 'info'
    },
    {
      label: 'Concluídos hoje',
      value: concluidos,
      note: 'finalizados no dia',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Ocorrências hoje',
      value: ocorrencias,
      note: 'requerem tratativa',
      icon: 'i-lucide-triangle-alert',
      tone: ocorrencias > 0 ? 'danger' : undefined
    },
    {
      label: 'Cancelados',
      value: cancelados,
      note: 'no filtro atual',
      icon: 'i-lucide-ban',
      tone: cancelados > 0 ? 'danger' : undefined
    },
    {
      label: 'Produtividade',
      value: produtividade,
      note: 'concluídos / total',
      icon: 'i-lucide-gauge',
      tone: 'success'
    }
  ]
}

export function buildPedidosClienteMetrics(rows: ResumoClienteRow[]): Metric[] {
  const total = rows.reduce((acc, row) => acc + row.total, 0)
  const emRota = rows.reduce((acc, row) => acc + row.emRota, 0)
  const concluidos = rows.reduce((acc, row) => acc + row.concluidos, 0)
  const ocorrencias = rows.reduce((acc, row) => acc + row.ocorrencias, 0)
  const contas = new Set(rows.map((row) => row.accountId)).size

  return [
    {
      label: 'Contas',
      value: contas,
      note: 'no ranking filtrado',
      icon: 'i-lucide-building-2',
      tone: 'info'
    },
    {
      label: 'Pedidos',
      value: total,
      note: 'volume consolidado',
      icon: 'i-lucide-package',
      tone: 'info'
    },
    {
      label: 'Em rota',
      value: emRota,
      note: 'em campo',
      icon: 'i-lucide-truck',
      tone: 'info'
    },
    {
      label: 'Concluídos',
      value: concluidos,
      note: 'finalizados',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Ocorrências',
      value: ocorrencias,
      note: 'abertas no filtro',
      icon: 'i-lucide-triangle-alert',
      tone: ocorrencias > 0 ? 'danger' : undefined
    },
    {
      label: 'Linhas',
      value: rows.length,
      note: 'conta × operação',
      icon: 'i-lucide-rows-3',
      tone: 'info'
    }
  ]
}

export function buildPedidosEstadoMetrics(rows: ResumoEstadoRow[]): Metric[] {
  const total = rows.reduce((acc, row) => acc + row.total, 0)
  const emRota = rows.reduce((acc, row) => acc + row.emRota, 0)
  const concluidos = rows.reduce((acc, row) => acc + row.concluidos, 0)
  const ocorrencias = rows.reduce((acc, row) => acc + row.ocorrencias, 0)
  const pas = rows.reduce((acc, row) => acc + row.pontosApoio, 0)

  return [
    {
      label: 'UFs',
      value: rows.length,
      note: 'com volume no filtro',
      icon: 'i-lucide-map',
      tone: 'info'
    },
    {
      label: 'Pedidos',
      value: total,
      note: 'soma por estado',
      icon: 'i-lucide-package',
      tone: 'info'
    },
    {
      label: 'Em rota',
      value: emRota,
      note: 'em campo',
      icon: 'i-lucide-truck',
      tone: 'info'
    },
    {
      label: 'Concluídos',
      value: concluidos,
      note: 'finalizados',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Ocorrências',
      value: ocorrencias,
      note: 'abertas',
      icon: 'i-lucide-triangle-alert',
      tone: ocorrencias > 0 ? 'danger' : undefined
    },
    {
      label: 'Pontos de apoio',
      value: pas,
      note: 'cobertos nas UFs',
      icon: 'i-lucide-map-pin-house',
      tone: 'info'
    }
  ]
}

export function buildPedidosPaMetrics(rows: ResumoPaRow[]): Metric[] {
  const total = rows.reduce((acc, row) => acc + row.total, 0)
  const emRota = rows.reduce((acc, row) => acc + row.emRota, 0)
  const concluidos = rows.reduce((acc, row) => acc + row.concluidos, 0)
  const ocorrencias = rows.reduce((acc, row) => acc + row.ocorrencias, 0)

  return [
    {
      label: 'Pontos de apoio',
      value: rows.length,
      note: 'no filtro',
      icon: 'i-lucide-map-pin-house',
      tone: 'info'
    },
    {
      label: 'Pedidos',
      value: total,
      note: 'volume consolidado',
      icon: 'i-lucide-package',
      tone: 'info'
    },
    {
      label: 'Em rota',
      value: emRota,
      note: 'em campo',
      icon: 'i-lucide-truck',
      tone: 'info'
    },
    {
      label: 'Concluídos',
      value: concluidos,
      note: 'finalizados',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Ocorrências',
      value: ocorrencias,
      note: 'abertas',
      icon: 'i-lucide-triangle-alert',
      tone: ocorrencias > 0 ? 'danger' : undefined
    },
    {
      label: 'UFs',
      value: new Set(rows.map((row) => row.uf)).size,
      note: 'cobertas',
      icon: 'i-lucide-map',
      tone: 'info'
    }
  ]
}

export function buildPedidosTransportadorMetrics(rows: ResumoTransportadorRow[]): Metric[] {
  const total = rows.reduce((acc, row) => acc + row.total, 0)
  const emRota = rows.reduce((acc, row) => acc + row.emRota, 0)
  const concluidos = rows.reduce((acc, row) => acc + row.concluidos, 0)
  const ocorrencias = rows.reduce((acc, row) => acc + row.ocorrencias, 0)

  return [
    {
      label: 'Transportadores',
      value: rows.length,
      note: 'no ranking',
      icon: 'i-lucide-truck',
      tone: 'info'
    },
    {
      label: 'Pedidos',
      value: total,
      note: 'volume consolidado',
      icon: 'i-lucide-package',
      tone: 'info'
    },
    {
      label: 'Em rota',
      value: emRota,
      note: 'em campo',
      icon: 'i-lucide-route',
      tone: 'info'
    },
    {
      label: 'Concluídos',
      value: concluidos,
      note: 'finalizados',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Ocorrências',
      value: ocorrencias,
      note: 'abertas',
      icon: 'i-lucide-triangle-alert',
      tone: ocorrencias > 0 ? 'danger' : undefined
    },
    {
      label: 'Linhas',
      value: rows.length,
      note: 'transportador × volume',
      tone: 'info',
      icon: 'i-lucide-rows-3'
    }
  ]
}
