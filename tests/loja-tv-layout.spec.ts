import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import LojaTvPage from '../app/pages/dashboards/loja-tv.vue'
import { dashboardsNavigation } from '../app/components/app/navigation'

const { setPageLayoutMock } = vi.hoisted(() => ({
  setPageLayoutMock: vi.fn()
}))

mockNuxtImport('setPageLayout', () => setPageLayoutMock)

describe('Loja (TV) — layout shell vs kiosk', () => {
  it('item da sidebar aponta para a rota embedded (sem fullscreen)', () => {
    const item = dashboardsNavigation.find((entry) => entry.to === '/dashboards/loja-tv')
    expect(item?.label).toBe('Loja (TV)')
    expect(item?.to).toBe('/dashboards/loja-tv')
    expect(item?.to).not.toContain('fullscreen')
  })

  it('não fixa layout tv em definePageMeta (sidebar do app autenticado)', () => {
    const src = fs.readFileSync(
      path.join('app', 'pages', 'dashboards', 'loja-tv.vue'),
      'utf8'
    )
    expect(src).not.toMatch(/definePageMeta\s*\(\s*\{[^}]*layout:\s*['"]tv['"]/)
    expect(src).toMatch(/setPageLayout\s*\(\s*isFullscreen\.value\s*\?\s*['"]tv['"]\s*:\s*['"]default['"]\s*\)/)
  })

  it('embedded: banner + layout default; fullscreen: layout tv sem banner', async () => {
    setPageLayoutMock.mockClear()

    const embedded = await mountSuspended(LojaTvPage, {
      route: '/dashboards/loja-tv'
    })
    expect(setPageLayoutMock).toHaveBeenCalledWith('default')
    expect(embedded.find('[data-testid="loja-tv-mode-banner"]').exists()).toBe(true)
    expect(embedded.text()).toContain('Abrir modo TV')

    setPageLayoutMock.mockClear()
    const fullscreen = await mountSuspended(LojaTvPage, {
      route: '/dashboards/loja-tv?fullscreen=1'
    })
    expect(setPageLayoutMock).toHaveBeenCalledWith('tv')
    expect(fullscreen.find('[data-testid="loja-tv-mode-banner"]').exists()).toBe(false)
    expect(fullscreen.text()).toContain('Voltar ao app')
  })
})
