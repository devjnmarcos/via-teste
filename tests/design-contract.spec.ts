import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('design system oficial', () => {
  const css = readFileSync('app/assets/css/main.css', 'utf8')

  it('expõe as cores medidas da suíte V12', () => {
    expect(css).toContain('--color-via-blue-500: oklch(62% 0.19 254)')
    expect(css).toContain('--color-via-neutral-900: oklch(25% 0.025 253)')
    expect(css).toContain('--color-via-red-500: oklch(59% 0.19 27)')
  })

  it('preserva a tipografia e o raio oficiais', () => {
    expect(css).toContain('--font-sans: "Segoe UI", Roboto, Arial, sans-serif')
    expect(css).toContain('--text-via-body: 0.8125rem')
    expect(css).toContain('--text-via-helper: 0.6875rem')
    expect(css).toContain('--ui-radius: 0.375rem')
  })

  it('não habilita tema escuro na fundação', () => {
    expect(css).not.toMatch(/\.dark\s*\{/)
  })

  it('proíbe os clichês visuais registrados', () => {
    expect(css).toContain('--shadow-shell:')
    expect(css).toContain('--radius-data: 0px')
    expect(css).toContain('--radius-control: 6px')
  })
})
