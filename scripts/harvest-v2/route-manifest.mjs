import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const pagesRoot = path.join(root, 'app', 'pages')

function walk(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : fullPath.endsWith('.vue') ? [fullPath] : []
  })
}

function pageToPath(file) {
  const relative = path.relative(pagesRoot, file).replaceAll('\\', '/')
  const withoutExtension = relative.replace(/\.vue$/, '')
  const segments = withoutExtension.split('/').filter(Boolean)
  const routeSegments = segments
    .filter((segment) => !/^\([^)]*\)$/.test(segment))
    .map((segment) => segment === 'index' ? '' : segment)
  const route = `/${routeSegments.filter(Boolean).join('/')}`
  return route === '/' ? '/' : route
}

function familyFor(route) {
  const segment = route.split('/').filter(Boolean)[0]
  const lookup = {
    auth: 'auth', login: 'auth', 'cadastro-motoboy': 'auth', 'cadastro-transportador': 'auth',
    c: 'publico', checkout: 'publico', publico: 'publico',
    pedidos: 'pedidos', operacao: 'operacao', operacoes: 'operacao',
    devolucoes: 'devolucoes', faturas: 'faturas', cadastros: 'cadastros',
    dashboards: 'analytics', resumos: 'analytics', sla: 'analytics',
    configuracoes: 'configuracoes', calendario: 'analytics', loja: 'loja',
    transportadores: 'cadastros', 'pontos-de-apoio': 'cadastros'
  }
  return lookup[segment] ?? 'home'
}

function accessFor(route) {
  if (route === '/login' || route.startsWith('/auth/') || route === '/c' || route === '/checkout' || route.startsWith('/publico/')) return 'public'
  if (route === '/cadastro-motoboy' || route === '/cadastro-transportador' || route === '/excluir-conta') return 'public'
  return 'auth'
}

function substitute(route) {
  const replacements = {
    '/pedidos/[id]': '/pedidos/48219',
    '/pedidos/[id]/editar': '/pedidos/48219/editar',
    '/pedidos/[id]/checkout': '/pedidos/48219/checkout',
    '/devolucoes/dev-in/[id]': '/devolucoes/dev-in/1042',
    '/devolucoes/dev-in/[id]/ticket': '/devolucoes/dev-in/1042/ticket',
    '/devolucoes/dev-out/[id]': '/devolucoes/dev-out/220',
    '/faturas/[id]': '/faturas/9001',
    '/faturas/nova/[kind]': '/faturas/nova/a-receber',
    '/operacao/lotes/[id]': '/operacao/lotes/1208',
    '/operacao/rotas/[id]': '/operacao/rotas/rt-101',
    '/cadastros/[kind]': '/cadastros/empresas',
    '/cadastros/[kind]/novo': '/cadastros/empresas/novo',
    '/cadastros/[kind]/[id]': '/cadastros/empresas/emp-1',
    '/publico/caixa/[id]': '/publico/caixa/1038',
    '/publico/etiqueta-caixa/[id]': '/publico/etiqueta-caixa/1038',
    '/publico/etiqueta-pedido/[id]': '/publico/etiqueta-pedido/48219',
    '/publico/pedido/[hash]': '/publico/pedido/demo-share-53101',
    '/operacoes/[slug]': '/operacoes/reversa'
  }
  if (replacements[route]) return replacements[route]
  return route.replace(/\[\[?\.\.\.[^\]]+\]?\]|\[[^\]]+\]/g, 'demo')
}

function classify(file, route) {
  const source = fs.readFileSync(file, 'utf8')
  const redirect = /await\s+navigateTo\(/.test(source) && !/<template[\s\S]*>\s*<\/?template>/.test(source)
  const container = source.trim().length < 180 || /^\/((cadastros|dashboards|configuracoes|devolucoes|faturas))$/.test(route)
  return { redirect: redirect ? 'redirect' : container ? 'container' : null, sourceBytes: Buffer.byteLength(source) }
}

const routeManifest = walk(pagesRoot)
  .map((file) => {
    const route = pageToPath(file)
    const classification = classify(file, route)
    const family = familyFor(route)
    const access = classification.redirect ?? accessFor(route)
    return {
      id: route === '/' ? 'home' : route.replace(/^\//, '').replaceAll('/', '--').replaceAll('[', '').replaceAll(']', '') || 'home',
      path: route,
      url: substitute(route),
      family,
      access,
      source: path.relative(root, file).replaceAll('\\', '/'),
      states: ['base'],
      mobileFamilyCapture: ['home', 'auth', 'publico', 'loja'].includes(family),
      handler: family,
      sourceBytes: classification.sourceBytes
    }
  })
  .sort((a, b) => a.path.localeCompare(b.path, 'pt-BR'))

export { routeManifest, pagesRoot, substitute }
