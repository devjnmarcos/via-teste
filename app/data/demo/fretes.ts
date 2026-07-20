/**
 * Fixtures de Fretes para o piloto de Cadastros.
 * Alinhado ao AS-IS (Descrição, UF origem, cidade, KM, peso, dimensão).
 * Create/edit em modal — formulário curto.
 * Delete: confirmação simples (não crítico).
 */

export interface FreteRow extends Record<string, unknown> {
  id: string
  description: string
  originState: string
  originCity: string
  kmLimit: string
  weightMinKg: string
  weightMaxKg: string
  maxDimension: string
  active: boolean
}

export const fretesDemoRows: FreteRow[] = [
  {
    id: 'fr-1',
    description: 'Grande SP · leve',
    originState: 'SP',
    originCity: 'Cajamar',
    kmLimit: '80',
    weightMinKg: '0',
    weightMaxKg: '30',
    maxDimension: '60×60×60',
    active: true
  },
  {
    id: 'fr-2',
    description: 'Interior SP · médio',
    originState: 'SP',
    originCity: 'Campinas',
    kmLimit: '200',
    weightMinKg: '0',
    weightMaxKg: '80',
    maxDimension: '100×80×80',
    active: true
  },
  {
    id: 'fr-3',
    description: 'RM Rio · padrão',
    originState: 'RJ',
    originCity: 'Duque de Caxias',
    kmLimit: '120',
    weightMinKg: '0',
    weightMaxKg: '50',
    maxDimension: '80×80×80',
    active: false
  }
]

export function createEmptyFrete(): Omit<FreteRow, 'id'> {
  return {
    description: '',
    originState: 'SP',
    originCity: '',
    kmLimit: '100',
    weightMinKg: '0',
    weightMaxKg: '30',
    maxDimension: '60×60×60',
    active: true
  }
}
