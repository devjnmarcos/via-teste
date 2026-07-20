import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { routeManifest, substitute } from './route-manifest.mjs'
import { routeSlug, requiredArtifacts } from './capture.mjs'

test('manifesto tem rotas únicas e domínios principais', () => {
  const paths = routeManifest.map((route) => route.path)
  assert.equal(new Set(paths).size, paths.length)
  for (const route of ['/', '/login', '/pedidos', '/publico/consulta-pedido']) assert.ok(paths.includes(route), route)
  assert.ok(paths.some((route) => route.includes('[')))
})

test('substitui parâmetros e mantém contrato de artefatos', () => {
  assert.equal(substitute('/pedidos/[id]'), '/pedidos/48219')
  assert.equal(routeSlug('/pedidos/[id]'), 'pedidos-id')
  assert.deepEqual(requiredArtifacts(), ['screen.html', 'screen.png', 'flow.md'])
})

test('todos os arquivos fonte do manifesto existem', () => {
  for (const route of routeManifest) assert.ok(fs.existsSync(path.resolve(process.cwd(), route.source)), route.source)
})
