import type { OrderDetailBundle } from '../../types/domain'

/**
 * Mocks tipados do detalhe do pedido.
 * Fonte: campos observados no legado (ViaOrderItemsTable, ViaOrderOccurrencesTable,
 * ViaOrderPhotos, ViaOrderScheduling, OrderHistory, ViaOrderMaterialsTable,
 * ViaOrderBarcode, locker/NFe em ViaOrder.vue). Substituir por API quando ligada.
 */
const featuredBundle: OrderDetailBundle = {
  orderId: '48224',
  items: [
    {
      id: 'oi-901',
      description: 'Smartphone Galaxy A54 128GB',
      serialNumber: 'SN-A54-882190',
      manufacturer: 'Samsung',
      category: 'Eletrônicos',
      quantity: 1,
      price: 'R$ 1.899,00',
      weightKg: '0,42'
    }
  ],
  occurrences: [
    {
      id: 'oo-301',
      description: 'Endereço não localizado',
      happenedAt: '16/07/2026 09:14',
      origin: 'Portal · Transportador',
      createdAt: '16/07/2026 09:15',
      tone: 'danger',
      canRemove: true
    },
    {
      id: 'oo-302',
      description: 'Tentativa de contato com destinatário',
      happenedAt: '16/07/2026 09:28',
      origin: 'Portal · Operação',
      createdAt: '16/07/2026 09:29',
      tone: 'warning'
    },
    {
      id: 'oo-303',
      description: 'Aguardando confirmação de endereço',
      happenedAt: '16/07/2026 09:45',
      origin: 'Sistema',
      createdAt: '16/07/2026 09:45',
      tone: 'info'
    }
  ],
  evidences: [
    {
      id: 'ev-11',
      filename: 'fachada-paulista.jpg',
      kind: 'foto',
      localization: 'Av. Paulista, 1578 · São Paulo',
      createdAt: '16/07/2026 09:16',
      author: 'Marcos L.'
    },
    {
      id: 'ev-12',
      filename: 'comprovante-tentativa.pdf',
      kind: 'documento',
      localization: 'Anexo operacional',
      createdAt: '16/07/2026 09:30',
      author: 'Ana Duarte'
    },
    {
      id: 'ev-13',
      filename: 'assinatura-destinatario.png',
      kind: 'assinatura',
      localization: 'Tentativa 1 · destinatário',
      createdAt: '16/07/2026 09:32',
      author: 'Marcos L.'
    }
  ],
  materials: [
    { id: 'mat-1', productName: 'Embalagem reversa M', quantity: 1 },
    { id: 'mat-2', productName: 'Lacre de segurança', quantity: 2 }
  ],
  barcodes: [
    {
      id: 'bc-1',
      barcode: '7891234567890',
      localization: 'Ponto de apoio Zona Sul',
      createdAt: '16/07/2026 07:55'
    },
    {
      id: 'bc-2',
      barcode: 'QR-EXP-48224-A1',
      localization: 'Expedição locker',
      createdAt: '16/07/2026 08:10'
    }
  ],
  locker: {
    expeditionAt: '16/07/2026 08:12',
    expeditionExtId: 'LKX-48224-EXP',
    expeditionQrcode: 'EXP-48224-QR',
    removalAt: 'Sem retirada',
    removalExtCode: 'RET-88421',
    removalQrcode: 'RET-48224-QR'
  },
  fiscal: {
    number: '452189',
    series: '1',
    orderId: '48224',
    accessKey: '35260714200166000187550010004521891000048224',
    volumeAmount: '1',
    value: 'R$ 1.899,00',
    itemsValue: 'R$ 1.899,00',
    emissionDate: '15/07/2026'
  },
  scheduling: [
    {
      id: 'sch-01',
      scheduledFor: '16/07/2026 14:30',
      window: '14:00 – 16:00',
      status: 'Pedido Agendado',
      channel: 'Link público /c',
      note: 'Janela confirmada pelo destinatário',
      tone: 'success'
    }
  ],
  history: [
    {
      id: 'vh-501',
      createdAt: '16/07/2026 09:45',
      description: 'Status alterado para Ocorrência',
      username: 'sistema'
    },
    {
      id: 'vh-500',
      createdAt: '16/07/2026 09:14',
      description: 'Ocorrência registrada: Endereço não localizado',
      username: 'Marcos L.'
    },
    {
      id: 'vh-499',
      createdAt: '16/07/2026 07:58',
      description: 'Pedido em rota — coleta iniciada',
      username: 'Ana Duarte'
    },
    {
      id: 'vh-498',
      createdAt: '16/07/2026 07:41',
      description: 'Transportador atribuído: Marcos L.',
      username: 'roteirização'
    },
    {
      id: 'vh-497',
      createdAt: '16/07/2026 07:40',
      description: 'Pedido criado',
      username: 'integração Casas Bahia'
    }
  ]
}

