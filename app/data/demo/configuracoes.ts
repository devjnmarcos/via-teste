/**
 * Fixtures de Configurações de módulo (SLA / Processo / Externos / Auditoria).
 */

import type { TrendPoint } from '../../types/domain'

export interface ConfigSlaForm {
  cutoffHour: string
  toleranceMinutes: number
  endHour: string
  considerHolidays: boolean
  considerWeekends: boolean
  auditEnabled: boolean
}

export interface ConfigProcessForm {
  autoAssignSupportPoint: boolean
  allowManualRouteOverride: boolean
  maxBatchSize: number
  retryAttempts: number
  notifyOnFailure: boolean
  holdOnOccurrence: boolean
}

export interface ConfigExternalRow extends Record<string, unknown> {
  id: string
  provider: string
  accountName: string
  apiKeyMasked: string
  active: boolean
  lastSyncLabel: string
}

export interface ConfigSlaAuditRow extends Record<string, unknown> {
  id: string
  changedAtLabel: string
  user: string
  field: string
  before: string
  after: string
}

export const configSlaForm = reactiveSeedSla()

export const configProcessForm = reactiveSeedProcess()

export const configExternalsState = {
  rows: [
    {
      id: 'ext-1',
      provider: 'Mileto',
      accountName: 'Casas Bahia · Nacional',
      apiKeyMasked: 'mk_••••••••a91f',
      active: true,
      lastSyncLabel: '18/07 10:40'
    },
    {
      id: 'ext-2',
      provider: 'Umbler',
      accountName: 'Casas Bahia · Nacional',
      apiKeyMasked: 'um_••••••••22c0',
      active: true,
      lastSyncLabel: '18/07 09:55'
    },
    {
      id: 'ext-3',
      provider: 'Kangu',
      accountName: 'Renner · Sul',
      apiKeyMasked: 'kg_••••••••7b11',
      active: false,
      lastSyncLabel: '16/07 14:20'
    },
    {
      id: 'ext-4',
      provider: 'Mileto',
      accountName: 'Amazon BR · Reversa',
      apiKeyMasked: 'mk_••••••••c4e2',
      active: true,
      lastSyncLabel: '18/07 08:12'
    }
  ] as ConfigExternalRow[]
}

export const configSlaAuditRows: ConfigSlaAuditRow[] = [
  {
    id: 'aud-1',
    changedAtLabel: '18/07 07:40',
    user: 'admin.via',
    field: 'toleranceMinutes',
    before: '30',
    after: '45'
  },
  {
    id: 'aud-2',
    changedAtLabel: '17/07 16:10',
    user: 'ops.lead',
    field: 'cutoffHour',
    before: '14:00',
    after: '15:00'
  },
  {
    id: 'aud-3',
    changedAtLabel: '16/07 11:22',
    user: 'admin.via',
    field: 'considerHolidays',
    before: 'false',
    after: 'true'
  },
  {
    id: 'aud-4',
    changedAtLabel: '15/07 09:05',
    user: 'ops.lead',
    field: 'endHour',
    before: '20:00',
    after: '21:00'
  },
  {
    id: 'aud-5',
    changedAtLabel: '14/07 18:30',
    user: 'admin.via',
    field: 'auditEnabled',
    before: 'false',
    after: 'true'
  }
]

export const configAuditTrend: TrendPoint[] = [
  { label: '12/07', value: 2 },
  { label: '13/07', value: 1 },
  { label: '14/07', value: 3 },
  { label: '15/07', value: 1 },
  { label: '16/07', value: 2 },
  { label: '17/07', value: 1 },
  { label: '18/07', value: 1 }
]

function reactiveSeedSla(): ConfigSlaForm {
  return {
    cutoffHour: '15:00',
    toleranceMinutes: 45,
    endHour: '21:00',
    considerHolidays: true,
    considerWeekends: false,
    auditEnabled: true
  }
}

function reactiveSeedProcess(): ConfigProcessForm {
  return {
    autoAssignSupportPoint: true,
    allowManualRouteOverride: true,
    maxBatchSize: 250,
    retryAttempts: 3,
    notifyOnFailure: true,
    holdOnOccurrence: true
  }
}

export function resetConfigSlaForm(target: ConfigSlaForm) {
  Object.assign(target, reactiveSeedSla())
}

export function resetConfigProcessForm(target: ConfigProcessForm) {
  Object.assign(target, reactiveSeedProcess())
}

export function saveConfigSlaSnapshot(form: ConfigSlaForm): ConfigSlaForm {
  return { ...form }
}

export function saveConfigProcessSnapshot(form: ConfigProcessForm): ConfigProcessForm {
  return { ...form }
}

export function toggleExternalActive(id: string, active: boolean): boolean {
  const row = configExternalsState.rows.find((item) => item.id === id)
  if (!row) return false
  row.active = active
  row.lastSyncLabel = '18/07 11:25'
  return true
}
