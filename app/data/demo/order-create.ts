import type {
  OrderAddressParty,
  OrderCreateClientOption,
  OrderCreateForm,
  OrderCreateItem,
  OrderCreateStepMeta,
  OrderKindCtrl
} from '../../types/order-create'
import { getCadastroOnda3Rows } from './cadastros-onda3'

export const orderCreateSteps: OrderCreateStepMeta[] = [
  {
    id: 'cliente',
    label: 'Cliente',
    description: 'Cliente do pedido'
  },
  {
    id: 'operacao',
    label: 'Operação',
    description: 'Tipo de operação, agendamento e transportador'
  },
  {
    id: 'endereco',
    label: 'Endereço',
    description: 'Endereço de coleta ou entrega, conforme a operação'
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

export interface OrderCreateCarrier {
  id: string
  name: string
  type: string
  region: string
  phone: string
  statusLabel: string
  active: boolean
}

/**
 * Transportadores ativos disponíveis para o select do step Operação.
 *
 * Fixture inline (não lida de `gestao-rede.ts`, que foi removido na Onda 3 de
 * Cadastros junto com as telas de Pontos de apoio/Transportadores) — mesmo
 * shape que o `TransportadorRow` daquele arquivo, para manter a fixture
 * coerente com o padrão do projeto.
 */
const orderCreateCarrierRows: OrderCreateCarrier[] = [
  {
    id: 'tr-1',
    name: 'Marcos L.',
    type: 'Motoboy',
    region: 'SP · Zona Sul',
    phone: '(11) 98888-1001',
    statusLabel: 'Ativo',
    active: true
  },
  {
    id: 'tr-2',
    name: 'Rita S.',
    type: 'Van',
    region: 'RJ · Baixada',
    phone: '(21) 97777-2002',
    statusLabel: 'Ativo',
    active: true
  },
  {
    id: 'tr-3',
    name: 'Paulo N.',
    type: 'Motoboy',
    region: 'SP · Centro',
    phone: '(11) 96666-3003',
    statusLabel: 'Inativo',
    active: false
  },
  {
    id: 'tr-4',
    name: 'Fernanda K.',
    type: 'Carro',
    region: 'PR · Curitiba',
    phone: '(41) 95555-4004',
    statusLabel: 'Ativo',
    active: true
  }
]

export const orderCreateCarriers = orderCreateCarrierRows.filter((row) => row.active)

/** Catálogo de produtos ativos — mesma fonte de /cadastros/produtos (app/data/demo/cadastros-onda3.ts). */
export const orderCreateProducts = getCadastroOnda3Rows('produtos').filter((row) => row.active)

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
    productId: '',
    quantity: 1,
    price: null,
    sizeX: null,
    sizeY: null,
    sizeZ: null,
    weight: null,
    serialNumber: '',
    notes: ''
  }
}

export function createEmptyOrderForm(): OrderCreateForm {
  return {
    accountId: '',
    kindCtrl: 'OE',
    scheduledAt: '',
    carrierId: '',
    address: emptyParty(),
    items: []
  }
}

/** Fixture válida para testes e demos rápidas. */
export function createValidOrderFormFixture(): OrderCreateForm {
  return {
    accountId: 'acc-keener',
    kindCtrl: 'OE',
    scheduledAt: '2026-08-10',
    carrierId: orderCreateCarriers[0]!.id,
    address: {
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
        productId: orderCreateProducts[0]!.id,
        quantity: 2,
        price: 150,
        sizeX: 40,
        sizeY: 30,
        sizeZ: 25,
        weight: 5,
        serialNumber: 'SN-1001',
        notes: 'Frágil — manuseio com cuidado'
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

export function carrierLabel(carrierId: string): string {
  return orderCreateCarriers.find((c) => c.id === carrierId)?.name ?? carrierId
}

export function productLabel(productId: string): string {
  return orderCreateProducts.find((p) => p.id === productId)?.name ?? productId
}

/** Rótulo do step Endereço único — depende do tipo de operação selecionado. */
export function addressRoleLabel(kind: OrderKindCtrl): string {
  return kind === 'OC' ? 'Endereço de coleta' : 'Endereço de entrega'
}
