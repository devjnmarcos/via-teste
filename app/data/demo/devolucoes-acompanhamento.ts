/**
 * Fixture do acompanhamento de Devoluções — top transportadores + tendência mensal.
 * Datas alinhadas aos labels das caixas DEV IN (jul/2026).
 */

import type { TrendPoint } from '../../types/domain'
import type { DataTableColumn } from '../../types/data-table'

export interface TopTransporterRow extends Record<string, unknown> {
  id: string
  name: string
  boxes: number
  items: number
  shareLabel: string
}

export const acompanhamentoTopTransporters: TopTransporterRow[] = [
  {
    id: 'tr-1',
    name: 'Transportadora Alpha',
    boxes: 14,
    items: 48,
    shareLabel: '32%'
  },
  {
    id: 'tr-2',
    name: 'Logística Beta',
    boxes: 9,
    items: 31,
    shareLabel: '21%'
  },
  {
    id: 'tr-3',
    name: 'Expresso Gama',
    boxes: 7,
    items: 22,
    shareLabel: '16%'
  },
  {
    id: 'tr-4',
    name: 'Rede Delta',
    boxes: 5,
    items: 18,
    shareLabel: '12%'
  },
  {
    id: 'tr-5',
    name: 'Via Frota Própria',
    boxes: 4,
    items: 11,
    shareLabel: '9%'
  },
  {
    id: 'tr-6',
    name: 'Parceiro Épsilon',
    boxes: 3,
    items: 8,
    shareLabel: '7%'
  },
  {
    id: 'tr-7',
    name: 'Outros',
    boxes: 2,
    items: 5,
    shareLabel: '3%'
  }
]

/** Série diária mock de caixas criadas em julho/2026 (determinística). */
export const acompanhamentoVolumeTrend: TrendPoint[] = [
  { label: '01', value: 1 },
  { label: '03', value: 2 },
  { label: '05', value: 1 },
  { label: '08', value: 3 },
  { label: '10', value: 2 },
  { label: '12', value: 4 },
  { label: '13', value: 2 },
  { label: '15', value: 3 },
  { label: '16', value: 2 },
  { label: '17', value: 1 }
]

export const topTransporterColumns: DataTableColumn<TopTransporterRow>[] = [
  { type: 'text', key: 'name', label: 'Transportador' },
  { type: 'text', key: 'boxes', label: 'Caixas', width: '90px', align: 'right' },
  { type: 'text', key: 'items', label: 'Itens', width: '90px', align: 'right' },
  { type: 'text', key: 'shareLabel', label: 'Participação', width: '110px', align: 'right' }
]

export const monthOptions = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 }
]

export const yearOptions = [
  { label: '2025', value: 2025 },
  { label: '2026', value: 2026 }
]

export const periodModeOptions = [
  { label: 'Mensal', value: 'mensal' },
  { label: 'Personalizado', value: 'custom' }
]
