/**
 * Elegibilidade e mutação em lote para as ações "Gerar etiqueta" e
 * "Disparar chatbot" na listagem de pedidos.
 * Migrado de app/pages/operacao/expedicao.vue e
 * app/pages/operacao/disparo-chatbot.vue — agora opera sobre os pedidos
 * reais da listagem (via `Order`), não mais sobre fixtures isoladas.
 */
import type { Order } from '../types/domain'

export interface BulkSelectionSplit {
  eligible: string[]
  ineligible: string[]
}

/** Elegível para etiqueta enquanto não tiver sido impressa ainda. */
export function isLabelPrintable(order: Order): boolean {
  return order.labelPrinted !== true
}

/** Elegível para disparo de chatbot só quando explicitamente marcado. */
export function isChatbotDispatchable(order: Order): boolean {
  return order.chatbotEligible === true
}

/**
 * Divide os ids selecionados entre elegíveis e ignorados segundo `predicate`.
 * Ids que não existem em `orders` são descartados silenciosamente.
 */
export function splitEligibleSelection(
  orders: Order[],
  selectedIds: string[],
  predicate: (order: Order) => boolean
): BulkSelectionSplit {
  const eligible: string[] = []
  const ineligible: string[] = []
  for (const id of selectedIds) {
    const order = orders.find((item) => item.id === id)
    if (!order) continue
    if (predicate(order)) eligible.push(id)
    else ineligible.push(id)
  }
  return { eligible, ineligible }
}

/** Marca os pedidos elegíveis (ids) como já impressos. Retorna quantos mudaram. */
export function markOrdersLabelPrinted(orders: Order[], ids: string[]): number {
  let count = 0
  for (const order of orders) {
    if (ids.includes(order.id) && isLabelPrintable(order)) {
      order.labelPrinted = true
      count += 1
    }
  }
  return count
}

/** Marca os pedidos elegíveis (ids) como disparados no chatbot. Retorna quantos mudaram. */
export function markOrdersChatbotDispatched(orders: Order[], ids: string[]): number {
  let count = 0
  for (const order of orders) {
    if (ids.includes(order.id) && isChatbotDispatchable(order)) {
      order.chatbotEligible = false
      count += 1
    }
  }
  return count
}
