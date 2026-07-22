# Wizard de Criação de Pedido — Reestruturação de Steps — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir os 5 steps atuais do wizard de criação de pedido (`operacao`, `origem`, `destino`, `itens`, `revisao`) por uma nova sequência de 5 steps (`cliente`, `operacao`, `endereco`, `itens`, `revisao`) onde Cliente é isolado, Operação ganha agendamento e transportador, Origem/Destino colapsam em um único Endereço condicionado ao tipo de operação, e Itens passa a usar um catálogo de produtos (select) em vez de texto livre, com campo de Observação por item.

**Architecture:** O wizard (`OrderCreateWizard.vue`) permanece o dono da máquina de estados (step atual, validação, navegação, submit). O bloco de campos de endereço — hoje duplicado inline com um ternário `origem`/`destino` — é extraído para um componente compartilhado `OrderAddressFields.vue` com `v-model` (Vue 3.4 `defineModel`) e uma prop `showExtraFields` que decide se mostra Referência/Informação adicional (mapeando exatamente o que antes só aparecia no step `destino`). O catálogo de produtos é lido de `cadastros-onda3.ts` (`getCadastroOnda3Rows('produtos')`) e a lista de transportadores de `gestao-rede.ts` (`transportadoresRows`), ambos já usados em outras telas — nenhuma fixture nova é criada, apenas reaproveitada.

**Tech Stack:** Nuxt 4, Vue 3 (`<script setup>`, `defineModel`), TypeScript, Nuxt UI 4 (`USelectMenu`, `UInput`, `UTextarea`), Tailwind CSS 4, Vitest + `@nuxt/test-utils` (`mountSuspended`).

---

## Decisões de implementação (fechadas antes de codar)

Estas decisões vieram da leitura do código real em `app/components/orders/OrderCreateWizard.vue`, `app/types/order-create.ts`, `app/utils/order-create-validation.ts`, `app/data/demo/order-create.ts`, `app/data/demo/gestao-rede.ts` e `app/data/demo/cadastros-onda3.ts` — documentando aqui para não haver ambiguidade nas tasks:

1. **Endereço único (`form.address`) substitui `form.origin` + `form.destiny`.** O tipo de operação (`form.kindCtrl`, valores `'OE'` Entrega / `'OC'` Coleta) decide o rótulo e quais campos extras aparecem:
   - `kindCtrl === 'OC'` (Coleta = reversa, coleta no cliente) → o endereço representa o que hoje era `origin`. Não mostra Referência/Informação adicional (o step `origem` de hoje não tinha esses campos).
   - `kindCtrl === 'OE'` (Entrega no cliente) → o endereço representa o que hoje era `destiny`. Mostra Referência/Informação adicional (exatamente como o step `destino` de hoje).
   Essa regra é implementada como `show-extra-fields="form.kindCtrl === 'OE'"` no componente extraído — preserva 100% do comportamento visual atual, só que agora condicionado pela Operação em vez de pelo `currentStep.id`.

2. **Bug pré-existente na prop `own-order` — decisão de correção mínima.** Hoje, em `OrderCreateWizard.vue` linha 28: `form.clientId = orderCreateClients[0]?.id ?? ''`. `OrderCreateForm` nunca teve um campo `clientId` (o campo real é `accountId`) — essa linha é um no-op / bug, o `accountId` real fica vazio mesmo com `own-order`. O único efeito visível hoje da prop é o texto do banner ("origem pré-preenchida com a conta autenticada"), que também não corresponde ao que o código faz. Como o step `origem` deixa de existir, e a intenção original (nome da variável, texto do banner, contexto "conta autenticada") sempre foi pré-selecionar o **cliente**, a correção mínima é: trocar `form.clientId` pelo campo real `form.accountId` no novo step Cliente, e ajustar o texto do banner/subtítulo para falar de cliente em vez de origem. Isso não é comportamento novo — é o bug óbvio sendo corrigido no mesmo lugar que já ia precisar mudar por causa da reestruturação de steps.

3. **Catálogo de produtos e transportadores são lidos, não recriados.** `orderCreateProducts` = `getCadastroOnda3Rows('produtos')` filtrando `active`; `orderCreateCarriers` = `transportadoresRows` (de `gestao-rede.ts`) filtrando `active`. Ambos já são fixtures existentes no projeto.

4. **Campo "Data de agendamento" usa `<UInput type="date">`.** É o padrão já usado em `app/pages/pedidos/[id]/checkout.vue` para o mesmo tipo de campo (`form.date` com `type="date"`) — não existe (nem é necessário criar) um componente de date-picker dedicado no design system atual.

5. **Item do pedido ganha `productId` (select) no lugar de `description` (texto livre), mais `notes` (Observação, texto livre, opcional).** Os demais campos do item (`quantity`, `price`, `sizeX/Y/Z`, `weight`, `serialNumber`) não mudam.

---

## File Structure

