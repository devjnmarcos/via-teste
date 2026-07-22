import { useToast } from './useToast'

/**
 * Estado compartilhado de saúde do chatbot (mock) — usado pelos modais de
 * "Agendar em lote" e "Disparar chatbot" em app/pages/pedidos/index.vue.
 * Extraído para evitar duplicar a verificação entre os dois modais da
 * mesma página.
 */
export function useChatbotHealth() {
  const chatbotOnline = useState('chatbot-health-online', () => true)
  const checkingHealth = useState('chatbot-health-checking', () => false)

  async function checkChatbotHealth() {
    checkingHealth.value = true
    await new Promise((resolve) => setTimeout(resolve, 420))
    chatbotOnline.value = true
    checkingHealth.value = false
    useToast().info('Chatbot verificado', 'Serviço online (mock).')
  }

  return { chatbotOnline, checkingHealth, checkChatbotHealth }
}
