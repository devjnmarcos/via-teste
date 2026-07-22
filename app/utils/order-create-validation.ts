import type {
  FieldErrors,
  OrderAddressParty,
  OrderCreateForm,
  OrderCreateItem,
  OrderCreateStepId
} from '../types/order-create'

const requiredMsg = 'Campo obrigatório.'

function requireText(value: string | null | undefined, label = requiredMsg): string | undefined {
  if (!value || !String(value).trim()) return label
  return undefined
}

function requirePositive(
  value: number | null | undefined,
  label = 'Informe um valor maior que zero.'
): string | undefined {
  if (value === null || value === undefined || Number.isNaN(Number(value)) || Number(value) < 1) {
    return label
  }
  return undefined
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function validateFederalId(party: OrderAddressParty, prefix: string, errors: FieldErrors) {
  const raw = digitsOnly(party.federalId)
  if (!raw) {
    errors[`${prefix}.federalId`] = requiredMsg
    return
  }
  if (party.isCompany && raw.length !== 14) {
    errors[`${prefix}.federalId`] = 'CNPJ inválido.'
    return
  }
  if (!party.isCompany && raw.length !== 11) {
    errors[`${prefix}.federalId`] = 'CPF inválido.'
  }
}

function validateParty(party: OrderAddressParty, prefix: string): FieldErrors {
  const errors: FieldErrors = {}
  const name = requireText(party.name, 'Nome é obrigatório.')
  if (name) errors[`${prefix}.name`] = name

  const cellphone = requireText(party.cellphone, 'Celular é obrigatório.')
  if (cellphone) errors[`${prefix}.cellphone`] = cellphone

  validateFederalId(party, prefix, errors)

  const address = requireText(party.address, 'Logradouro é obrigatório.')
  if (address) errors[`${prefix}.address`] = address

  const number = requireText(party.number, 'Número é obrigatório.')
  if (number) errors[`${prefix}.number`] = number

  const quarter = requireText(party.quarter, 'Bairro é obrigatório.')
  if (quarter) errors[`${prefix}.quarter`] = quarter

  const city = requireText(party.city, 'Cidade é obrigatória.')
  if (city) errors[`${prefix}.city`] = city

  const zip = requireText(party.zipCode, 'CEP é obrigatório.')
  if (zip) errors[`${prefix}.zipCode`] = zip

  const state = requireText(party.stateCode, 'UF é obrigatória.')
  if (state) errors[`${prefix}.stateCode`] = state

  return errors
}

export function validateClienteStep(form: OrderCreateForm): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.accountId) errors.accountId = 'Selecione o cliente.'
  return errors
}

export function validateOperacaoStep(form: OrderCreateForm): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.kindCtrl) errors.kindCtrl = 'Selecione o tipo de operação.'

  const scheduledAt = requireText(form.scheduledAt, 'Data de agendamento é obrigatória.')
  if (scheduledAt) errors.scheduledAt = scheduledAt

  const carrierId = requireText(form.carrierId, 'Selecione o transportador.')
  if (carrierId) errors.carrierId = carrierId

  return errors
}

export function validateEnderecoStep(form: OrderCreateForm): FieldErrors {
  return validateParty(form.address, 'address')
}

export function validateItem(item: OrderCreateItem, index: number): FieldErrors {
  const prefix = `items.${index}`
  const errors: FieldErrors = {}
  const productId = requireText(item.productId, 'Selecione um produto.')
  if (productId) errors[`${prefix}.productId`] = productId

  const quantity = requirePositive(item.quantity, 'Quantidade mínima é 1.')
  if (quantity) errors[`${prefix}.quantity`] = quantity

  const price = requirePositive(item.price, 'Preço mínimo é 1.')
  if (price) errors[`${prefix}.price`] = price

  const sizeX = requirePositive(item.sizeX, 'Largura mínima é 1.')
  if (sizeX) errors[`${prefix}.sizeX`] = sizeX

  const sizeY = requirePositive(item.sizeY, 'Altura mínima é 1.')
  if (sizeY) errors[`${prefix}.sizeY`] = sizeY

  const sizeZ = requirePositive(item.sizeZ, 'Profundidade mínima é 1.')
  if (sizeZ) errors[`${prefix}.sizeZ`] = sizeZ

  const weight = requirePositive(item.weight, 'Peso mínimo é 1.')
  if (weight) errors[`${prefix}.weight`] = weight

  return errors
}

export function validateItensStep(form: OrderCreateForm): FieldErrors {
  if (!form.items.length) {
    return { items: 'Adicione ao menos um item ao pedido.' }
  }
  return form.items.reduce<FieldErrors>((acc, item, index) => {
    Object.assign(acc, validateItem(item, index))
    return acc
  }, {})
}

export function validateOrderCreateStep(
  stepId: OrderCreateStepId,
  form: OrderCreateForm
): FieldErrors {
  switch (stepId) {
    case 'cliente':
      return validateClienteStep(form)
    case 'operacao':
      return validateOperacaoStep(form)
    case 'endereco':
      return validateEnderecoStep(form)
    case 'itens':
      return validateItensStep(form)
    case 'revisao':
      return {
        ...validateClienteStep(form),
        ...validateOperacaoStep(form),
        ...validateEnderecoStep(form),
        ...validateItensStep(form)
      }
    default:
      return {}
  }
}

export function isStepValid(stepId: OrderCreateStepId, form: OrderCreateForm): boolean {
  return Object.keys(validateOrderCreateStep(stepId, form)).length === 0
}