- **Modify:** `app/types/order-create.ts` — novo `OrderCreateStepId` (`cliente`/`operacao`/`endereco`/`itens`/`revisao`), `OrderCreateForm` (`accountId`, `kindCtrl`, `scheduledAt`, `carrierId`, `address`, `items`), `OrderCreateItem` (`productId` + `notes` no lugar de `description`).
- **Modify:** `app/data/demo/order-create.ts` — `orderCreateSteps` reordenado/renomeado; novos exports `orderCreateCarriers`, `orderCreateProducts`, `carrierLabel`, `productLabel`, `addressRoleLabel`; `createEmptyOrderForm`/`createEmptyOrderItem`/`createValidOrderFormFixture` na nova forma.
- **Modify:** `app/utils/order-create-validation.ts` — `validateClienteStep` (novo), `validateOperacaoStep` (agendamento + transportador), `validateEnderecoStep` (novo, reaproveitando `validateParty`), `validateItem`/`validateItensStep` (valida `productId` em vez de `description`), `validateOrderCreateStep` com os 5 novos ids.
- **Modify:** `tests/order-create.spec.ts` — cobertura dos 5 novos steps.
- **Create:** `app/components/orders/OrderAddressFields.vue` — bloco de campos de endereço extraído (Nome, Celular, CPF/CNPJ, CEP, Logradouro, Número, Bairro, Cidade, UF, e Referência/Informação adicional condicionais), com `v-model` de `OrderAddressParty` e prop `errors`/`showExtraFields`.
- **Create:** `tests/order-address-fields.spec.ts` — testes de render, condicional de campos extras, propagação de erro e `v-model` do componente novo.
- **Modify:** `tests/routes.spec.ts` — adiciona `['app/components/orders/OrderCreateWizard.vue', 'OrderAddressFields']` à lista `routes` (mesma convenção "materializa X com Y" já usada no arquivo).
- **Modify:** `app/components/orders/OrderCreateWizard.vue` — reescreve os blocos de template dos 5 steps, remove `partyField`, usa `OrderAddressFields`, corrige o bug de `own-order` (item 2 acima).
- **Modify:** `app/pages/pedidos/novo.vue` — subtítulo do `PageHeader` (não menciona mais "Origem, destino").
- **Modify:** `app/pages/pedidos/novo-proprio.vue` — subtítulo do `PageHeader` (fala de cliente, não de origem).
- **Sem alteração:** `app/components/orders/OrderCreateStepper.vue` (componente genérico já reusável, recebe `steps`/`current-index` sem acoplamento aos ids).

---

### Task 1: Novo `OrderCreateStepId` e formas de `OrderCreateForm`/`OrderCreateItem`

**Files:**
- Modify: `app/types/order-create.ts`

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Conteúdo completo novo de `app/types/order-create.ts`:

```typescript
export type OrderKindCtrl = 'OE' | 'OC'

export interface OrderAddressParty {
  name: string
  cellphone: string
  federalId: string
  isCompany: boolean
  address: string
  number: string
  quarter: string
  city: string
  zipCode: string
  stateCode: string
  countryCode: string
  reference?: string
  additional?: string
}

export interface OrderCreateItem {
  id: string
  productId: string
  quantity: number | null
  price: number | null
  sizeX: number | null
  sizeY: number | null
  sizeZ: number | null
  weight: number | null
  serialNumber?: string
  notes?: string
}

export interface OrderCreateForm {
  accountId: string
  kindCtrl: OrderKindCtrl
  scheduledAt: string
  carrierId: string
  address: OrderAddressParty
  items: OrderCreateItem[]
}

export type OrderCreateStepId =
  | 'cliente'
  | 'operacao'
  | 'endereco'
  | 'itens'
  | 'revisao'

export interface OrderCreateStepMeta {
  id: OrderCreateStepId
  label: string
  description: string
}

export type FieldErrors = Record<string, string>

export interface OrderCreateClientOption {
  id: string
  name: string
}
```

- [ ] **Step 2: Commit**

```bash
git add app/types/order-create.ts
git commit -m "refactor(pedidos): novo shape de OrderCreateForm/Item e steps do wizard"
```

---

### Task 2: Testes de validação para os 5 novos steps (RED)

**Files:**
- Modify: `tests/order-create.spec.ts`

Neste ponto os testes vão falhar porque `app/utils/order-create-validation.ts` e `app/data/demo/order-create.ts` ainda não foram atualizados (Tasks 3 e 4) — isso é esperado e intencional (RED antes do GREEN).

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Conteúdo completo novo de `tests/order-create.spec.ts`:

```typescript
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
```

- [ ] **Step 2: Rodar os testes e confirmar que falham (RED)**

Run: `npm run test:run -- tests/order-create.spec.ts`
Expected: FAIL — erros de import (`validateClienteStep`, `validateEnderecoStep` não existem ainda) ou asserções quebradas por causa do shape antigo de `createEmptyOrderForm`/`createValidOrderFormFixture`.

- [ ] **Step 3: Commit**

```bash
git add tests/order-create.spec.ts
git commit -m "test(pedidos): cobertura RED para os 5 novos steps do wizard"
```

---

### Task 3: Validadores para `cliente`, `operacao`, `endereco` e `itens` (com produto)

**Files:**
- Modify: `app/utils/order-create-validation.ts`

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Conteúdo completo novo de `app/utils/order-create-validation.ts`:

```typescript
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
```

- [ ] **Step 2: Rodar os testes (ainda parcialmente RED — fixtures do data.ts na Task 4 seguem no shape antigo)**

