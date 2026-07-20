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
})
