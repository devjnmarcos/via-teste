import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const pagesRoot = path.join('app', 'pages')

function walk(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.vue')) out.push(full)
  }
  return out
}

describe('imports em pages/', () => {
  it('usa alias ~/ para data|types|utils|components|composables (evita depth bugs e chunk-reload)', () => {
    const relative: string[] = []

    for (const file of walk(pagesRoot)) {
      const src = fs.readFileSync(file, 'utf8')
      const importRe = /from\s+['"]((?:\.\.\/)+(?:data|types|utils|components|composables)[^'"]*)['"]/g
      let match: RegExpExecArray | null
      while ((match = importRe.exec(src))) {
        relative.push(`${file.replaceAll('\\', '/')}: ${match[1]}`)
      }
    }

    expect(relative).toEqual([])
  })

  it('resolve arquivos apontados por ~/data|types|utils|components|composables', () => {
    const missing: string[] = []
    const importRe = /from\s+['"]~\/(data|types|utils|components|composables)([^'"]*)['"]/g

    for (const file of walk(pagesRoot)) {
      const src = fs.readFileSync(file, 'utf8')
      let match: RegExpExecArray | null
      while ((match = importRe.exec(src))) {
        const spec = path.join('app', match[1] + match[2])
        const candidates = [
          spec,
          `${spec}.ts`,
          `${spec}.js`,
          `${spec}.vue`,
          path.join(spec, 'index.ts'),
          path.join(spec, 'index.js'),
          path.join(spec, 'index.vue')
        ]
        if (!candidates.some((c) => fs.existsSync(c))) {
          missing.push(`${file.replaceAll('\\', '/')}: ~/${match[1]}${match[2]}`)
        }
      }
    }

    expect(missing).toEqual([])
  })
})