Run: `npm run test:run -- tests/order-create.spec.ts`
Expected: os testes que dependem só de `createEmptyOrderForm()` (ex.: "bloqueia o step Cliente sem seleção", "exige agendamento e transportador", "exige campos do endereço único", "exige ao menos um item...") devem passar, já que `createEmptyOrderForm()` ainda produz um objeto qualquer (o TypeScript não é checado em runtime pelo Vitest) — mas "aceita fixture completa" e "rejeita CPF..." continuam FAIL até a Task 4 atualizar `createValidOrderFormFixture`.

- [ ] **Step 3: Commit**

```bash
git add app/utils/order-create-validation.ts
git commit -m "feat(pedidos): validadores para cliente, operacao, endereco e itens com produto"
```

---

### Task 4: Fixtures e helpers de `app/data/demo/order-create.ts` (GREEN)

**Files:**
- Modify: `app/data/demo/order-create.ts`

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Conteúdo completo novo de `app/data/demo/order-create.ts`:

```typescript
import type {
  OrderAddressParty,
  OrderCreateClientOption,
  OrderCreateForm,
  OrderCreateItem,
  OrderCreateStepMeta,
  OrderKindCtrl
} from '../../types/order-create'
import { getCadastroOnda3Rows } from './cadastros-onda3'
import { transportadoresRows } from './gestao-rede'

export const orderCreateSteps: OrderCreateStepMeta[] = [
  {
    id: 'cliente',
    label: 'Cliente',
    description: 'Cliente do pedido'
  },
  {
    id: 'operacao',
    label: 'Operação',
    description: 'Tipo de operação, agendamento e transportador'
  },
  {
    id: 'endereco',
    label: 'Endereço',
    description: 'Endereço de coleta ou entrega, conforme a operação'
  },
  {
    id: 'itens',
    label: 'Itens',
    description: 'Volumes para frete e seguro'
  },
  {
    id: 'revisao',
    label: 'Revisão',
    description: 'Confira e conclua o pedido'
  }
]

export const orderKindOptions = [
  { label: 'Entrega', value: 'OE' },
  { label: 'Coleta', value: 'OC' }
] as const

export const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
].map((uf) => ({ label: uf, value: uf }))

export const orderCreateClients: OrderCreateClientOption[] = [
  { id: 'acc-keener', name: 'Keener Logística' },
  { id: 'acc-retail', name: 'Retail Brasil SA' },
  { id: 'acc-moda', name: 'Moda Carioca Ltda' }
]

/** Transportadores ativos disponíveis para o select do step Operação (fixture de app/data/demo/gestao-rede.ts). */
export const orderCreateCarriers = transportadoresRows.filter((row) => row.active)

/** Catálogo de produtos ativos — mesma fonte de /cadastros/produtos (app/data/demo/cadastros-onda3.ts). */
export const orderCreateProducts = getCadastroOnda3Rows('produtos').filter((row) => row.active)

function emptyParty(): OrderAddressParty {
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

export function createEmptyOrderItem(): OrderCreateItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: '',
    quantity: 1,
    price: null,
    sizeX: null,
    sizeY: null,
    sizeZ: null,
    weight: null,
    serialNumber: '',
    notes: ''
  }
}

export function createEmptyOrderForm(): OrderCreateForm {
  return {
    accountId: '',
    kindCtrl: 'OE',
    scheduledAt: '',
    carrierId: '',
    address: emptyParty(),
    items: []
  }
}

/** Fixture válida para testes e demos rápidas. */
export function createValidOrderFormFixture(): OrderCreateForm {
  return {
    accountId: 'acc-keener',
    kindCtrl: 'OE',
    scheduledAt: '2026-08-10',
    carrierId: orderCreateCarriers[0]!.id,
    address: {
      name: 'Pachequinho',
      cellphone: '(11) 97777-2000',
      federalId: '074.498.080-13',
      isCompany: false,
      address: 'Rua das Flores',
      number: '55',
      quarter: 'Centro',
      city: 'Iracemápolis',
      zipCode: '13495-000',
      stateCode: 'SP',
      countryCode: 'BR',
      reference: 'Portão azul',
      additional: ''
    },
    items: [
      {
        id: 'item-demo-1',
        productId: orderCreateProducts[0]!.id,
        quantity: 2,
        price: 150,
        sizeX: 40,
        sizeY: 30,
        sizeZ: 25,
        weight: 5,
        serialNumber: 'SN-1001',
        notes: 'Frágil — manuseio com cuidado'
      }
    ]
  }
}

export function formatMoneyBr(value: number | null | undefined): string {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

export function orderKindLabel(kind: string): string {
  return kind === 'OC' ? 'Coleta' : 'Entrega'
}

export function clientLabel(accountId: string): string {
  return orderCreateClients.find((c) => c.id === accountId)?.name ?? accountId
}

export function carrierLabel(carrierId: string): string {
  return orderCreateCarriers.find((c) => c.id === carrierId)?.name ?? carrierId
}

export function productLabel(productId: string): string {
  return orderCreateProducts.find((p) => p.id === productId)?.name ?? productId
}

/** Rótulo do step Endereço único — depende do tipo de operação selecionado. */
export function addressRoleLabel(kind: OrderKindCtrl): string {
  return kind === 'OC' ? 'Endereço de coleta' : 'Endereço de entrega'
}
```

