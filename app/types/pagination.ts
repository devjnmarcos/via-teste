/**
 * Contrato do primitive Pagination do design system Via Reversa.
 */

export interface PaginationProps {
  /** Página atual (1-based). */
  page: number
  /** Itens por página. */
  pageSize: number
  /** Total de registros no escopo (após filtros). */
  total: number
  /** Opções do seletor de tamanho. Default: [10, 25, 50]. */
  pageSizeOptions?: number[]
  /** Mostrar seletor de page size. Default: true. */
  showPageSize?: boolean
  /** Mostrar texto “Exibindo a–b de total”. Default: true. */
  showSummary?: boolean
  /** Desabilitar controles (loading). */
  disabled?: boolean
  /** Aria label do nav. Default: "Paginação". */
  ariaLabel?: string
}

export type PaginationPageItem = number | 'ellipsis'
