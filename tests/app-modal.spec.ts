import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppModal from '../app/components/app/AppModal.vue'
import DataTable from '../app/components/app/DataTable.vue'
import type { DataTableColumn } from '../app/types/data-table'

describe('AppModal', () => {
  it('bloqueia exclusão com keyword até o texto bater', async () => {
    const wrapper = await mountSuspended(AppModal, {
      props: {
        open: true,
        portal: false,
        title: 'Excluir usuário',
        description: 'Confirme digitando o e-mail.',
        variant: 'confirm-keyword',
        keyword: 'ana@via.com',
        confirmLabel: 'Excluir'
      }
    })

    const confirm = wrapper.get('[data-testid="app-modal-confirm"]')
    expect(confirm.attributes('disabled')).toBeDefined()

    const input = wrapper.get('[data-testid="app-modal-keyword"]')
    await input.setValue('ana@via.com')
    await nextTick()

    expect(wrapper.get('[data-testid="app-modal-confirm"]').attributes('disabled')).toBeUndefined()
  })

  it('confirm sem slot não renderiza body (modal compacto)', async () => {
    const wrapper = await mountSuspended(AppModal, {
      props: {
        open: true,
        portal: false,
        title: 'Excluir SLA',
        description: 'A tabela será removida. Esta ação não pode ser desfeita.',
        variant: 'confirm',
        confirmLabel: 'Excluir'
      }
    })

    expect(wrapper.find('[data-testid="app-modal-body"]').exists()).toBe(false)
    expect(wrapper.find('.app-modal__body').exists()).toBe(false)
    expect(wrapper.text()).toContain('Excluir SLA')
    expect(wrapper.text()).toContain('A tabela será removida')
    expect(wrapper.find('.app-modal__footer--compact').exists()).toBe(true)
    expect(wrapper.find('.app-modal__header').exists()).toBe(true)
    expect(wrapper.find('.app-modal__footer').exists()).toBe(true)
  })

  it('form renderiza body com slot e seções com padding estrutural', async () => {
    const wrapper = await mountSuspended(AppModal, {
      props: {
        open: true,
        portal: false,
        title: 'Editar SLA',
        description: 'Atualize os parâmetros.',
        variant: 'form',
        confirmLabel: 'Salvar'
      },
      slots: {
        default: () => 'Campo de formulário'
      }
    })

    expect(wrapper.find('[data-testid="app-modal-body"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Campo de formulário')
    expect(wrapper.find('.app-modal__footer--compact').exists()).toBe(false)
    expect(wrapper.find('.app-modal__header').exists()).toBe(true)
    expect(wrapper.find('.app-modal__body').exists()).toBe(true)
    expect(wrapper.find('.app-modal__footer').exists()).toBe(true)
    expect(wrapper.find('.app-modal__form').exists()).toBe(true)
  })

  it('close fica DENTRO do header (não no fluxo do body/description)', async () => {
    const wrapper = await mountSuspended(AppModal, {
      props: {
        open: true,
        portal: false,
        title: 'Excluir SLA',
        description: 'A tabela será removida. Esta ação não pode ser desfeita.',
        variant: 'confirm',
        confirmLabel: 'Excluir'
      }
    })

    const header = wrapper.get('.app-modal__header')
    const closeBtn = wrapper.get('[data-testid="app-modal-close"]')

    expect(header.find('[data-testid="app-modal-close"]').exists()).toBe(true)
    expect(closeBtn.classes()).toContain('app-modal__close')
    expect(closeBtn.element.parentElement?.classList.contains('app-modal__header')).toBe(true)

    // Confirm sem body: close não pode estar após a description no fluxo do body
    expect(wrapper.find('[data-testid="app-modal-body"]').exists()).toBe(false)
    expect(closeBtn.element.closest('.app-modal__body')).toBeNull()
    expect(closeBtn.element.closest('.app-modal__heading')).toBeNull()
  })

  it('anatomia do card: shell + header/body/footer com classes próprias', async () => {
    const wrapper = await mountSuspended(AppModal, {
      props: {
        open: true,
        portal: false,
        title: 'Editar frete',
        description: 'Atualize os parâmetros.',
        variant: 'form',
        confirmLabel: 'Salvar'
      },
      slots: {
        default: () => 'Campo'
      }
    })

    const root = wrapper.get('[data-testid="app-modal"]')
    expect(root.classes()).toContain('app-modal')

    const header = wrapper.get('.app-modal__header')
    const body = wrapper.get('.app-modal__body')
    const footer = wrapper.get('.app-modal__footer')
    const closeBtn = header.get('[data-testid="app-modal-close"]')

    expect(header.find('.app-modal__title').text()).toBe('Editar frete')
    expect(header.find('.app-modal__description').text()).toContain('Atualize')
    expect(closeBtn.attributes('aria-label')).toBe('Fechar')
    expect(body.find('.app-modal__form').exists()).toBe(true)
    expect(footer.find('[data-testid="app-modal-confirm"]').exists()).toBe(true)

    // Não depende de data-slot do UModal para anatomia visual
    expect(wrapper.find('[data-slot="header"]').exists()).toBe(false)
    expect(wrapper.find('[data-slot="body"]').exists()).toBe(false)
    expect(wrapper.find('[data-slot="footer"]').exists()).toBe(false)
  })
})

describe('DataTable tipada (runtime)', () => {
  type Row = { id: string; name: string; active: boolean; detail: string }

  it('renderiza text, switch, actions e slot expand', async () => {
    const columns: DataTableColumn<Row>[] = [
      { type: 'expand', key: 'expand' },
      { type: 'text', key: 'name', label: 'Nome' },
      { type: 'switch', key: 'active', label: 'Ativo' },
      {
        type: 'actions',
        key: 'actions',
        items: [{ key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', ariaLabel: 'Editar' }]
      }
    ]

    const wrapper = await mountSuspended(DataTable, {
      props: {
        columns,
        rows: [{ id: '1', name: 'Tabela A', active: true, detail: 'Detalhe interno' }],
        expandedKeys: ['1']
      },
      slots: {
        expand: ({ row }: { row: Row }) => row.detail
      }
    })

    expect(wrapper.text()).toContain('Tabela A')
    expect(wrapper.text()).toContain('Detalhe interno')
    expect(wrapper.findAll('tbody tr').length).toBeGreaterThanOrEqual(2)
  })
})