- [ ] **Step 2: Rodar os testes e confirmar GREEN**

Run: `npm run test:run -- tests/order-create.spec.ts`
Expected: PASS — todos os 6 testes de `tests/order-create.spec.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/data/demo/order-create.ts
git commit -m "feat(pedidos): fixtures do wizard usando catálogo de produtos e transportadores"
```

---

### Task 5: Testes do componente `OrderAddressFields` (RED)

**Files:**
- Test: `tests/order-address-fields.spec.ts`

O componente ainda não existe — esta task escreve os testes primeiro.

- [ ] **Step 1: Criar o arquivo de teste**

Conteúdo completo de `tests/order-address-fields.spec.ts`:

```typescript
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
```

- [ ] **Step 2: Rodar os testes e confirmar que falham (RED)**

Run: `npm run test:run -- tests/order-address-fields.spec.ts`
Expected: FAIL — `Failed to resolve import "../app/components/orders/OrderAddressFields.vue"` (arquivo não existe ainda).

- [ ] **Step 3: Commit**

```bash
git add tests/order-address-fields.spec.ts
git commit -m "test(pedidos): cobertura RED para o componente OrderAddressFields"
```

---

### Task 6: Criar `OrderAddressFields.vue` (GREEN)

**Files:**
- Create: `app/components/orders/OrderAddressFields.vue`

Bloco extraído literalmente de `app/components/orders/OrderCreateWizard.vue` (o `v-else-if="currentStep.id === 'origem' || currentStep.id === 'destino'"` de hoje), trocando o ternário `origem`/`destino` por um único `address` (via `defineModel`) e o `v-if="currentStep.id === 'destino'"` dos campos extras por `showExtraFields`.

- [ ] **Step 1: Criar o arquivo**

Conteúdo completo de `app/components/orders/OrderAddressFields.vue`:

```vue
<script setup lang="ts">
import type { FieldErrors, OrderAddressParty } from '../../types/order-create'
import { brazilianStates } from '../../data/demo/order-create'

const props = defineProps<{
  errors: FieldErrors
  showExtraFields?: boolean
}>()

const address = defineModel<OrderAddressParty>({ required: true })

const stateItems = brazilianStates

function fieldError(key: string): string | undefined {
  return props.errors[`address.${key}`]
}
</script>

<template>
  <div class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
    <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Nome <abbr title="Obrigatório">*</abbr></span>
      <UInput
        v-model="address.name"
        :class="{ 'is-invalid': fieldError('name') }"
      />
      <small v-if="fieldError('name')" class="text-[11px] text-via-red">{{ fieldError('name') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Celular <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.cellphone" placeholder="(00) 00000-0000" />
      <small v-if="fieldError('cellphone')" class="text-[11px] text-via-red">{{ fieldError('cellphone') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>
        {{ address.isCompany ? 'CNPJ' : 'CPF' }}
        <abbr title="Obrigatório">*</abbr>
      </span>
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <UInput
          v-model="address.federalId"
          :placeholder="address.isCompany ? '00.000.000/0000-00' : '000.000.000-00'"
        />
        <div class="inline-flex overflow-hidden rounded-via-control border border-via-line-strong" role="group" aria-label="Tipo de documento">
          <button
            type="button"
            class="min-h-9 cursor-pointer border-0 bg-via-surface-2 px-3 text-[11px] font-[650] text-via-muted"
            :class="!address.isCompany ? 'bg-via-blue text-via-surface' : undefined"
            @click="address.isCompany = false"
          >CPF</button>
          <button
            type="button"
            class="min-h-9 cursor-pointer border-0 bg-via-surface-2 px-3 text-[11px] font-[650] text-via-muted"
            :class="address.isCompany ? 'bg-via-blue text-via-surface' : undefined"
            @click="address.isCompany = true"
          >CNPJ</button>
        </div>
      </div>
      <small v-if="fieldError('federalId')" class="text-[11px] text-via-red">{{ fieldError('federalId') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>CEP <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.zipCode" placeholder="00000-000" />
      <small v-if="fieldError('zipCode')" class="text-[11px] text-via-red">{{ fieldError('zipCode') }}</small>
    </label>

    <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Logradouro <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.address" />
      <small v-if="fieldError('address')" class="text-[11px] text-via-red">{{ fieldError('address') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Número <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.number" />
      <small v-if="fieldError('number')" class="text-[11px] text-via-red">{{ fieldError('number') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Bairro <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.quarter" />
      <small v-if="fieldError('quarter')" class="text-[11px] text-via-red">{{ fieldError('quarter') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Cidade <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.city" />
      <small v-if="fieldError('city')" class="text-[11px] text-via-red">{{ fieldError('city') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>UF <abbr title="Obrigatório">*</abbr></span>
      <USelectMenu
        v-model="address.stateCode"
        value-key="value"
        :items="stateItems"
        placeholder="UF"
      />
      <small v-if="fieldError('stateCode')" class="text-[11px] text-via-red">{{ fieldError('stateCode') }}</small>
    </label>

    <template v-if="showExtraFields">
      <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
        <span>Referência</span>
        <UInput v-model="address.reference" />
      </label>
      <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
        <span>Informação adicional</span>
        <UInput v-model="address.additional" />
      </label>
    </template>
  </div>
</template>
```

