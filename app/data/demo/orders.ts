import type { AttentionItem, Metric, Order } from '../../types/domain'

const baseOrders: Order[] = [
  {
    id: '48219', href: '/pedidos/48219', client: 'Renner', operation: 'Troca', state: 'RJ', status: 'backOrder',
    supportPoint: 'Não atribuído', responsible: 'Aguardando reposição', region: 'RJ', createdAt: '15/07 19:02', updatedAt: 'há 14 min',
    stageDuration: '23 min', sla: 'Em risco', slaTone: 'warning', labelPrinted: false, chatbotEligible: false,
    items: 2, occurrences: 0, evidences: 0, scheduling: 0,
    events: [], establishments: []
  },
  {
    id: '48208', href: '/pedidos/48208', client: 'Amazon BR', operation: 'Reversa', state: 'SP', status: 'assigned',
    supportPoint: 'Ponto de apoio Centro', responsible: 'João R.', region: 'SP', createdAt: '15/07 14:55', updatedAt: 'há 8 min',
    stageDuration: '4 min', sla: '5h40', slaTone: 'success', labelPrinted: false, chatbotEligible: true,
    items: 1, occurrences: 0, evidences: 1, scheduling: 0,
    events: [], establishments: []
  },
  {
    id: '48201', href: '/pedidos/48201', client: 'Netshoes', operation: 'Troca', state: 'PR', status: 'stock',
    supportPoint: 'Ponto de apoio Zona Sul', responsible: 'Camila F.', region: 'PR', createdAt: '15/07 11:30', updatedAt: 'há 19 min',
    stageDuration: '1h12', sla: '8h05', slaTone: 'success', labelPrinted: true, chatbotEligible: false,
    items: 1, occurrences: 0, evidences: 0, scheduling: 1,
    events: [], establishments: []
  },
  {
    id: '48197', href: '/pedidos/48197', client: 'Renner', operation: 'Reversa', state: 'RS', status: 'supportMissing',
    supportPoint: 'Não atribuído', responsible: 'Aguardando roteirização', region: 'RS', createdAt: '15/07 09:18', updatedAt: 'há 22 min',
    stageDuration: '22 min', sla: 'Em risco', slaTone: 'warning', labelPrinted: false, chatbotEligible: false,
    items: 1, occurrences: 0, evidences: 0, scheduling: 0,
    events: [], establishments: []
  },
  {
    id: '48190', href: '/pedidos/48190', client: 'Casas Bahia', operation: 'Reversa', state: 'BA', status: 'new',
    supportPoint: 'Não atribuído', responsible: 'Triagem', region: 'BA', createdAt: '15/07 08:02', updatedAt: 'há 11 min',
    stageDuration: '11 min', sla: '12h00', slaTone: 'success', labelPrinted: false, chatbotEligible: true,
    items: 1, occurrences: 0, evidences: 0, scheduling: 0,
    events: [], establishments: []
  }
]

export const featuredOrder: Order = {
  id: '48224',
  href: '/pedidos/48224',
  client: 'Casas Bahia',
  operation: 'Reversa',
  state: 'SP',
  status: 'occurrence',
  supportPoint: 'Ponto de apoio Zona Sul',
  responsible: 'Ana Duarte',
  region: 'SP',
  createdAt: '16/07 às 07:40',
  updatedAt: '09:14',
  stageDuration: '18 min',
  sla: 'Expirado 1h18',
  slaTone: 'danger',
  labelPrinted: true,
  chatbotEligible: false,
  items: 1,
  occurrences: 3,
  evidences: 2,
  scheduling: 1,
  document: 'NF 883.192',
  externalOrder: '92014',
  address: 'Av. Paulista, 1578 · São Paulo · SP',
  transporter: 'Marcos L.',
  events: [
    { time: '07:40', name: 'Criado', description: 'Pedido recebido', tone: 'info' },
    { time: '07:41', name: 'Atribuído', description: 'Transportador definido', tone: 'info' },
    { time: '07:58', name: 'Em rota', description: 'Coleta iniciada', tone: 'info' },
    { time: '09:14', name: 'Ocorrência', description: 'Endereço não localizado', tone: 'danger' }
  ],
  establishments: [
    { role: 'Origem', name: 'Casas Bahia · Loja Paulista', detail: 'Av. Paulista, 1578' },
    { role: 'Ponto de apoio', name: 'Ponto de apoio Zona Sul', detail: 'Responsável: Ana Duarte' },
    { role: 'Destino', name: 'Centro de distribuição Cajamar', detail: 'Rod. Anhanguera, km 33' }
  ]
}

