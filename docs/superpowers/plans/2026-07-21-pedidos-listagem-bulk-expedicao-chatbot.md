# Pedidos: ações em lote (etiqueta + chatbot) e remoção de Expedição/Disparo Chatbot/Check In

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar as ações de "gerar etiqueta" (Expedição) e "disparar chatbot" (Disparo Chatbot) para a toolbar de ações em lote da listagem de pedidos (`app/pages/pedidos/index.vue`), deletar as três páginas legadas (`operacao/expedicao.vue`, `operacao/disparo-chatbot.vue`, `loja/check-in.vue`) e limpar todo o código morto (fixtures, métricas, breadcrumbs, links, testes) que ficaria órfão.

**Architecture:** A toolbar de seleção em lote de `app/pages/pedidos/index.vue` passa a ter 1 botão primário ("Agendar em lote", inalterado) + um `UDropdownMenu` "Mais ações" (Nuxt UI 4, já disponível via `@nuxt/ui@^4.10.0`, sem componente novo a inventar) com os itens "Gerar etiqueta" e "Disparar chatbot". Cada item abre um `AppModal` que opera sobre `selectedIds` da própria listagem — não mais sobre as fixtures isoladas de Expedição/Disparo Chatbot, que tratavam pedidos com IDs completamente diferentes (`48401+`, `51101+`) dos pedidos reais da listagem (`48219`, `48208`, etc.). Duas flags novas e opcionais no tipo `Order` (`labelPrinted`, `chatbotEligible`) carregam a elegibilidade. Um módulo puro `order-bulk-actions.ts` decide elegibilidade e faz o split seleção-elegível/seleção-ignorada; um composable `useChatbotHealth` (extraído do código que já existia no modal de "Agendar em lote") é compartilhado pelos dois modais novos para evitar duplicar a verificação de saúde do chatbot. As páginas de Expedição, Disparo Chatbot e Check In são deletadas junto com toda fixture/métrica/teste que só existia para alimentá-las; links órfãos em `tratativas.vue` e `chatbot-monitor.vue` (que apontavam para `/operacao/disparo-chatbot`) e breadcrumbs em `app/utils/breadcrumbs.ts` são corrigidos. `app/components/app/navigation.ts`, `AppSidebar.vue`, `tests/navigation.spec.ts` e as asserções de `navigationItems` dentro de `tests/p2-screens.spec.ts`/`tests/p3-screens.spec.ts` **não são tocados** — isso é responsabilidade do plano irmão de navegação.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, TypeScript, Nuxt UI 4 (`UDropdownMenu`, `UModal` via `AppModal`), Tailwind CSS 4, Vitest + `@nuxt/test-utils/runtime` (`mountSuspended`, ambiente `nuxt`).

---

## Decisões fechadas (não deixar vago)

1. **Botão primário da toolbar continua "Agendar em lote"** — já é a ação existente/mais usada hoje; as duas novas ações entram só no dropdown "Mais ações".
2. **Regra de elegibilidade para "Gerar etiqueta":** um pedido é elegível se `labelPrinted !== true`. O item do dropdown fica **desabilitado** (não escondido) quando **nenhum** pedido selecionado é elegível. Quando a seleção é mista (alguns já impressos, outros não), o modal processa **apenas os elegíveis** e mostra uma linha de aviso informando quantos pedidos foram ignorados por já terem etiqueta. Isso resolve o caso "seleção feita na listagem geral, não numa tela filtrada para expedição": a listagem de pedidos não filtra por elegibilidade antes de selecionar, então a filtragem acontece na hora de abrir/confirmar o modal, não na seleção em si.
3. **Regra de elegibilidade para "Disparar chatbot":** um pedido é elegível se `chatbotEligible === true`. Mesmo comportamento de desabilitar quando zero elegíveis e ignorar os inelegíveis dentro de uma seleção mista, com aviso no modal.
4. **Após confirmar qualquer uma das três ações em lote** (agendar, etiqueta, chatbot), `selectedIds` é limpo por completo (`selectedIds.value = []`), igual ao comportamento já existente do "Agendar em lote" — não deixamos pedidos ignorados "presos" na seleção.
5. **Verificação de saúde do chatbot** (`chatbotOnline`, `checkingHealth`, `checkChatbotHealth`) sai do script local de `pedidos/index.vue` e vira o composable `app/composables/useChatbotHealth.ts`, usado pelos modais de "Agendar em lote" e "Disparar chatbot" (evita duplicar a lógica dentro da mesma página).
6. **`tratativas.vue` mantém seu próprio botão/modal "Disparar"** (que opera sobre `tratativasState.orders`, um dataset separado, marcando pedidos como "trabalhados/disparados" dentro da própria tela de tratativas) — isso é uma funcionalidade distinta e não faz parte desta migração. Só o botão "Disparo" que **linkava para a rota `/operacao/disparo-chatbot`** (agora deletada) é removido de `tratativas.vue` e de `chatbot-monitor.vue`.
7. **`chatbot-monitor.vue` não é deletado** (não está na lista de páginas a remover) — só perde o botão "Disparo" (linkava para a rota deletada) e seu breadcrumb pai deixa de referenciar `/operacao/disparo-chatbot`.
8. **Dropdown usa `UDropdownMenu` do Nuxt UI 4 diretamente** (com `AppButton` como trigger via slot padrão) — não existe nenhum componente de menu/dropdown próprio no projeto (`grep -r UDropdownMenu app/` não retornou nada antes desta migração), então não estamos inventando um padrão novo, apenas usando um componente que a biblioteca já usada pelo projeto (via `USelectMenu`, `UModal`, `UButton`) já expõe.
9. **Fora de escopo, não tocar:** `app/components/app/navigation.ts`, `app/components/app/AppSidebar.vue`, `tests/navigation.spec.ts`, os testes que comparam a lista completa de `navigationItems` dentro de `tests/p2-screens.spec.ts` e `tests/p3-screens.spec.ts`, e a cópia em `D:/DEVJUANMARCOS/PROJETOS/KEENER/VIA REVERSA/via-teste`.
10. **Não testamos a abertura interativa do `UDropdownMenu` via clique simulado** (Radix/reka-ui, sem overlay portalado nos testes já existentes do projeto — não há precedente de teste assim em `tests/components.spec.ts`). A cobertura de elegibilidade fica nas funções puras de `order-bulk-actions.ts` e no composable `useChatbotHealth`; a cobertura do componente de página fica em asserções estruturais (o markup contém os textos/testids esperados) mais um teste de regressão que confirma que a ação já existente ("Agendar em lote") continua funcionando após a extração do composable.

---

## File Structure

