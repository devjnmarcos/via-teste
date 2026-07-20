/**
 * Fixtures de Lotes de importação (Operação → Lotes).
 * Não confundir com DEV OUT (`lots_out`).
 */

import { reactive } from 'vue'
import type { TrendPoint } from '../../types/domain'

export type LotStatus = 'Concluído' | 'Importando' | 'Com erro' | 'Rascunho'

export type ImportLogSeverity = 'info' | 'warning' | 'error'

export interface ImportLogRow extends Record<string, unknown> {
  id: string
  line: number
  message: string
  severity: ImportLogSeverity
  atLabel: string
}

export interface LotFileInfo {
  name: string
  sizeLabel: string
  uploadedAtLabel: string
}

export interface LotRow extends Record<string, unknown> {
  id: string
  reference: string
  status: LotStatus
  accountId: string
  accountName: string
  createdAtLabel: string
  ordersCreated: number
  errorsCount: number
  linesOk: number
  linesError: number
  linesTotal: number
  file: LotFileInfo | null
  logs: ImportLogRow[]
}

export const lotesAccountOptions = [
  { label: 'Casas Bahia · Nacional', value: 'acc-1' },
  { label: 'Renner · Sul', value: 'acc-2' },
  { label: 'Amazon BR · Reversa', value: 'acc-3' }
]

export const lotesStatusOptions = [
  { label: 'Todos os status', value: 'Todos' },
  { label: 'Concluído', value: 'Concluído' },
  { label: 'Importando', value: 'Importando' },
  { label: 'Com erro', value: 'Com erro' },
  { label: 'Rascunho', value: 'Rascunho' }
]

const initialLots: LotRow[] = [
  {
    id: '1208',
    reference: 'IMP-CB-JUL-01',
    status: 'Concluído',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    createdAtLabel: '17/07/2026 08:12',
    ordersCreated: 142,
    errorsCount: 0,
    linesOk: 142,
    linesError: 0,
    linesTotal: 142,
    file: {
      name: 'importacao_cb_jul01.xlsx',
      sizeLabel: '248 KB',
      uploadedAtLabel: '17/07/2026 08:10'
    },
    logs: [
      {
        id: 'log-1208-1',
        line: 0,
        message: 'Arquivo validado — 142 linhas',
        severity: 'info',
        atLabel: '17/07/2026 08:11'
      },
      {
        id: 'log-1208-2',
        line: 0,
        message: 'Importação concluída sem erros',
        severity: 'info',
        atLabel: '17/07/2026 08:14'
      }
    ]
  },
  {
    id: '1207',
    reference: 'IMP-RNN-SUL-44',
    status: 'Com erro',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    createdAtLabel: '16/07/2026 16:40',
    ordersCreated: 88,
    errorsCount: 6,
    linesOk: 88,
    linesError: 6,
    linesTotal: 94,
    file: {
      name: 'lote_renner_44.xlsx',
      sizeLabel: '191 KB',
      uploadedAtLabel: '16/07/2026 16:38'
    },
    logs: [
      {
        id: 'log-1207-1',
        line: 12,
        message: 'CEP inválido na coluna destino',
        severity: 'error',
        atLabel: '16/07/2026 16:41'
      },
      {
        id: 'log-1207-2',
        line: 18,
        message: 'SKU não cadastrado: RNN-SKU-991',
        severity: 'error',
        atLabel: '16/07/2026 16:41'
      },
      {
        id: 'log-1207-3',
        line: 27,
        message: 'Telefone ausente — pedido criado sem contato',
        severity: 'warning',
        atLabel: '16/07/2026 16:42'
      },
      {
        id: 'log-1207-4',
        line: 41,
        message: 'UF divergente do CEP informado',
        severity: 'error',
        atLabel: '16/07/2026 16:42'
      },
      {
        id: 'log-1207-5',
        line: 55,
        message: 'Linha duplicada ignorada',
        severity: 'warning',
        atLabel: '16/07/2026 16:43'
      },
      {
        id: 'log-1207-6',
        line: 72,
        message: 'Documento fiscal sem série',
        severity: 'error',
        atLabel: '16/07/2026 16:43'
      },
      {
        id: 'log-1207-7',
        line: 0,
        message: 'Importação parcial — 88 pedidos gerados',
        severity: 'warning',
        atLabel: '16/07/2026 16:44'
      }
    ]
  },
  {
    id: '1206',
    reference: 'IMP-AMZ-REV-09',
    status: 'Importando',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    createdAtLabel: '18/07/2026 07:05',
    ordersCreated: 34,
    errorsCount: 0,
    linesOk: 34,
    linesError: 0,
    linesTotal: 210,
    file: {
      name: 'amazon_reversa_09.xlsx',
      sizeLabel: '512 KB',
      uploadedAtLabel: '18/07/2026 07:04'
    },
    logs: [
      {
        id: 'log-1206-1',
        line: 0,
        message: 'Processando lote — 34/210 linhas',
        severity: 'info',
        atLabel: '18/07/2026 07:06'
      }
    ]
  },
  {
    id: '1205',
    reference: 'IMP-CB-JUN-28',
    status: 'Concluído',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    createdAtLabel: '28/06/2026 11:22',
    ordersCreated: 76,
    errorsCount: 1,
    linesOk: 76,
    linesError: 1,
    linesTotal: 77,
    file: {
      name: 'cb_jun28.xlsx',
      sizeLabel: '134 KB',
      uploadedAtLabel: '28/06/2026 11:20'
    },
    logs: [
      {
        id: 'log-1205-1',
        line: 44,
        message: 'Endereço truncado no limite do campo',
        severity: 'warning',
        atLabel: '28/06/2026 11:23'
      },
      {
        id: 'log-1205-2',
        line: 0,
        message: 'Importação concluída com 1 aviso',
        severity: 'info',
        atLabel: '28/06/2026 11:25'
      }
    ]
  },
  {
    id: '1204',
    reference: 'IMP-RNN-RASCUNHO',
    status: 'Rascunho',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    createdAtLabel: '15/07/2026 09:00',
    ordersCreated: 0,
    errorsCount: 0,
    linesOk: 0,
    linesError: 0,
    linesTotal: 0,
    file: null,
    logs: []
  },
  {
    id: '1203',
    reference: 'IMP-AMZ-REV-08',
    status: 'Concluído',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    createdAtLabel: '14/07/2026 13:18',
    ordersCreated: 201,
    errorsCount: 0,
    linesOk: 201,
    linesError: 0,
    linesTotal: 201,
    file: {
      name: 'amazon_reversa_08.xlsx',
      sizeLabel: '620 KB',
      uploadedAtLabel: '14/07/2026 13:15'
    },
    logs: [
      {
        id: 'log-1203-1',
        line: 0,
        message: 'Importação concluída sem erros',
        severity: 'info',
        atLabel: '14/07/2026 13:22'
      }
    ]
  },
  {
    id: '1202',
    reference: 'IMP-CB-JUL-00',
    status: 'Com erro',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    createdAtLabel: '10/07/2026 10:05',
    ordersCreated: 0,
    errorsCount: 12,
    linesOk: 0,
    linesError: 12,
    linesTotal: 12,
    file: {
      name: 'cb_invalid.xlsx',
      sizeLabel: '18 KB',
      uploadedAtLabel: '10/07/2026 10:04'
    },
    logs: [
      {
        id: 'log-1202-1',
        line: 1,
        message: 'Cabeçalho incompatível com o template',
        severity: 'error',
        atLabel: '10/07/2026 10:05'
      },
      {
        id: 'log-1202-2',
        line: 0,
        message: 'Importação abortada',
        severity: 'error',
        atLabel: '10/07/2026 10:05'
      }
    ]
  },
  {
    id: '1201',
    reference: 'IMP-RNN-SUL-43',
    status: 'Concluído',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    createdAtLabel: '08/07/2026 15:44',
    ordersCreated: 55,
    errorsCount: 0,
    linesOk: 55,
    linesError: 0,
    linesTotal: 55,
    file: {
      name: 'lote_renner_43.xlsx',
      sizeLabel: '102 KB',
      uploadedAtLabel: '08/07/2026 15:42'
    },
    logs: [
      {
        id: 'log-1201-1',
        line: 0,
        message: 'Importação concluída sem erros',
        severity: 'info',
        atLabel: '08/07/2026 15:46'
      }
    ]
  }
]

