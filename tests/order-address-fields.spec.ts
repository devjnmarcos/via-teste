import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { reactive } from 'vue'
import OrderAddressFields from '../app/components/orders/OrderAddressFields.vue'
import type { OrderAddressParty } from '../app/types/order-create'

function emptyAddress(): OrderAddressParty {
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

describe('OrderAddressFields', () => {
  it('renderiza os campos obrigatórios do endereço', async () => {
    const wrapper = await mountSuspended(OrderAddressFields, {
      props: { modelValue: reactive(emptyAddress()), errors: {} }
    })

    expect(wrapper.text()).toContain('Nome')
    expect(wrapper.text()).toContain('Celular')
    expect(wrapper.text()).toContain('CEP')
    expect(wrapper.text()).toContain('Logradouro')
    expect(wrapper.text()).toContain('Número')
    expect(wrapper.text()).toContain('Bairro')
    expect(wrapper.text()).toContain('Cidade')
    expect(wrapper.text()).toContain('UF')
  })

  it('esconde Referência e Informação adicional quando showExtraFields é falso', async () => {
    const wrapper = await mountSuspended(OrderAddressFields, {
      props: { modelValue: reactive(emptyAddress()), errors: {}, showExtraFields: false }
    })

    expect(wrapper.text()).not.toContain('Referência')
    expect(wrapper.text()).not.toContain('Informação adicional')
  })

  it('mostra Referência e Informação adicional quando showExtraFields é verdadeiro', async () => {
    const wrapper = await mountSuspended(OrderAddressFields, {
      props: { modelValue: reactive(emptyAddress()), errors: {}, showExtraFields: true }
    })

    expect(wrapper.text()).toContain('Referência')
    expect(wrapper.text()).toContain('Informação adicional')
  })

  it('exibe mensagens de erro vindas da prop errors com prefixo address.', async () => {
    const wrapper = await mountSuspended(OrderAddressFields, {
      props: {
        modelValue: reactive(emptyAddress()),
        errors: { 'address.name': 'Nome é obrigatório.' }
      }
    })

    expect(wrapper.text()).toContain('Nome é obrigatório.')
  })

  it('atualiza o endereço recebido via v-model ao editar o campo Nome', async () => {
    const address = reactive(emptyAddress())
    const wrapper = await mountSuspended(OrderAddressFields, {
      props: { modelValue: address, errors: {} }
    })

    const nomeLabel = wrapper.findAll('label').find((label) => label.text().includes('Nome'))
    await nomeLabel!.get('input').setValue('Ana Souza')

    expect(address.name).toBe('Ana Souza')
  })
})
