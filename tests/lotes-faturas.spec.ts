import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { createLot, getLot, lotesState } from '../app/data/demo/lotes'
import { createFatura, getFatura, isFaturaKind, listFaturasByKind } from '../app/data/demo/faturas'
import { buildLotesListMetrics, mapLotStatusKey } from '../app/utils/lotes-metrics'
import { buildFaturasListMetrics, mapFaturaStatusKey } from '../app/utils/faturas-metrics'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'
import { devolucoesNavigation } from '../app/components/app/navigation'

describe('lotes fixtures e métricas', () => {
  it('expõe lotes com logs tipados', () => {
    expect(lotesState.lots.length).toBeGreaterThanOrEqual(5)
    const withError = getLot('1207')
    expect(withError?.status).toBe('Com erro')
    expect(withError?.logs.length).toBeGreaterThan(0)
  })

  it('cria lote mock e agrega métricas', () => {
    const before = lotesState.lots.length
    const lot = createLot({
      reference: 'IMP-TEST',
      accountId: 'acc-1',
      fileName: 'teste.xlsx'
    })
    expect(lotesState.lots.length).toBe(before + 1)
    expect(lot.status).toBe('Importando')
    expect(mapLotStatusKey('Com erro')).toBe('occurrence')
    const metrics = buildLotesListMetrics(lotesState.lots)
    expect(metrics).toHaveLength(4)
    expect(metrics[0]?.label).toBe('Total de lotes')
  })
})

describe('faturas fixtures e métricas', () => {
  it('separa kinds a-receber e a-pagar', () => {
    expect(isFaturaKind('a-receber')).toBe(true)
    expect(isFaturaKind('to-receive')).toBe(false)
    expect(listFaturasByKind('a-receber').every((row) => row.kind === 'a-receber')).toBe(true)
    expect(listFaturasByKind('a-pagar').every((row) => row.kind === 'a-pagar')).toBe(true)
  })

  it('cria fatura com pedidos e métricas de listagem', () => {
    const invoice = createFatura({
      kind: 'a-receber',
      competenceLabel: 'Jul/2026',
      accountId: 'acc-1',
      dueAtLabel: '31/07/2026',
      notes: 'teste',
      orderIds: ['48231', '48219']
    })
    expect(getFatura(invoice.id)?.orders).toHaveLength(2)
    expect(mapFaturaStatusKey('Vencida')).toBe('occurrence')
    const metrics = buildFaturasListMetrics(listFaturasByKind('a-receber'))
    expect(metrics).toHaveLength(3)
    expect(metrics[0]?.label).toBe('Faturas abertas')
  })
})

describe('navegação e breadcrumbs — lotes e faturas', () => {
  it('inclui Lotes no grupo Remessas', () => {
    expect(devolucoesNavigation.map((item) => item.to)).toContain('/operacao/lotes')
    expect(devolucoesNavigation.find((item) => item.to === '/operacao/lotes')?.icon).toBe('i-lucide-layers')
  })

  it('resolve breadcrumbs de lotes e faturas', () => {
    expect(resolveBreadcrumbs('/operacao/lotes')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Lotes' }
    ])
    expect(resolveBreadcrumbs('/operacao/lotes/1208', { id: '1208' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Lotes', to: '/operacao/lotes' },
      { label: '#1208' }
    ])
    expect(resolveBreadcrumbs('/faturas/a-receber')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Faturas', to: '/faturas' },
      { label: 'A receber' }
    ])
    expect(resolveBreadcrumbs('/faturas/nova/a-pagar', { kind: 'a-pagar' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Faturas', to: '/faturas' },
      { label: 'Nova · A pagar' }
    ])
    expect(resolveBreadcrumbs('/faturas/9001', { id: '9001' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Faturas', to: '/faturas' },
      { label: '#9001' }
    ])
  })
})

describe('conteúdo da tela de Lotes', () => {
  it('remove a seção de Volume de importações e mantém tabela e paginação', () => {
    const path = 'app/pages/operacao/lotes/index.vue'
    expect(existsSync(path)).toBe(true)
    const source = readFileSync(path, 'utf8')
    expect(source).not.toContain('Volume de importações')
    expect(source).not.toContain('VolumeTrendChart')
    expect(source).not.toContain('lotesVolumeTrend')
    expect(source).toContain('<DataTable')
    expect(source).toContain('<Pagination')
  })
})
