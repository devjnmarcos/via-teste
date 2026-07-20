import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Pagination from '../app/components/app/Pagination.vue'
import {
  clampPage,
  paginationSummary,
  pageSliceRange,
  slicePage,
  totalPages,
  visiblePageItems
} from '../app/utils/pagination'

describe('utils/pagination', () => {
  it('calcula total de páginas e clampa ao reduzir o total', () => {
    expect(totalPages(128, 25)).toBe(6)
    expect(totalPages(0, 25)).toBe(1)
    expect(clampPage(6, 40, 25)).toBe(2)
    expect(clampPage(0, 40, 25)).toBe(1)
  })

  it('monta summary correto incluindo última página parcial', () => {
    expect(paginationSummary(1, 25, 128)).toBe('Exibindo 1–25 de 128')
    expect(paginationSummary(6, 25, 128)).toBe('Exibindo 126–128 de 128')
    expect(paginationSummary(1, 25, 0)).toBe('0 registros')
  })

  it('fatia a página atual', () => {
    const rows = Array.from({ length: 30 }, (_, i) => i + 1)
    expect(slicePage(rows, 2, 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    expect(pageSliceRange(2, 10, 30)).toEqual({ start: 10, end: 20 })
  })

  it('gera janela de páginas com reticências', () => {
    expect(visiblePageItems(1, 50, 10)).toEqual([1, 2, 3, 4, 5])
    expect(visiblePageItems(1, 200, 25)).toEqual([1, 2, 'ellipsis', 8])
    expect(visiblePageItems(5, 200, 25)).toContain('ellipsis')
  })
})

describe('Pagination component', () => {
  it('renderiza summary, ARIA e emite update:page', async () => {
    const wrapper = await mountSuspended(Pagination, {
      props: {
        page: 2,
        pageSize: 25,
        total: 128
      }
    })

    expect(wrapper.text()).toContain('Exibindo 26–50 de 128')
    expect(wrapper.find('nav[aria-label="Paginação"]').exists()).toBe(true)
    expect(wrapper.find('[aria-current="page"]').text()).toBe('2')
    expect(wrapper.find('button[aria-label="Página anterior"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Próxima página"]').exists()).toBe(true)

    await wrapper.find('button[aria-label="Próxima página"]').trigger('click')
    expect(wrapper.emitted('update:page')?.[0]).toEqual([3])
  })

  it('desabilita navegação quando disabled ou total zero', async () => {
    const wrapper = await mountSuspended(Pagination, {
      props: {
        page: 1,
        pageSize: 25,
        total: 0,
        disabled: true
      }
    })

    expect(wrapper.text()).toContain('0 registros')
    expect(wrapper.find('button[aria-label="Página anterior"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[aria-label="Próxima página"]').attributes('disabled')).toBeDefined()
  })

  it('emite update:page clampado ao reduzir o total', async () => {
    const wrapper = await mountSuspended(Pagination, {
      props: {
        page: 5,
        pageSize: 25,
        total: 120
      }
    })

    await wrapper.setProps({ total: 40 })
    expect(wrapper.emitted('update:page')?.at(-1)).toEqual([2])
  })
})
