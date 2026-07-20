import { describe, expect, it } from 'vitest'
import { isTypedColumn, type DataTableColumnDef } from '../app/types/data-table'
import { cadastrosNavigation } from '../app/components/app/navigation'

describe('contrato DataTable tipada', () => {
  it('discrimina colunas tipadas vs legado', () => {
    const typed: DataTableColumnDef = { type: 'text', key: 'name', label: 'Nome' }
    const legacy: DataTableColumnDef = { key: 'name', label: 'Nome' }
    expect(isTypedColumn(typed)).toBe(true)
    expect(isTypedColumn(legacy)).toBe(false)
  })

  it('aceita os tipos mínimos do pacote completo', () => {
    const columns: DataTableColumnDef[] = [
      { type: 'text', key: 'name', label: 'Nome' },
      { type: 'switch', key: 'active', label: 'Ativo' },
      { type: 'select', key: 'uf', label: 'UF', options: [{ label: 'SP', value: 'SP' }] },
      { type: 'actions', key: 'actions', items: [{ key: 'edit', label: 'Editar' }] },
      { type: 'expand', key: 'expand' }
    ]
    expect(columns.every(isTypedColumn)).toBe(true)
    expect(columns.map((column) => (isTypedColumn(column) ? column.type : null))).toEqual([
      'text',
      'switch',
      'select',
      'actions',
      'expand'
    ])
  })
})

describe('menu Cadastros', () => {
  it('expõe 12 itens na ordem e labels do legado', () => {
    expect(cadastrosNavigation.map((item) => item.label)).toEqual([
      'SLA',
      'Fretes',
      'Empresas',
      'Contas',
      'Usuários',
      "Aprovações PA's",
      'Ocorrências',
      'Ocorrências Externas',
      'Regiões',
      'Feriados',
      'Produtos',
      'Templates Chatbot'
    ])
  })

  it('usa rotas sob /cadastros/', () => {
    expect(cadastrosNavigation.every((item) => item.to.startsWith('/cadastros/'))).toBe(true)
  })
})
