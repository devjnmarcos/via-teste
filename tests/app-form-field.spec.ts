import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppFormField from '../app/components/app/AppFormField.vue'

describe('AppFormField', () => {
  it('renderiza label e slot com classes do padrão SLA', async () => {
    const wrapper = await mountSuspended(AppFormField, {
      props: { label: 'Conta *' },
      slots: { default: () => 'input-slot' }
    })

    const root = wrapper.get('label')
    expect(root.classes()).toContain('app-form-field')
    expect(root.classes()).toContain('grid')
    expect(root.classes()).toContain('gap-2')
    expect(wrapper.get('span').text()).toBe('Conta *')
    expect(wrapper.text()).toContain('input-slot')
  })
})