- **Modify:** `app/types/domain.ts` — adiciona `labelPrinted?: boolean` e `chatbotEligible?: boolean` em `Order`.
- **Modify:** `app/data/demo/orders.ts` — seta as duas flags em cada pedido mock (`baseOrders` + `featuredOrder`).
- **Create:** `app/utils/order-bulk-actions.ts` — funções puras: `isLabelPrintable`, `isChatbotDispatchable`, `splitEligibleSelection`, `markOrdersLabelPrinted`, `markOrdersChatbotDispatched`.
- **Create:** `tests/order-bulk-actions.spec.ts` — testes das funções puras acima.
- **Create:** `app/composables/useChatbotHealth.ts` — estado compartilhado (`chatbotOnline`, `checkingHealth`, `checkChatbotHealth`) via `useState`, com o toast de "Chatbot verificado" embutido.
- **Create:** `tests/use-chatbot-health.spec.ts` — testes do composable.
- **Modify:** `app/pages/pedidos/index.vue` — troca os refs locais do chatbot pelo composable; adiciona `UDropdownMenu` "Mais ações" com "Gerar etiqueta" e "Disparar chatbot"; adiciona os dois `AppModal` novos.
- **Create:** `tests/pedidos-bulk-actions.spec.ts` — testes estruturais + regressão do dropdown/modais novos na página de pedidos.
- **Delete:** `app/pages/operacao/expedicao.vue`
- **Delete:** `app/pages/operacao/disparo-chatbot.vue`
- **Delete:** `app/pages/loja/check-in.vue`
- **Delete:** `app/data/demo/expedicao.ts`
- **Delete:** `app/data/demo/loja-check-in.ts`
- **Modify:** `app/data/demo/chatbot-operacional.ts` — remove `DispatchStatus`, `ChatbotDispatchRow`, `chatbotDispatchState`, `buildDispatchDistribution`, `dispatchChatbotOrders`.
- **Modify:** `app/utils/operacao-p2-metrics.ts` — remove `buildExpedicaoMetrics` e o import de `ExpedicaoOrderRow`.
- **Modify:** `app/utils/operacao-p3-metrics.ts` — remove `buildChatbotDispatchMetrics`, `buildLojaCheckInMetrics` e os imports de `ChatbotDispatchRow`/`CheckInHistoryRow`.
- **Modify:** `app/utils/breadcrumbs.ts` — remove os blocos de `/operacao/expedicao`, `/operacao/disparo-chatbot`, `/loja/check-in`; corrige o breadcrumb de `/operacao/chatbot-monitor`.
- **Modify:** `app/pages/operacao/chatbot-monitor.vue` — remove o botão "Disparo".
- **Modify:** `app/pages/operacao/tratativas.vue` — remove o botão "Disparo" (mantém o botão/modal "Disparar" locais).
- **Modify:** `tests/routes.spec.ts` — remove as 3 rotas deletadas; adiciona a rota migrada (`pedidos/index.vue` com `etiqueta-pdf-preview`).
- **Modify:** `tests/p2-screens.spec.ts` — remove imports/teste/breadcrumb de Expedição.
- **Modify:** `tests/p3-screens.spec.ts` — remove imports/teste/breadcrumb de Disparo Chatbot e Check In; corrige o breadcrumb de `chatbot-monitor`.

---

### Task 1: Elegibilidade no modelo de pedido (`Order`) + fixtures

**Files:**
- Modify: `app/types/domain.ts:95-121` (interface `Order`)
- Modify: `app/data/demo/orders.ts:3-70` (`baseOrders`, `featuredOrder`)
- Test: `tests/domain.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicione ao final do `describe('domínio operacional', ...)` em `tests/domain.spec.ts` (depois do `it('expõe jornada e estabelecimentos do pedido em destaque', ...)`, antes do `})` final):

```ts
  it('marca elegibilidade de etiqueta e disparo de chatbot nos pedidos mock', () => {
    const backOrder = orders.find((order) => order.id === '48219')
    const assignedOrder = orders.find((order) => order.id === '48208')
    const stockOrder = orders.find((order) => order.id === '48201')
    const supportMissingOrder = orders.find((order) => order.id === '48197')
    const newOrder = orders.find((order) => order.id === '48190')

    expect(backOrder?.labelPrinted).toBe(false)
    expect(backOrder?.chatbotEligible).toBe(false)
    expect(assignedOrder?.labelPrinted).toBe(false)
    expect(assignedOrder?.chatbotEligible).toBe(true)
    expect(stockOrder?.labelPrinted).toBe(true)
    expect(stockOrder?.chatbotEligible).toBe(false)
    expect(supportMissingOrder?.labelPrinted).toBe(false)
    expect(supportMissingOrder?.chatbotEligible).toBe(false)
    expect(newOrder?.labelPrinted).toBe(false)
    expect(newOrder?.chatbotEligible).toBe(true)
    expect(featuredOrder.labelPrinted).toBe(true)
    expect(featuredOrder.chatbotEligible).toBe(false)
  })
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test:run -- tests/domain.spec.ts`
Expected: FAIL — `labelPrinted`/`chatbotEligible` são `undefined`, todas as asserções `toBe(false)`/`toBe(true)` quebram (menos as que esperam `undefined`... na prática todas falham porque `undefined !== false/true`).

- [ ] **Step 3: Adicionar os campos na interface `Order`**

Em `app/types/domain.ts`, dentro de `export interface Order { ... }` (linha 95-121), adicione as duas linhas abaixo depois de `slaTone: StatusTone`:

```ts
export interface Order {
  id: string
  href: string
  client: string
  operation: string
  state: string
  status: StatusKey
  statusLabel?: string
  supportPoint: string
  responsible: string
  region: string
  createdAt: string
  updatedAt: string
  stageDuration: string
  sla: string
  slaTone: StatusTone
  /** Etiqueta 100×150mm já gerada para este pedido (bloqueia "Gerar etiqueta" em lote). */
  labelPrinted?: boolean
  /** Pedido elegível para disparo de template de chatbot em lote. */
  chatbotEligible?: boolean
  items: number
  occurrences: number
  evidences: number
  scheduling: number
  document?: string
  externalOrder?: string
  address?: string
  transporter?: string
  events: OrderEvent[]
  establishments: Establishment[]
}
```

- [ ] **Step 4: Popular as fixtures em `app/data/demo/orders.ts`**

Substitua o bloco `baseOrders` (linhas 3-34) por:

```ts
const baseOrders: Order[] = [
  {
    id: '48219', href: '/pedidos/48219', client: 'Renner', operation: 'Troca', state: 'RJ', status: 'backOrder',
    supportPoint: 'Não atribuído', responsible: 'Aguardando reposição', region: 'RJ', createdAt: '15/07 19:02', updatedAt: 'há 14 min',
    stageDuration: '23 min', sla: 'Em risco', slaTone: 'warning', labelPrinted: false, chatbotEligible: false,
    items: 2, occurrences: 0, evidences: 0, scheduling: 0,
    events: [], establishments: []
  },
  {
    id: '48208', href: '/pedidos/48208', client: 'Amazon BR', operation: 'Reversa', state: 'SP', status: 'assigned',
    supportPoint: 'Ponto de apoio Centro', responsible: 'João R.', region: 'SP', createdAt: '15/07 14:55', updatedAt: 'há 8 min',
    stageDuration: '4 min', sla: '5h40', slaTone: 'success', labelPrinted: false, chatbotEligible: true,
    items: 1, occurrences: 0, evidences: 1, scheduling: 0,
    events: [], establishments: []
  },
  {
    id: '48201', href: '/pedidos/48201', client: 'Netshoes', operation: 'Troca', state: 'PR', status: 'stock',
    supportPoint: 'Ponto de apoio Zona Sul', responsible: 'Camila F.', region: 'PR', createdAt: '15/07 11:30', updatedAt: 'há 19 min',
    stageDuration: '1h12', sla: '8h05', slaTone: 'success', labelPrinted: true, chatbotEligible: false,
    items: 1, occurrences: 0, evidences: 0, scheduling: 1,
    events: [], establishments: []
  },
  {
    id: '48197', href: '/pedidos/48197', client: 'Renner', operation: 'Reversa', state: 'RS', status: 'supportMissing',
    supportPoint: 'Não atribuído', responsible: 'Aguardando roteirização', region: 'RS', createdAt: '15/07 09:18', updatedAt: 'há 22 min',
    stageDuration: '22 min', sla: 'Em risco', slaTone: 'warning', labelPrinted: false, chatbotEligible: false,
    items: 1, occurrences: 0, evidences: 0, scheduling: 0,
    events: [], establishments: []
  },
  {
    id: '48190', href: '/pedidos/48190', client: 'Casas Bahia', operation: 'Reversa', state: 'BA', status: 'new',
    supportPoint: 'Não atribuído', responsible: 'Triagem', region: 'BA', createdAt: '15/07 08:02', updatedAt: 'há 11 min',
    stageDuration: '11 min', sla: '12h00', slaTone: 'success', labelPrinted: false, chatbotEligible: true,
    items: 1, occurrences: 0, evidences: 0, scheduling: 0,
    events: [], establishments: []
  }
]
```

E adicione `labelPrinted: true, chatbotEligible: false,` em `featuredOrder` (linhas 36-70), na linha do `slaTone`:

```ts
export const featuredOrder: Order = {
  id: '48224',
  href: '/pedidos/48224',
  client: 'Casas Bahia',
  operation: 'Reversa',
  state: 'SP',
  status: 'occurrence',
  supportPoint: 'Ponto de apoio Zona Sul',
  responsible: 'Ana Duarte',
  region: 'SP',
  createdAt: '16/07 às 07:40',
  updatedAt: '09:14',
  stageDuration: '18 min',
  sla: 'Expirado 1h18',
  slaTone: 'danger',
  labelPrinted: true,
  chatbotEligible: false,
  items: 1,
  occurrences: 3,
  evidences: 2,
  scheduling: 1,
  document: 'NF 883.192',
  externalOrder: '92014',
  address: 'Av. Paulista, 1578 · São Paulo · SP',
  transporter: 'Marcos L.',
  events: [
    { time: '07:40', name: 'Criado', description: 'Pedido recebido', tone: 'info' },
    { time: '07:41', name: 'Atribuído', description: 'Transportador definido', tone: 'info' },
    { time: '07:58', name: 'Em rota', description: 'Coleta iniciada', tone: 'info' },
    { time: '09:14', name: 'Ocorrência', description: 'Endereço não localizado', tone: 'danger' }
  ],
  establishments: [
    { role: 'Origem', name: 'Casas Bahia · Loja Paulista', detail: 'Av. Paulista, 1578' },
    { role: 'Ponto de apoio', name: 'Ponto de apoio Zona Sul', detail: 'Responsável: Ana Duarte' },
    { role: 'Destino', name: 'Centro de distribuição Cajamar', detail: 'Rod. Anhanguera, km 33' }
  ]
}
```

O restante do arquivo (`orders`, `liveOrders`, `liveMetrics`, `ordersMetrics`, `attentionItems`) não muda.

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npm run test:run -- tests/domain.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/types/domain.ts app/data/demo/orders.ts tests/domain.spec.ts
git commit -m "feat(pedidos): adiciona elegibilidade de etiqueta e chatbot ao modelo de pedido"
```

