import { describe, expect, it } from 'vitest'
import {
  createEmptyOrderForm,
  createValidOrderFormFixture
} from '../app/data/demo/order-create'
import {
  isStepValid,
  validateItensStep,
  validateOperacaoStep,
  validateOrderCreateStep,
  validateOrigemStep
} from '../app/utils/order-create-validation'

describe('validação do wizard de criação de pedido', () => {
  it('bloqueia operação sem cliente', () => {
    const form = createEmptyOrderForm()
    form.kindCtrl = 'OE'
    const errors = validateOperacaoStep(form)
    expect(errors.accountId).toBeTruthy()
    expect(isStepValid('operacao', form)).toBe(false)
  })

  it('exige campos de origem', () => {
    const form = createEmptyOrderForm()
    const errors = validateOrigemStep(form)
    expect(errors['origin.name']).toBeTruthy()
    expect(errors['origin.zipCode']).toBeTruthy()
    expect(errors['origin.stateCode']).toBeTruthy()
  })

  it('exige ao menos um item válido', () => {
    const form = createEmptyOrderForm()
    expect(validateItensStep(form).items).toMatch(/ao menos um item/i)

    form.items.push({
      id: 'x',
      description: '',
      quantity: 0,
      price: null,
      sizeX: null,
      sizeY: null,
      sizeZ: null,
      weight: null
    })
    const errors = validateItensStep(form)
    expect(errors['items.0.description']).toBeTruthy()
    expect(errors['items.0.quantity']).toBeTruthy()
  })

  it('aceita fixture completa em todos os steps', () => {
    const form = createValidOrderFormFixture()
    for (const step of ['operacao', 'origem', 'destino', 'itens', 'revisao'] as const) {
      expect(validateOrderCreateStep(step, form)).toEqual({})
      expect(isStepValid(step, form)).toBe(true)
    }
  })

  it('rejeita CPF com tamanho incorreto', () => {
    const form = createValidOrderFormFixture()
    form.origin.isCompany = false
    form.origin.federalId = '123'
    const errors = validateOrigemStep(form)
    expect(errors['origin.federalId']).toMatch(/CPF/i)
  })
})
