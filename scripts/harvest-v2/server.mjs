import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'

function freePort() {
  return new Promise((resolve, reject) => {
    const server = http.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
  })
}

export async function startDevServer({ cwd, logDir }) {
  const port = await freePort()
  const stdout = fs.createWriteStream(`${logDir}/nuxt.stdout.log`, { encoding: 'utf8' })
  const stderr = fs.createWriteStream(`${logDir}/nuxt.stderr.log`, { encoding: 'utf8' })
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const commandArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm run dev -- --host 127.0.0.1 --port ${port}`]
    : ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)]
  const child = spawn(command, commandArgs, { cwd, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  const url = `http://127.0.0.1:${port}`
  const deadline = Date.now() + 120000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok || response.status < 500) return { child, url, port, stdout, stderr }
    } catch {
      // O servidor ainda está compilando ou a porta ainda não está pronta.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  child.kill()
  throw new Error(`Nuxt não respondeu em ${url}; consulte ${logDir}`)
}

export async function stopDevServer(server) {
  if (!server?.child || server.child.killed) return
  if (process.platform === 'win32') {
    const killer = spawn('cmd.exe', ['/d', '/s', '/c', `taskkill /PID ${server.child.pid} /T /F`], { stdio: 'ignore', windowsHide: true })
    await new Promise((resolve) => killer.once('close', resolve))
  } else {
    server.child.kill('SIGTERM')
  }
  server.stdout?.close()
  server.stderr?.close()
}
