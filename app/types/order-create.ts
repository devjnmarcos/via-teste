export type OrderKindCtrl = 'OE' | 'OC'

export interface OrderAddressParty {
  name: string
  cellphone: string
  federalId: string
  isCompany: boolean
  address: string
  number: string
  quarter: string
  city: string
  zipCode: string
  stateCode: string
  countryCode: string
  reference?: string
  additional?: string
}

export interface OrderCreateItem {
  id: string
  productId: string
  quantity: number | null
  price: number | null
  sizeX: number | null
  sizeY: number | null
  sizeZ: number | null
  weight: number | null
  serialNumber?: string
  notes?: string
}

export interface OrderCreateForm {
  accountId: string
  kindCtrl: OrderKindCtrl
  scheduledAt: string
  carrierId: string
  address: OrderAddressParty
  items: OrderCreateItem[]
}

export type OrderCreateStepId =
  | 'cliente'
  | 'operacao'
  | 'endereco'
  | 'itens'
  | 'revisao'

export interface OrderCreateStepMeta {
  id: OrderCreateStepId
  label: string
  description: string
}

export type FieldErrors = Record<string, string>

export interface OrderCreateClientOption {
  id: string
  name: string
}
