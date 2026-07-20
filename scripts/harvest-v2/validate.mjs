import path from 'node:path'
import { validateCoverage } from './report.mjs'

const index = process.argv.indexOf('--input')
const input = path.resolve(process.cwd(), index >= 0 ? process.argv[index + 1] : 'output/playwright/harvest-v2')
const result = await validateCoverage(input)
console.log(JSON.stringify({ valid: result.valid, errors: result.errors, total: result.coverage.total, captured: result.coverage.captured, failed: result.coverage.failed }, null, 2))
if (!result.valid) process.exitCode = 1
