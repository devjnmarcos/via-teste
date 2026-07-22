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
  it('expõe 13 itens na ordem final (Pedidos + 12 cadastros + Operações — Feature Flags/Cargos migraram para Configurações)', () => {
    expect(cadastrosNavigation.map((item) => item.label)).toEqual([
      'Pedidos',
      'SLA',
      'Fretes',
      'Empresas',
      'Operadores',
      'Usuários',
      "Aprovações PA's",
      'Ocorrências',
      'Regiões',
      'Feriados',
      'Produtos',
      'Templates Chatbot',
      'Operações'
    ])
  })

  it('usa rotas sob /cadastros/, exceto Pedidos (que mantém /pedidos)', () => {
    const [pedidos, ...resto] = cadastrosNavigation
    expect(pedidos?.to).toBe('/pedidos')
    expect(resto.every((item) => item.to.startsWith('/cadastros/'))).toBe(true)
  })
})
