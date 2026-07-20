/**
 * Mock da calculadora de frete (legado ViaFreightPriceCalculator).
 * Steps: Rota → Item → Adicionais → Resultado.
 */

export interface FreightCalcForm {
  originZip: string
  destinyZip: string
  clientId: string
  packageType: string
  weight: string
  sizeX: string
  sizeY: string
  sizeZ: string
  itemPrice: string
  system: string
  needSecurity: boolean
  needPackage: boolean
}

export interface FreightCalcResult {
  status: 'success' | 'error'
  price: number
  messages: string[]
}

export const freightCalcSteps = [
  { id: 'route', label: 'Rota', description: 'CEPs e cliente' },
  { id: 'item', label: 'Item', description: 'Embalagem e dimensões' },
  { id: 'extras', label: 'Adicionais', description: 'Valor e opções' },
  { id: 'result', label: 'Resultado', description: 'Valor do frete' }
] as const

export const freightCalcClients = [
  { label: 'Casas Bahia', value: 'acc-1' },
  { label: 'Amazon BR', value: 'acc-2' },
  { label: 'Renner', value: 'acc-3' }
]

export const freightPackageOptions = [
  { label: 'Caixa', value: 'package' }
]

export const freightSystemOptions = [
  { label: 'Via Reversa', value: 'via' },
  { label: 'Parceiro externo', value: 'external' }
]

export function createEmptyFreightCalc(): FreightCalcForm {
  return {
    originZip: '',
    destinyZip: '',
    clientId: freightCalcClients[0]!.value,
    packageType: 'package',
    weight: '',
    sizeX: '',
    sizeY: '',
    sizeZ: '',
    itemPrice: '',
    system: 'via',
    needSecurity: false,
    needPackage: false
  }
}

export function validateFreightCalcStep(stepIndex: number, form: FreightCalcForm): string | null {
  if (stepIndex === 0) {
    if (form.originZip.replace(/\D/g, '').length < 8) return 'Informe o CEP de origem.'
    if (form.destinyZip.replace(/\D/g, '').length < 8) return 'Informe o CEP de destino.'
    if (!form.clientId) return 'Selecione o cliente.'
  }
  if (stepIndex === 1) {
    if (!form.packageType) return 'Selecione a embalagem.'
    if (!form.weight || Number(form.weight) <= 0) return 'Informe o peso em kg.'
    if (!form.sizeX || !form.sizeY || !form.sizeZ) return 'Informe altura, largura e comprimento.'
  }
  if (stepIndex === 2) {
    if (!form.itemPrice || Number(form.itemPrice) < 0) return 'Informe o valor da mercadoria.'
    if (!form.system) return 'Selecione o sistema.'
  }
  return null
}

/** Cálculo mock determinístico a partir dos inputs. */
export function calcFreightMock(form: FreightCalcForm): FreightCalcResult {
  const weight = Number(form.weight) || 0
  const price = Number(form.itemPrice) || 0
  const base = 18.9 + weight * 2.4 + Math.min(price * 0.01, 40)
  const security = form.needSecurity ? base * 0.08 : 0
  const packing = form.needPackage ? 6.5 : 0
  const total = Math.round((base + security + packing) * 100) / 100

  const messages = [
    `Rota ${form.originZip} → ${form.destinyZip}`,
    `Peso ${form.weight} kg · ${form.sizeX}×${form.sizeY}×${form.sizeZ} cm`
  ]
  if (form.needSecurity) messages.push('Seguro incluído (+8%)')
  if (form.needPackage) messages.push('Embalagem adicional (+R$ 6,50)')

  return {
    status: 'success',
    price: total,
    messages
  }
}

export function formatFreightPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
