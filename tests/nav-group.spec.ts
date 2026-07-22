import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import NavGroup from '../app/components/app/NavGroup.vue'

const navLinkClass = 'nav-link'
const navLinkActiveClass = 'nav-link--active'
const navLinkSubClass = 'nav-link--sub'

const baseProps = {
  label: 'Exemplo',
  icon: 'i-lucide-folder',
  children: [
    { label: 'Item A', to: '/exemplo/a', icon: 'i-lucide-circle' },
    { label: 'Item B', to: '/exemplo/b', icon: 'i-lucide-circle' }
  ],
  testId: 'exemplo',
  navLinkClass,
  navLinkActiveClass,
  navLinkSubClass
}

describe('NavGroup', () => {
  it('inicia fechado quando nenhum filho está ativo e abre/fecha ao clicar', async () => {
    const wrapper = await mountSuspended(NavGroup, {
      route: '/',
      props: baseProps
    })

    const toggle = wrapper.get('[data-testid="nav-group-exemplo"]')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="nav-submenu-exemplo"]').exists()).toBe(false)

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="nav-submenu-exemplo"]').exists()).toBe(true)
    expect(wrapper.get('a[href="/exemplo/a"]').exists()).toBe(true)
    expect(toggle.find('.nav-chevron--open').exists()).toBe(true)

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="nav-submenu-exemplo"]').exists()).toBe(false)
  })

  it('inicia aberto quando a rota atual é filha de um item do grupo', async () => {
    const wrapper = await mountSuspended(NavGroup, {
      route: '/exemplo/a',
      props: baseProps
    })

    const toggle = wrapper.get('[data-testid="nav-group-exemplo"]')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('a[href="/exemplo/a"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('a[href="/exemplo/b"]').attributes('aria-current')).toBeUndefined()
  })
})
