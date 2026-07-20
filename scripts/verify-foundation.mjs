import { existsSync, readFileSync } from 'node:fs'

const required = [
  'package.json',
  'nuxt.config.ts',
  'app/app.vue',
  'app/app.config.ts',
  'app/assets/css/main.css',
  'app/layouts/default.vue',
  'app/pages/index.vue',
  'app/pages/operacao/ao-vivo.vue',
  'app/pages/operacoes/[slug].vue',
  'app/pages/pedidos/index.vue',
  'app/pages/pedidos/[id].vue',
  'AGENTS.md',
  'CLAUDE.md',
  'DESIGN_SYSTEM.md'
]

for (const path of required) {
  if (!existsSync(path)) {
    throw new Error(`Arquivo obrigatório ausente: ${path}`)
  }
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

if (!pkg.dependencies?.nuxt?.startsWith('^4.')) throw new Error('Nuxt 4 não configurado')
if (!pkg.dependencies?.['@nuxt/ui']?.startsWith('^4.')) throw new Error('Nuxt UI 4 não configurado')
if (!pkg.dependencies?.tailwindcss?.startsWith('^4.')) throw new Error('Tailwind CSS 4 não configurado')
if (!pkg.dependencies?.['@iconify-json/lucide']) throw new Error('Lucide via Iconify não configurado')

const css = readFileSync('app/assets/css/main.css', 'utf8')
for (const token of [
  '--color-via-blue-500: oklch(62% 0.19 254)',
  '--font-sans: "Segoe UI", Roboto, Arial, sans-serif',
  '--text-via-body: 0.8125rem',
  '--ui-radius: 0.375rem'
]) {
  if (!css.includes(token)) throw new Error(`Token oficial ausente: ${token}`)
}

const forbidden = /shadcn|Radix|React|\bPA\b/i
for (const path of ['AGENTS.md', 'CLAUDE.md', 'DESIGN_SYSTEM.md']) {
  if (forbidden.test(readFileSync(path, 'utf8'))) {
    throw new Error(`Referência incompatível encontrada em ${path}`)
  }
}

console.log(JSON.stringify({
  status: 'ok',
  arquivosObrigatorios: required.length,
  stack: ['Nuxt 4', 'Nuxt UI 4', 'Tailwind CSS 4', 'Lucide via Iconify']
}, null, 2))
