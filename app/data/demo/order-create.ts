import type {
  OrderAddressParty,
  OrderCreateClientOption,
  OrderCreateForm,
  OrderCreateItem,
  OrderCreateStepMeta
} from '../../types/order-create'

export const orderCreateSteps: OrderCreateStepMeta[] = [
  {
    id: 'operacao',
    label: 'Operação',
    description: 'Tipo de pedido e cliente'
  },
  {
    id: 'origem',
    label: 'Origem',
    description: 'Contato e endereço de coleta/saída'
  },
  {
    id: 'destino',
    label: 'Destino',
    description: 'Contato e endereço de entrega'
  },
  {
    id: 'itens',
    label: 'Itens',
    description: 'Volumes para frete e seguro'
  },
  {
    id: 'revisao',
    label: 'Revisão',
    description: 'Confira e conclua o pedido'
  }
]

export const orderKindOptions = [
  { label: 'Entrega', value: 'OE' },
  { label: 'Coleta', value: 'OC' }
] as const

export const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
].map((uf) => ({ label: uf, value: uf }))

export const orderCreateClients: OrderCreateClientOption[] = [
  { id: 'acc-keener', name: 'Keener Logística' },
  { id: 'acc-retail', name: 'Retail Brasil SA' },
  { id: 'acc-moda', name: 'Moda Carioca Ltda' }
]

function emptyParty(): OrderAddressParty {
  return {
    name: '',
    cellphone: '',
    federalId: '',
    isCompany: false,
    address: '',
    number: '',
    quarter: '',
    city: '',
    zipCode: '',
    stateCode: '',
    countryCode: 'BR',
    reference: '',
    additional: ''
  }
}

export function createEmptyOrderItem(): OrderCreateItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    quantity: 1,
    price: null,
    sizeX: null,
    sizeY: null,
    sizeZ: null,
    weight: null,
    serialNumber: ''
  }
}

export function createEmptyOrderForm(): OrderCreateForm {
  return {
    kindCtrl: 'OE',
    accountId: '',
    origin: emptyParty(),
    destiny: emptyParty(),
    items: []
  }
}

/** Fixture válida para testes e demos rápidas. */
export function createValidOrderFormFixture(): OrderCreateForm {
  return {
    kindCtrl: 'OE',
    accountId: 'acc-keener',
    origin: {
      name: 'Centro de Distribuição Keener',
      cellphone: '(21) 98888-1000',
      federalId: '12.345.678/0001-90',
      isCompany: true,
      address: 'Av. Brasil',
      number: '1200',
      quarter: 'Penha',
      city: 'Rio de Janeiro',
      zipCode: '21040-360',
      stateCode: 'RJ',
      countryCode: 'BR'
    },
    destiny: {
      name: 'Pachequinho',
      cellphone: '(11) 97777-2000',
      federalId: '074.498.080-13',
      isCompany: false,
      address: 'Rua das Flores',
      number: '55',
      quarter: 'Centro',
      city: 'Iracemápolis',
      zipCode: '13495-000',
      stateCode: 'SP',
      countryCode: 'BR',
      reference: 'Portão azul',
      additional: ''
    },
    items: [
      {
        id: 'item-demo-1',
        description: 'Caixa de eletrônicos',
        quantity: 2,
        price: 150,
        sizeX: 40,
        sizeY: 30,
        sizeZ: 25,
        weight: 5,
        serialNumber: 'SN-1001'
      }
    ]
  }
}

export function formatMoneyBr(value: number | null | undefined): string {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

export function orderKindLabel(kind: string): string {
  return kind === 'OC' ? 'Coleta' : 'Entrega'
}

export function clientLabel(accountId: string): string {
  return orderCreateClients.find((c) => c.id === accountId)?.name ?? accountId
}
