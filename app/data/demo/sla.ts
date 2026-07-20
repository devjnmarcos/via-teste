/**
 * Fixtures de SLA para o piloto de Cadastros.
 * Alinhado ao AS-IS (Conta, Corte, Tolerância, Término, Dias bloqueados + subitens).
 * Create/edit em modal — formulário curto, sem abas.
 * Delete: confirmação simples (não crítico).
 */

export interface SlaTermRow extends Record<string, unknown> {
  id: string
  city: string
  state: string
  slaHours: string
  holidaysBlocked: boolean
  dayHour: string
}

export interface SlaConfigRow extends Record<string, unknown> {
  id: string
  name: string
  cutoffTime: string
  toleranceTime: string
  endTime: string
  blockedWeekdays: string
  active: boolean
  terms: SlaTermRow[]
}

export const slaDemoRows: SlaConfigRow[] = [
  {
    id: 'sla-1',
    name: 'CB · CD Cajamar',
    cutoffTime: '14:00',
    toleranceTime: '01:00',
    endTime: '18:00',
    blockedWeekdays: 'Sáb, Dom',
    active: true,
    terms: [
      { id: 't1', city: 'Cajamar', state: 'SP', slaHours: '24h', holidaysBlocked: true, dayHour: 'Dia útil' },
      { id: 't2', city: 'Osasco', state: 'SP', slaHours: '36h', holidaysBlocked: true, dayHour: 'Dia útil' }
    ]
  },
  {
    id: 'sla-2',
    name: 'Renner · POA',
    cutoffTime: '12:00',
    toleranceTime: '00:30',
    endTime: '17:00',
    blockedWeekdays: 'Dom',
    active: true,
    terms: [
      { id: 't3', city: 'Porto Alegre', state: 'RS', slaHours: '48h', holidaysBlocked: false, dayHour: 'Dia / Hora' }
    ]
  },
  {
    id: 'sla-3',
    name: 'Padrão nacional',
    cutoffTime: '15:00',
    toleranceTime: '02:00',
    endTime: '19:00',
    blockedWeekdays: 'Sáb, Dom',
    active: false,
    terms: []
  }
]

export function createEmptySla(): Omit<SlaConfigRow, 'id' | 'terms'> {
  return {
    name: '',
    cutoffTime: '14:00',
    toleranceTime: '01:00',
    endTime: '18:00',
    blockedWeekdays: 'Sáb, Dom',
    active: true
  }
}
