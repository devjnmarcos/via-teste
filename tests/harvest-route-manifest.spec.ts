import { describe, expect, it } from 'vitest'
import { routeManifest } from '../scripts/harvest-v2/route-manifest.mjs'

describe('manifesto de harvest', () => {
  it('tem rotas únicas e cobre os domínios do front v2', () => {
    const paths = routeManifest.map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).toContain('/')
    expect(paths).toContain('/login')
    expect(paths).toContain('/pedidos')
    expect(paths).toContain('/publico/consulta-pedido')
    expect(paths.some((path) => path.includes('[id]'))).toBe(true)
  })
})