export const lotesVolumeTrend: TrendPoint[] = [
  { label: '12/07', value: 1 },
  { label: '13/07', value: 0 },
  { label: '14/07', value: 1 },
  { label: '15/07', value: 1 },
  { label: '16/07', value: 1 },
  { label: '17/07', value: 1 },
  { label: '18/07', value: 1 }
]

export interface CreateLotInput {
  reference: string
  accountId: string
  fileName?: string
}

export function createEmptyLotForm() {
  return {
    reference: '',
    accountId: '',
    fileName: ''
  }
}

export const lotesState = reactive({
  lots: structuredClone(initialLots) as LotRow[]
})

export function getLot(id: string): LotRow | undefined {
  return lotesState.lots.find((lot) => lot.id === id)
}

export function createLot(input: CreateLotInput): LotRow {
  const account = lotesAccountOptions.find((item) => item.value === input.accountId)
  const hasFile = Boolean(input.fileName?.trim())
  const now = new Date()
  const label = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const id = String(1300 + lotesState.lots.length)

  const lot: LotRow = {
    id,
    reference: input.reference.trim() || `IMP-${id}`,
    status: hasFile ? 'Importando' : 'Rascunho',
    accountId: input.accountId,
    accountName: account?.label ?? input.accountId,
    createdAtLabel: label,
    ordersCreated: 0,
    errorsCount: 0,
    linesOk: 0,
    linesError: 0,
    linesTotal: hasFile ? 50 : 0,
    file: hasFile
      ? {
          name: input.fileName!.trim(),
          sizeLabel: '—',
          uploadedAtLabel: label
        }
      : null,
    logs: hasFile
      ? [
          {
            id: `log-${id}-1`,
            line: 0,
            message: 'Upload recebido — fila de importação',
            severity: 'info',
            atLabel: label
          }
        ]
      : []
  }

  lotesState.lots = [lot, ...lotesState.lots]
  return lot
}