const emptyBundle = (orderId: string): OrderDetailBundle => ({
  orderId,
  items: [],
  occurrences: [],
  evidences: [],
  materials: [],
  barcodes: [],
  locker: null,
  fiscal: null,
  scheduling: [],
  history: []
})

const partialBundles: Record<string, Partial<OrderDetailBundle>> = {
  '48208': {
    items: [
      {
        id: 'oi-810',
        description: 'Kit devolução logística',
        serialNumber: 'SN-KIT-120',
        manufacturer: 'Amazon',
        category: 'Embalagem',
        quantity: 1,
        price: 'R$ 45,00',
        weightKg: '1,20'
      }
    ],
    evidences: [
      {
        id: 'ev-80',
        filename: 'coleta-centro.jpg',
        kind: 'foto',
        localization: 'Ponto de apoio Centro',
        createdAt: '15/07/2026 15:10',
        author: 'João R.'
      }
    ],
    materials: [
      { id: 'mat-80', productName: 'Embalagem reversa P', quantity: 1 }
    ],
    barcodes: [
      {
        id: 'bc-80',
        barcode: '7890000111222',
        localization: 'Ponto de apoio Centro',
        createdAt: '15/07/2026 15:05'
      }
    ],
    history: [
      {
        id: 'vh-80',
        createdAt: '15/07/2026 14:55',
        description: 'Pedido atribuído ao ponto de apoio Centro',
        username: 'roteirização'
      }
    ]
  },
  '48201': {
    items: [
      {
        id: 'oi-701',
        description: 'Tênis esportivo 42',
        serialNumber: 'SN-NS-7781',
        manufacturer: 'Netshoes',
        category: 'Calçados',
        quantity: 1,
        price: 'R$ 329,90',
        weightKg: '0,85'
      }
    ],
    scheduling: [
      {
        id: 'sch-70',
        scheduledFor: '17/07/2026 10:00',
        window: '09:00 – 12:00',
        status: 'Aguardando Agendamento',
        channel: 'Portal',
        note: 'Data sugerida pela operação',
        tone: 'warning'
      }
    ]
  },
  '48219': {
    items: [
      {
        id: 'oi-619',
        description: 'Camisa social M',
        serialNumber: 'SN-RN-4412',
        manufacturer: 'Renner',
        category: 'Vestuário',
        quantity: 1,
        price: 'R$ 119,90',
        weightKg: '0,30'
      },
      {
        id: 'oi-620',
        description: 'Calça jeans 40',
        serialNumber: 'SN-RN-4413',
        manufacturer: 'Renner',
        category: 'Vestuário',
        quantity: 1,
        price: 'R$ 189,90',
        weightKg: '0,55'
      }
    ],
    fiscal: {
      number: '100882',
      series: '2',
      orderId: '48219',
      accessKey: '33260714200166000187550020001008821000048219',
      volumeAmount: '2',
      value: 'R$ 309,80',
      itemsValue: 'R$ 309,80',
      emissionDate: '15/07/2026'
    }
  }
}

export function getOrderDetailBundle(orderId: string): OrderDetailBundle {
  if (orderId === featuredBundle.orderId) return featuredBundle

  const partial = partialBundles[orderId]
  if (!partial) return emptyBundle(orderId)

  return {
    ...emptyBundle(orderId),
    ...partial,
    orderId
  }
}
