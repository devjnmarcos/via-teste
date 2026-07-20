import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import AppSidebar from '../app/components/app/AppSidebar.vue'
import OrdersTable from '../app/components/orders/OrdersTable.vue'
import {
  assertNavigationIntegrity,
  navigationGroups,
  navigationItems,
  secondaryNavigation
} from '../app/components/app/navigation'
import { orders } from '../app/data/demo/orders'

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn()
}))

mockNuxtImport('navigateTo', () => navigateToMock)

describe('integridade da navegação da sidebar', () => {
  it('exige to/label/ícone em todos os destinos (inclui secundários e submenus)', () => {
    expect(assertNavigationIntegrity()).toBe(true)
    expect(secondaryNavigation.every((item) => Boolean(item.to))).toBe(true)
    expect(navigationGroups.every((group) => group.children.length > 0)).toBe(true)
  })

  it('renderiza a sidebar com os itens oficiais de operação', async () => {
    const wrapper = await mountSuspended(AppSidebar, { route: '/pedidos' })

    expect(wrapper.get('[data-testid="app-sidebar"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Via Reversa')
    for (const item of navigationItems) {
      expect(wrapper.get(`a[href="${item.to}"]`).exists()).toBe(true)
    }
    for (const item of secondaryNavigation) {
      expect(wrapper.get(`a[href="${item.to}"]`).exists()).toBe(true)
    }
  })
})

describe('OrdersTable → detalhe do pedido', () => {
  it('expõe href /pedidos/:id e navega ao clicar na linha', async () => {
    navigateToMock.mockClear()

    const order = orders[0]!
    const wrapper = await mountSuspended(OrdersTable, {
      props: { orders: [order] }
    })

    const row = wrapper.get(`[data-testid="order-row-${order.id}"]`)
    expect(row.attributes('data-order-href')).toBe(`/pedidos/${order.id}`)

    await row.trigger('click')
    expect(navigateToMock).toHaveBeenCalledWith(`/pedidos/${order.id}`, { external: false })
  })
})
