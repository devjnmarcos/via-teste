import { beforeEach, describe, expect, it } from 'vitest'
import { useToast } from '../app/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    const { clear } = useToast()
    clear()
  })

  it('empilha toasts de sucesso, erro e info', () => {
    const { success, error, info, toasts } = useToast()

    success('Pedido criado', 'Mock OK')
    error('Revise os campos', 'Origem incompleta')
    info('Frete', 'Cálculo pendente de API')

    expect(toasts.value).toHaveLength(3)
    expect(toasts.value.map((t) => t.tone)).toEqual(['success', 'error', 'info'])
    expect(toasts.value[0]?.title).toBe('Pedido criado')
    expect(toasts.value[1]?.description).toContain('Origem')
  })

  it('remove toast por id', () => {
    const { success, dismiss, toasts } = useToast()
    const id = success('Ok')
    expect(toasts.value).toHaveLength(1)
    dismiss(id)
    expect(toasts.value).toHaveLength(0)
  })
})
