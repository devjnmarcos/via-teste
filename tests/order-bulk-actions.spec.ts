import { describe, expect, it } from 'vitest'
import type { Order } from '../app/types/domain'
import {
  isChatbotDispatchable,
  isLabelPrintable,
  markOrdersChatbotDispatched,
  markOrdersLabelPrinted,
  splitEligibleSelection
} from '../app/utils/order-bulk-actions'

function buildOrder(overrides: Partial<Order>): Order {
  return {
    id: '00000',
    href: '/pedidos/00000',
    client: 'Cliente Teste',
    operation: 'Reversa',
    state: 'SP',
    status: 'new',
    supportPoint: 'Ponto de apoio Centro',
    responsible: 'Equipe Teste',
    region: 'SP',
    createdAt: '18/07 10:00',
    updatedAt: 'há 1 min',
    stageDuration: '1 min',
    sla: '4h00',
    slaTone: 'success',
    items: 1,
    occurrences: 0,
    evidences: 0,
    scheduling: 0,
    events: [],
    establishments: [],
    ...overrides
  }
}

describe('order-bulk-actions', () => {
  it('isLabelPrintable: elegível quando não impresso', () => {
    expect(isLabelPrintable(buildOrder({ labelPrinted: false }))).toBe(true)
    expect(isLabelPrintable(buildOrder({ labelPrinted: undefined }))).toBe(true)
    expect(isLabelPrintable(buildOrder({ labelPrinted: true }))).toBe(false)
  })

  it('isChatbotDispatchable: só elegível quando chatbotEligible é true', () => {
    expect(isChatbotDispatchable(buildOrder({ chatbotEligible: true }))).toBe(true)
    expect(isChatbotDispatchable(buildOrder({ chatbotEligible: false }))).toBe(false)
    expect(isChatbotDispatchable(buildOrder({ chatbotEligible: undefined }))).toBe(false)
  })

  it('splitEligibleSelection separa elegíveis de ignorados e ignora ids inexistentes', () => {
    const orders = [
      buildOrder({ id: '1', labelPrinted: false }),
      buildOrder({ id: '2', labelPrinted: true }),
      buildOrder({ id: '3', labelPrinted: false })
    ]
    const result = splitEligibleSelection(orders, ['1', '2', '3', '999'], isLabelPrintable)
    expect(result.eligible).toEqual(['1', '3'])
    expect(result.ineligible).toEqual(['2'])
  })

  it('markOrdersLabelPrinted marca só os ids informados e retorna a contagem', () => {
    const orders = [
      buildOrder({ id: '1', labelPrinted: false }),
      buildOrder({ id: '2', labelPrinted: false }),
      buildOrder({ id: '3', labelPrinted: true })
    ]
    const count = markOrdersLabelPrinted(orders, ['1', '3'])
    expect(count).toBe(1)
    expect(orders[0]?.labelPrinted).toBe(true)
    expect(orders[1]?.labelPrinted).toBe(false)
  })

  it('markOrdersChatbotDispatched desliga chatbotEligible dos ids elegíveis e retorna a contagem', () => {
    const orders = [
      buildOrder({ id: '1', chatbotEligible: true }),
      buildOrder({ id: '2', chatbotEligible: false }),
      buildOrder({ id: '3', chatbotEligible: true })
    ]
    const count = markOrdersChatbotDispatched(orders, ['1', '2', '3'])
    expect(count).toBe(2)
    expect(orders[0]?.chatbotEligible).toBe(false)
    expect(orders[1]?.chatbotEligible).toBe(false)
    expect(orders[2]?.chatbotEligible).toBe(false)
  })
})
