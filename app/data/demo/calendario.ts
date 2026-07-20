/**
 * Fixtures do Calendário operacional.
 */

import type { TrendPoint } from '../../types/domain'

export interface CalendarEvent extends Record<string, unknown> {
  id: string
  orderId: string
  accountId: string
  accountName: string
  client: string
  day: number
  timeLabel: string
  situation: string
}

export const calendarioAccountOptions = [
  { label: 'Todas as contas', value: 'all' },
  { label: 'Casas Bahia · Nacional', value: 'acc-1' },
  { label: 'Renner · Sul', value: 'acc-2' },
  { label: 'Amazon BR · Reversa', value: 'acc-3' }
]

/** Julho/2026 — mês da sessão demo. */
export const calendarioMonthLabel = 'Julho 2026'
export const calendarioYear = 2026
export const calendarioMonthIndex = 6 // 0-based

export const calendarioEvents: CalendarEvent[] = [
  {
    id: 'ce-1',
    orderId: '48501',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    client: 'Ana Souza',
    day: 14,
    timeLabel: '09:00',
    situation: 'Aberto'
  },
  {
    id: 'ce-2',
    orderId: '48502',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    client: 'Bruno Lima',
    day: 14,
    timeLabel: '10:30',
    situation: 'Aberto'
  },
  {
    id: 'ce-3',
    orderId: '48503',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    client: 'Carla Mendes',
    day: 15,
    timeLabel: '11:00',
    situation: 'Aberto'
  },
  {
    id: 'ce-4',
    orderId: '48504',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    client: 'Diego Alves',
    day: 16,
    timeLabel: '08:45',
    situation: 'Aberto'
  },
  {
    id: 'ce-5',
    orderId: '48505',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    client: 'Elena Rocha',
    day: 17,
    timeLabel: '14:00',
    situation: 'Aberto'
  },
  {
    id: 'ce-6',
    orderId: '48506',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    client: 'Fábio Nunes',
    day: 18,
    timeLabel: '09:30',
    situation: 'Aberto'
  },
  {
    id: 'ce-7',
    orderId: '48507',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    client: 'Gisele Prado',
    day: 18,
    timeLabel: '11:15',
    situation: 'Aberto'
  },
  {
    id: 'ce-8',
    orderId: '48508',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    client: 'Hugo Martins',
    day: 18,
    timeLabel: '15:00',
    situation: 'Aberto'
  },
  {
    id: 'ce-9',
    orderId: '48509',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    client: 'Iris Costa',
    day: 20,
    timeLabel: '10:00',
    situation: 'Aberto'
  },
  {
    id: 'ce-10',
    orderId: '48510',
    accountId: 'acc-2',
    accountName: 'Renner · Sul',
    client: 'João Pedro',
    day: 21,
    timeLabel: '13:30',
    situation: 'Aberto'
  },
  {
    id: 'ce-11',
    orderId: '48511',
    accountId: 'acc-3',
    accountName: 'Amazon BR · Reversa',
    client: 'Karen Dias',
    day: 22,
    timeLabel: '09:00',
    situation: 'Aberto'
  },
  {
    id: 'ce-12',
    orderId: '48512',
    accountId: 'acc-1',
    accountName: 'Casas Bahia · Nacional',
    client: 'Lucas Vieira',
    day: 24,
    timeLabel: '16:00',
    situation: 'Aberto'
  }
]

export const calendarioVolumeTrend: TrendPoint[] = [
  { label: '14', value: 2 },
  { label: '15', value: 1 },
  { label: '16', value: 1 },
  { label: '17', value: 1 },
  { label: '18', value: 3 },
  { label: '20', value: 1 },
  { label: '21', value: 1 },
  { label: '22', value: 1 },
  { label: '24', value: 1 }
]

export function eventsForDay(
  day: number,
  accountId = 'all'
): CalendarEvent[] {
  return calendarioEvents.filter((event) => {
    if (event.day !== day) return false
    if (accountId === 'all') return true
    return event.accountId === accountId
  })
}

export function countEventsByDay(accountId = 'all'): Record<number, number> {
  const counts: Record<number, number> = {}
  for (const event of calendarioEvents) {
    if (accountId !== 'all' && event.accountId !== accountId) continue
    counts[event.day] = (counts[event.day] ?? 0) + 1
  }
  return counts
}

/** Grade do mês: células com day null = padding fora do mês. */
export function buildMonthCells(
  year: number,
  monthIndex: number
): Array<{ day: number | null; key: string }> {
  const first = new Date(year, monthIndex, 1)
  const startWeekday = first.getDay() // 0=dom
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: Array<{ day: number | null; key: string }> = []

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ day: null, key: `pad-${i}` })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, key: `d-${day}` })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, key: `pad-end-${cells.length}` })
  }
  return cells
}

/** Semana contendo `anchorDay` (1–31) no mês informado. */
export function buildWeekCells(
  year: number,
  monthIndex: number,
  anchorDay: number
): Array<{ day: number | null; key: string; weekdayLabel: string }> {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const anchor = new Date(year, monthIndex, anchorDay)
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - anchor.getDay())

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const inMonth = date.getMonth() === monthIndex
    return {
      day: inMonth ? date.getDate() : null,
      key: `w-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      weekdayLabel: weekdays[index]!
    }
  })
}

export function weekRangeLabel(
  year: number,
  monthIndex: number,
  anchorDay: number
): string {
  const cells = buildWeekCells(year, monthIndex, anchorDay)
  const days = cells.map((cell) => cell.day).filter((day): day is number => day != null)
  if (days.length === 0) return calendarioMonthLabel
  const first = days[0]!
  const last = days[days.length - 1]!
  return `${String(first).padStart(2, '0')}–${String(last).padStart(2, '0')}/07 · ${calendarioMonthLabel}`
}
