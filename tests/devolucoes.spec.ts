import { describe, expect, it } from 'vitest'
import {
  addDevInItem,
  closeDevInBox,
  createDevInBox,
  getDevInBox,
  removeDevInItem,
  devInState
} from '../app/data/demo/devolucoes-dev-in'
import {
  associateBoxToLot,
  closeDevOutLot,
  createDevOutLot,
  getDevOutLot,
  listAvailableClosedBoxes,
  returnDevOutLot,
  devOutState
} from '../app/data/demo/devolucoes-dev-out'
import {
  buildAcompanhamentoMetrics,
  buildDevInDetailMetrics,
  buildDevInListMetrics,
  buildDevOutListMetrics,
  filterAcompanhamentoBoxes,
  parseDevLabelDate
} from '../app/utils/devolucoes-metrics'

describe('fixtures DEV IN / DEV OUT', () => {
  it('cria caixa, inclui item e fecha', () => {
    const box = createDevInBox({ companyId: 'emp-1', notes: 'teste' })
    expect(box.status).toBe('Aberto')
    expect(getDevInBox(box.id)?.companyName).toContain('Cajamar')

    const item = addDevInItem(box.id, { serial: 'SN-TEST-1', itemType: 'Reversa' })
    expect(item?.serial).toBe('SN-TEST-1')
    expect(getDevInBox(box.id)?.totItemsIn).toBe(1)

    expect(closeDevInBox(box.id)).toBe(true)
    expect(getDevInBox(box.id)?.status).toBe('Fechado')
  })

  it('desassocia item de caixa aberta', () => {
    const box = createDevInBox({ companyId: 'emp-2' })
    const item = addDevInItem(box.id, { serial: 'SN-RM', itemType: 'Entrega' })
    expect(item).toBeTruthy()
    expect(removeDevInItem(box.id, item!.id)).toBe(true)
    expect(getDevInBox(box.id)?.totItemsIn).toBe(0)
  })

  it('associa caixa fechada a lote e devolve', () => {
    const availableBefore = listAvailableClosedBoxes().length
    expect(availableBefore).toBeGreaterThan(0)

    const lot = createDevOutLot({
      companyId: 'emp-1',
      distributionCenter: 'CD Cajamar',
      shippingForecastLabel: '25/07/2026'
    })
    const boxId = listAvailableClosedBoxes()[0]!.id
    expect(associateBoxToLot(lot.id, boxId)).toBe(true)
    expect(getDevOutLot(lot.id)?.totBoxesIn).toBe(1)
    expect(closeDevOutLot(lot.id)).toBe(true)
    expect(returnDevOutLot(lot.id)).toBe(true)
    expect(getDevOutLot(lot.id)?.status).toBe('Devolvido')
  })

  it('expõe volume suficiente para paginação nas listagens', () => {
    expect(devInState.boxes.length).toBeGreaterThan(25)
    expect(devOutState.lots.length).toBeGreaterThan(25)
  })
})

describe('devolucoes-metrics', () => {
  it('parseia labels de data das fixtures', () => {
    const date = parseDevLabelDate('15/07/2026 09:14')
    expect(date?.getFullYear()).toBe(2026)
    expect(date?.getMonth()).toBe(6)
    expect(date?.getDate()).toBe(15)
  })

  it('agrega métricas de listagem DEV IN / DEV OUT', () => {
    const inMetrics = buildDevInListMetrics(devInState.boxes)
    expect(inMetrics).toHaveLength(4)
    expect(inMetrics[0]?.label).toBe('Total de caixas')
    expect(Number(inMetrics[0]?.value)).toBe(devInState.boxes.length)

    const outMetrics = buildDevOutListMetrics(devOutState.lots)
    expect(outMetrics).toHaveLength(5)
    expect(outMetrics[0]?.label).toBe('Total de lotes')
  })

  it('expande métricas do detalhe DEV IN', () => {
    const box = getDevInBox('1042')
    expect(box).toBeTruthy()
    const metrics = buildDevInDetailMetrics(box!)
    expect(metrics).toHaveLength(4)
    expect(metrics.map((item) => item.label)).toEqual([
      'Itens na caixa',
      'Itens Reversa',
      'Itens Entrega',
      'Status Despachos'
    ])
  })

  it('filtra acompanhamento por período mensal e monta cards de caixas', () => {
    const scoped = filterAcompanhamentoBoxes({
      boxes: devInState.boxes,
      companyId: 'Todas',
      itemType: 'Todos',
      periodMode: 'mensal',
      month: 7,
      year: 2026,
      startDate: '',
      endDate: ''
    })
    expect(scoped.length).toBeGreaterThan(0)

    const { boxMetrics, itemMetrics } = buildAcompanhamentoMetrics(scoped, 'Todos')
    expect(boxMetrics).toHaveLength(5)
    expect(itemMetrics).toHaveLength(1)
    expect([...boxMetrics, ...itemMetrics]).toHaveLength(6)
    expect(boxMetrics.some((metric) => metric.to?.includes('status=Aberto'))).toBe(true)
  })
})
