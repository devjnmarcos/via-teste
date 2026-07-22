import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PedidosIndex from '../app/pages/pedidos/index.vue'
import { useToast } from '../app/composables/useToast'

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn()
}))

mockNuxtImport('navigateTo', () => navigateToMock)

describe('pedidos/index.vue — ações em lote', () => {
  beforeEach(() => {
    useToast().clear()
  })

  it('usa o composable useChatbotHealth no modal de agendar em lote', async () => {
    const wrapper = await mountSuspended(PedidosIndex)

    const checkbox = wrapper.get('[aria-label="Selecionar pedido 48208"]')
    await checkbox.trigger('click')

    const scheduleButton = wrapper.get('[data-testid="pedidos-schedule-button"]')
    await scheduleButton.trigger('click')

    expect(wrapper.text()).toContain('Chatbot: ON')
    expect(wrapper.get('[data-testid="app-modal-confirm"]').exists()).toBe(true)
  })

  it('exibe o dropdown "Mais ações" com "Gerar etiqueta" quando algo está selecionado', async () => {
    const wrapper = await mountSuspended(PedidosIndex)
    expect(wrapper.find('[data-testid="pedidos-more-actions"]').exists()).toBe(false)

    const checkbox = wrapper.get('[aria-label="Selecionar pedido 48208"]')
    await checkbox.trigger('click')

    expect(wrapper.find('[data-testid="pedidos-more-actions"]').exists()).toBe(true)
    // UDropdownMenu (reka-ui) só monta o conteúdo do menu quando aberto — sem
    // precedente de teste de abertura via clique neste projeto (ver decisão
    // 10 do plano). Cobertura estrutural via os itens computados expostos.
    const vmItems = wrapper.vm as unknown as { moreActionsItems: { label: string }[][] }
    expect(vmItems.moreActionsItems[0]?.map((item) => item.label)).toContain('Gerar etiqueta')
  })

  it('desabilita "Gerar etiqueta" quando nenhum selecionado é elegível e mostra o preview quando é', async () => {
    const wrapper = await mountSuspended(PedidosIndex)

    // 48201 já está impresso (labelPrinted: true) — não elegível.
    const printedCheckbox = wrapper.get('[aria-label="Selecionar pedido 48201"]')
    await printedCheckbox.trigger('click')

    const vm = wrapper.vm as unknown as { canGenerateLabel: boolean; openLabel: () => void }
    expect(vm.canGenerateLabel).toBe(false)

    // 48219 não está impresso — elegível.
    const eligibleCheckbox = wrapper.get('[aria-label="Selecionar pedido 48219"]')
    await eligibleCheckbox.trigger('click')

    expect(vm.canGenerateLabel).toBe(true)
    vm.openLabel()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="etiqueta-pdf-preview"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('1 pedido(s) já possuem etiqueta e serão ignorados')
  })

  it('desabilita "Disparar chatbot" quando nenhum selecionado é elegível e mostra o indicador de saúde quando é', async () => {
    const wrapper = await mountSuspended(PedidosIndex)

    // 48219 não é elegível ao chatbot (chatbotEligible: false).
    const ineligibleCheckbox = wrapper.get('[aria-label="Selecionar pedido 48219"]')
    await ineligibleCheckbox.trigger('click')

    const vm = wrapper.vm as unknown as { canDispatchChatbot: boolean; openDispatch: () => void }
    expect(vm.canDispatchChatbot).toBe(false)

    // 48208 é elegível.
    const eligibleCheckbox = wrapper.get('[aria-label="Selecionar pedido 48208"]')
    await eligibleCheckbox.trigger('click')

    expect(vm.canDispatchChatbot).toBe(true)
    vm.openDispatch()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Chatbot: ON')
    expect(wrapper.text()).toContain('1 pedido(s) não elegíveis ao chatbot e serão ignorados')
  })
})
