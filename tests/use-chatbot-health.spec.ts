import { beforeEach, describe, expect, it } from 'vitest'
import { useChatbotHealth } from '../app/composables/useChatbotHealth'
import { useToast } from '../app/composables/useToast'

describe('useChatbotHealth', () => {
  beforeEach(() => {
    useToast().clear()
  })

  it('inicia online e alterna checkingHealth durante a verificação (mock)', async () => {
    const { chatbotOnline, checkingHealth, checkChatbotHealth } = useChatbotHealth()
    expect(chatbotOnline.value).toBe(true)

    const pending = checkChatbotHealth()
    expect(checkingHealth.value).toBe(true)

    await pending
    expect(checkingHealth.value).toBe(false)
    expect(chatbotOnline.value).toBe(true)

    const { toasts } = useToast()
    expect(toasts.value.at(-1)?.title).toBe('Chatbot verificado')
  })

  it('compartilha o mesmo estado entre chamadas (useState)', () => {
    const a = useChatbotHealth()
    const b = useChatbotHealth()

    a.checkingHealth.value = true
    expect(b.checkingHealth.value).toBe(true)
    a.checkingHealth.value = false
  })
})