- [ ] **Step 2: Rodar os testes e confirmar GREEN**

Run: `npm run test:run -- tests/order-address-fields.spec.ts`
Expected: PASS — todos os 5 testes de `tests/order-address-fields.spec.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/components/orders/OrderAddressFields.vue
git commit -m "feat(pedidos): extrai OrderAddressFields como bloco de endereço compartilhado"
```

---

### Task 7: Asserção RED em `routes.spec.ts` para o novo uso de `OrderAddressFields` no wizard

**Files:**
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Adicionar a entrada na lista `routes`**

Em `tests/routes.spec.ts`, dentro do array `routes` (linha 20, logo após a entrada de `novo-proprio.vue`), adicionar:

```typescript
  ['app/pages/pedidos/novo-proprio.vue', 'OrderCreateWizard'],
  ['app/components/orders/OrderCreateWizard.vue', 'OrderAddressFields'],
  ['app/pages/operacao/geo-audit.vue', 'VolumeTrendChart'],
```

(a linha do meio é a nova; as outras duas já existem e servem de referência de posição.)

- [ ] **Step 2: Rodar os testes e confirmar que a nova linha falha (RED)**

Run: `npm run test:run -- tests/routes.spec.ts`
Expected: FAIL no caso `materializa app/components/orders/OrderCreateWizard.vue com OrderAddressFields` — o wizard ainda não referencia o componente novo.

- [ ] **Step 3: Commit**

```bash
git add tests/routes.spec.ts
git commit -m "test(pedidos): RED para wizard referenciar OrderAddressFields"
```

---

### Task 8: Reescrever `OrderCreateWizard.vue` com os 5 novos steps (GREEN)

**Files:**
- Modify: `app/components/orders/OrderCreateWizard.vue`

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Conteúdo completo novo de `app/components/orders/OrderCreateWizard.vue`:

