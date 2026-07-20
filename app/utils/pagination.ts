/**
 * Helpers puros de paginação — clamp, fatia e resumo (testáveis sem Vue).
 */

import type { PaginationPageItem } from '../types/pagination'

export const DEFAULT_PAGE_SIZE = 25
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const

export function totalPages(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}

export function clampPage(page: number, total: number, pageSize: number): number {
  const max = totalPages(total, pageSize)
  if (!Number.isFinite(page) || page < 1) return 1
  return Math.min(page, max)
}

export function pageSliceRange(
  page: number,
  pageSize: number,
  total: number
): { start: number; end: number } {
  if (total <= 0) return { start: 0, end: 0 }
  const safePage = clampPage(page, total, pageSize)
  const start = (safePage - 1) * pageSize
  const end = Math.min(start + pageSize, total)
  return { start, end }
}

export function slicePage<T>(rows: T[], page: number, pageSize: number): T[] {
  const { start, end } = pageSliceRange(page, pageSize, rows.length)
  return rows.slice(start, end)
}

export function paginationSummary(page: number, pageSize: number, total: number): string {
  if (total <= 0) return '0 registros'
  const safePage = clampPage(page, total, pageSize)
  const { start, end } = pageSliceRange(safePage, pageSize, total)
  return `Exibindo ${start + 1}–${end} de ${total}`
}

/**
 * Janela de páginas com reticências (ex.: 1 … 4 5 6 … 12).
 */
export function visiblePageItems(page: number, total: number, pageSize: number): PaginationPageItem[] {
  const pages = totalPages(total, pageSize)
  const current = clampPage(page, total, pageSize)

  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1)
  }

  const items: PaginationPageItem[] = [1]
  const windowStart = Math.max(2, current - 1)
  const windowEnd = Math.min(pages - 1, current + 1)

  if (windowStart > 2) items.push('ellipsis')

  for (let value = windowStart; value <= windowEnd; value += 1) {
    items.push(value)
  }

  if (windowEnd < pages - 1) items.push('ellipsis')
  items.push(pages)
  return items
}
