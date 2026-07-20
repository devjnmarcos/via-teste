export const flowHandlers = Object.fromEntries(['auth', 'home', 'pedidos', 'operacao', 'devolucoes', 'faturas', 'cadastros', 'analytics', 'configuracoes', 'loja', 'publico'].map((family) => [family, async ({ page, captureState, recordStep }) => {
  recordStep(`Handler ${family} iniciado`)
  const buttons = page.getByRole('button')
  const count = await buttons.count().catch(() => 0)
  if (count > 0 && family !== 'publico') {
    const first = buttons.first()
    const label = await first.innerText().catch(() => '')
    if (label && /filtro|detalhe|atualizar|abrir|mais|ações/i.test(label)) {
      await first.click().catch(() => {})
      await captureState('interactive-first-action')
      await page.keyboard.press('Escape').catch(() => {})
    }
  }
}]))
