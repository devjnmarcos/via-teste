import fs from 'node:fs/promises'
import path from 'node:path'
import { createBrowser, loginDemo, waitForStablePage, collectRuntimeEvidence, viewports } from './browser.mjs'

const mkdir = (directory) => fs.mkdir(directory, { recursive: true })
const writeJson = (file, value) => fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')

export function routeSlug(route) {
  return (route === '/' ? 'home' : route).replace(/^\//, '').replace(/\[\.?\.?[^\]]+\]/g, (value) => value.replace(/[^a-z0-9]+/gi, '-')).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'
}

export const requiredArtifacts = () => ['screen.html', 'screen.png', 'flow.md']

function routeUrl(baseUrl, route) {
  return `${baseUrl}${route.url.startsWith('/') ? route.url : `/${route.url}`}`
}

function flowDocument(route, evidence, error) {
  const links = (evidence?.links ?? []).filter((link) => link.href).slice(0, 20).map((link) => `- [${link.text || link.href}](${link.href})`).join('\n') || '- Nenhum link interno visível no estado capturado.'
  return `# Fluxo — ${route.path}\n\n- Família: ${route.family}\n- Acesso: ${route.access}\n- Arquivo fonte: \`${route.source}\`\n- URL solicitada: \`${route.url}\`\n- URL final: \`${evidence?.url ?? 'não capturada'}\`\n- Estado: ${error ? 'falhou' : 'capturado'}\n\n## Pré-condições\n\n${route.access === 'public' ? 'Abrir contexto público isolado.' : 'Autenticar com a sessão demo antes de visitar a rota.'}\n\n## Passos observados\n\n1. Abrir a URL demo da rota.\n2. Aguardar DOM, fontes e rede estabilizarem.\n3. Registrar a tela base, links, ações, layout e evidências de runtime.\n4. Registrar estados interativos quando o handler da família encontrar uma ação aplicável.\n\n## Resultado\n\n${error ? `A captura encontrou: ${error}` : 'A tela foi renderizada e seus artefatos foram gravados.'}\n\n## Links visíveis\n\n${links}\n`
}

async function captureViewport(page, directory, name, viewport) {
  await page.setViewportSize(viewport)
  await waitForStablePage(page)
  if (name === 'desktop') {
    await fs.writeFile(path.join(directory, 'screen.html'), await page.content(), 'utf8')
    await fs.writeFile(path.join(directory, 'raw', 'dom.html'), await page.locator('body').evaluate((body) => body.outerHTML), 'utf8')
  }
  await page.screenshot({ path: path.join(directory, name === 'desktop' ? 'screen.png' : `${name}.png`), fullPage: true })
  return page
}

export async function captureRoutes({ routes, baseUrl, outputDir, familyMobile = true }) {
  await mkdir(outputDir)
  const browser = await createBrowser()
  const results = []
  const contexts = new Map()
  async function contextFor(route) {
    const kind = route.access === 'public' ? 'public' : 'auth'
    if (contexts.has(kind)) return contexts.get(kind)
    const context = await browser.newContext({ viewport: viewports.desktop, locale: 'pt-BR', colorScheme: 'light' })
    const page = await context.newPage()
    if (kind === 'auth') await loginDemo(page, baseUrl)
    contexts.set(kind, { context, page })
    return { context, page }
  }
  try {
    for (const route of routes) {
      const directory = path.join(outputDir, 'routes', routeSlug(route.path))
      await mkdir(path.join(directory, 'raw'))
      const { page } = await contextFor(route)
      const requestLog = []
      const consoleLog = []
      const pageErrors = []
      const onRequestFailed = (request) => {
        const failure = request.failure()?.errorText
        if (failure && failure !== 'net::ERR_ABORTED') requestLog.push({ url: request.url(), method: request.method(), failure })
      }
      const onResponse = (response) => { if (response.status() >= 400) requestLog.push({ url: response.url(), status: response.status() }) }
      const onConsole = (message) => { if (message.type() === 'error' || message.type() === 'warning') consoleLog.push({ type: message.type(), text: message.text() }) }
      const onPageError = (error) => pageErrors.push(String(error))
      page.on('requestfailed', onRequestFailed); page.on('response', onResponse); page.on('console', onConsole); page.on('pageerror', onPageError)
      let evidence = null
      let error = null
      try {
        await page.goto(routeUrl(baseUrl, route), { waitUntil: 'domcontentloaded', timeout: 30000 })
        await captureViewport(page, directory, 'desktop', viewports.desktop)
        await captureViewport(page, directory, 'validation-1366x768', viewports.validation)
        if (familyMobile && route.mobileFamilyCapture) await captureViewport(page, directory, 'mobile-390x844', viewports.mobile)
        evidence = await collectRuntimeEvidence(page, requestLog, consoleLog, pageErrors)
      } catch (captureError) {
        error = captureError instanceof Error ? captureError.message : String(captureError)
        await page.screenshot({ path: path.join(directory, 'error.png'), fullPage: true }).catch(() => {})
      }
      if (evidence) await writeJson(path.join(directory, 'raw', 'live-extract.json'), evidence)
      await writeJson(path.join(directory, 'raw', 'console.json'), consoleLog)
      await writeJson(path.join(directory, 'raw', 'network.json'), requestLog)
      await fs.writeFile(path.join(directory, 'flow.md'), flowDocument(route, evidence, error), 'utf8')
      results.push({ ...route, status: error ? 'failed' : 'captured', finalUrl: evidence?.url ?? null, files: error ? ['flow.md', 'error.png'] : ['screen.html', 'screen.png', 'validation-1366x768.png', ...(route.mobileFamilyCapture ? ['mobile-390x844.png'] : []), 'flow.md'], states: ['base'], error, consoleErrors: consoleLog.length, failedRequests: requestLog.length })
      page.off('requestfailed', onRequestFailed); page.off('response', onResponse); page.off('console', onConsole); page.off('pageerror', onPageError)
    }
  } finally {
    await Promise.all([...contexts.values()].map(({ context }) => context.close()))
    await browser.close()
  }
  return results
}
