/**
 * Opções mock dos modais de pedidos (agendamento em lote / import ocorrências).
 * Alinhado ao legado ViaOrders.vue — sem API nesta onda.
 */

export const schedulingChannelOptions = [
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'SMS', value: 'sms' },
  { label: 'E-mail', value: 'email' },
  { label: 'Push app', value: 'push' }
] as const

export const chatbotTemplateOptions = [
  { id: 'tpl-1', name: 'Agendamento padrão', requiresProduct: false },
  { id: 'tpl-2', name: 'Agendamento com produto', requiresProduct: true },
  { id: 'tpl-3', name: 'Reagendamento cortês', requiresProduct: false }
] as const

export const productOptions = [
  { id: 'prod-1', name: 'Embalagem reversa P' },
  { id: 'prod-2', name: 'Embalagem reversa M' },
  { id: 'prod-3', name: 'Kit coleta' }
] as const

export type SchedulingChannelValue = (typeof schedulingChannelOptions)[number]['value']
