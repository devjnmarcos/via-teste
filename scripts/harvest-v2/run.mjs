import fs from 'node:fs/promises'
import path from 'node:path'
import { routeManifest, substitute } from './route-manifest.mjs'
import { captureRoutes } from './capture.mjs'
import { startDevServer, stopDevServer } from './server.mjs'
import { generateReport } from './report.mjs'

const root = process.cwd()
const args = process.argv.slice(2)
const arg = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback
const outputDir = path.resolve(root, arg('--output', 'output/playwright/harvest-v2'))
const baseUrl = arg('--base-url', null)
const requested = arg('--routes', null)?.split(',').map((item) => item.trim())
const routes = routeManifest.filter((route) => !requested || requested.some((value) => route.path === value || substitute(route.path) === value))

await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(path.join(outputDir, 'run.json'), JSON.stringify({ startedAt: new Date().toISOString(), routeCount: routes.length, routes: routes.map((route) => route.path) }, null, 2), 'utf8')
let server = null
try {
  server = baseUrl ? { url: baseUrl } : await startDevServer({ cwd: root, logDir: outputDir })
  const results = await captureRoutes({ routes, baseUrl: server.url, outputDir })
  await fs.mkdir(path.join(outputDir, 'manifest'), { recursive: true })
  await fs.writeFile(path.join(outputDir, 'manifest', 'routes.json'), JSON.stringify(routeManifest, null, 2), 'utf8')
  const coverage = { generatedAt: new Date().toISOString(), total: results.length, captured: results.filter((r) => r.status === 'captured').length, failed: results.filter((r) => r.status === 'failed').length, routes: results }
  await fs.writeFile(path.join(outputDir, 'manifest', 'coverage.json'), JSON.stringify(coverage, null, 2), 'utf8')
  await generateReport(outputDir, coverage)
  console.log(JSON.stringify({ outputDir, baseUrl: server.url, total: results.length, captured: coverage.captured, failed: coverage.failed }, null, 2))
} finally {
  await stopDevServer(server)
}
