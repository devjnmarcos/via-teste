import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppBreadcrumbs from '../app/components/app/AppBreadcrumbs.vue'
import AppSidebar from '../app/components/app/AppSidebar.vue'
import MetricsStrip from '../app/components/app/MetricsStrip.vue'
import StatusLabel from '../app/components/app/StatusLabel.vue'

describe('primitives operacionais', () => {
  it('renderiza status com texto e marcador sem badge decorativo', async () => {
    const wrapper = await mountSuspended(StatusLabel, {
      props: { status: 'supportMissing' }
    })

    expect(wrapper.text()).toContain('Ponto de apoio não identificado')
    expect(wrapper.find('[data-status-dot]').exists()).toBe(true)
  })

  it('renderiza métricas numa faixa contínua', async () => {
    const wrapper = await mountSuspended(MetricsStrip, {
      props: {
        metrics: [
          { value: 146, label: 'Ativos agora', note: 'pedidos em andamento' },
          { value: 7, label: 'Ocorrências', note: '3 fora do SLA', tone: 'danger' }
        ]
      }
    })

    expect(wrapper.findAll('[data-metric-item]')).toHaveLength(2)
    expect(wrapper.classes()).toContain('metrics-strip')
    expect(wrapper.attributes('style')).toContain('repeat(2, minmax(0, 1fr))')
  })

  it('respeita maxPerRow sem gap entre cards', async () => {
    const wrapper = await mountSuspended(MetricsStrip, {
      props: {
        maxPerRow: 3,
        metrics: [
          { value: 1, label: 'A', note: 'n' },
          { value: 2, label: 'B', note: 'n' },
          { value: 3, label: 'C', note: 'n' },
          { value: 4, label: 'D', note: 'n' },
          { value: 5, label: 'E', note: 'n' },
          { value: 6, label: 'F', note: 'n' }
        ]
      }
    })

    expect(wrapper.findAll('[data-metric-item]')).toHaveLength(6)
    expect(wrapper.attributes('style')).toContain('repeat(3, minmax(0, 1fr))')
    expect(wrapper.classes()).toContain('gap-0')
  })
})

describe('AppBreadcrumbs', () => {
  it('liga ancestrais com NuxtLink e mantém a página atual sem link', async () => {
    const wrapper = await mountSuspended(AppBreadcrumbs, {
      props: {
        items: [
          { label: 'Cadastros', to: '/cadastros' },
          { label: 'SLA' }
        ]
      }
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Cadastros')
    expect(link.attributes('href')).toBe('/cadastros')
    expect(wrapper.find('[aria-current="page"]').text()).toBe('SLA')
    expect(wrapper.find('[aria-current="page"]').element.tagName).toBe('SPAN')
  })
})

describe('AppSidebar accordion', () => {
  it('abre e fecha Cadastros pelo rótulo do grupo', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      route: '/'
    })

    const toggle = wrapper.get('[data-testid="nav-group-cadastros"]')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="nav-submenu-cadastros"]').exists()).toBe(false)

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="nav-submenu-cadastros"]').exists()).toBe(true)
    expect(toggle.find('.nav-chevron--open').exists()).toBe(true)

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="nav-submenu-cadastros"]').exists()).toBe(false)
  })

  it('abre automaticamente em rota filha e ainda permite fechar', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      route: '/cadastros/sla'
    })

    const toggle = wrapper.get('[data-testid="nav-group-cadastros"]')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="nav-submenu-cadastros"]').exists()).toBe(true)
    expect(wrapper.get('a[href="/cadastros/sla"]').attributes('aria-current')).toBe('page')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="nav-submenu-cadastros"]').exists()).toBe(false)
  })

  it('abre e fecha Devoluções pelo rótulo do grupo', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      route: '/'
    })

    const toggle = wrapper.get('[data-testid="nav-group-devolucoes"]')

    expect(wrapper.find('[data-testid="nav-submenu-devolucoes"]').exists()).toBe(false)

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="nav-submenu-devolucoes"]').exists()).toBe(true)
    expect(wrapper.get('a[href="/devolucoes/dev-in"]').exists()).toBe(true)

    await toggle.trigger('click')
    expect(wrapper.find('[data-testid="nav-submenu-devolucoes"]').exists()).toBe(false)
  })
})