```vue
<script setup lang="ts">
import type { OrderCreateForm } from '../../types/order-create'
import {
  addressRoleLabel,
  carrierLabel,
  clientLabel,
  createEmptyOrderForm,
  createEmptyOrderItem,
  formatMoneyBr,
  orderCreateCarriers,
  orderCreateClients,
  orderCreateProducts,
  orderCreateSteps,
  orderKindLabel,
  orderKindOptions,
  productLabel
} from '../../data/demo/order-create'
import { validateOrderCreateStep } from '../../utils/order-create-validation'

const toast = useToast()

const props = withDefaults(
  defineProps<{
    /** Fluxo new_own — cliente pré-selecionado como a conta autenticada. */
    ownOrder?: boolean
  }>(),
  { ownOrder: false }
)

const form = reactive<OrderCreateForm>(createEmptyOrderForm())
if (props.ownOrder) {
  form.accountId = orderCreateClients[0]?.id ?? ''
}
const stepIndex = ref(0)
const errors = ref<Record<string, string>>({})
const submitted = ref(false)
const submitting = ref(false)
const transitionName = ref('via-step-forward')

const currentStep = computed(() => orderCreateSteps[stepIndex.value]!)
const isFirst = computed(() => stepIndex.value === 0)
const isLast = computed(() => stepIndex.value === orderCreateSteps.length - 1)

const clientItems = orderCreateClients.map((c) => ({ label: c.name, value: c.id }))
const kindItems = orderKindOptions.map((k) => ({ label: k.label, value: k.value }))
const carrierItems = orderCreateCarriers.map((c) => ({ label: `${c.name} · ${c.type}`, value: c.id }))
const productItems = orderCreateProducts.map((p) => ({ label: `${p.name} — ${p.detail}`, value: p.id }))

const itemsTotal = computed(() =>
  form.items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
)

function fieldError(key: string): string | undefined {
  return submitted.value ? errors.value[key] : undefined
}

function validateCurrent(): boolean {
  submitted.value = true
  errors.value = validateOrderCreateStep(currentStep.value.id, form)
  return Object.keys(errors.value).length === 0
}

function goTo(index: number, direction: 'forward' | 'back') {
  transitionName.value = direction === 'forward' ? 'via-step-forward' : 'via-step-back'
  stepIndex.value = index
  submitted.value = false
  errors.value = {}
}

function onNext() {
  if (!validateCurrent()) {
    toast.error('Revise os campos obrigatórios', 'Corrija os erros destacados antes de avançar.')
    return
  }
  if (!isLast.value) {
    goTo(stepIndex.value + 1, 'forward')
  }
}

function onBack() {
  if (!isFirst.value) {
    goTo(stepIndex.value - 1, 'back')
  }
}

function addItem() {
  form.items.push(createEmptyOrderItem())
}

function removeItem(index: number) {
  form.items.splice(index, 1)
}

async function onSubmit() {
  if (!validateCurrent()) {
    toast.error('Pedido incompleto', 'Há campos inválidos na revisão. Volte e corrija.')
    return
  }
  submitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 450))
  submitting.value = false
  toast.success(
    props.ownOrder ? 'Pedido próprio criado' : 'Pedido criado',
    'O pedido foi registrado com sucesso (mock).'
  )
  await navigateTo('/pedidos')
}
</script>

<template>
  <div class="flex min-h-[calc(100%-88px)] flex-col" data-testid="order-create-wizard">
    <p
      v-if="ownOrder"
      class="border-b border-via-line bg-via-surface-2 px-app-gutter py-2 text-[11px] text-via-muted"
    >
      Modo pedido próprio — cliente pré-selecionado como a conta autenticada (mock).
    </p>
    <OrderCreateStepper :steps="orderCreateSteps" :current-index="stepIndex" />

    <div class="flex-1 px-app-gutter pt-[18px] pb-6">
      <Transition :name="transitionName" mode="out-in">
        <section :key="currentStep.id" class="order-wizard__panel" :aria-labelledby="`step-${currentStep.id}`">
          <header class="mb-4">
            <h2 :id="`step-${currentStep.id}`">{{ currentStep.label }}</h2>
            <p>{{ currentStep.description }}</p>
          </header>

          <!-- Cliente -->
          <div v-if="currentStep.id === 'cliente'" class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
            <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Cliente <abbr title="Obrigatório">*</abbr></span>
              <USelectMenu
                v-model="form.accountId"
                value-key="value"
                :items="clientItems"
                placeholder="Selecione o cliente..."
              />
              <small v-if="fieldError('accountId')" class="text-[11px] text-via-red">{{ fieldError('accountId') }}</small>
            </label>
          </div>

          <!-- Operação -->
          <div v-else-if="currentStep.id === 'operacao'" class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
            <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Tipo de operação <abbr title="Obrigatório">*</abbr></span>
              <USelectMenu
                v-model="form.kindCtrl"
                value-key="value"
                :items="kindItems"
                placeholder="Selecione"
              />
              <small v-if="fieldError('kindCtrl')" class="text-[11px] text-via-red">{{ fieldError('kindCtrl') }}</small>
            </label>
            <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Data de agendamento <abbr title="Obrigatório">*</abbr></span>
              <UInput v-model="form.scheduledAt" type="date" />
              <small v-if="fieldError('scheduledAt')" class="text-[11px] text-via-red">{{ fieldError('scheduledAt') }}</small>
            </label>
            <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Transportador <abbr title="Obrigatório">*</abbr></span>
              <USelectMenu
                v-model="form.carrierId"
                value-key="value"
                :items="carrierItems"
                placeholder="Selecione o transportador..."
              />
              <small v-if="fieldError('carrierId')" class="text-[11px] text-via-red">{{ fieldError('carrierId') }}</small>
            </label>
          </div>

          <!-- Endereço -->
          <div v-else-if="currentStep.id === 'endereco'">
            <OrderAddressFields
              v-model="form.address"
              :errors="submitted ? errors : {}"
              :show-extra-fields="form.kindCtrl === 'OE'"
            />
          </div>

          <!-- Itens -->
          <div v-else-if="currentStep.id === 'itens'" class="items-step">
            <div class="mb-3.5 flex max-w-[920px] items-center justify-between gap-3">
              <p>Adicione os itens para cálculo do valor do frete e seguro.</p>
              <AppButton icon="i-lucide-plus" variant="primary" @click="addItem">Adicionar item</AppButton>
            </div>

            <p v-if="fieldError('items')" class="mb-3 text-[11px] text-via-red">{{ fieldError('items') }}</p>

            <EmptyState
              v-if="!form.items.length"
              title="Nenhum item adicionado"
              description="Inclua ao menos um volume com produto, quantidade, preço, dimensões e peso."
              icon="i-lucide-package"
            />

            <article
              v-for="(item, index) in form.items"
              :key="item.id"
              class="mb-3.5 max-w-[920px] border-t border-via-line pt-3.5 pb-1"
            >
              <header class="mb-3 flex items-center justify-between">
                <h3>Item {{ index + 1 }}</h3>
                <AppButton
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  aria-label="Remover item"
                  @click="removeItem(index)"
                />
              </header>
              <div class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
                <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Produto <abbr title="Obrigatório">*</abbr></span>
                  <USelectMenu
                    v-model="item.productId"
                    value-key="value"
                    :items="productItems"
                    placeholder="Selecione o produto..."
                  />
                  <small v-if="fieldError(`items.${index}.productId`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.productId`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Quantidade <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.quantity" type="number" min="1" />
                  <small v-if="fieldError(`items.${index}.quantity`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.quantity`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Preço (R$) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.price" type="number" min="1" step="0.01" />
                  <small v-if="fieldError(`items.${index}.price`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.price`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Largura (cm) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.sizeX" type="number" min="1" />
                  <small v-if="fieldError(`items.${index}.sizeX`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.sizeX`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Altura (cm) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.sizeY" type="number" min="1" />
                  <small v-if="fieldError(`items.${index}.sizeY`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.sizeY`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Profundidade (cm) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.sizeZ" type="number" min="1" />
                  <small v-if="fieldError(`items.${index}.sizeZ`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.sizeZ`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Peso (kg) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.weight" type="number" min="1" step="0.1" />
                  <small v-if="fieldError(`items.${index}.weight`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.weight`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Serial</span>
                  <UInput v-model="item.serialNumber" />
                </label>
                <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted">
                  <span>Observação</span>
                  <UTextarea v-model="item.notes" :rows="2" placeholder="Observações sobre o item (opcional)" />
                </label>
              </div>
            </article>
          </div>

          <!-- Revisão -->
          <div v-else class="review-step">
            <dl class="mb-5 grid max-w-[920px] grid-cols-2 gap-x-5 gap-y-3 max-[800px]:grid-cols-1">
              <div>
                <dt>Cliente</dt>
                <dd>{{ clientLabel(form.accountId) }}</dd>
              </div>
              <div>
                <dt>Tipo de operação</dt>
                <dd>{{ orderKindLabel(form.kindCtrl) }}</dd>
              </div>
              <div>
                <dt>Agendamento</dt>
                <dd>{{ form.scheduledAt || '—' }}</dd>
              </div>
              <div>
                <dt>Transportador</dt>
                <dd>{{ carrierLabel(form.carrierId) }}</dd>
              </div>
              <div>
                <dt>{{ addressRoleLabel(form.kindCtrl) }}</dt>
                <dd>
                  {{ form.address.name }} · {{ form.address.address }}, {{ form.address.number }} —
                  {{ form.address.city }}/{{ form.address.stateCode }}
                </dd>
              </div>
              <div>
                <dt>Itens</dt>
                <dd>{{ form.items.length }} volume(s) · total {{ formatMoneyBr(itemsTotal) }}</dd>
              </div>
              <div>
                <dt>Frete</dt>
                <dd>Cálculo mock — será ligado à API na próxima onda</dd>
              </div>
            </dl>

            <table class="w-full max-w-[920px] border-collapse text-xs [&_td]:border-b [&_td]:border-via-line [&_td]:px-2.5 [&_td]:py-2 [&_td]:text-left [&_th]:border-b [&_th]:border-via-line [&_th]:bg-via-surface-2 [&_th]:px-2.5 [&_th]:py-2 [&_th]:text-left [&_th]:text-[10px] [&_th]:font-bold [&_th]:tracking-[0.04em] [&_th]:text-via-subtle [&_th]:uppercase">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Dimensões</th>
                  <th>Peso</th>
                  <th>Preço</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in form.items" :key="item.id">
                  <td>{{ productLabel(item.productId) }}</td>
                  <td class="numeric">{{ item.quantity }}</td>
                  <td class="numeric">{{ item.sizeX }}×{{ item.sizeY }}×{{ item.sizeZ }} cm</td>
                  <td class="numeric">{{ item.weight }} kg</td>
                  <td class="numeric">{{ formatMoneyBr(item.price) }}</td>
                  <td>{{ item.notes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </Transition>
    </div>

    <footer class="flex min-h-16 items-center gap-2 border-t border-via-line bg-via-surface px-app-gutter py-2.5">
      <AppButton
        v-if="!isFirst"
        type="button"
        icon="i-lucide-arrow-left"
        @click="onBack"
      >
        Voltar
      </AppButton>
      <span class="flex-1" />
      <AppButton
        v-if="!isLast"
        type="button"
        variant="primary"
        icon="i-lucide-arrow-right"
        data-testid="order-wizard-next"
        @click="onNext"
      >
        Próximo
      </AppButton>
      <AppButton
        v-else
        type="button"
        variant="primary"
        icon="i-lucide-check"
        :disabled="submitting"
        data-testid="order-wizard-submit"
        @click="onSubmit"
      >
        {{ submitting ? 'Enviando…' : 'Concluir' }}
      </AppButton>
    </footer>
  </div>
</template>
```

- [ ] **Step 2: Rodar toda a suíte relacionada e confirmar GREEN**

Run: `npm run test:run -- tests/routes.spec.ts tests/order-create.spec.ts tests/order-address-fields.spec.ts tests/p4-screens.spec.ts`
Expected: PASS em todos — inclusive a linha nova da Task 7 (`OrderCreateWizard.vue` agora contém `OrderAddressFields`).

- [ ] **Step 3: Commit**

```bash
git add app/components/orders/OrderCreateWizard.vue
git commit -m "feat(pedidos): wizard com 5 novos steps (cliente, operacao, endereco, itens, revisao)"
```

---

### Task 9: Atualizar subtítulos das páginas `novo.vue` e `novo-proprio.vue`

**Files:**
- Modify: `app/pages/pedidos/novo.vue`
- Modify: `app/pages/pedidos/novo-proprio.vue`

- [ ] **Step 1: Editar `app/pages/pedidos/novo.vue`**

Trocar:

```vue
      subtitle="Origem, destino e itens em etapas — espelhando o fluxo legado"
```

por:

```vue
      subtitle="Cliente, operação, endereço e itens em etapas — espelhando o fluxo legado"
```

- [ ] **Step 2: Editar `app/pages/pedidos/novo-proprio.vue`**

Trocar:

```vue
      subtitle="Fluxo new_own — origem vinculada à conta autenticada"
```

por:

```vue
      subtitle="Fluxo new_own — cliente vinculado à conta autenticada"
```

- [ ] **Step 3: Verificar que os testes de rota continuam passando (sem regressão de texto)**

Run: `npm run test:run -- tests/routes.spec.ts tests/p4-screens.spec.ts`
Expected: PASS — nenhum teste depende do texto do subtítulo, só da presença de `OrderCreateWizard` nas páginas, que continua lá.

- [ ] **Step 4: Commit**

```bash
git add app/pages/pedidos/novo.vue app/pages/pedidos/novo-proprio.vue
git commit -m "docs(pedidos): atualiza subtitulos das paginas de criacao para os novos steps"
```

---

### Task 10: Checklist final do CLAUDE.md

**Files:** nenhum (task de verificação)

- [ ] **Step 1: Rodar a suíte completa de testes**

Run: `npm run test:run`
Expected: PASS em todos os arquivos de teste (incluindo `tests/order-create.spec.ts`, `tests/order-address-fields.spec.ts`, `tests/routes.spec.ts`, `tests/p4-screens.spec.ts` e o restante da suíte, que não foi tocado por este plano).

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: sem erros. Se aparecer erro de tipo, confirmar que não sobrou nenhuma referência a `form.origin`, `form.destiny`, `item.description`, `OrderCreateStepId` com `'origem'`/`'destino'`, ou `partyField` em nenhum arquivo (buscar com `grep -rn "\.origin\b\|\.destiny\b\|partyField" app/`).

- [ ] **Step 3: Rodar o lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 4: Rodar o build**

Run: `npm run build`
Expected: build concluído sem erros.

- [ ] **Step 5: Rodar o verificador de fundação**

Run: `node scripts/verify-foundation.mjs`
Expected: saída de sucesso (o script não referencia `order-create` hoje, então não deve reportar nada específico deste wizard — mas precisa terminar sem erro).

- [ ] **Step 6: Commit final (se o checklist tiver corrigido algo)**

Se qualquer step 1–5 exigiu ajuste de código, commitar separadamente com mensagem descrevendo o que foi corrigido, por exemplo:

```bash
git add -A
git commit -m "fix(pedidos): ajustes apontados pelo checklist do CLAUDE.md"
```

Se nada precisou de ajuste, não há commit nesta task.

---

## Self-Review

**1. Cobertura da spec:**
- Novo step Cliente isolado → Task 1 (tipo), Task 4 (steps/fixture), Task 8 (template).
- Step Operação com tipo de operação, agendamento e transportador → Task 1, Task 3 (`validateOperacaoStep`), Task 4 (`orderCreateCarriers`), Task 8 (template).
- Fusão Origem/Destino em Endereço único condicionado pela Operação → Decisão 1, Task 5/6 (`OrderAddressFields`), Task 3 (`validateEnderecoStep`), Task 8 (`show-extra-fields`).
- Itens com select de produto do catálogo `/cadastros/produtos` + Observação → Task 1 (`productId`/`notes`), Task 4 (`orderCreateProducts`/`productLabel`), Task 3 (`validateItem`), Task 8 (template + tabela de revisão).
- Revisão mantida (mock) → Task 8, com colunas/linhas atualizadas para os novos campos.
- Remoção de `origem`/`destino` de `orderCreateSteps` e código ligado só a eles → Task 4 (steps), Task 3 (validadores antigos removidos), Task 8 (bloco de template antigo totalmente substituído).
- `app/utils/order-create-validation.ts` com validação para os 4 novos/alterados steps → Task 3.
- Testes existentes localizados e atualizados (`tests/order-create.spec.ts`, `tests/routes.spec.ts`; `tests/p4-screens.spec.ts` conferido e não precisa mudar pois só valida breadcrumbs/nome de componente) → Tasks 2, 5, 7, 9.
- Comportamento de `own-order` decidido com base no código real (bug de `clientId`→`accountId` corrigido) → Decisão 2, Task 8.
- Task explícita rodando o checklist do CLAUDE.md → Task 10.
- Nenhuma task para `via-teste` (cópia de deploy) → confirmado, não mencionada em nenhuma task.

**2. Placeholder scan:** nenhum "TBD"/"implementar depois"/"adicionar validação apropriada" — todo código de cada step está completo e citado inline. Os únicos itens não fechados são resultados de comandos (`npm run ...`) cujo "Expected" descreve o resultado esperado, não um placeholder de implementação.

**3. Consistência de tipos/nomes:** `OrderCreateForm.address` (Task 1) é usado como `form.address` em todo lugar (Task 3 `validateEnderecoStep`, Task 4 fixture, Task 8 template/revisão) — sem variações como `form.endereco`. `OrderCreateItem.productId`/`notes` (Task 1) usados de forma consistente em `validateItem` (Task 3), `createEmptyOrderItem`/`createValidOrderFormFixture` (Task 4) e no template de Itens/Revisão (Task 8). Funções `carrierLabel`, `productLabel`, `addressRoleLabel` definidas uma única vez em `order-create.ts` (Task 4) e importadas com o mesmo nome em `OrderCreateWizard.vue` (Task 8). Prefixo de erro `address.` usado de forma consistente em `validateParty(form.address, 'address')` (Task 3) e em `OrderAddressFields.fieldError` (Task 6, `props.errors['address.' + key]`).
