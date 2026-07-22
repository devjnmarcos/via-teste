import { describe, expect, it } from 'vitest'
import {
  createEmptyOrderForm,
  createValidOrderFormFixture
} from '../app/data/demo/order-create'
import {
  isStepValid,
  validateClienteStep,
  validateEnderecoStep,
  validateItensStep,
  validateOperacaoStep,
  validateOrderCreateStep
} from '../app/utils/order-create-validation'

describe('validação do wizard de criação de pedido', () => {
  it('bloqueia o step Cliente sem seleção', () => {
    const form = createEmptyOrderForm()
    const errors = validateClienteStep(form)
    expect(errors.accountId).toBeTruthy()
    expect(isStepValid('cliente', form)).toBe(false)
  })

  it('exige agendamento e transportador no step Operação', () => {
    const form = createEmptyOrderForm()
    const errors = validateOperacaoStep(form)
    expect(errors.scheduledAt).toBeTruthy()
    expect(errors.carrierId).toBeTruthy()
    expect(isStepValid('operacao', form)).toBe(false)
  })

  it('exige campos do endereço único', () => {
    const form = createEmptyOrderForm()
    const errors = validateEnderecoStep(form)
    expect(errors['address.name']).toBeTruthy()
    expect(errors['address.zipCode']).toBeTruthy()
    expect(errors['address.stateCode']).toBeTruthy()
  })

  it('exige ao menos um item com produto selecionado', () => {
    const form = createEmptyOrderForm()
    expect(validateItensStep(form).items).toMatch(/ao menos um item/i)

    form.items.push({
      id: 'x',
      productId: '',
      quantity: 0,
      price: null,
      sizeX: null,
      sizeY: null,
      sizeZ: null,
      weight: null
    })
    const errors = validateItensStep(form)
    expect(errors['items.0.productId']).toBeTruthy()
    expect(errors['items.0.quantity']).toBeTruthy()
  })

  it('aceita fixture completa em todos os steps', () => {
    const form = createValidOrderFormFixture()
    for (const step of ['cliente', 'operacao', 'endereco', 'itens', 'revisao'] as const) {
      expect(validateOrderCreateStep(step, form)).toEqual({})
      expect(isStepValid(step, form)).toBe(true)
    }
  })

  it('rejeita CPF com tamanho incorreto no endereço', () => {
    const form = createValidOrderFormFixture()
    form.address.isCompany = false
    form.address.federalId = '123'
    const errors = validateEnderecoStep(form)
    expect(errors['address.federalId']).toMatch(/CPF/i)
  })
})
