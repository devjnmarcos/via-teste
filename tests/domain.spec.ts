import { describe, expect, it } from 'vitest'
import { operationStages, operations, totalOrders } from '../app/data/demo/operations'
import { featuredOrder, orders } from '../app/data/demo/orders'
import { statusMeta } from '../app/types/domain'

describe('domínio operacional', () => {
  it('mantém ponto de apoio escrito por extenso', () => {
    expect(statusMeta.supportMissing.label).toBe('Ponto de apoio não identificado')
    expect(operationStages[1]?.label).toBe('Ponto de apoio não identificado')
  })

  it('agrega o volume das seis operações da Home', () => {
    expect(operations).toHaveLength(6)
    expect(totalOrders).toBe(609)
    expect(totalOrders).toBe(operations.reduce((sum, operation) => sum + operation.total, 0))
  })

  it('mantém cinco estágios que fecham o fluxo da operação em destaque', () => {
    expect(operationStages).toHaveLength(5)
    expect(operationStages.reduce((sum, stage) => sum + stage.count, 0)).toBe(198)
  })

  it('gera um destino navegável para cada pedido', () => {
    expect(orders.every(order => order.href === `/pedidos/${order.id}`)).toBe(true)
  })

  it('expõe jornada e estabelecimentos do pedido em destaque', () => {
    expect(featuredOrder.id).toBe('48224')
    expect(featuredOrder.events).toHaveLength(4)
    expect(featuredOrder.establishments).toHaveLength(3)
  })

  it('marca elegibilidade de etiqueta e disparo de chatbot nos pedidos mock', () => {
    const backOrder = orders.find((order) => order.id === '48219')
    const assignedOrder = orders.find((order) => order.id === '48208')
    const stockOrder = orders.find((order) => order.id === '48201')
    const supportMissingOrder = orders.find((order) => order.id === '48197')
    const newOrder = orders.find((order) => order.id === '48190')

    expect(backOrder?.labelPrinted).toBe(false)
    expect(backOrder?.chatbotEligible).toBe(false)
    expect(assignedOrder?.labelPrinted).toBe(false)
    expect(assignedOrder?.chatbotEligible).toBe(true)
    expect(stockOrder?.labelPrinted).toBe(true)
    expect(stockOrder?.chatbotEligible).toBe(false)
    expect(supportMissingOrder?.labelPrinted).toBe(false)
    expect(supportMissingOrder?.chatbotEligible).toBe(false)
    expect(newOrder?.labelPrinted).toBe(false)
    expect(newOrder?.chatbotEligible).toBe(true)
    expect(featuredOrder.labelPrinted).toBe(true)
    expect(featuredOrder.chatbotEligible).toBe(false)
  })
})