export const orders: Order[] = [baseOrders[0]!, baseOrders[1]!, baseOrders[2]!, baseOrders[3]!, baseOrders[4]!, featuredOrder]

export const liveOrders: Order[] = [
  {
    ...baseOrders[1]!, id: '48231', href: '/pedidos/48231', client: 'Renner', operation: 'Troca', status: 'route',
    supportPoint: 'Ponto de apoio Centro', responsible: 'Lucas M.', createdAt: 'hoje', updatedAt: '13:31', stageDuration: '11 min', sla: '43 min', slaTone: 'success'
  },
  {
    ...baseOrders[1]!, id: '48229', href: '/pedidos/48229', client: 'Amazon BR', operation: 'Reversa', status: 'assigned',
    supportPoint: 'Ponto de apoio Zona Sul', responsible: 'João R.', createdAt: 'hoje', updatedAt: '13:38', stageDuration: '4 min', sla: '1h22', slaTone: 'success'
  },
  featuredOrder,
  {
    ...baseOrders[2]!, id: '48222', href: '/pedidos/48222', client: 'Netshoes', operation: 'Troca', status: 'route', statusLabel: 'Coleta iniciada',
    supportPoint: 'Ponto de apoio Centro', responsible: 'Camila F.', updatedAt: '13:16', stageDuration: '26 min', sla: '36 min', slaTone: 'success'
  },
  {
    ...baseOrders[2]!, id: '48217', href: '/pedidos/48217', client: 'Centauro', operation: 'Reversa', status: 'stock',
    supportPoint: 'Centro SP', responsible: 'Ana P.', updatedAt: '12:30', stageDuration: '1h12', sla: '2h05', slaTone: 'success'
  }
]

export const liveMetrics: Metric[] = [
  { label: 'Ativos agora', value: 146, note: 'pedidos em andamento', icon: 'i-lucide-activity', tone: 'info' },
  { label: 'Em rota', value: 96, note: 'coletas em andamento', icon: 'i-lucide-route', tone: 'info' },
  { label: 'Ponto de apoio não identificado', value: 18, note: 'aguardando roteirização', icon: 'i-lucide-map-pin-off', tone: 'warning' },
  { label: 'Ocorrências abertas', value: 7, note: '3 fora do SLA', icon: 'i-lucide-triangle-alert', tone: 'danger' }
]

export const ordersMetrics: Metric[] = [
  { label: 'Não processado', value: 28, note: 'filtrar este status', icon: 'i-lucide-inbox', tone: 'warning' },
  { label: 'Ponto de apoio não identificado', value: 18, note: 'aguardando roteirização', icon: 'i-lucide-map-pin-off', tone: 'warning' },
  { label: 'Back Order', value: 42, note: 'aguardando reposição', icon: 'i-lucide-package-x', tone: 'warning' },
  { label: 'Ocorrências hoje', value: 7, note: '3 fora do SLA', icon: 'i-lucide-triangle-alert', tone: 'danger' }
]

export const attentionItems: AttentionItem[] = [
  { orderId: '48224', status: 'occurrence', description: 'Endereço não localizado pelo transportador.', timing: 'SLA expirado há 18 min' },
  { orderId: '48197', status: 'supportMissing', description: 'Pedido ainda não possui ponto de apoio definido.', timing: 'Aguardando há 22 min' },
  { orderId: '48219', status: 'backOrder', description: 'Previsão de reposição ainda não registrada.', timing: 'Atualizado há 14 min' },
  { orderId: '48228', status: 'route', label: 'Sem atualização', description: 'Rota ativa sem novo evento operacional.', timing: 'Último evento há 31 min' }
]