---

### Task 2: `order-bulk-actions.ts` (funções puras de elegibilidade)

**Files:**
- Create: `app/utils/order-bulk-actions.ts`
- Test: `tests/order-bulk-actions.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Crie `tests/order-bulk-actions.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { Order } from '../app/types/domain'
import {
  isChatbotDispatchable,
  isLabelPrintable,
  markOrdersChatbotDispatched,
  markOrdersLabelPrinted,
  splitEligibleSelection
} from '../app/utils/order-bulk-actions'

function buildOrder(overrides: Partial<Order>): Order {
  return {
    id: '00000',
    href: '/pedidos/00000',
    client: 'Cliente Teste',
    operation: 'Reversa',
    state: 'SP',
    status: 'new',
    supportPoint: 'Ponto de apoio Centro',
    responsible: 'Equipe Teste',
    region: 'SP',
    createdAt: '18/07 10:00',
    updatedAt: 'há 1 min',
    stageDuration: '1 min',
    sla: '4h00',
    slaTone: 'success',
    items: 1,
    occurrences: 0,
    evidences: 0,
    scheduling: 0,
    events: [],
    establishments: [],
    ...overrides
  }
}

describe('order-bulk-actions', () => {
  it('isLabelPrintable: elegível quando não impresso', () => {
    expect(isLabelPrintable(buildOrder({ labelPrinted: false }))).toBe(true)
    expect(isLabelPrintable(buildOrder({ labelPrinted: undefined }))).toBe(true)
    expect(isLabelPrintable(buildOrder({ labelPrinted: true }))).toBe(false)
  })

  it('isChatbotDispatchable: só elegível quando chatbotEligible é true', () => {
    expect(isChatbotDispatchable(buildOrder({ chatbotEligible: true }))).toBe(true)
    expect(isChatbotDispatchable(buildOrder({ chatbotEligible: false }))).toBe(false)
    expect(isChatbotDispatchable(buildOrder({ chatbotEligible: undefined }))).toBe(false)
  })

  it('splitEligibleSelection separa elegíveis de ignorados e ignora ids inexistentes', () => {
    const orders = [
      buildOrder({ id: '1', labelPrinted: false }),
      buildOrder({ id: '2', labelPrinted: true }),
      buildOrder({ id: '3', labelPrinted: false })
    ]
    const result = splitEligibleSelection(orders, ['1', '2', '3', '999'], isLabelPrintable)
    expect(result.eligible).toEqual(['1', '3'])
    expect(result.ineligible).toEqual(['2'])
  })

  it('markOrdersLabelPrinted marca só os ids informados e retorna a contagem', () => {
    const orders = [
      buildOrder({ id: '1', labelPrinted: false }),
      buildOrder({ id: '2', labelPrinted: false }),
      buildOrder({ id: '3', labelPrinted: true })
    ]
    const count = markOrdersLabelPrinted(orders, ['1', '3'])
    expect(count).toBe(1)
    expect(orders[0]?.labelPrinted).toBe(true)
    expect(orders[1]?.labelPrinted).toBe(false)
  })

  it('markOrdersChatbotDispatched desliga chatbotEligible dos ids elegíveis e retorna a contagem', () => {
    const orders = [
      buildOrder({ id: '1', chatbotEligible: true }),
      buildOrder({ id: '2', chatbotEligible: false }),
      buildOrder({ id: '3', chatbotEligible: true })
    ]
    const count = markOrdersChatbotDispatched(orders, ['1', '2', '3'])
    expect(count).toBe(2)
    expect(orders[0]?.chatbotEligible).toBe(false)
    expect(orders[1]?.chatbotEligible).toBe(false)
    expect(orders[2]?.chatbotEligible).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test:run -- tests/order-bulk-actions.spec.ts`
Expected: FAIL — `Cannot find module '../app/utils/order-bulk-actions'`

- [ ] **Step 3: Implementar `app/utils/order-bulk-actions.ts`**

```ts
/**
 * Elegibilidade e mutação em lote para as ações "Gerar etiqueta" e
 * "Disparar chatbot" na listagem de pedidos.
 * Migrado de app/pages/operacao/expedicao.vue e
 * app/pages/operacao/disparo-chatbot.vue — agora opera sobre os pedidos
 * reais da listagem (via `Order`), não mais sobre fixtures isoladas.
 */
import type { Order } from '../types/domain'

export interface BulkSelectionSplit {
  eligible: string[]
  ineligible: string[]
}

/** Elegível para etiqueta enquanto não tiver sido impressa ainda. */
export function isLabelPrintable(order: Order): boolean {
  return order.labelPrinted !== true
}

/** Elegível para disparo de chatbot só quando explicitamente marcado. */
export function isChatbotDispatchable(order: Order): boolean {
  return order.chatbotEligible === true
}

/**
 * Divide os ids selecionados entre elegíveis e ignorados segundo `predicate`.
 * Ids que não existem em `orders` são descartados silenciosamente.
 */
export function splitEligibleSelection(
  orders: Order[],
  selectedIds: string[],
  predicate: (order: Order) => boolean
): BulkSelectionSplit {
  const eligible: string[] = []
  const ineligible: string[] = []
  for (const id of selectedIds) {
    const order = orders.find((item) => item.id === id)
    if (!order) continue
    if (predicate(order)) eligible.push(id)
    else ineligible.push(id)
  }
  return { eligible, ineligible }
}

/** Marca os pedidos elegíveis (ids) como já impressos. Retorna quantos mudaram. */
export function markOrdersLabelPrinted(orders: Order[], ids: string[]): number {
  let count = 0
  for (const order of orders) {
    if (ids.includes(order.id) && isLabelPrintable(order)) {
      order.labelPrinted = true
      count += 1
    }
  }
  return count
}

/** Marca os pedidos elegíveis (ids) como disparados no chatbot. Retorna quantos mudaram. */
export function markOrdersChatbotDispatched(orders: Order[], ids: string[]): number {
  let count = 0
  for (const order of orders) {
    if (ids.includes(order.id) && isChatbotDispatchable(order)) {
      order.chatbotEligible = false
      count += 1
    }
  }
  return count
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm run test:run -- tests/order-bulk-actions.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/utils/order-bulk-actions.ts tests/order-bulk-actions.spec.ts
git commit -m "feat(pedidos): funções puras de elegibilidade para ações em lote"
```

---

### Task 3: `useChatbotHealth` (composable compartilhado) + refactor do modal existente

**Files:**
- Create: `app/composables/useChatbotHealth.ts`
- Test: `tests/use-chatbot-health.spec.ts`
- Modify: `app/pages/pedidos/index.vue:1-99` (script setup)
- Test: `tests/pedidos-bulk-actions.spec.ts` (novo arquivo, primeiro teste)

- [ ] **Step 1: Escrever o teste do composable que falha**

Crie `tests/use-chatbot-health.spec.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useChatbotHealth } from '../app/composables/useChatbotHealth'
import { useToast } from '../app/composables/useToast'

describe('useChatbotHealth', () => {
  beforeEach(() => {
    useToast().clear()
  })

  it('inicia online e alterna checkingHealth durante a verificação (mock)', async () => {
    const { chatbotOnline, checkingHealth, checkChatbotHealth } = useChatbotHealth()
    expect(chatbotOnline.value).toBe(true)

    const pending = checkChatbotHealth()
    expect(checkingHealth.value).toBe(true)

    await pending
    expect(checkingHealth.value).toBe(false)
    expect(chatbotOnline.value).toBe(true)

    const { toasts } = useToast()
    expect(toasts.value.at(-1)?.title).toBe('Chatbot verificado')
  })

  it('compartilha o mesmo estado entre chamadas (useState)', () => {
    const a = useChatbotHealth()
    const b = useChatbotHealth()

    a.checkingHealth.value = true
    expect(b.checkingHealth.value).toBe(true)
    a.checkingHealth.value = false
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test:run -- tests/use-chatbot-health.spec.ts`
Expected: FAIL — `Cannot find module '../app/composables/useChatbotHealth'`

- [ ] **Step 3: Implementar `app/composables/useChatbotHealth.ts`**

```ts
import { useToast } from './useToast'

/**
 * Estado compartilhado de saúde do chatbot (mock) — usado pelos modais de
 * "Agendar em lote" e "Disparar chatbot" em app/pages/pedidos/index.vue.
 * Extraído para evitar duplicar a verificação entre os dois modais da
 * mesma página.
 */
export function useChatbotHealth() {
  const chatbotOnline = useState('chatbot-health-online', () => true)
  const checkingHealth = useState('chatbot-health-checking', () => false)

  async function checkChatbotHealth() {
    checkingHealth.value = true
    await new Promise((resolve) => setTimeout(resolve, 420))
    chatbotOnline.value = true
    checkingHealth.value = false
    useToast().info('Chatbot verificado', 'Serviço online (mock).')
  }

  return { chatbotOnline, checkingHealth, checkChatbotHealth }
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm run test:run -- tests/use-chatbot-health.spec.ts`
Expected: PASS

- [ ] **Step 5: Escrever o teste de regressão da página (falha antes do refactor não se aplica — é caracterização; ver Step 7)**

Crie `tests/pedidos-bulk-actions.spec.ts`:

```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
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
})
```

- [ ] **Step 6: Rodar o teste e confirmar que falha (o `data-testid="pedidos-schedule-button"` ainda não existe)**

Run: `npm run test:run -- tests/pedidos-bulk-actions.spec.ts`
Expected: FAIL — `Cannot find element matching selector "[data-testid="pedidos-schedule-button"]"`

- [ ] **Step 7: Refatorar `app/pages/pedidos/index.vue` para usar o composable**

No `<script setup>` de `app/pages/pedidos/index.vue`, substitua:

```ts
import { orders, ordersMetrics } from '~/data/demo/orders'
import {
  chatbotTemplateOptions,
  productOptions,
  schedulingChannelOptions,
  type SchedulingChannelValue
} from '~/data/demo/order-modals'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const activeTab = ref('Em aberto')
const tabs = ['Em aberto · 5', 'Em rota · 1', 'Concluídos / Ocorrências · 4']
const listOrders = computed(() => orders.slice(0, 5))
const selectedIds = ref<string[]>([])

const scheduleOpen = ref(false)
const importOpen = ref(false)
const scheduleLoading = ref(false)
const importLoading = ref(false)

const chatbotOnline = ref(true)
const checkingHealth = ref(false)
const selectedChannels = ref<SchedulingChannelValue[]>(['whatsapp', 'sms'])
const selectedTemplateId = ref<string>(chatbotTemplateOptions[0]!.id)
const selectedProductId = ref<string>(productOptions[0]!.id)
const importFileName = ref('')
```

por:

```ts
import { orders, ordersMetrics } from '~/data/demo/orders'
import {
  chatbotTemplateOptions,
  productOptions,
  schedulingChannelOptions,
  type SchedulingChannelValue
} from '~/data/demo/order-modals'
import { useToast } from '~/composables/useToast'
import { useChatbotHealth } from '~/composables/useChatbotHealth'

const toast = useToast()
const { chatbotOnline, checkingHealth, checkChatbotHealth } = useChatbotHealth()

const activeTab = ref('Em aberto')
const tabs = ['Em aberto · 5', 'Em rota · 1', 'Concluídos / Ocorrências · 4']
const listOrders = computed(() => orders.slice(0, 5))
const selectedIds = ref<string[]>([])

const scheduleOpen = ref(false)
const importOpen = ref(false)
const scheduleLoading = ref(false)
const importLoading = ref(false)

const selectedChannels = ref<SchedulingChannelValue[]>(['whatsapp', 'sms'])
const selectedTemplateId = ref<string>(chatbotTemplateOptions[0]!.id)
const selectedProductId = ref<string>(productOptions[0]!.id)
const importFileName = ref('')
```

Remova a função `async function checkChatbotHealth() { ... }` (o bloco inteiro, agora vem do composable).

Na função `confirmSchedule`, `if (!chatbotOnline.value) { ... }` continua igual (o ref agora vem do composable, mesma API).

- [ ] **Step 8: Adicionar `data-testid="pedidos-schedule-button"` no botão "Agendar em lote"**

No `<template>`, altere:

```html
<AppButton
  icon="i-lucide-calendar-check"
  variant="primary"
  @click="openSchedule"
>
  Agendar em lote
</AppButton>
```

para:

```html
<AppButton
  data-testid="pedidos-schedule-button"
  icon="i-lucide-calendar-check"
  variant="primary"
  @click="openSchedule"
>
  Agendar em lote
</AppButton>
```

- [ ] **Step 9: Rodar o teste e confirmar que passa**

Run: `npm run test:run -- tests/pedidos-bulk-actions.spec.ts tests/use-chatbot-health.spec.ts`
Expected: PASS

- [ ] **Step 10: Rodar a suíte completa para garantir que nada mais quebrou**

Run: `npm run test:run`
Expected: PASS (todos os testes, incluindo os que já existiam para `pedidos/index.vue` indiretamente via `routes.spec.ts`)

- [ ] **Step 11: Commit**

```bash
git add app/composables/useChatbotHealth.ts tests/use-chatbot-health.spec.ts app/pages/pedidos/index.vue tests/pedidos-bulk-actions.spec.ts
git commit -m "refactor(pedidos): extrai useChatbotHealth do modal de agendar em lote"
```

---

### Task 4: Ação "Gerar etiqueta" (dropdown "Mais ações" + modal)

**Files:**
- Modify: `app/pages/pedidos/index.vue`
- Test: `tests/pedidos-bulk-actions.spec.ts`

- [ ] **Step 1: Escrever os testes que falham**

Adicione a `tests/pedidos-bulk-actions.spec.ts`, dentro do `describe('pedidos/index.vue — ações em lote', ...)`:

```ts
  it('exibe o dropdown "Mais ações" com "Gerar etiqueta" quando algo está selecionado', async () => {
    const wrapper = await mountSuspended(PedidosIndex)
    expect(wrapper.find('[data-testid="pedidos-more-actions"]').exists()).toBe(false)

    const checkbox = wrapper.get('[aria-label="Selecionar pedido 48208"]')
    await checkbox.trigger('click')

    expect(wrapper.find('[data-testid="pedidos-more-actions"]').exists()).toBe(true)
    expect(wrapper.html()).toContain('Gerar etiqueta')
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
```

Adicione também o import de `nextTick` se necessário (não é: `wrapper.vm.$nextTick()` já resolve). Para o teste acessar `canGenerateLabel`/`openLabel` via `wrapper.vm`, é necessário `defineExpose` no componente (Step 4 abaixo).

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npm run test:run -- tests/pedidos-bulk-actions.spec.ts`
Expected: FAIL — `data-testid="pedidos-more-actions"` não existe; `vm.canGenerateLabel` é `undefined`.

- [ ] **Step 3: Adicionar estado e lógica no `<script setup>`**

Em `app/pages/pedidos/index.vue`, adicione os imports:

```ts
import {
  isChatbotDispatchable,
  isLabelPrintable,
  markOrdersLabelPrinted,
  splitEligibleSelection
} from '~/utils/order-bulk-actions'
```

E, depois de `const importFileName = ref('')`, adicione:

```ts
const labelOpen = ref(false)
const labelLoading = ref(false)

const labelSelection = computed(() =>
  splitEligibleSelection(orders, selectedIds.value, isLabelPrintable)
)
const canGenerateLabel = computed(() => labelSelection.value.eligible.length > 0)

const moreActionsItems = computed(() => [[
  {
    label: 'Gerar etiqueta',
    icon: 'i-lucide-tag',
    disabled: !canGenerateLabel.value,
    onSelect: openLabel
  }
]])

function openLabel() {
  if (!canGenerateLabel.value) {
    toast.error('Seleção inválida', 'Nenhum pedido selecionado é elegível para etiqueta (já impressos).')
    return
  }
  labelOpen.value = true
}

async function confirmLabel() {
  labelLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 480))
  const count = markOrdersLabelPrinted(orders, labelSelection.value.eligible)
  labelLoading.value = false
  labelOpen.value = false
  toast.success('Etiquetas geradas', `${count} etiqueta(s) enviada(s) para impressão (mock PDF).`)
  selectedIds.value = []
}

defineExpose({ canGenerateLabel, openLabel })
```

(O import de `isChatbotDispatchable` já entra agora porque será usado na Task 5 — deixe-o mesmo que o lint não reclame de import não usado só nesta task; se o lint reclamar antes da Task 5, remova `isChatbotDispatchable` deste import e adicione-o na Task 5.)

- [ ] **Step 4: Adicionar o dropdown e o modal no `<template>`**

Substitua o bloco da toolbar de ações em lote:

```html
    <section
      v-if="selectedIds.length"
      class="flex min-h-12 items-center gap-2 border-b border-via-line bg-[color-mix(in_oklab,var(--via-blue-soft)_45%,var(--via-surface))] px-[18px]"
      aria-label="Ações em lote"
    >
      <strong class="text-xs text-via-ink">{{ selectedIds.length }} selecionado(s)</strong>
      <AppButton
        data-testid="pedidos-schedule-button"
        icon="i-lucide-calendar-check"
        variant="primary"
        @click="openSchedule"
      >
        Agendar em lote
      </AppButton>
      <AppButton
        variant="ghost"
        @click="selectedIds = []"
      >
        Limpar seleção
      </AppButton>
    </section>
```

por:

```html
    <section
      v-if="selectedIds.length"
      class="flex min-h-12 items-center gap-2 border-b border-via-line bg-[color-mix(in_oklab,var(--via-blue-soft)_45%,var(--via-surface))] px-[18px]"
      aria-label="Ações em lote"
    >
      <strong class="text-xs text-via-ink">{{ selectedIds.length }} selecionado(s)</strong>
      <AppButton
        data-testid="pedidos-schedule-button"
        icon="i-lucide-calendar-check"
        variant="primary"
        @click="openSchedule"
      >
        Agendar em lote
      </AppButton>
      <UDropdownMenu
        :items="moreActionsItems"
        :portal="false"
        data-testid="pedidos-more-actions"
      >
        <AppButton icon="i-lucide-ellipsis" aria-label="Mais ações">
          Mais ações
        </AppButton>
      </UDropdownMenu>
      <AppButton
        variant="ghost"
        @click="selectedIds = []"
      >
        Limpar seleção
      </AppButton>
    </section>
```

E adicione o modal novo depois do `</AppModal>` do modal de importação (final do `<template>`, antes do `</div>` de fechamento):

```html
    <AppModal
      v-model:open="labelOpen"
      variant="confirm"
      title="Imprimir etiquetas"
      :description="`${labelSelection.eligible.length} pedido(s) serão marcados como impressos (mock PDF).`"
      confirm-label="Gerar PDF"
      confirm-variant="primary"
      :loading="labelLoading"
      @confirm="confirmLabel"
    >
      <p
        v-if="labelSelection.ineligible.length"
        class="mb-3 text-xs text-via-muted"
      >
        {{ labelSelection.ineligible.length }} pedido(s) já possuem etiqueta e serão ignorados.
      </p>
      <div
        class="border border-via-line bg-via-surface-2 p-3"
        data-testid="etiqueta-pdf-preview"
        aria-label="Pré-visualização da etiqueta"
      >
        <p class="m-0 text-[10px] font-bold tracking-wide text-via-muted uppercase">
          Pré-visualização · etiqueta 100×150 mm
        </p>
        <div class="mt-2 border border-dashed border-via-line-strong bg-white px-3 py-4">
          <p class="m-0 text-xs font-bold text-via-ink">
            Via Reversa · Etiqueta
          </p>
          <p class="mt-1 mb-0 text-sm text-via-ink">
            Pedido #{{ labelSelection.eligible[0] ?? '—' }}
            <span v-if="labelSelection.eligible.length > 1">
              (+{{ labelSelection.eligible.length - 1 }})
            </span>
          </p>
          <p class="mt-2 mb-0 font-mono text-[11px] tracking-[0.2em] text-via-muted">
            ||||||||||||||||||||
          </p>
          <p class="mt-1 mb-0 text-[10px] text-via-muted">
            Mock PDF — arquivo real na integração de API.
          </p>
        </div>
      </div>
    </AppModal>
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `npm run test:run -- tests/pedidos-bulk-actions.spec.ts`
Expected: PASS

- [ ] **Step 6: Rodar a suíte completa**

Run: `npm run test:run`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/pages/pedidos/index.vue tests/pedidos-bulk-actions.spec.ts
git commit -m "feat(pedidos): ação 'Gerar etiqueta' em lote via dropdown Mais ações"
```

---

### Task 5: Ação "Disparar chatbot" (segundo item do dropdown + modal)

**Files:**
- Modify: `app/pages/pedidos/index.vue`
- Test: `tests/pedidos-bulk-actions.spec.ts`

- [ ] **Step 1: Escrever os testes que falham**

Adicione a `tests/pedidos-bulk-actions.spec.ts`:

```ts
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
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npm run test:run -- tests/pedidos-bulk-actions.spec.ts`
Expected: FAIL — `vm.canDispatchChatbot` é `undefined`.

- [ ] **Step 3: Adicionar estado e lógica no `<script setup>`**

Depois do bloco de `labelOpen`/`confirmLabel` da Task 4, adicione:

```ts
const dispatchOpen = ref(false)
const dispatchLoading = ref(false)

const chatbotSelection = computed(() =>
  splitEligibleSelection(orders, selectedIds.value, isChatbotDispatchable)
)
const canDispatchChatbot = computed(() => chatbotSelection.value.eligible.length > 0)

function openDispatch() {
  if (!canDispatchChatbot.value) {
    toast.error('Seleção inválida', 'Nenhum pedido selecionado é elegível para disparo de chatbot.')
    return
  }
  dispatchOpen.value = true
}

async function confirmDispatch() {
  if (!chatbotOnline.value) {
    toast.error('Chatbot offline', 'Verifique o status antes de disparar.')
    return
  }
  dispatchLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 480))
  const count = markOrdersChatbotDispatched(orders, chatbotSelection.value.eligible)
  dispatchLoading.value = false
  dispatchOpen.value = false
  toast.success('Disparo iniciado', `${count} pedido(s) enfileirado(s) no chatbot (mock).`)
  selectedIds.value = []
}
```

Atualize o import de `~/utils/order-bulk-actions` (já tinha `isChatbotDispatchable` desde a Task 4) para incluir `markOrdersChatbotDispatched`:

```ts
import {
  isChatbotDispatchable,
  isLabelPrintable,
  markOrdersChatbotDispatched,
  markOrdersLabelPrinted,
  splitEligibleSelection
} from '~/utils/order-bulk-actions'
```

Atualize `moreActionsItems` para incluir o segundo item:

```ts
const moreActionsItems = computed(() => [[
  {
    label: 'Gerar etiqueta',
    icon: 'i-lucide-tag',
    disabled: !canGenerateLabel.value,
    onSelect: openLabel
  },
  {
    label: 'Disparar chatbot',
    icon: 'i-lucide-bot',
    disabled: !canDispatchChatbot.value,
    onSelect: openDispatch
  }
]])
```

Atualize o `defineExpose` para incluir os novos nomes:

```ts
defineExpose({ canGenerateLabel, openLabel, canDispatchChatbot, openDispatch })
```

- [ ] **Step 4: Adicionar o modal no `<template>`**

Depois do `</AppModal>` do modal de etiqueta (Task 4), adicione:

```html
    <AppModal
      v-model:open="dispatchOpen"
      variant="confirm"
      title="Disparar chatbot"
      :description="`${chatbotSelection.eligible.length} pedido(s) serão enfileirados no chatbot (mock).`"
      confirm-label="Disparar agora"
      confirm-variant="primary"
      :loading="dispatchLoading"
      @confirm="confirmDispatch"
    >
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span
          class="inline-block size-2.5 rounded-full"
          :class="chatbotOnline ? 'bg-via-green' : 'bg-via-red'"
          aria-hidden="true"
        />
        <strong>Chatbot: {{ chatbotOnline ? 'ON' : 'OFF' }}</strong>
        <AppButton
          icon="i-lucide-refresh-cw"
          :disabled="checkingHealth"
          @click="checkChatbotHealth"
        >
          {{ checkingHealth ? 'Verificando…' : 'Verificar agora' }}
        </AppButton>
      </div>
      <p
        v-if="chatbotSelection.ineligible.length"
        class="mt-3 text-xs text-via-muted"
      >
        {{ chatbotSelection.ineligible.length }} pedido(s) não elegíveis ao chatbot e serão ignorados.
      </p>
    </AppModal>
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `npm run test:run -- tests/pedidos-bulk-actions.spec.ts`
Expected: PASS

- [ ] **Step 6: Rodar a suíte completa**

Run: `npm run test:run`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/pages/pedidos/index.vue tests/pedidos-bulk-actions.spec.ts
git commit -m "feat(pedidos): ação 'Disparar chatbot' em lote via dropdown Mais ações"
```

---

### Task 6: Deletar Expedição e limpar código morto associado

**Files:**
- Delete: `app/pages/operacao/expedicao.vue`
- Delete: `app/data/demo/expedicao.ts`
- Modify: `app/utils/operacao-p2-metrics.ts:7,125-167`
- Modify: `app/utils/breadcrumbs.ts:127-132`
- Modify: `tests/routes.spec.ts:70`
- Modify: `tests/p2-screens.spec.ts` (imports + teste + breadcrumb)

- [ ] **Step 1: Atualizar `tests/routes.spec.ts` primeiro (vira o teste que orienta a deleção)**

Remova a linha:

```ts
  ['app/pages/operacao/expedicao.vue', 'etiqueta-pdf-preview'],
```

E adicione no lugar (mantendo a lista ordenada como está, essa troca substitui a linha removida):

```ts
  ['app/pages/pedidos/index.vue', 'etiqueta-pdf-preview'],
```

- [ ] **Step 2: Rodar o teste e confirmar o novo estado**

Run: `npm run test:run -- tests/routes.spec.ts`
Expected: PASS (a rota `app/pages/pedidos/index.vue` já contém `etiqueta-pdf-preview` desde a Task 4; o arquivo de expedição ainda existe nesse ponto, mas não é mais referenciado no teste).

- [ ] **Step 3: Remover o import morto e a função `buildExpedicaoMetrics` de `app/utils/operacao-p2-metrics.ts`**

Remova a linha 7:

```ts
import type { ExpedicaoOrderRow } from '../data/demo/expedicao'
```

Remova a função inteira `buildExpedicaoMetrics` (linhas 125-167, o bloco `export function buildExpedicaoMetrics(...) { ... }`).

- [ ] **Step 4: Remover o bloco de `/operacao/expedicao` em `app/utils/breadcrumbs.ts`**

Remova:

```ts
  if (normalized === '/operacao/expedicao') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Expedição' }
    ]
  }

```

- [ ] **Step 5: Atualizar `tests/p2-screens.spec.ts`**

Remova o import (linhas 25-28):

```ts
import {
  expedicaoState,
  markOrdersPrinted
} from '../app/data/demo/expedicao'
```

Remova `buildExpedicaoMetrics` da lista de import de `../app/utils/operacao-p2-metrics` (fica só `buildCalendarioMetrics, buildRoutesListMetrics, buildRoteirizacaoMetrics`).

Remova o `it('marca etiquetas como impressas', ...)` inteiro (o bloco de teste que usa `expedicaoState`/`markOrdersPrinted`/`buildExpedicaoMetrics`) e renomeie o `describe('expedição e calendário', ...)` que o envolvia para `describe('calendário', ...)`.

Remova o bloco de asserção de breadcrumb:

```ts
    expect(resolveBreadcrumbs('/operacao/expedicao')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Expedição' }
    ])
```

- [ ] **Step 6: Rodar os testes e confirmar que passam**

Run: `npm run test:run -- tests/p2-screens.spec.ts tests/routes.spec.ts`
Expected: PASS

- [ ] **Step 7: Deletar os arquivos**

```bash
git rm "app/pages/operacao/expedicao.vue" "app/data/demo/expedicao.ts"
```

- [ ] **Step 8: Rodar a suíte completa e o typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: PASS (nenhum import morto para os arquivos deletados).

- [ ] **Step 9: Commit**

```bash
git add app/utils/operacao-p2-metrics.ts app/utils/breadcrumbs.ts tests/p2-screens.spec.ts tests/routes.spec.ts
git commit -m "chore: remove página de Expedição e código morto associado"
```

---

### Task 7: Deletar Disparo Chatbot, corrigir links órfãos e limpar código morto

**Files:**
- Delete: `app/pages/operacao/disparo-chatbot.vue`
- Modify: `app/data/demo/chatbot-operacional.ts` (remove exports específicos de disparo)
- Modify: `app/utils/operacao-p3-metrics.ts:8,118-168`
- Modify: `app/utils/breadcrumbs.ts` (remove bloco de disparo-chatbot; corrige bloco de chatbot-monitor)
- Modify: `app/pages/operacao/chatbot-monitor.vue:43-49`
- Modify: `app/pages/operacao/tratativas.vue:152-158`
- Modify: `tests/routes.spec.ts:82`
- Modify: `tests/p3-screens.spec.ts` (imports + teste + breadcrumbs)

- [ ] **Step 1: Remover o botão "Disparo" de `app/pages/operacao/chatbot-monitor.vue`**

Substitua:

```html
    <PageHeader
      title="Monitor Chatbot"
      subtitle="Saúde das filas de disparo e webhooks"
    >
      <AppButton
        icon="i-lucide-bot"
        variant="ghost"
        to="/operacao/disparo-chatbot"
      >
        Disparo
      </AppButton>
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>
```

por:

```html
    <PageHeader
      title="Monitor Chatbot"
      subtitle="Saúde das filas de disparo e webhooks"
    >
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        @click="refresh"
      >
        Atualizar
      </AppButton>
    </PageHeader>
```

- [ ] **Step 2: Remover o botão "Disparo" de `app/pages/operacao/tratativas.vue`**

Substitua:

```html
      <AppButton
        icon="i-lucide-activity"
        variant="ghost"
        to="/operacao/chatbot-monitor"
      >
        Monitor
      </AppButton>
      <AppButton
        icon="i-lucide-bot"
        variant="ghost"
        to="/operacao/disparo-chatbot"
      >
        Disparo
      </AppButton>
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        @click="refresh"
      >
        Atualizar
      </AppButton>
```

por:

```html
      <AppButton
        icon="i-lucide-activity"
        variant="ghost"
        to="/operacao/chatbot-monitor"
      >
        Monitor
      </AppButton>
      <AppButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        @click="refresh"
      >
        Atualizar
      </AppButton>
```

O botão "Disparar" (`@click="openDispatch"`, mais à frente no mesmo `PageHeader`) e o `AppModal` `dispatchOpen`/`confirmDispatch` de `tratativas.vue` **não mudam** — operam sobre `tratativasState.orders`, feature própria da tela de tratativas.

- [ ] **Step 3: Corrigir o breadcrumb de `/operacao/chatbot-monitor` em `app/utils/breadcrumbs.ts`**

Substitua:

```ts
  if (normalized === '/operacao/chatbot-monitor') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Disparo Chatbot', to: '/operacao/disparo-chatbot' },
      { label: 'Monitor' }
    ]
  }
```

por:

```ts
  if (normalized === '/operacao/chatbot-monitor') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Monitor' }
    ]
  }
```

E remova o bloco de `/operacao/disparo-chatbot`, que fica logo acima:

```ts
  if (normalized === '/operacao/disparo-chatbot') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Disparo Chatbot' }
    ]
  }

```

- [ ] **Step 4: Atualizar `tests/routes.spec.ts`**

Remova a linha:

```ts
  ['app/pages/operacao/disparo-chatbot.vue', 'DataTable'],
```

- [ ] **Step 5: Atualizar `tests/p3-screens.spec.ts`**

Remova `chatbotDispatchState` e `dispatchChatbotOrders` do import de `../app/data/demo/chatbot-operacional` (linhas 18-24), ficando:

```ts
import {
  chatbotMonitorQueues,
  miletoBackfillState,
  startMiletoBackfill
} from '../app/data/demo/chatbot-operacional'
```

Remova `buildChatbotDispatchMetrics` do import de `../app/utils/operacao-p3-metrics` (linhas 41-50).

No `it('chatbot: disparo, monitor e backfill', ...)`, remova as linhas que usam `chatbotDispatchState`/`dispatchChatbotOrders`/`buildChatbotDispatchMetrics`:

```ts
    expect(
      buildChatbotDispatchMetrics(chatbotDispatchState.orders, 1, 1, 1, 1, 1)[0]?.label
    ).toBe('Selecionados')
```

e

```ts
    const elegivel = chatbotDispatchState.orders.find((row) => row.status === 'elegivel')
    expect(elegivel).toBeTruthy()
    expect(dispatchChatbotOrders([elegivel!.orderId])).toBe(1)
```

Renomeie o `it` para `'chatbot: monitor e backfill'` (o teste fica só com as asserções de `buildChatbotMonitorMetrics`, `chatbotMonitorQueues`, `buildMiletoBackfillMetrics`, `miletoBackfillState`, `startMiletoBackfill`).

Remova o bloco de asserção de breadcrumb de disparo-chatbot:

```ts
    expect(resolveBreadcrumbs('/operacao/disparo-chatbot')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Disparo Chatbot' }
    ])
```

E atualize a asserção de breadcrumb de chatbot-monitor para o novo formato de 2 níveis:

```ts
    expect(resolveBreadcrumbs('/operacao/chatbot-monitor')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Monitor' }
    ])
```

- [ ] **Step 6: Rodar os testes e confirmar que passam**

Run: `npm run test:run -- tests/p3-screens.spec.ts tests/routes.spec.ts`
Expected: PASS

- [ ] **Step 7: Remover os exports de disparo em `app/data/demo/chatbot-operacional.ts`**

Remova `export type DispatchStatus = ...` (linha 7).

Remova a interface `ChatbotDispatchRow` (linhas 9-17).

Remova o objeto `chatbotDispatchState` inteiro (linhas 39-118, `export const chatbotDispatchState = { ... }`).

Remova a função `buildDispatchDistribution` inteira (linhas 200-216).

Remova a função `dispatchChatbotOrders` inteira (linhas 218-230).

O arquivo fica só com: `ChatbotQueueRow`, `MiletoBackfillJob`, `chatbotMonitorQueues`, `chatbotHealthTrend`, `miletoBackfillState`, `startMiletoBackfill`.

- [ ] **Step 8: Remover `buildChatbotDispatchMetrics` de `app/utils/operacao-p3-metrics.ts`**

Atualize o import da linha 8:

```ts
import type { ChatbotDispatchRow, ChatbotQueueRow, MiletoBackfillJob } from '../data/demo/chatbot-operacional'
```

para:

```ts
import type { ChatbotQueueRow, MiletoBackfillJob } from '../data/demo/chatbot-operacional'
```

Remova a função `buildChatbotDispatchMetrics` inteira (linhas 118-168).

- [ ] **Step 9: Deletar o arquivo da página**

```bash
git rm "app/pages/operacao/disparo-chatbot.vue"
```

- [ ] **Step 10: Rodar a suíte completa e o typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add app/data/demo/chatbot-operacional.ts app/utils/operacao-p3-metrics.ts app/utils/breadcrumbs.ts app/pages/operacao/chatbot-monitor.vue app/pages/operacao/tratativas.vue tests/p3-screens.spec.ts tests/routes.spec.ts
git commit -m "chore: remove página de Disparo Chatbot, links órfãos e código morto associado"
```

---

### Task 8: Deletar Check In e limpar código morto associado

**Files:**
- Delete: `app/pages/loja/check-in.vue`
- Delete: `app/data/demo/loja-check-in.ts`
- Modify: `app/utils/operacao-p3-metrics.ts:9,257-292`
- Modify: `app/utils/breadcrumbs.ts:157-162`
- Modify: `tests/routes.spec.ts:85`
- Modify: `tests/p3-screens.spec.ts` (imports + teste + breadcrumb)

- [ ] **Step 1: Atualizar `tests/routes.spec.ts`**

Remova a linha:

```ts
  ['app/pages/loja/check-in.vue', 'AppFormField'],
```

- [ ] **Step 2: Atualizar `tests/p3-screens.spec.ts`**

Remova o import (linhas 25-29):

```ts
import {
  confirmCheckIn,
  lookupCheckInOrder,
  lojaCheckInState
} from '../app/data/demo/loja-check-in'
```

Remova `buildLojaCheckInMetrics` do import de `../app/utils/operacao-p3-metrics`.

No `it('check-in, configs e público', ...)`, remova as linhas:

```ts
    expect(lookupCheckInOrder('52120')?.canConfirm).toBe(true)
    expect(confirmCheckIn('52120')?.orderId).toBe('52120')
    expect(
      buildLojaCheckInMetrics(
        lojaCheckInState.checkInsToday,
        lojaCheckInState.queue,
        lojaCheckInState.divergences,
        lojaCheckInState.history
      )[0]?.label
    ).toBe('Check-ins hoje')

```

e renomeie o `it` para `'configs e público'`.

Remova o bloco de asserção de breadcrumb:

```ts
    expect(resolveBreadcrumbs('/loja/check-in')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Check In' }
    ])
```

- [ ] **Step 3: Rodar os testes e confirmar que passam**

Run: `npm run test:run -- tests/p3-screens.spec.ts tests/routes.spec.ts`
Expected: PASS

- [ ] **Step 4: Remover o bloco de `/loja/check-in` em `app/utils/breadcrumbs.ts`**

Remova:

```ts
  if (normalized === '/loja/check-in') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Check In' }
    ]
  }

```

- [ ] **Step 5: Remover `buildLojaCheckInMetrics` de `app/utils/operacao-p3-metrics.ts`**

Atualize o import da linha 9:

```ts
import type { CheckInHistoryRow } from '../data/demo/loja-check-in'
```

Remova essa linha inteira (o tipo só era usado por essa função).

Remova a função `buildLojaCheckInMetrics` inteira (linhas 257-292).

- [ ] **Step 6: Deletar os arquivos**

```bash
git rm "app/pages/loja/check-in.vue" "app/data/demo/loja-check-in.ts"
```

- [ ] **Step 7: Rodar a suíte completa e o typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/utils/operacao-p3-metrics.ts app/utils/breadcrumbs.ts tests/p3-screens.spec.ts tests/routes.spec.ts
git commit -m "chore: remove página de Check In e código morto associado"
```

---

### Task 9: Checklist final do CLAUDE.md

**Files:** nenhum (apenas verificação)

- [ ] **Step 1: Rodar a suíte de testes**

Run: `npm run test:run`
Expected: PASS — todos os testes, incluindo os novos (`order-bulk-actions.spec.ts`, `use-chatbot-health.spec.ts`, `pedidos-bulk-actions.spec.ts`) e os já existentes ajustados (`routes.spec.ts`, `p2-screens.spec.ts`, `p3-screens.spec.ts`, `domain.spec.ts`).

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS — sem erros de tipo (nenhum import morto para `app/data/demo/expedicao.ts`, `app/data/demo/loja-check-in.ts`, ou os exports removidos de `chatbot-operacional.ts`).

- [ ] **Step 3: Rodar o lint**

Run: `npm run lint`
Expected: PASS — sem imports não usados, sem variáveis não usadas (`ExpedicaoOrderRow`, `ChatbotDispatchRow`, `CheckInHistoryRow` removidos junto com seus usos).

- [ ] **Step 4: Rodar o build**

Run: `npm run build`
Expected: PASS — build do Nuxt conclui sem erros (nenhuma rota órfã apontando para arquivo inexistente; `/operacao/expedicao`, `/operacao/disparo-chatbot`, `/loja/check-in` deixam de existir como páginas, o que é esperado — o plano irmão de navegação remove as entradas de menu correspondentes separadamente).

- [ ] **Step 5: Rodar a verificação de fundação**

Run: `node scripts/verify-foundation.mjs`
Expected: saída JSON com `"status": "ok"` — o script não referencia nenhum dos três arquivos deletados, então não é afetado por esta mudança.

- [ ] **Step 6: Revisão visual manual (conforme CLAUDE.md)**

Abra `/pedidos` em 1600×1000 e 1366×768 (`npm run dev`, depois abrir no navegador) e confirme visualmente:
- a toolbar de seleção mostra "Agendar em lote" (primário) + "Mais ações" (dropdown) + "Limpar seleção";
- selecionar um pedido já impresso (`48201`) e um não impresso (`48219`) e abrir "Gerar etiqueta" mostra o aviso de "1 pedido(s) já possuem etiqueta e serão ignorados" e o preview 100×150mm;
- selecionar um pedido elegível (`48208`) e um não elegível (`48219`) ao chatbot e abrir "Disparar chatbot" mostra o indicador "Chatbot: ON" e o aviso de ignorados;
- `/operacao/expedicao`, `/operacao/disparo-chatbot` e `/loja/check-in` retornam 404 (página deletada);
- `/operacao/chatbot-monitor` não mostra mais o botão "Disparo" e seu breadcrumb é só "Home / Monitor";
- `/operacao/tratativas` não mostra mais o botão "Disparo" (mas mantém "Monitor", "Atualizar" e "Disparar").

- [ ] **Step 7: Commit final (se houver ajustes de revisão visual)**

```bash
git add -A
git commit -m "chore: checklist final da migração de ações em lote de pedidos"
```

(Só execute este commit se o Step 6 tiver gerado alguma correção; se tudo já estava correto, não há nada para commitar aqui.)

---

## Self-review

**Cobertura do spec:**
- Deletar as 3 páginas → Tasks 6, 7, 8.
- Toolbar com 3 ações (1 primário + dropdown com 2) → Tasks 4 e 5 (decisão de qual é primário documentada em "Decisões fechadas" item 1).
- "Gerar etiqueta" reaproveitando o preview 100×150mm e operando sobre `selectedIds` da listagem, com regra de elegibilidade explícita para o caso "seleção feita fora de uma tela filtrada" → Task 4 + decisão item 2.
- "Disparar chatbot" reaproveitando a verificação de saúde do chatbot sem duplicar lógica (`useChatbotHealth`) e respeitando a regra `status === 'elegivel'` (traduzida para `chatbotEligible === true` no modelo real de pedido) → Tasks 3 e 5 + decisão item 3.
- Grep por links/botões para as 3 rotas e plano de remoção/redirecionamento caso a caso → Task 7 (chatbot-monitor.vue, tratativas.vue) documentado em "Decisões fechadas" itens 6-7.
- Grep por testes existentes cobrindo as 3 páginas ou a toolbar de pedidos, com plano de deletar/atualizar cada um → Tasks 6, 7, 8 (routes.spec.ts, p2-screens.spec.ts, p3-screens.spec.ts) e Tasks 2-5 (testes novos).
- Checklist final do CLAUDE.md → Task 9.
- Não tocar em `navigation.ts`/`AppSidebar.vue` → explicitado em "Decisões fechadas" item 9 e nunca aparece em nenhuma task.
- Não incluir tasks para a cópia em `via-teste` → nenhuma task referencia esse caminho.

**Placeholders:** nenhum "TBD"/"implementar depois" — todo código de cada step está completo e poderia ser copiado diretamente para os arquivos.

**Consistência de tipos/nomes:** `isLabelPrintable`, `isChatbotDispatchable`, `splitEligibleSelection`, `markOrdersLabelPrinted`, `markOrdersChatbotDispatched` (Task 2) são os mesmos nomes usados em todos os imports das Tasks 3-5. `chatbotOnline`/`checkingHealth`/`checkChatbotHealth` (Task 3) mantêm os nomes que já existiam no script original de `pedidos/index.vue`, então o template do modal de "Agendar em lote" não precisa mudar. `labelSelection`/`chatbotSelection`/`canGenerateLabel`/`canDispatchChatbot`/`openLabel`/`openDispatch`/`confirmLabel`/`confirmDispatch` são usados de forma consistente entre script e template nas Tasks 4-5.
