import { chromium } from 'playwright'

export const viewports = {
  desktop: { width: 1600, height: 1000 },
  validation: { width: 1366, height: 768 },
  mobile: { width: 390, height: 844 },
  tv: { width: 1920, height: 1080 }
}

export const demoCredentials = {
  email: 'demo@viareversa.com.br',
  password: 'demo123'
}

export async function createBrowser() {
  return chromium.launch({ headless: true })
}

export async function loginDemo(page, baseUrl) {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' })
  const email = page.getByLabel(/e-mail|email/i).first()
  const password = page.getByLabel(/senha|password/i).first()
  await email.fill(demoCredentials.email)
  await password.fill(demoCredentials.password)
  await page.getByRole('button', { name: /entrar|acessar|login/i }).first().click()
  await page.waitForTimeout(150)
}

export async function waitForStablePage(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {})
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  }).catch(() => {})
}

export async function collectRuntimeEvidence(page, requestLog, consoleLog, pageErrors) {
  return page.evaluate(() => {
    const shell = (selector) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const style = getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return {
        selector,
        tag: element.tagName.toLowerCase(),
        classes: element.className,
        text: element.textContent?.trim().slice(0, 200),
        box: { x: box.x, y: box.y, width: box.width, height: box.height },
        styles: { display: style.display, color: style.color, backgroundColor: style.backgroundColor, fontFamily: style.fontFamily, fontSize: style.fontSize, lineHeight: style.lineHeight, borderRadius: style.borderRadius, boxShadow: style.boxShadow }
      }
    }
    const variables = Object.fromEntries([...getComputedStyle(document.documentElement)].filter((name) => name.startsWith('--via-')).map((name) => [name, getComputedStyle(document.documentElement).getPropertyValue(name).trim()]))
    return {
      url: location.href,
      title: document.title,
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      landmarks: ['aside', 'header', 'main', 'nav', '[role="dialog"]', 'table', 'form'].map(shell).filter(Boolean),
      variables,
      links: [...document.querySelectorAll('a[href]')].slice(0, 100).map((link) => ({ text: link.textContent?.trim(), href: link.getAttribute('href') })),
      buttons: [...document.querySelectorAll('button')].slice(0, 100).map((button) => ({ text: button.textContent?.trim(), disabled: button.disabled, aria: button.getAttribute('aria-label') })),
      components: [...document.querySelectorAll('[class]')].map((element) => [...element.classList].filter((value) => /via|app-|metrics|order|chart|table|sidebar|topbar/i.test(value))).flat().filter(Boolean).slice(0, 200)
    }
  }).then((result) => ({ ...result, requestLog, consoleLog, pageErrors }))
}
