import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Devoluções — DEV IN → Caixas, DEV OUT → Despachos (texto visível)', () => {
  it('renomeia título, aba do navegador e coluna da listagem DEV IN', () => {
    const source = readFileSync('app/pages/devolucoes/dev-in/index.vue', 'utf8')
    expect(source).toContain("useSeoMeta({ title: 'Caixas · Remessas · Via Reversa' })")
    expect(source).toContain('title="Caixas"')
    expect(source).toContain("label: 'Status Despachos'")
    expect(source).not.toMatch(/title="DEV IN"/)
    expect(source).not.toMatch(/'DEV IN/)
    expect(source).not.toMatch(/Status DEV OUT/)
  })

  it('renomeia título e aba do navegador da listagem DEV OUT', () => {
    const source = readFileSync('app/pages/devolucoes/dev-out/index.vue', 'utf8')
    expect(source).toContain("useSeoMeta({ title: 'Despachos · Remessas · Via Reversa' })")
    expect(source).toContain('title="Despachos"')
    expect(source).not.toMatch(/title="DEV OUT"/)
    expect(source).not.toMatch(/'DEV OUT/)
  })

  it('renomeia título do detalhe DEV IN para Caixa #id', () => {
    const source = readFileSync('app/pages/devolucoes/dev-in/[id]/index.vue', 'utf8')
    expect(source).toContain('`Caixa #${boxId.value} · Remessas · Via Reversa`')
    expect(source).toContain('`Caixa #${box.id}`')
    expect(source).not.toMatch(/DEV IN #/)
  })

  it('renomeia título do detalhe DEV OUT para Despacho #id', () => {
    const source = readFileSync('app/pages/devolucoes/dev-out/[id].vue', 'utf8')
    expect(source).toContain('`Despacho #${lotId.value} · Remessas · Via Reversa`')
    expect(source).toContain('`Despacho #${lot.id}`')
    expect(source).not.toMatch(/DEV OUT #/)
  })

  it('não altera acompanhamento.vue (fora do escopo deste plano)', () => {
    const source = readFileSync('app/pages/devolucoes/acompanhamento.vue', 'utf8')
    expect(source).toContain('Acompanhamento de Devoluções')
    expect(source).toContain('Visão agregada DEV IN — caixas, itens, período e transportadores')
  })
})
