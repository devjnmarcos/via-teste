# Integrações, Cadastros → Operações/Operadores e Logs de Integração Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modelar do zero as entidades mock `Integration` / `IntegrationOperator` / `IntegrationOrder`, construir as telas `Configurações → Integrações` (CRUD completo, substitui Externos) e `Gestão → Logs → Integração` (somente leitura), estender os cadastros Onda 3 (`Cadastros → Operações` novo, `Contas` com campo Tipo, `Usuários` com toggle "É transportador"), e remover as telas/fixtures obsoletas (Pontos de apoio, Transportadores, Configurações → SLA/Processo/Externos, Ocorrências Externas).

**Architecture:** Uma nova fixture mock (`app/data/demo/integrations.ts`) com store em memória (`let` + getters/setters, `structuredClone` na leitura/escrita — mesmo padrão de `cadastros-onda3.ts`) alimenta duas páginas novas standalone (`app/pages/configuracoes/integracoes.vue` CRUD e `app/pages/logs/integracao.vue` somente leitura). O catálogo genérico `[kind]/index.vue` + `CadastroOnda3Page.vue` ganha um kind novo (`operacoes`) e dois campos novos condicionais por kind (`tipo` em Contas, `isTransporter` em Usuários), exigindo um novo `type: 'select'` em `CadastroOnda3FormField`. Nenhuma chamada de API real é feita; tudo é fixture/mock client-side, seguindo a convenção de testes do repo (`readFileSync`/`existsSync` sobre os `.vue`, sem montagem de componente).

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>` + TypeScript, Nuxt UI 4 (`USelectMenu`, `UInput`, `USwitch`), Tailwind CSS 4, Vitest (`@nuxt/test-utils`, `environment: 'nuxt'`), ESLint, `nuxt typecheck`.

**Projeto:** `D:/DEVJUANMARCOS/PROJETOS/KEENER/VIA REVERSA/V2/ViaReversaV2_Front` (não confundir com a cópia de deploy em `.../via-teste`, que não faz parte deste plano).

---

## Contexto e decisões de design

- Este é 1 de 6 planos paralelos. Um plano irmão cuida de `app/components/app/navigation.ts` / `app/components/app/AppSidebar.vue` — **não tocar nesses 2 arquivos**. Ele registra: `Cadastros → Operações` (`/cadastros/operacoes`), relabela `Cadastros → Contas` para "Operadores" (rota `/cadastros/contas` inalterada), relabela `Configurações → Externos` para um item solto "Integrações" (`/configuracoes/integracoes`), adiciona `Gestão → Logs → Integração` (`/logs/integracao`), e remove do menu: Ocorrências Externas, Configurações → SLA, Configurações → Processamento, Pontos de apoio, Transportadores.
- **Dependência cruzada conhecida e aceita:** `app/data/demo/cadastros.ts` deriva `cadastroNavItems` de `cadastrosNavigation` (array do plano irmão) via `item.to.replace('/cadastros/', '') as CadastroKind` — um cast, não uma checagem estática. Por isso este plano pode remover `'ocorrencias-externas'` de `CadastroKind`/`cadastroOnda3Configs` e adicionar `'operacoes'` sem quebrar o `typecheck`, independente da ordem de merge com o plano irmão. Só o **runtime** de `/cadastros/ocorrencias-externas` (e a asserção `kinds.toHaveLength(10)` / `cadastroNavItems.every(ready)` em `tests/p4-screens.spec.ts`, ambas dependentes de `cadastrosNavigation`) ficam corretos quando os dois planos estiverem integrados juntos — isso é esperado e não é responsabilidade desta Task 14 resolver isoladamente.
- **Não tocamos** nas asserções de array de navegação já existentes em `tests/p3-screens.spec.ts` (`configuracoesNavigation.map(...)`, `secondaryNavigation.map(...)`), `tests/p4-screens.spec.ts` (`secondaryNavigation.map(...)`) e `tests/data-table.spec.ts` (`cadastrosNavigation.map((item) => item.label)` com 12 itens incluindo "Ocorrências Externas") — são propriedade do plano irmão de navegação.
- `app/data/demo/gestao-rede.ts` é usado **apenas** por `app/pages/pontos-de-apoio/index.vue` e `app/pages/transportadores/index.vue` (confirmado por grep; `app/pages/resumos/pontos-de-apoio.vue` e `app/pages/resumos/transportadores.vue` usam fixtures diferentes, de `app/data/demo/resumos.ts`, e não são tocados). Decisão: **deletar o arquivo inteiro** junto com as duas páginas (Task 10).
- `app/data/demo/configuracoes.ts` (SLA/Processo/Externos/Auditoria) é usado **apenas** pelas 4 páginas que este plano deleta (`configuracoes/sla/index.vue`, `configuracoes/sla/auditoria.vue`, `configuracoes/processo.vue`, `configuracoes/externos.vue`) mais `app/utils/operacao-p3-metrics.ts` (2 funções) e `tests/p3-screens.spec.ts` (confirmado por grep). Decisão: **deletar o arquivo inteiro** e remover as 2 funções órfãs de `operacao-p3-metrics.ts` (Task 8).
- `app/pages/configuracoes/index.vue` hoje faz `navigateTo('/configuracoes/sla', { replace: true })` — como este plano deleta `configuracoes/sla/index.vue`, o redirect ficaria quebrado. Ele passa a apontar para `/configuracoes/integracoes` (única página restante da seção após este plano) — corrigido na Task 11.
- A tela `Logs → Integração` precisa de um badge de status com **ícone + texto** (nunca só cor — regra do `CLAUDE.md`). A `DataTable` genérica só suporta `type: 'text'` (texto puro, sem slot de célula custom). Por isso `app/pages/logs/integracao.vue` **não usa** o componente `DataTable`; escreve uma `<table>` própria, no mesmo padrão já usado por `app/components/orders/OrdersTable.vue` (que também precisa de `StatusLabel`/badge custom em vez da `DataTable` genérica).
- `/logs/integracao` ainda não tem nenhum bloco em `app/utils/breadcrumbs.ts` (não existe prefixo `/logs` hoje) e não existe página índice `/logs`. Adicionamos um bloco novo e simples (`Home > Logs · Integração`, 2 itens, sem depender de nenhum export do plano irmão) na Task 12, para a página não ficar com breadcrumb genérico incorreto.
- `Cadastros → Contas` (renomeado "Operadores" só no menu) recebe um campo **Tipo** (select) que espelha o array `kinds` do `Account` legado (`Cliente`/`Fornecedor`/`Ponto de apoio`) — implementado como select de valor único (não multi-tag) porque nem `CadastroOnda3FormField` nem a coluna `select` da `DataTable` suportam múltipla seleção hoje; introduzir multi-select seria escopo novo não pedido. Isso exige um novo `type: 'select'` em `CadastroOnda3FormField` (hoje só `text | email | switch`).
- Nomes de provider da fixture `Integration` (Task 1): 8 registros cobrindo o legado real de `ViaReversa_Api/api/src/models/account.py` (`intelipost_*` → Intelipost, `rapido_latina_*` → Rápido Latina, `tracken_*` → Tracken, `integration_toutbox_*` → Toutbox, `integration_spotcon_*` → Spotcon) + `module_configuration.py` (`vtex_freight_prices` → VTEX) + Chatbot (novo, kind `chatbot`) + Kangu (`kangu_transporter` em `ModuleConfiguration`).

## File Structure

- Create: `app/data/demo/integrations.ts` — tipos `Integration`/`IntegrationOperator`/`IntegrationOrder`, fixtures, CRUD helpers, métricas.
- Create: `tests/integrations.spec.ts` — fixtures, helpers de métricas, breadcrumb de `/logs/integracao`.
- Modify: `app/types/domain.ts` — `CadastroKind`: remove `'ocorrencias-externas'`, adiciona `'operacoes'`.
- Modify: `app/data/demo/cadastros.ts` — `descriptions`/`readyKinds` acompanham a troca de kind.
- Modify: `app/data/demo/cadastros-onda3.ts` — kind `operacoes` (novo), remove kind `ocorrencias-externas`, campo `tipo` (Contas) + `type: 'select'`, campo `isTransporter` (Usuários).
- Modify: `app/components/cadastros/CadastroOnda3Page.vue` — renderiza campo `select` no form, coluna "Tipo" condicional (`kind === 'contas'`).
- Create: `app/pages/configuracoes/integracoes.vue` — CRUD de `Integration` + modal "Configurar" de `IntegrationOperator`.
- Delete: `app/pages/configuracoes/externos.vue`.
- Delete: `app/data/demo/configuracoes.ts`.
- Modify: `app/utils/operacao-p3-metrics.ts` — remove `buildConfigExternalsMetrics`/`buildConfigAuditMetrics` e o import órfão.
- Modify: `app/pages/configuracoes/index.vue` — redirect passa a ser `/configuracoes/integracoes`.
- Create: `app/pages/logs/integracao.vue` — histórico somente leitura de `IntegrationOrder`.
- Delete: `app/pages/pontos-de-apoio/index.vue`, `app/pages/transportadores/index.vue`.
- Delete: `app/data/demo/gestao-rede.ts`.
- Delete: `app/pages/configuracoes/sla/index.vue`, `app/pages/configuracoes/sla/auditoria.vue`, `app/pages/configuracoes/processo.vue`.
- Modify: `app/utils/breadcrumbs.ts` — remove blocos `/pontos-de-apoio`, `/transportadores`, caso especial `sla/auditoria`; adiciona bloco `/logs/integracao`.
- Modify: `tests/p3-screens.spec.ts` — remove asserções de fixtures/breadcrumbs das telas deletadas.
- Modify: `tests/p4-screens.spec.ts` — remove import/asserções de `gestao-rede`.
- Modify: `tests/routes.spec.ts` — remove linhas das rotas deletadas, adiciona linhas das 2 páginas novas.

---

### Task 1: Fixtures `Integration` / `IntegrationOperator` / `IntegrationOrder`

**Files:**
- Create: `app/data/demo/integrations.ts`
- Test: `tests/integrations.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/integrations.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  buildIntegrationOrdersMetrics,
  buildIntegrationsMetrics,
  createEmptyIntegration,
  createEmptyIntegrationOperator,
  getIntegrationOperators,
  getIntegrationOrders,
  getIntegrations,
  integrationAccountOptions,
  integrationKindLabels,
  integrationKindOptions,
  integrationOrderStatusMeta,
  resolveAccountLabel,
  setIntegrationOperators,
  setIntegrations
} from '../app/data/demo/integrations'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

describe('fixtures de integrações', () => {
  it('expõe entre 5 e 8 integrações cobrindo providers reais do legado', () => {
    const rows = getIntegrations()
    expect(rows.length).toBeGreaterThanOrEqual(5)
    expect(rows.length).toBeLessThanOrEqual(8)
    const providers = rows.map((row) => row.provider)
    expect(providers).toContain('Toutbox')
    expect(providers).toContain('Kangu')
    expect(providers).toContain('Intelipost')
    expect(providers).toContain('VTEX')
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
  })

  it('calcula métricas de integrações (total/ativas/inativas)', () => {
    const rows = getIntegrations()
    const metrics = buildIntegrationsMetrics(rows)
    expect(metrics).toHaveLength(3)
    expect(metrics[0]).toMatchObject({ label: 'Integrações', value: rows.length })
    const active = rows.filter((row) => row.active).length
    expect(metrics[1]).toMatchObject({ label: 'Ativas', value: active })
    expect(metrics[2]).toMatchObject({ label: 'Inativas', value: rows.length - active })
  })

  it('cria e persiste uma integração nova (mock)', () => {
    const before = getIntegrations().length
    const draft = createEmptyIntegration()
    expect(draft.active).toBe(true)
    setIntegrations([...getIntegrations(), { id: 'int-test', ...draft, provider: 'Teste' }])
    expect(getIntegrations().length).toBe(before + 1)
    expect(getIntegrations().some((row) => row.id === 'int-test')).toBe(true)
    setIntegrations(getIntegrations().filter((row) => row.id !== 'int-test'))
    expect(getIntegrations().length).toBe(before)
  })

  it('lista operadores vinculados a uma integração e resolve o nome da conta', () => {
    const first = getIntegrations()[0]!
    const operators = getIntegrationOperators(first.id)
    expect(Array.isArray(operators)).toBe(true)
    for (const op of operators) {
      expect(op.integrationId).toBe(first.id)
      expect(resolveAccountLabel(op.accountId)).not.toBe('')
    }
  })

  it('substitui os operadores de uma integração (mock)', () => {
    const first = getIntegrations()[0]!
    const before = getIntegrationOperators(first.id)
    const draft = createEmptyIntegrationOperator(first.id)
    expect(draft.integrationId).toBe(first.id)
    setIntegrationOperators(first.id, [...before, { id: 'iop-test', ...draft, apiKeyMasked: 'xx_test' }])
    expect(getIntegrationOperators(first.id).length).toBe(before.length + 1)
    setIntegrationOperators(first.id, before)
    expect(getIntegrationOperators(first.id).length).toBe(before.length)
  })

  it('expõe opções de tipo e de conta para os formulários', () => {
    expect(integrationKindOptions.length).toBeGreaterThan(0)
    expect(integrationKindOptions.every((opt) => opt.label === integrationKindLabels[opt.value as keyof typeof integrationKindLabels])).toBe(true)
    expect(integrationAccountOptions().length).toBeGreaterThan(0)
  })

  it('expõe histórico de pedidos por integração com status variados e ao menos um erro com mensagem', () => {
    const rows = getIntegrationOrders()
    expect(rows.length).toBeGreaterThanOrEqual(6)
    const statuses = new Set(rows.map((row) => row.status))
    expect(statuses.has('pendente')).toBe(true)
    expect(statuses.has('enviado')).toBe(true)
    expect(statuses.has('erro')).toBe(true)
    expect(statuses.has('concluido')).toBe(true)
    const withError = rows.filter((row) => row.status === 'erro')
    expect(withError.length).toBeGreaterThan(0)
    expect(withError.every((row) => Boolean(row.errorMessage))).toBe(true)
  })

  it('calcula métricas de status do histórico', () => {
    const rows = getIntegrationOrders()
    const metrics = buildIntegrationOrdersMetrics(rows)
    expect(metrics).toHaveLength(4)
    expect(metrics.map((metric) => metric.label)).toEqual(['Pendentes', 'Enviados', 'Erros', 'Concluídos'])
  })

  it('expõe meta de ícone + texto para cada status (nunca só cor)', () => {
    for (const status of ['pendente', 'enviado', 'erro', 'concluido'] as const) {
      expect(integrationOrderStatusMeta[status].label.length).toBeGreaterThan(0)
      expect(integrationOrderStatusMeta[status].icon.startsWith('i-lucide-')).toBe(true)
    }
  })
})

describe('breadcrumb de Logs · Integração', () => {
  it('resolve /logs/integracao', () => {
    expect(resolveBreadcrumbs('/logs/integracao')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Logs · Integração' }
    ])
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: FAIL — `Cannot find module '../app/data/demo/integrations'` (arquivo ainda não existe) e o bloco de breadcrumb falha (`/logs/integracao` cai no fallback genérico).

- [ ] **Step 3: Criar `app/data/demo/integrations.ts`**

```ts
/**
 * Fixtures — Integrações (Configurações → Integrações) e histórico (Gestão → Logs → Integração).
 * Substitui a antiga tela "Externos" (app/pages/configuracoes/externos.vue, removida).
 * Modelo novo (não existe hoje nem no front nem na API legado) — desenhado a partir das colunas
 * soltas por provedor em Account (intelipost_*, rapido_latina_*, tracken_*, oi_api_*,
 * integration_toutbox_*, integration_spotcon_*) e da config global em ModuleConfiguration
 * (Frete Rápido, VTEX, Kangu) do ViaReversa_Api.
 */
import type { Metric, StatusTone } from '../../types/domain'
import { getCadastroOnda3Rows } from './cadastros-onda3'

export type IntegrationKind = 'transportadora' | 'marketplace' | 'chatbot' | 'geolocalizacao' | 'pagamento' | 'outro'

export interface Integration {
  id: string
  provider: string
  kind: IntegrationKind
  label: string
  active: boolean
  createdAt: string
}

export interface IntegrationOperator {
  id: string
  integrationId: string
  accountId: string
  apiKeyMasked: string
  config: Record<string, unknown>
  active: boolean
  lastSyncLabel: string
}

export type IntegrationOrderStatus = 'pendente' | 'enviado' | 'erro' | 'concluido'

export interface IntegrationOrder {
  id: string
  integrationId: string
  orderId: string
  status: IntegrationOrderStatus
  errorMessage?: string
  requestedAt: string
  respondedAt?: string
}

export const integrationKindLabels: Record<IntegrationKind, string> = {
  transportadora: 'Transportadora',
  marketplace: 'Marketplace',
  chatbot: 'Chatbot',
  geolocalizacao: 'Geolocalização',
  pagamento: 'Pagamento',
  outro: 'Outro'
}

export const integrationKindOptions: { label: string; value: IntegrationKind }[] = (
  Object.entries(integrationKindLabels) as [IntegrationKind, string][]
).map(([value, label]) => ({ label, value }))

export const integrationOrderStatusMeta: Record<IntegrationOrderStatus, { label: string; icon: string; tone?: StatusTone }> = {
  pendente: { label: 'Pendente', icon: 'i-lucide-clock', tone: 'warning' },
  enviado: { label: 'Enviado', icon: 'i-lucide-send', tone: 'info' },
  erro: { label: 'Erro', icon: 'i-lucide-circle-alert', tone: 'danger' },
  concluido: { label: 'Concluído', icon: 'i-lucide-circle-check', tone: 'success' }
}

const integrationsSeed: Integration[] = [
  { id: 'int-1', provider: 'Toutbox', kind: 'transportadora', label: 'Toutbox · Reversa', active: true, createdAt: '02/03/2024' },
  { id: 'int-2', provider: 'Kangu', kind: 'transportadora', label: 'Kangu · Frete nacional', active: true, createdAt: '14/05/2024' },
  { id: 'int-3', provider: 'Intelipost', kind: 'transportadora', label: 'Intelipost · Rastreio', active: true, createdAt: '20/06/2024' },
  { id: 'int-4', provider: 'Rápido Latina', kind: 'transportadora', label: 'Rápido Latina · Sul', active: false, createdAt: '11/08/2024' },
  { id: 'int-5', provider: 'Tracken', kind: 'geolocalizacao', label: 'Tracken · Localização', active: true, createdAt: '03/09/2024' },
  { id: 'int-6', provider: 'Spotcon', kind: 'geolocalizacao', label: 'Spotcon · Geocode', active: true, createdAt: '05/11/2024' },
  { id: 'int-7', provider: 'VTEX', kind: 'marketplace', label: 'VTEX · Pedidos loja', active: true, createdAt: '18/01/2025' },
  { id: 'int-8', provider: 'Chatbot', kind: 'chatbot', label: 'Chatbot · Disparo WhatsApp', active: true, createdAt: '27/02/2025' }
]

const operatorsSeed: IntegrationOperator[] = [
  { id: 'iop-1', integrationId: 'int-1', accountId: 'cta-1', apiKeyMasked: 'tb_••••••••91fa', config: { workingDays: 5 }, active: true, lastSyncLabel: '18/07 10:40' },
  { id: 'iop-2', integrationId: 'int-2', accountId: 'cta-2', apiKeyMasked: 'kg_••••••••7b11', config: {}, active: false, lastSyncLabel: '16/07 14:20' },
  { id: 'iop-3', integrationId: 'int-3', accountId: 'cta-1', apiKeyMasked: 'il_••••••••c4e2', config: { sendOccurrences: true }, active: true, lastSyncLabel: '18/07 08:12' },
  { id: 'iop-4', integrationId: 'int-3', accountId: 'cta-3', apiKeyMasked: 'il_••••••••2290', config: { sendOccurrences: false }, active: true, lastSyncLabel: '17/07 09:30' },
  { id: 'iop-5', integrationId: 'int-5', accountId: 'cta-2', apiKeyMasked: 'tk_••••••••55d1', config: {}, active: true, lastSyncLabel: '15/07 22:05' },
  { id: 'iop-6', integrationId: 'int-7', accountId: 'cta-3', apiKeyMasked: 'vt_••••••••a001', config: { store: 'amazon-br' }, active: true, lastSyncLabel: '19/07 07:15' }
]

const ordersSeed: IntegrationOrder[] = [
  { id: 'ord-1', integrationId: 'int-1', orderId: '48224', status: 'concluido', requestedAt: '18/07 09:00', respondedAt: '18/07 09:02' },
  { id: 'ord-2', integrationId: 'int-1', orderId: '48310', status: 'pendente', requestedAt: '18/07 11:20' },
  { id: 'ord-3', integrationId: 'int-2', orderId: '48355', status: 'enviado', requestedAt: '18/07 10:05' },
  { id: 'ord-4', integrationId: 'int-2', orderId: '48360', status: 'erro', errorMessage: 'CEP não localizado pela transportadora', requestedAt: '18/07 09:40', respondedAt: '18/07 09:41' },
  { id: 'ord-5', integrationId: 'int-3', orderId: '48372', status: 'concluido', requestedAt: '17/07 16:00', respondedAt: '17/07 16:03' },
  { id: 'ord-6', integrationId: 'int-3', orderId: '48390', status: 'erro', errorMessage: 'Token de autenticação expirado', requestedAt: '17/07 15:10', respondedAt: '17/07 15:11' },
  { id: 'ord-7', integrationId: 'int-6', orderId: '48401', status: 'pendente', requestedAt: '18/07 12:00' },
  { id: 'ord-8', integrationId: 'int-7', orderId: '48415', status: 'enviado', requestedAt: '18/07 13:10' }
]

let integrationsStore: Integration[] = structuredClone(integrationsSeed)
let operatorsStore: IntegrationOperator[] = structuredClone(operatorsSeed)
const ordersStore: IntegrationOrder[] = structuredClone(ordersSeed)

export function getIntegrations(): Integration[] {
  return integrationsStore
}

export function setIntegrations(rows: Integration[]) {
  integrationsStore = structuredClone(rows)
}

export function createEmptyIntegration(): Omit<Integration, 'id'> {
  return {
    provider: '',
    kind: 'transportadora',
    label: '',
    active: true,
    createdAt: new Date().toLocaleDateString('pt-BR')
  }
}

export function buildIntegrationsMetrics(rows: Integration[]): Metric[] {
  const active = rows.filter((row) => row.active).length
  return [
    { label: 'Integrações', value: rows.length, note: 'cadastradas', icon: 'i-lucide-plug' },
    { label: 'Ativas', value: active, note: 'em uso', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Inativas', value: rows.length - active, note: 'pausadas', icon: 'i-lucide-pause-circle', tone: rows.length - active > 0 ? 'warning' : undefined }
  ]
}

export function getIntegrationOperators(integrationId: string): IntegrationOperator[] {
  return operatorsStore.filter((op) => op.integrationId === integrationId)
}

export function setIntegrationOperators(integrationId: string, rows: IntegrationOperator[]) {
  operatorsStore = [
    ...operatorsStore.filter((op) => op.integrationId !== integrationId),
    ...structuredClone(rows)
  ]
}

export function createEmptyIntegrationOperator(integrationId: string): Omit<IntegrationOperator, 'id'> {
  const firstAccount = getCadastroOnda3Rows('contas')[0]
  return {
    integrationId,
    accountId: firstAccount ? firstAccount.id : '',
    apiKeyMasked: '',
    config: {},
    active: true,
    lastSyncLabel: 'Nunca sincronizado'
  }
}

export function integrationAccountOptions(): { label: string; value: string }[] {
  return getCadastroOnda3Rows('contas').map((row) => ({ label: row.name, value: row.id }))
}

export function resolveAccountLabel(accountId: string): string {
  const row = getCadastroOnda3Rows('contas').find((item) => item.id === accountId)
  return row?.name ?? accountId
}

export function getIntegrationOrders(): IntegrationOrder[] {
  return ordersStore
}

export function buildIntegrationOrdersMetrics(rows: IntegrationOrder[]): Metric[] {
  const pendente = rows.filter((row) => row.status === 'pendente').length
  const enviado = rows.filter((row) => row.status === 'enviado').length
  const erro = rows.filter((row) => row.status === 'erro').length
  const concluido = rows.filter((row) => row.status === 'concluido').length
  return [
    { label: 'Pendentes', value: pendente, note: 'na fila', icon: 'i-lucide-clock', tone: pendente > 0 ? 'warning' : undefined },
    { label: 'Enviados', value: enviado, note: 'aguardando resposta', icon: 'i-lucide-send' },
    { label: 'Erros', value: erro, note: 'falharam', icon: 'i-lucide-circle-alert', tone: erro > 0 ? 'danger' : undefined },
    { label: 'Concluídos', value: concluido, note: 'finalizados', icon: 'i-lucide-circle-check', tone: 'success' }
  ]
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: PASS em todos os `it` de fixtures/métricas. O bloco de breadcrumb (`/logs/integracao`) ainda falha — será corrigido na Task 12; por ora confirme que é a **única** falha restante:

Run: `npm run test:run -- tests/integrations.spec.ts 2>&1 | grep -c "✓\|×"`

- [ ] **Step 5: Commit**

```bash
git add app/data/demo/integrations.ts tests/integrations.spec.ts
git commit -m "feat: adiciona fixtures Integration/IntegrationOperator/IntegrationOrder"
```

---

### Task 2: `CadastroKind` — troca `ocorrencias-externas` por `operacoes`

**Files:**
- Modify: `app/types/domain.ts:235-247`
- Modify: `app/data/demo/cadastros.ts`
- Test: `tests/integrations.spec.ts` (mesmo arquivo da Task 1, novo describe)

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `tests/integrations.spec.ts`:

```ts
import type { CadastroKind } from '../app/types/domain'
import { cadastroNavItems } from '../app/data/demo/cadastros'

describe('kind operacoes substitui ocorrencias-externas', () => {
  it('cadastroNavItems não referencia mais ocorrencias-externas nas descrições', () => {
    const kinds: CadastroKind[] = cadastroNavItems.map((item) => item.kind)
    expect(kinds).not.toContain('ocorrencias-externas' as CadastroKind)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run typecheck`
Expected: FAIL — `cadastroNavItems` ainda não existe com o kind trocado (o teste em si não falha ainda porque `'ocorrencias-externas' as CadastroKind` continua compilando; a falha real vem do `typecheck` do projeto, que hoje aceita `'ocorrencias-externas'` mas depois de mudarmos `descriptions`/`readyKinds` sem mudar `CadastroKind` teria erro de tipos — confirme rodando o typecheck **antes** de tocar em `domain.ts`, para registrar a baseline).

- [ ] **Step 3: Editar `app/types/domain.ts:235-247`**

De:

```ts
export type CadastroKind =
  | 'sla'
  | 'fretes'
  | 'empresas'
  | 'contas'
  | 'usuarios'
  | 'aprovacoes-pas'
  | 'ocorrencias'
  | 'ocorrencias-externas'
  | 'regioes'
  | 'feriados'
  | 'produtos'
  | 'templates-chatbot'
```

Para:

```ts
export type CadastroKind =
  | 'sla'
  | 'fretes'
  | 'empresas'
  | 'contas'
  | 'usuarios'
  | 'aprovacoes-pas'
  | 'ocorrencias'
  | 'operacoes'
  | 'regioes'
  | 'feriados'
  | 'produtos'
  | 'templates-chatbot'
```

- [ ] **Step 4: Editar `app/data/demo/cadastros.ts`**

No objeto `descriptions`, trocar a linha de `'ocorrencias-externas'` por `operacoes`:

De:

```ts
  ocorrencias: 'Catálogo interno de tipos de ocorrência',
  'ocorrencias-externas': 'Ocorrências externas / itens de catálogo',
  regioes: 'Grupos e regiões de atendimento',
```

Para:

```ts
  ocorrencias: 'Catálogo interno de tipos de ocorrência',
  operacoes: 'Catálogo de tipos e naturezas de operação (reversa, direta, marketplace)',
  regioes: 'Grupos e regiões de atendimento',
```

No `Set` `readyKinds`, trocar a mesma entrada:

De:

```ts
const readyKinds = new Set<CadastroKind>([
  'sla',
  'fretes',
  'empresas',
  'contas',
  'usuarios',
  'aprovacoes-pas',
  'ocorrencias',
  'ocorrencias-externas',
  'regioes',
  'feriados',
  'produtos',
  'templates-chatbot'
])
```

Para:

```ts
const readyKinds = new Set<CadastroKind>([
  'sla',
  'fretes',
  'empresas',
  'contas',
  'usuarios',
  'aprovacoes-pas',
  'ocorrencias',
  'operacoes',
  'regioes',
  'feriados',
  'produtos',
  'templates-chatbot'
])
```

- [ ] **Step 5: Rodar o typecheck e confirmar sucesso**

Run: `npm run typecheck`
Expected: PASS (ainda não compila 100% até a Task 3 remover `'ocorrencias-externas'` de `cadastroOnda3Configs`/`store` em `cadastros-onda3.ts` — se o typecheck falhar aqui com "Property 'ocorrencias-externas' is missing" ou "'operacoes' does not exist", isso é esperado; prossiga para a Task 3 antes de considerar este passo concluído).

- [ ] **Step 6: Commit**

```bash
git add app/types/domain.ts app/data/demo/cadastros.ts tests/integrations.spec.ts
git commit -m "refactor: troca kind ocorrencias-externas por operacoes em CadastroKind"
```

---

### Task 3: `cadastros-onda3.ts` — adiciona kind `operacoes`, remove `ocorrencias-externas`

**Files:**
- Modify: `app/data/demo/cadastros-onda3.ts`
- Modify: `tests/p4-screens.spec.ts` (nenhuma mudança de asserção nesta task — o `toHaveLength(10)` continua válido, ver Step 5)

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `tests/integrations.spec.ts`:

```ts
import {
  cadastroOnda3Configs,
  createEmptyCadastroOnda3,
  getCadastroOnda3Rows
} from '../app/data/demo/cadastros-onda3'

describe('cadastro Operações', () => {
  it('expõe fixture e config do kind operacoes com o catálogo do legado', () => {
    const rows = getCadastroOnda3Rows('operacoes')
    expect(rows.length).toBeGreaterThanOrEqual(6)
    const names = rows.map((row) => row.name)
    expect(names).toContain('Logística Reversa')
    expect(names).toContain('Entrega em Lote')
    expect(names).toContain('Entrega Expressa')
    expect(names).toContain('Logística Incremental')
    expect(names).toContain('Weelog')
    expect(names).toContain('VTEX')
    expect(names).toContain('Store')
    expect(cadastroOnda3Configs.operacoes.singular).toBe('operação')
  })

  it('não expõe mais o kind ocorrencias-externas em cadastroOnda3Configs', () => {
    expect(Object.keys(cadastroOnda3Configs)).not.toContain('ocorrencias-externas')
  })

  it('createEmptyCadastroOnda3 funciona para operacoes', () => {
    const draft = createEmptyCadastroOnda3('operacoes')
    expect(draft.active).toBe(true)
    expect(draft.name).toBe('')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: FAIL — `getCadastroOnda3Rows('operacoes')` não compila/retorna `undefined` (kind ainda não existe no `store`).

- [ ] **Step 3: Editar `app/data/demo/cadastros-onda3.ts`**

Remover o bloco `ocorrenciasExternas` (linhas 75-79 do arquivo atual):

```ts
const ocorrenciasExternas: CadastroOnda3Row[] = [
  { id: 'ox-1', name: 'Mileto · AUSENTE', detail: 'Código MLT-01', meta: 'Externo', statusLabel: 'Mapeada', active: true },
  { id: 'ox-2', name: 'Kangu · CEP inválido', detail: 'Código KG-88', meta: 'Externo', statusLabel: 'Mapeada', active: true },
  { id: 'ox-3', name: 'Carrier · Recusa', detail: 'Código CR-12', meta: 'Externo', statusLabel: 'Pendente', active: false }
]
```

No lugar (mesma posição, logo após o bloco `ocorrencias`), inserir:

```ts
const operacoes: CadastroOnda3Row[] = [
  { id: 'op-1', name: 'Logística Reversa', detail: 'Coleta e retorno ao CD', meta: 'Reversa', statusLabel: 'Ativo', active: true },
  { id: 'op-2', name: 'Entrega em Lote', detail: 'Expedição consolidada', meta: 'Direta', statusLabel: 'Ativo', active: true },
  { id: 'op-3', name: 'Entrega Expressa', detail: 'SLA curto, prioridade alta', meta: 'Direta', statusLabel: 'Ativo', active: true },
  { id: 'op-4', name: 'Logística Incremental', detail: 'Reposição contínua de estoque', meta: 'Reversa', statusLabel: 'Ativo', active: true },
  { id: 'op-5', name: 'Weelog', detail: 'Integração Weelog', meta: 'Parceiro', statusLabel: 'Ativo', active: true },
  { id: 'op-6', name: 'VTEX', detail: 'Pedidos originados na VTEX', meta: 'Marketplace', statusLabel: 'Ativo', active: true },
  { id: 'op-7', name: 'Store', detail: 'Venda em loja física', meta: 'Loja', statusLabel: 'Inativo', active: false }
]
```

No objeto `store`, trocar:

```ts
  ocorrencias: structuredClone(ocorrencias),
  'ocorrencias-externas': structuredClone(ocorrenciasExternas),
  regioes: structuredClone(regioes),
```

Para:

```ts
  ocorrencias: structuredClone(ocorrencias),
  operacoes: structuredClone(operacoes),
  regioes: structuredClone(regioes),
```

No objeto `cadastroOnda3Configs`, trocar o bloco `'ocorrencias-externas'`:

```ts
  'ocorrencias-externas': {
    kind: 'ocorrencias-externas',
    singular: 'item de ocorrência',
    createLabel: 'Novo item externo',
    searchPlaceholder: 'Buscar código ou provedor…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Item *', placeholder: 'Provedor · código' },
      { key: 'detail', label: 'Código externo', placeholder: 'MLT-01' },
      { key: 'meta', label: 'Origem', placeholder: 'Externo' },
      { key: 'active', label: 'Ativo', type: 'switch' }
    ]
  },
```

Por:

```ts
  operacoes: {
    kind: 'operacoes',
    singular: 'operação',
    createLabel: 'Nova operação',
    searchPlaceholder: 'Buscar tipo de operação…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Operação *', placeholder: 'Ex.: Logística Reversa' },
      { key: 'detail', label: 'Descrição', placeholder: 'Contexto operacional' },
      { key: 'meta', label: 'Natureza', placeholder: 'Reversa' },
      { key: 'active', label: 'Ativa', type: 'switch' }
    ]
  },
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: PASS

- [ ] **Step 5: Confirmar que `tests/p4-screens.spec.ts` continua íntegro**

Run: `npm run test:run -- tests/p4-screens.spec.ts`
Expected: o `it('expõe fixtures e métricas para os 10 kinds', ...)` continua PASS — a troca é 1-para-1 (`ocorrencias-externas` sai, `operacoes` entra), o total de kinds Onda 3 continua 10. Se a asserção `cadastroNavItems.every((item) => item.ready)` falhar, é porque `cadastrosNavigation` (plano irmão) ainda não foi atualizado — não corrija isso aqui, é esperado até os planos serem integrados (ver Contexto).

- [ ] **Step 6: Rodar o typecheck completo**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/data/demo/cadastros-onda3.ts tests/integrations.spec.ts
git commit -m "feat: adiciona kind Operações aos cadastros Onda 3, remove Ocorrências Externas"
```

---

### Task 4: Campo "Tipo" em Contas (select) + `type: 'select'` em `CadastroOnda3FormField`

**Files:**
- Modify: `app/data/demo/cadastros-onda3.ts`
- Modify: `app/components/cadastros/CadastroOnda3Page.vue`
- Test: `tests/integrations.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `tests/integrations.spec.ts`:

```ts
import { readFileSync } from 'node:fs'

describe('campo Tipo em Contas', () => {
  it('fixture de contas tem tipo Cliente/Fornecedor', () => {
    const rows = getCadastroOnda3Rows('contas')
    expect(rows.every((row) => typeof row.tipo === 'string' && row.tipo.length > 0)).toBe(true)
    expect(rows.map((row) => row.tipo)).toContain('Cliente')
    expect(rows.map((row) => row.tipo)).toContain('Fornecedor')
  })

  it('config de contas expõe o campo select Tipo com as 3 opções do legado', () => {
    const field = cadastroOnda3Configs.contas.formFields.find((item) => item.key === 'tipo')
    expect(field).toBeTruthy()
    expect(field!.type).toBe('select')
    expect(field!.options?.map((opt) => opt.value)).toEqual(['Cliente', 'Fornecedor', 'Ponto de apoio'])
  })

  it('createEmptyCadastroOnda3 define tipo padrão para contas', () => {
    expect(createEmptyCadastroOnda3('contas').tipo).toBe('Cliente')
  })

  it('CadastroOnda3Page.vue só mostra a coluna Tipo quando kind é contas', () => {
    const source = readFileSync('app/components/cadastros/CadastroOnda3Page.vue', 'utf8')
    expect(source).toContain("props.kind === 'contas'")
    expect(source).toContain("field.type === 'select'")
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: FAIL — `row.tipo` é `undefined`, `field` é `undefined`, e o `.vue` não contém os trechos condicionais ainda.

- [ ] **Step 3: Editar `app/data/demo/cadastros-onda3.ts` — tipos**

Em `CadastroOnda3Row`, adicionar (depois de `queueStatus`):

```ts
export interface CadastroOnda3Row extends Record<string, unknown> {
  id: string
  name: string
  detail: string
  meta: string
  statusLabel: string
  active: boolean
  /** Keyword de exclusão (usuários = e-mail). */
  keyword?: string
  /** Filhos para coluna expand (regiões). */
  children?: { id: string; label: string; detail: string }[]
  /** Status de fila (aprovações). */
  queueStatus?: 'pendente' | 'aprovado' | 'recusado'
  /** Tags do Account legado (kinds JSON array) — só usado no kind 'contas'. */
  tipo?: string
  /** Espelha User.is_transporter do legado — só usado no kind 'usuarios'. */
  isTransporter?: boolean
}
```

Em `CadastroOnda3FormField`, adicionar `'select'` ao `type` e um novo campo `options`:

```ts
export interface CadastroOnda3FormField {
  key: keyof CadastroOnda3Row & string
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'switch' | 'select'
  options?: { label: string; value: string }[]
}
```

- [ ] **Step 4: Editar `app/data/demo/cadastros-onda3.ts` — fixture de contas**

De:

```ts
const contas: CadastroOnda3Row[] = [
  { id: 'cta-1', name: 'CB · CD Cajamar', detail: 'Casas Bahia', meta: 'Reversa · SP', statusLabel: 'Ativa', active: true },
  { id: 'cta-2', name: 'RN · Hub Sul', detail: 'Renner', meta: 'Troca · RS', statusLabel: 'Ativa', active: true },
  { id: 'cta-3', name: 'AMZ · São Paulo', detail: 'Amazon BR', meta: 'Reversa · SP', statusLabel: 'Pausada', active: false }
]
```

Para:

```ts
const contas: CadastroOnda3Row[] = [
  { id: 'cta-1', name: 'CB · CD Cajamar', detail: 'Casas Bahia', meta: 'Reversa · SP', statusLabel: 'Ativa', active: true, tipo: 'Cliente' },
  { id: 'cta-2', name: 'RN · Hub Sul', detail: 'Renner', meta: 'Troca · RS', statusLabel: 'Ativa', active: true, tipo: 'Cliente' },
  { id: 'cta-3', name: 'AMZ · São Paulo', detail: 'Amazon BR', meta: 'Reversa · SP', statusLabel: 'Pausada', active: false, tipo: 'Fornecedor' }
]
```

- [ ] **Step 5: Editar `app/data/demo/cadastros-onda3.ts` — config de contas**

De:

```ts
  contas: {
    kind: 'contas',
    singular: 'conta',
    createLabel: 'Nova conta',
    searchPlaceholder: 'Buscar por conta ou empresa…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Conta *', placeholder: 'Ex.: CB · CD Cajamar' },
      { key: 'detail', label: 'Empresa', placeholder: 'Casas Bahia' },
      { key: 'meta', label: 'Operação / UF', placeholder: 'Reversa · SP' },
      { key: 'active', label: 'Ativa', type: 'switch' }
    ]
  },
```

Para:

```ts
  contas: {
    kind: 'contas',
    singular: 'conta',
    createLabel: 'Nova conta',
    searchPlaceholder: 'Buscar por conta ou empresa…',
    deleteMode: 'confirm',
    formFields: [
      { key: 'name', label: 'Conta *', placeholder: 'Ex.: CB · CD Cajamar' },
      { key: 'detail', label: 'Empresa', placeholder: 'Casas Bahia' },
      { key: 'meta', label: 'Operação / UF', placeholder: 'Reversa · SP' },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: [
          { label: 'Cliente', value: 'Cliente' },
          { label: 'Fornecedor', value: 'Fornecedor' },
          { label: 'Ponto de apoio', value: 'Ponto de apoio' }
        ]
      },
      { key: 'active', label: 'Ativa', type: 'switch' }
    ]
  },
```

- [ ] **Step 6: Editar `app/data/demo/cadastros-onda3.ts` — `createEmptyCadastroOnda3`**

De:

```ts
export function createEmptyCadastroOnda3(kind: CadastroOnda3Kind): Omit<CadastroOnda3Row, 'id'> {
  const base: Omit<CadastroOnda3Row, 'id'> = {
    name: '',
    detail: '',
    meta: '',
    statusLabel: 'Ativo',
    active: true
  }
  if (kind === 'usuarios') base.keyword = ''
  if (kind === 'aprovacoes-pas') {
    base.queueStatus = 'pendente'
    base.statusLabel = 'Pendente'
  }
  if (kind === 'regioes') base.children = []
  return base
}
```

Para:

```ts
export function createEmptyCadastroOnda3(kind: CadastroOnda3Kind): Omit<CadastroOnda3Row, 'id'> {
  const base: Omit<CadastroOnda3Row, 'id'> = {
    name: '',
    detail: '',
    meta: '',
    statusLabel: 'Ativo',
    active: true
  }
  if (kind === 'usuarios') {
    base.keyword = ''
    base.isTransporter = false
  }
  if (kind === 'contas') base.tipo = 'Cliente'
  if (kind === 'aprovacoes-pas') {
    base.queueStatus = 'pendente'
    base.statusLabel = 'Pendente'
  }
  if (kind === 'regioes') base.children = []
  return base
}
```

- [ ] **Step 7: Editar `app/components/cadastros/CadastroOnda3Page.vue` — coluna Tipo condicional**

De (dentro de `columns` computed):

```ts
  cols.push(
    { type: 'text', key: 'name', label: 'Nome', width: '24%', secondaryKey: 'detail' },
    { type: 'text', key: 'meta', label: 'Detalhe', width: '18%' },
    { type: 'text', key: 'statusLabel', label: 'Status', width: '110px' }
  )
  if (props.kind !== 'aprovacoes-pas') {
    cols.push({ type: 'switch', key: 'active', label: 'Ativo', width: '72px' })
  }
```

Para:

```ts
  cols.push(
    { type: 'text', key: 'name', label: 'Nome', width: '24%', secondaryKey: 'detail' },
    { type: 'text', key: 'meta', label: 'Detalhe', width: '18%' },
    { type: 'text', key: 'statusLabel', label: 'Status', width: '110px' }
  )
  if (props.kind === 'contas') {
    cols.push({ type: 'text', key: 'tipo', label: 'Tipo', width: '130px' })
  }
  if (props.kind !== 'aprovacoes-pas') {
    cols.push({ type: 'switch', key: 'active', label: 'Ativo', width: '72px' })
  }
```

- [ ] **Step 8: Editar `app/components/cadastros/CadastroOnda3Page.vue` — `openEdit`/`saveForm`**

Em `openEdit`, de:

```ts
function openEdit(row: CadastroOnda3Row) {
  editingId.value = row.id
  form.name = row.name
  form.detail = row.detail
  form.meta = row.meta
  form.active = row.active
  form.statusLabel = row.statusLabel
  form.keyword = row.keyword
  form.queueStatus = row.queueStatus
  form.children = row.children ? structuredClone(row.children) : []
  formOpen.value = true
}
```

Para:

```ts
function openEdit(row: CadastroOnda3Row) {
  editingId.value = row.id
  form.name = row.name
  form.detail = row.detail
  form.meta = row.meta
  form.active = row.active
  form.statusLabel = row.statusLabel
  form.keyword = row.keyword
  form.queueStatus = row.queueStatus
  form.children = row.children ? structuredClone(row.children) : []
  form.tipo = row.tipo
  form.isTransporter = row.isTransporter
  formOpen.value = true
}
```

Em `saveForm`, no branch de edição, de:

```ts
  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.detail = form.detail.trim()
      target.meta = form.meta.trim()
      target.active = form.active
      target.statusLabel = form.active ? (target.queueStatus === 'pendente' ? 'Pendente' : 'Ativo') : 'Inativo'
      if (form.keyword !== undefined) target.keyword = String(form.keyword).trim()
    }
  }
```

Para:

```ts
  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.detail = form.detail.trim()
      target.meta = form.meta.trim()
      target.active = form.active
      target.statusLabel = form.active ? (target.queueStatus === 'pendente' ? 'Pendente' : 'Ativo') : 'Inativo'
      if (form.keyword !== undefined) target.keyword = String(form.keyword).trim()
      if (form.tipo !== undefined) target.tipo = form.tipo
      if (form.isTransporter !== undefined) target.isTransporter = form.isTransporter
    }
  }
```

No branch de criação, de:

```ts
  else {
    const created: CadastroOnda3Row = {
      id: `${props.kind}-${Date.now()}`,
      name: form.name.trim(),
      detail: form.detail.trim(),
      meta: form.meta.trim(),
      active: form.active,
      statusLabel: props.kind === 'aprovacoes-pas' ? 'Pendente' : form.active ? 'Ativo' : 'Inativo',
      keyword: form.keyword ? String(form.keyword).trim() : undefined,
      queueStatus: props.kind === 'aprovacoes-pas' ? 'pendente' : undefined,
      children: props.kind === 'regioes' ? [] : undefined
    }
    rows.value = [created, ...rows.value]
  }
```

Para:

```ts
  else {
    const created: CadastroOnda3Row = {
      id: `${props.kind}-${Date.now()}`,
      name: form.name.trim(),
      detail: form.detail.trim(),
      meta: form.meta.trim(),
      active: form.active,
      statusLabel: props.kind === 'aprovacoes-pas' ? 'Pendente' : form.active ? 'Ativo' : 'Inativo',
      keyword: form.keyword ? String(form.keyword).trim() : undefined,
      queueStatus: props.kind === 'aprovacoes-pas' ? 'pendente' : undefined,
      children: props.kind === 'regioes' ? [] : undefined,
      tipo: props.kind === 'contas' ? form.tipo : undefined,
      isTransporter: props.kind === 'usuarios' ? form.isTransporter : undefined
    }
    rows.value = [created, ...rows.value]
  }
```

- [ ] **Step 9: Editar `app/components/cadastros/CadastroOnda3Page.vue` — renderiza campo `select` no form**

De:

```html
      <template
        v-for="field in config.formFields"
        :key="field.key"
      >
        <AppFormField
          v-if="field.type === 'switch'"
          :label="field.label"
        >
          <USwitch v-model="(form as Record<string, unknown>)[field.key] as boolean" />
        </AppFormField>
        <AppFormField
          v-else
          :label="field.label"
        >
          <UInput
            v-model="(form as Record<string, unknown>)[field.key] as string"
            :type="field.type === 'email' ? 'email' : 'text'"
            :placeholder="field.placeholder"
          />
        </AppFormField>
      </template>
```

Para:

```html
      <template
        v-for="field in config.formFields"
        :key="field.key"
      >
        <AppFormField
          v-if="field.type === 'switch'"
          :label="field.label"
        >
          <USwitch v-model="(form as Record<string, unknown>)[field.key] as boolean" />
        </AppFormField>
        <AppFormField
          v-else-if="field.type === 'select'"
          :label="field.label"
        >
          <USelectMenu
            v-model="(form as Record<string, unknown>)[field.key] as string"
            value-key="value"
            :items="field.options ?? []"
          />
        </AppFormField>
        <AppFormField
          v-else
          :label="field.label"
        >
          <UInput
            v-model="(form as Record<string, unknown>)[field.key] as string"
            :type="field.type === 'email' ? 'email' : 'text'"
            :placeholder="field.placeholder"
          />
        </AppFormField>
      </template>
```

- [ ] **Step 10: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/integrations.spec.ts tests/p4-screens.spec.ts`
Expected: PASS

- [ ] **Step 11: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 12: Commit**

```bash
git add app/data/demo/cadastros-onda3.ts app/components/cadastros/CadastroOnda3Page.vue tests/integrations.spec.ts
git commit -m "feat: adiciona campo Tipo (select) em Contas e suporte a formFields select"
```

---

### Task 5: Toggle "É transportador" em Usuários

**Files:**
- Modify: `app/data/demo/cadastros-onda3.ts`
- Test: `tests/integrations.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `tests/integrations.spec.ts`:

```ts
describe('toggle É transportador em Usuários', () => {
  it('config de usuarios expõe o switch isTransporter', () => {
    const field = cadastroOnda3Configs.usuarios.formFields.find((item) => item.key === 'isTransporter')
    expect(field).toBeTruthy()
    expect(field!.type).toBe('switch')
    expect(field!.label).toBe('É transportador')
  })

  it('fixture de usuarios tem isTransporter definido', () => {
    const rows = getCadastroOnda3Rows('usuarios')
    expect(rows.every((row) => typeof row.isTransporter === 'boolean')).toBe(true)
    expect(rows.some((row) => row.isTransporter === true)).toBe(true)
  })

  it('createEmptyCadastroOnda3 define isTransporter=false para usuarios', () => {
    expect(createEmptyCadastroOnda3('usuarios').isTransporter).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: FAIL — `field` é `undefined`, `row.isTransporter` é `undefined`.

- [ ] **Step 3: Editar `app/data/demo/cadastros-onda3.ts` — fixture de usuários**

De:

```ts
const usuarios: CadastroOnda3Row[] = [
  { id: 'usr-1', name: 'Ana Duarte', detail: 'Operações', meta: 'Admin', statusLabel: 'Ativo', active: true, keyword: 'ana.duarte@viareversa.com' },
  { id: 'usr-2', name: 'João Ribeiro', detail: 'Ponto de apoio Centro', meta: 'Operador', statusLabel: 'Ativo', active: true, keyword: 'joao.ribeiro@viareversa.com' },
  { id: 'usr-3', name: 'Camila Ferreira', detail: 'Backoffice', meta: 'Analista', statusLabel: 'Inativo', active: false, keyword: 'camila.ferreira@viareversa.com' }
]
```

Para:

```ts
const usuarios: CadastroOnda3Row[] = [
  { id: 'usr-1', name: 'Ana Duarte', detail: 'Operações', meta: 'Admin', statusLabel: 'Ativo', active: true, keyword: 'ana.duarte@viareversa.com', isTransporter: false },
  { id: 'usr-2', name: 'João Ribeiro', detail: 'Ponto de apoio Centro', meta: 'Operador', statusLabel: 'Ativo', active: true, keyword: 'joao.ribeiro@viareversa.com', isTransporter: true },
  { id: 'usr-3', name: 'Camila Ferreira', detail: 'Backoffice', meta: 'Analista', statusLabel: 'Inativo', active: false, keyword: 'camila.ferreira@viareversa.com', isTransporter: false }
]
```

- [ ] **Step 4: Editar `app/data/demo/cadastros-onda3.ts` — config de usuários**

De:

```ts
  usuarios: {
    kind: 'usuarios',
    singular: 'usuário',
    createLabel: 'Novo usuário',
    searchPlaceholder: 'Buscar por nome ou e-mail…',
    deleteMode: 'keyword',
    formFields: [
      { key: 'name', label: 'Nome *', placeholder: 'Nome completo' },
      { key: 'keyword', label: 'E-mail *', placeholder: 'usuario@empresa.com', type: 'email' },
      { key: 'detail', label: 'Área', placeholder: 'Operações' },
      { key: 'meta', label: 'Papel', placeholder: 'Operador' },
      { key: 'active', label: 'Ativo', type: 'switch' }
    ]
  },
```

Para:

```ts
  usuarios: {
    kind: 'usuarios',
    singular: 'usuário',
    createLabel: 'Novo usuário',
    searchPlaceholder: 'Buscar por nome ou e-mail…',
    deleteMode: 'keyword',
    formFields: [
      { key: 'name', label: 'Nome *', placeholder: 'Nome completo' },
      { key: 'keyword', label: 'E-mail *', placeholder: 'usuario@empresa.com', type: 'email' },
      { key: 'detail', label: 'Área', placeholder: 'Operações' },
      { key: 'meta', label: 'Papel', placeholder: 'Operador' },
      { key: 'isTransporter', label: 'É transportador', type: 'switch' },
      { key: 'active', label: 'Ativo', type: 'switch' }
    ]
  },
```

`createEmptyCadastroOnda3` já foi ajustado na Task 4 (Step 6) para setar `base.isTransporter = false` quando `kind === 'usuarios'` — nenhuma mudança adicional necessária aqui. `openEdit`/`saveForm` em `CadastroOnda3Page.vue` também já tratam `form.isTransporter`/`target.isTransporter` desde a Task 4 (Step 8), de forma genérica (guard `!== undefined`), então funcionam também para `usuarios` sem mudança adicional.

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: PASS

- [ ] **Step 6: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/data/demo/cadastros-onda3.ts tests/integrations.spec.ts
git commit -m "feat: adiciona toggle É transportador em Usuários"
```

---

### Task 6: `Configurações → Integrações` — listagem + CRUD (criar/editar/excluir)

**Files:**
- Create: `app/pages/configuracoes/integracoes.vue`
- Test: `tests/routes.spec.ts` (linha nova, ver Task 13)

- [ ] **Step 1: Escrever o teste que falha**

Criar (ou, se já existir de outra task paralela, confirmar) o seguinte teste em `tests/integrations.spec.ts`, ao final:

```ts
describe('página Configurações · Integrações', () => {
  it('materializa CRUD completo com MetricsStrip, DataTable e modais', () => {
    const source = readFileSync('app/pages/configuracoes/integracoes.vue', 'utf8')
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('<DataTable')
    expect(source).toContain("variant=\"form\"")
    expect(source).toContain("variant=\"confirm\"")
    expect(source).toContain('Nova integração')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: FAIL — `ENOENT` (arquivo ainda não existe).

- [ ] **Step 3: Criar `app/pages/configuracoes/integracoes.vue`**

```vue
<script setup lang="ts">
/**
 * Configurações → Integrações — CRUD completo (substitui a antiga tela Externos).
 * Padrão visual de CadastroOnda3Page.vue: MetricsStrip + busca + DataTable + AppModal.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Integration } from '~/data/demo/integrations'
import {
  buildIntegrationsMetrics,
  createEmptyIntegration,
  getIntegrations,
  integrationKindLabels,
  integrationKindOptions,
  setIntegrations
} from '~/data/demo/integrations'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Integrações · Configurações · Via Reversa' })

type IntegrationDisplayRow = Integration & { kindLabel: string }

const toast = useToast()

const rows = ref<Integration[]>(structuredClone(getIntegrations()))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<Integration | null>(null)
const form = reactive(createEmptyIntegration())

const columns: DataTableColumn<IntegrationDisplayRow>[] = [
  { type: 'text', key: 'provider', label: 'Provedor', width: '22%', secondaryKey: 'label' },
  { type: 'text', key: 'kindLabel', label: 'Tipo', width: '16%' },
  { type: 'text', key: 'createdAt', label: 'Criado em', width: '120px' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '80px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '112px',
    items: (row) => [
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.provider}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.provider}` }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.provider, row.label, integrationKindLabels[row.kind]].some((value) => String(value).toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildIntegrationsMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const displayRows = computed((): IntegrationDisplayRow[] =>
  pagedRows.value.map((row) => ({ ...row, kindLabel: integrationKindLabels[row.kind] }))
)

watch(search, () => {
  page.value = 1
})

function persist() {
  setIntegrations(structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyIntegration())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: Integration) {
  editingId.value = row.id
  form.provider = row.provider
  form.kind = row.kind
  form.label = row.label
  form.active = row.active
  form.createdAt = row.createdAt
  formOpen.value = true
}

function openDelete(row: Integration) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: IntegrationDisplayRow; action: string }) {
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: IntegrationDisplayRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target) {
    target.active = payload.value
    persist()
  }
}

function saveForm() {
  if (!form.provider.trim() || !form.label.trim()) {
    toast.error('Campo obrigatório', 'Informe provedor e rótulo antes de salvar.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.provider = form.provider.trim()
      target.kind = form.kind
      target.label = form.label.trim()
      target.active = form.active
    }
  }
  else {
    const created: Integration = {
      id: `int-${Date.now()}`,
      provider: form.provider.trim(),
      kind: form.kind,
      label: form.label.trim(),
      active: form.active,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `Integração ${wasEdit ? 'atualizada' : 'criada'} (mock).`)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  persist()
  toast.success('Excluído', `${pendingDelete.value.provider} removido (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="config-integracoes-page">
    <PageHeader
      title="Configurações · Integrações"
      subtitle="Provedores de transportadora, marketplace, chatbot e geolocalização"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Nova integração
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="listMetrics" />

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar provedor ou tipo…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="displayRows"
      min-width="880px"
      empty-title="Nenhuma integração"
      empty-description="Cadastre a primeira integração ou ajuste a busca."
      @action="onAction"
      @update:switch="onSwitch"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar integração' : 'Nova integração'"
      :description="editingId ? 'Atualize os dados da integração.' : 'Informe os dados da nova integração.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Provedor *">
        <UInput
          v-model="form.provider"
          placeholder="Ex.: Kangu"
        />
      </AppFormField>
      <AppFormField label="Tipo *">
        <USelectMenu
          v-model="form.kind"
          value-key="value"
          :items="integrationKindOptions"
        />
      </AppFormField>
      <AppFormField label="Rótulo *">
        <UInput
          v-model="form.label"
          placeholder="Ex.: Kangu · Frete nacional"
        />
      </AppFormField>
      <AppFormField label="Ativa">
        <USwitch v-model="form.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir integração"
      :description="pendingDelete ? `“${pendingDelete.provider}” será removida. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: PASS

- [ ] **Step 5: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/pages/configuracoes/integracoes.vue tests/integrations.spec.ts
git commit -m "feat: cria Configurações → Integrações (CRUD de Integration)"
```

---

### Task 7: `Configurações → Integrações` — modal "Configurar" (CRUD de `IntegrationOperator`)

**Files:**
- Modify: `app/pages/configuracoes/integracoes.vue`
- Test: `tests/integrations.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `tests/integrations.spec.ts`:

```ts
describe('página Configurações · Integrações — modal Configurar', () => {
  it('tem ação Configurar e o modal de operadores vinculados', () => {
    const source = readFileSync('app/pages/configuracoes/integracoes.vue', 'utf8')
    expect(source).toContain("key: 'configure'")
    expect(source).toContain('Configurar')
    expect(source).toContain('resolveAccountLabel')
    expect(source).toContain('Vincular conta')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: FAIL — nenhum desses trechos existe ainda no arquivo.

- [ ] **Step 3: Editar `app/pages/configuracoes/integracoes.vue` — imports e estado**

No bloco de import de `~/data/demo/integrations`, adicionar os símbolos novos:

De:

```ts
import {
  buildIntegrationsMetrics,
  createEmptyIntegration,
  getIntegrations,
  integrationKindLabels,
  integrationKindOptions,
  setIntegrations
} from '~/data/demo/integrations'
```

Para:

```ts
import type { IntegrationOperator } from '~/data/demo/integrations'
import {
  buildIntegrationsMetrics,
  createEmptyIntegration,
  createEmptyIntegrationOperator,
  getIntegrationOperators,
  getIntegrations,
  integrationAccountOptions,
  integrationKindLabels,
  integrationKindOptions,
  resolveAccountLabel,
  setIntegrationOperators,
  setIntegrations
} from '~/data/demo/integrations'
```

Logo após a declaração de `const form = reactive(createEmptyIntegration())`, adicionar:

```ts
const configureOpen = ref(false)
const configuringIntegration = ref<Integration | null>(null)
const operatorRows = ref<IntegrationOperator[]>([])
const operatorFormOpen = ref(false)
const editingOperatorId = ref<string | null>(null)
const operatorForm = reactive(createEmptyIntegrationOperator(''))
const accountOptions = integrationAccountOptions()
```

- [ ] **Step 4: Editar `app/pages/configuracoes/integracoes.vue` — coluna e ação "Configurar"**

De:

```ts
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '112px',
    items: (row) => [
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.provider}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.provider}` }
    ]
  }
```

Para:

```ts
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '168px',
    items: (row) => [
      { key: 'configure', label: 'Configurar', icon: 'i-lucide-settings-2', variant: 'ghost', ariaLabel: `Configurar ${row.provider}` },
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.provider}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.provider}` }
    ]
  }
```

De:

```ts
function onAction(payload: { row: IntegrationDisplayRow; action: string }) {
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}
```

Para:

```ts
function onAction(payload: { row: IntegrationDisplayRow; action: string }) {
  if (payload.action === 'configure') openConfigure(payload.row)
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}
```

- [ ] **Step 5: Editar `app/pages/configuracoes/integracoes.vue` — funções do modal Configurar**

Adicionar ao final do `<script setup>`, antes do `confirmDelete`:

```ts
function resetOperatorForm() {
  Object.assign(operatorForm, createEmptyIntegrationOperator(configuringIntegration.value?.id ?? ''))
  editingOperatorId.value = null
}

function openConfigure(row: Integration) {
  configuringIntegration.value = row
  operatorRows.value = structuredClone(getIntegrationOperators(row.id))
  operatorFormOpen.value = false
  resetOperatorForm()
  configureOpen.value = true
}

function openAddOperator() {
  resetOperatorForm()
  operatorFormOpen.value = true
}

function openEditOperator(op: IntegrationOperator) {
  editingOperatorId.value = op.id
  operatorForm.accountId = op.accountId
  operatorForm.apiKeyMasked = op.apiKeyMasked
  operatorForm.active = op.active
  operatorFormOpen.value = true
}

function saveOperatorInline() {
  if (!operatorForm.accountId) {
    toast.error('Campo obrigatório', 'Selecione a conta.')
    return
  }
  if (editingOperatorId.value) {
    const target = operatorRows.value.find((op) => op.id === editingOperatorId.value)
    if (target) {
      target.accountId = operatorForm.accountId
      target.apiKeyMasked = operatorForm.apiKeyMasked.trim()
      target.active = operatorForm.active
    }
  }
  else {
    operatorRows.value = [
      {
        id: `iop-${Date.now()}`,
        integrationId: configuringIntegration.value!.id,
        accountId: operatorForm.accountId,
        apiKeyMasked: operatorForm.apiKeyMasked.trim() || '••••••••',
        config: {},
        active: operatorForm.active,
        lastSyncLabel: 'Nunca sincronizado'
      },
      ...operatorRows.value
    ]
  }
  operatorFormOpen.value = false
  resetOperatorForm()
}

function removeOperator(op: IntegrationOperator) {
  operatorRows.value = operatorRows.value.filter((row) => row.id !== op.id)
  toast.success('Removido', 'Vínculo de conta removido (mock).')
}

function toggleOperatorActive(op: IntegrationOperator, value: boolean) {
  const target = operatorRows.value.find((row) => row.id === op.id)
  if (target) target.active = value
}

function saveConfigure() {
  if (!configuringIntegration.value) return
  setIntegrationOperators(configuringIntegration.value.id, operatorRows.value)
  configureOpen.value = false
  toast.success('Salvo', `Vínculos de ${configuringIntegration.value.provider} atualizados (mock).`)
}
```

- [ ] **Step 6: Editar `app/pages/configuracoes/integracoes.vue` — template do modal Configurar**

Adicionar, logo antes do `AppModal` de exclusão (`v-model:open="deleteOpen"`):

```html
    <AppModal
      v-model:open="configureOpen"
      variant="form"
      :title="configuringIntegration ? `Configurar · ${configuringIntegration.provider}` : 'Configurar integração'"
      :description="configuringIntegration ? `Contas vinculadas a ${configuringIntegration.label}.` : ''"
      confirm-label="Salvar"
      @confirm="saveConfigure"
    >
      <div class="grid gap-2">
        <div
          v-for="op in operatorRows"
          :key="op.id"
          class="flex items-center justify-between gap-3 border-b border-via-line py-2 text-xs last:border-b-0"
        >
          <div class="min-w-0">
            <strong class="block truncate">{{ resolveAccountLabel(op.accountId) }}</strong>
            <small class="block text-via-muted">{{ op.apiKeyMasked }} · {{ op.lastSyncLabel }}</small>
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            <USwitch
              :model-value="op.active"
              size="sm"
              @update:model-value="toggleOperatorActive(op, Boolean($event))"
            />
            <AppButton
              variant="ghost"
              icon="i-lucide-pencil"
              aria-label="Editar vínculo"
              @click="openEditOperator(op)"
            />
            <AppButton
              variant="ghost"
              icon="i-lucide-trash-2"
              aria-label="Remover vínculo"
              @click="removeOperator(op)"
            />
          </div>
        </div>
        <p
          v-if="!operatorRows.length"
          class="m-0 text-xs text-via-muted"
        >
          Nenhuma conta vinculada a esta integração.
        </p>

        <AppButton
          variant="secondary"
          icon="i-lucide-plus"
          class="justify-self-start"
          @click="openAddOperator"
        >
          Vincular conta
        </AppButton>

        <div
          v-if="operatorFormOpen"
          class="grid gap-3 border-t border-via-line pt-3"
        >
          <AppFormField label="Conta *">
            <USelectMenu
              v-model="operatorForm.accountId"
              value-key="value"
              :items="accountOptions"
            />
          </AppFormField>
          <AppFormField label="Chave de API">
            <UInput
              v-model="operatorForm.apiKeyMasked"
              placeholder="sk_••••••••1234"
            />
          </AppFormField>
          <AppFormField label="Ativo">
            <USwitch v-model="operatorForm.active" />
          </AppFormField>
          <div class="flex justify-end gap-2">
            <AppButton
              variant="secondary"
              @click="operatorFormOpen = false"
            >
              Cancelar
            </AppButton>
            <AppButton
              variant="primary"
              @click="saveOperatorInline"
            >
              {{ editingOperatorId ? 'Salvar vínculo' : 'Adicionar vínculo' }}
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>

```

- [ ] **Step 7: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: PASS

- [ ] **Step 8: Rodar o typecheck e o lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add app/pages/configuracoes/integracoes.vue tests/integrations.spec.ts
git commit -m "feat: adiciona modal Configurar (CRUD de IntegrationOperator) em Integrações"
```

---

### Task 8: Remove `Configurações → Externos` e fixtures órfãs de Configurações

**Files:**
- Delete: `app/pages/configuracoes/externos.vue`
- Delete: `app/data/demo/configuracoes.ts`
- Modify: `app/utils/operacao-p3-metrics.ts:10,294-341`
- Modify: `tests/p3-screens.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

No `tests/p3-screens.spec.ts`, adicionar (temporariamente, será consolidado no Step 5) ao final do arquivo:

```ts
describe('remoção de Configurações → Externos', () => {
  it('a página externos.vue não existe mais', () => {
    expect(existsSync('app/pages/configuracoes/externos.vue')).toBe(false)
  })

  it('a fixture configuracoes.ts não existe mais', () => {
    expect(existsSync('app/data/demo/configuracoes.ts')).toBe(false)
  })
})
```

Adicionar `existsSync` ao import de `node:fs` no topo do arquivo (hoje o arquivo não importa `node:fs`):

```ts
import { existsSync } from 'node:fs'
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: FAIL — os dois arquivos ainda existem.

- [ ] **Step 3: Deletar os arquivos**

```bash
rm "app/pages/configuracoes/externos.vue"
rm "app/data/demo/configuracoes.ts"
```

- [ ] **Step 4: Remover os imports/usos de `configuracoes.ts` que sobraram**

Editar `tests/p3-screens.spec.ts`: remover o bloco de import de `../app/data/demo/configuracoes` e as 3 linhas que o usam dentro do `it('check-in, configs e público', ...)`.

De (import no topo):

```ts
import {
  configExternalsState,
  configSlaAuditRows,
  toggleExternalActive
} from '../app/data/demo/configuracoes'
```

Remover esse bloco inteiro.

De (dentro de `describe('fixtures e métricas P3', ...)`, no `it('check-in, configs e público', ...)`):

```ts
    expect(buildConfigExternalsMetrics(configExternalsState.rows).length).toBe(3)
    expect(toggleExternalActive(configExternalsState.rows[0]!.id, false)).toBe(true)
    expect(buildConfigAuditMetrics(configSlaAuditRows)[0]?.label).toBe('Alterações')

```

Remover essas 3 linhas (mantendo o restante do `it` — as linhas de `lookupCheckInOrder`/`confirmCheckIn`/`buildLojaCheckInMetrics` antes, e `searchPublicOrder`/`getPublicOrderByHash`/`confirmPublicSchedule`/`payPublicCheckout` depois).

No import de `../app/utils/operacao-p3-metrics`, remover `buildConfigAuditMetrics` e `buildConfigExternalsMetrics`:

De:

```ts
import {
  buildChatbotDispatchMetrics,
  buildChatbotMonitorMetrics,
  buildConfigAuditMetrics,
  buildConfigExternalsMetrics,
  buildLojaCheckInMetrics,
  buildMiletoBackfillMetrics,
  buildOcorrenciasNgMetrics,
  buildTratativasMetrics
} from '../app/utils/operacao-p3-metrics'
```

Para:

```ts
import {
  buildChatbotDispatchMetrics,
  buildChatbotMonitorMetrics,
  buildLojaCheckInMetrics,
  buildMiletoBackfillMetrics,
  buildOcorrenciasNgMetrics,
  buildTratativasMetrics
} from '../app/utils/operacao-p3-metrics'
```

- [ ] **Step 5: Editar `app/utils/operacao-p3-metrics.ts` — remover funções e import órfãos**

Remover o import (linha 10):

```ts
import type { ConfigExternalRow, ConfigSlaAuditRow } from '../data/demo/configuracoes'
```

Remover as duas funções (linhas 294-341, do início de `buildConfigExternalsMetrics` até o fechamento de `buildConfigAuditMetrics`):

```ts
export function buildConfigExternalsMetrics(rows: ConfigExternalRow[]): Metric[] {
  const active = rows.filter((row) => row.active).length
  return [
    {
      label: 'Integrações',
      value: rows.length,
      note: 'cadastradas',
      icon: 'i-lucide-plug'
    },
    {
      label: 'Ativas',
      value: active,
      note: 'sincronizando',
      icon: 'i-lucide-circle-check',
      tone: 'success'
    },
    {
      label: 'Inativas',
      value: rows.length - active,
      note: 'pausadas',
      icon: 'i-lucide-pause-circle'
    }
  ]
}

export function buildConfigAuditMetrics(rows: ConfigSlaAuditRow[]): Metric[] {
  const users = new Set(rows.map((row) => row.user)).size
  return [
    {
      label: 'Alterações',
      value: rows.length,
      note: 'no histórico',
      icon: 'i-lucide-scroll-text'
    },
    {
      label: 'Usuários',
      value: users,
      note: 'que alteraram',
      icon: 'i-lucide-users'
    },
    {
      label: 'Última',
      value: rows[0]?.changedAtLabel ?? '—',
      note: 'registro mais recente',
      icon: 'i-lucide-clock'
    }
  ]
}
```

- [ ] **Step 6: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: PASS

- [ ] **Step 7: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS (nenhum outro arquivo referencia `configuracoes.ts` — confirmado por grep prévio)

- [ ] **Step 8: Commit**

```bash
git add -A app/pages/configuracoes/externos.vue app/data/demo/configuracoes.ts app/utils/operacao-p3-metrics.ts tests/p3-screens.spec.ts
git commit -m "refactor: remove Configurações → Externos e fixtures órfãs (substituído por Integrações)"
```

---

### Task 9: `Gestão → Logs → Integração` (somente leitura)

**Files:**
- Create: `app/pages/logs/integracao.vue`
- Test: `tests/integrations.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `tests/integrations.spec.ts`:

```ts
describe('página Logs · Integração', () => {
  it('é somente leitura, com filtros, MetricsStrip e badge ícone+texto', () => {
    const source = readFileSync('app/pages/logs/integracao.vue', 'utf8')
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('integrationOrderStatusMeta')
    expect(source).not.toContain('AppModal')
    expect(source).not.toContain('DataTable')
    expect(source).toContain('EmptyState')
    expect(source).toContain('Solicitado em')
    expect(source).toContain('Respondido em')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: FAIL — `ENOENT` (arquivo ainda não existe).

- [ ] **Step 3: Criar `app/pages/logs/integracao.vue`**

```vue
<script setup lang="ts">
/**
 * Gestão → Logs → Integração — histórico somente leitura de IntegrationOrder.
 * Badge de status com ícone + texto (nunca só cor); por isso usa <table> própria
 * em vez da DataTable genérica, que só suporta type: 'text' (sem célula custom).
 */
import type { IntegrationOrder, IntegrationOrderStatus } from '~/data/demo/integrations'
import {
  buildIntegrationOrdersMetrics,
  getIntegrationOrders,
  getIntegrations,
  integrationOrderStatusMeta
} from '~/data/demo/integrations'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'

useSeoMeta({ title: 'Integração · Logs · Via Reversa' })

const orders = getIntegrationOrders()
const integrations = getIntegrations()

const integrationFilter = ref('Todas')
const statusFilter = ref<'Todos' | IntegrationOrderStatus>('Todos')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const integrationOptions = computed(() => [
  { label: 'Todas as integrações', value: 'Todas' },
  ...integrations.map((item) => ({ label: item.provider, value: item.id }))
])

const statusOptions = [
  { label: 'Todos os status', value: 'Todos' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Erro', value: 'erro' },
  { label: 'Concluído', value: 'concluido' }
]

function providerFor(order: IntegrationOrder): string {
  return integrations.find((item) => item.id === order.integrationId)?.provider ?? order.integrationId
}

const filteredRows = computed(() => orders.filter((row) => {
  if (integrationFilter.value !== 'Todas' && row.integrationId !== integrationFilter.value) return false
  if (statusFilter.value !== 'Todos' && row.status !== statusFilter.value) return false
  return true
}))

const listMetrics = computed(() => buildIntegrationOrdersMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))

watch([integrationFilter, statusFilter], () => {
  page.value = 1
})

const statusToneClass: Record<IntegrationOrderStatus, string> = {
  pendente: 'text-[oklch(55%_0.14_73)]',
  enviado: 'text-via-blue-strong',
  erro: 'text-via-red',
  concluido: 'text-via-green'
}

const thClass = 'border-b border-via-line bg-via-surface-2 px-3 py-[11px] text-left text-[10px] font-bold tracking-[0.04em] text-via-muted uppercase'
const tdClass = 'border-b border-via-line px-3 py-[11px] align-middle text-xs text-via-ink'
</script>

<template>
  <div class="logs-integracao-page">
    <PageHeader
      title="Logs · Integração"
      subtitle="Histórico somente leitura de solicitações às integrações"
    />

    <MetricsStrip :metrics="listMetrics" />

    <section
      class="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <USelectMenu
        v-model="integrationFilter"
        value-key="value"
        :items="integrationOptions"
        class="filter-select filter-select--wide"
      />
      <USelectMenu
        v-model="statusFilter"
        value-key="value"
        :items="statusOptions"
        class="filter-select"
      />
    </section>

    <EmptyState
      v-if="!pagedRows.length"
      title="Nenhum registro"
      description="Nenhuma solicitação de integração no filtro."
      icon="i-lucide-inbox"
    />
    <div
      v-else
      class="min-w-0 overflow-auto"
    >
      <table
        class="w-full table-fixed border-collapse"
        style="min-width: 960px"
      >
        <colgroup>
          <col class="w-[100px]"><col class="w-[18%]"><col class="w-[140px]"><col><col class="w-[150px]"><col class="w-[150px]">
        </colgroup>
        <thead>
          <tr>
            <th :class="thClass">Pedido</th>
            <th :class="thClass">Integração</th>
            <th :class="thClass">Status</th>
            <th :class="thClass">Erro</th>
            <th :class="thClass">Solicitado em</th>
            <th :class="thClass">Respondido em</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in pagedRows"
            :key="row.id"
          >
            <td :class="[tdClass, 'font-bold']">#{{ row.orderId }}</td>
            <td :class="tdClass">{{ providerFor(row) }}</td>
            <td :class="tdClass">
              <span
                class="inline-flex items-center gap-1.5 font-[650]"
                :class="statusToneClass[row.status]"
              >
                <UIcon
                  :name="integrationOrderStatusMeta[row.status].icon"
                  class="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {{ integrationOrderStatusMeta[row.status].label }}
              </span>
            </td>
            <td :class="tdClass">{{ row.errorMessage ?? '—' }}</td>
            <td :class="tdClass">{{ row.requestedAt }}</td>
            <td :class="tdClass">{{ row.respondedAt ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredRows.length"
    />
  </div>
</template>
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: PASS

- [ ] **Step 5: Rodar o typecheck e o lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/pages/logs/integracao.vue tests/integrations.spec.ts
git commit -m "feat: cria Gestão → Logs → Integração (histórico somente leitura)"
```

---

### Task 10: Remove Pontos de apoio e Transportadores

**Files:**
- Delete: `app/pages/pontos-de-apoio/index.vue`
- Delete: `app/pages/transportadores/index.vue`
- Delete: `app/data/demo/gestao-rede.ts`
- Modify: `tests/p4-screens.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

No `tests/p4-screens.spec.ts`, adicionar (junto ao `describe('rotas P4 materializadas', ...)`, ao final do arquivo):

```ts
describe('remoção de Pontos de apoio e Transportadores', () => {
  it('as páginas e a fixture gestao-rede.ts não existem mais', () => {
    expect(existsSync('app/pages/pontos-de-apoio/index.vue')).toBe(false)
    expect(existsSync('app/pages/transportadores/index.vue')).toBe(false)
    expect(existsSync('app/data/demo/gestao-rede.ts')).toBe(false)
  })
})
```

(`existsSync` já é importado no topo do arquivo, junto com `readFileSync`.)

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/p4-screens.spec.ts`
Expected: FAIL — os 3 arquivos ainda existem.

- [ ] **Step 3: Deletar os arquivos**

```bash
rm "app/pages/pontos-de-apoio/index.vue"
rm "app/pages/transportadores/index.vue"
rm "app/data/demo/gestao-rede.ts"
```

- [ ] **Step 4: Remover o import e os testes órfãos de `gestao-rede` em `tests/p4-screens.spec.ts`**

De (import no topo):

```ts
import {
  buildGeoAuditMetrics,
  enqueueFixInvalidAddresses,
  geoAuditState
} from '../app/data/demo/geo-audit'
import {
  buildPontosApoioMetrics,
  buildTransportadoresMetrics,
  pontosApoioRows,
  transportadoresRows
} from '../app/data/demo/gestao-rede'
```

Para:

```ts
import {
  buildGeoAuditMetrics,
  enqueueFixInvalidAddresses,
  geoAuditState
} from '../app/data/demo/geo-audit'
```

Em `describe('geo-audit e gestão de rede', ...)`, remover o `it('calcula métricas de PA e transportadores', ...)`:

```ts
  it('calcula métricas de PA e transportadores', () => {
    expect(buildPontosApoioMetrics(pontosApoioRows)[0]?.label).toBe('Pontos')
    expect(buildTransportadoresMetrics(transportadoresRows)[0]?.label).toBe('Transportadores')
  })

```

Em `describe('breadcrumbs P4', ...)`, remover as duas asserções de `/pontos-de-apoio` e `/transportadores`:

```ts
    expect(resolveBreadcrumbs('/pontos-de-apoio')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pontos de apoio' }
    ])
    expect(resolveBreadcrumbs('/transportadores')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Transportadores' }
    ])
```

Em `describe('rotas P4 materializadas', ...)`, remover as 2 linhas da tabela `files`:

```ts
    ['app/pages/pontos-de-apoio/index.vue', 'DataTable'],
    ['app/pages/transportadores/index.vue', 'AppModal'],
```

- [ ] **Step 5: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/p4-screens.spec.ts`
Expected: PASS

- [ ] **Step 6: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add -A app/pages/pontos-de-apoio app/pages/transportadores app/data/demo/gestao-rede.ts tests/p4-screens.spec.ts
git commit -m "refactor: remove Pontos de apoio, Transportadores e fixture gestao-rede.ts"
```

---

### Task 11: Remove Configurações → SLA / Processamento e corrige redirect de `configuracoes/index.vue`

**Files:**
- Delete: `app/pages/configuracoes/sla/index.vue`
- Delete: `app/pages/configuracoes/sla/auditoria.vue`
- Delete: `app/pages/configuracoes/processo.vue`
- Modify: `app/pages/configuracoes/index.vue`
- Modify: `tests/p3-screens.spec.ts`
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `tests/p3-screens.spec.ts`:

```ts
describe('remoção de Configurações → SLA / Processamento', () => {
  it('as 3 páginas não existem mais', () => {
    expect(existsSync('app/pages/configuracoes/sla/index.vue')).toBe(false)
    expect(existsSync('app/pages/configuracoes/sla/auditoria.vue')).toBe(false)
    expect(existsSync('app/pages/configuracoes/processo.vue')).toBe(false)
  })

  it('configuracoes/index.vue não redireciona mais para /configuracoes/sla', () => {
    const source = readFileSync('app/pages/configuracoes/index.vue', 'utf8')
    expect(source).not.toContain('/configuracoes/sla')
    expect(source).toContain('/configuracoes/integracoes')
  })
})
```

Adicionar `readFileSync` ao import de `node:fs` já existente no topo do arquivo (adicionado na Task 8):

```ts
import { existsSync, readFileSync } from 'node:fs'
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: FAIL — os arquivos ainda existem e o redirect ainda aponta para `/configuracoes/sla`.

- [ ] **Step 3: Deletar os arquivos**

```bash
rm "app/pages/configuracoes/sla/index.vue"
rm "app/pages/configuracoes/sla/auditoria.vue"
rm "app/pages/configuracoes/processo.vue"
rmdir "app/pages/configuracoes/sla" 2>/dev/null || true
```

- [ ] **Step 4: Corrigir o redirect em `app/pages/configuracoes/index.vue`**

De:

```vue
<script setup lang="ts">
/**
 * Redirect Configurações → SLA.
 */
await navigateTo('/configuracoes/sla', { replace: true })
</script>
```

Para:

```vue
<script setup lang="ts">
/**
 * Redirect Configurações → Integrações (única página da seção após a remoção
 * de SLA/Processamento/Externos).
 */
await navigateTo('/configuracoes/integracoes', { replace: true })
</script>
```

- [ ] **Step 5: Remover as 3 asserções de breadcrumb obsoletas em `tests/p3-screens.spec.ts`**

De:

```ts
    expect(resolveBreadcrumbs('/configuracoes/sla')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'SLA' }
    ])
    expect(resolveBreadcrumbs('/configuracoes/sla/auditoria')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'SLA', to: '/configuracoes/sla' },
      { label: 'Auditoria' }
    ])
    expect(resolveBreadcrumbs('/configuracoes/processo')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Processamento' }
    ])
```

Remover as 3 chamadas (mantendo as demais do mesmo `it`, como `/operacao/tratativas`, `/loja/check-in` etc.).

Também remover, no mesmo arquivo, a asserção de navegação que lista as 3 rotas antigas de `configuracoesNavigation` **não é tocada** (pertence ao plano irmão) — deixe a linha:

```ts
    expect(configuracoesNavigation.map((item) => item.to)).toEqual([
      '/configuracoes/sla',
      '/configuracoes/processo',
      '/configuracoes/externos'
    ])
```

como está; ela é do bloco `describe('navegação P3', ...)`, propriedade do plano de navegação (ver Contexto).

- [ ] **Step 6: Remover as linhas correspondentes em `tests/routes.spec.ts`**

De:

```ts
  ['app/pages/configuracoes/sla/index.vue', 'AppFormField'],
  ['app/pages/configuracoes/sla/auditoria.vue', 'VolumeTrendChart'],
  ['app/pages/configuracoes/processo.vue', 'AppModal'],
  ['app/pages/configuracoes/externos.vue', 'MetricsStrip'],
```

Para:

```ts
  ['app/pages/configuracoes/integracoes.vue', 'MetricsStrip'],
  ['app/pages/logs/integracao.vue', 'MetricsStrip'],
```

(a linha de `externos.vue` some junto — já tratada na Task 8; aqui consolidamos a troga pelas 2 páginas novas, ver Task 13 para a razão de já incluir as 2 linhas novas nesta mesma edição em vez de numa Task separada).

- [ ] **Step 7: Rodar o teste e confirmar sucesso**

Run: `npm run test:run -- tests/p3-screens.spec.ts tests/routes.spec.ts`
Expected: PASS

- [ ] **Step 8: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add -A app/pages/configuracoes app/pages/logs tests/p3-screens.spec.ts tests/routes.spec.ts
git commit -m "refactor: remove Configurações → SLA/Processamento, corrige redirect e atualiza rotas materializadas"
```

---

### Task 12: `breadcrumbs.ts` — remove blocos obsoletos, adiciona `/logs/integracao`

**Files:**
- Modify: `app/utils/breadcrumbs.ts:268-280,430-434`
- Test: `tests/integrations.spec.ts`, `tests/p4-screens.spec.ts`

- [ ] **Step 1: Confirmar que os testes relevantes ainda falham no ponto certo**

O bloco de `/logs/integracao` em `tests/integrations.spec.ts` (criado na Task 1, Step 1) ainda deve estar falhando — é o gatilho desta task.

Run: `npm run test:run -- tests/integrations.spec.ts`
Expected: FAIL apenas em `describe('breadcrumb de Logs · Integração', ...)`.

- [ ] **Step 2: Remover o bloco `/pontos-de-apoio` (linhas 268-273 de `app/utils/breadcrumbs.ts`)**

De:

```ts
  if (normalized === '/pontos-de-apoio') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Pontos de apoio' }
    ]
  }

  if (normalized === '/transportadores') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Transportadores' }
    ]
  }

  if (normalized.startsWith('/operacoes/')) {
```

Para:

```ts
  if (normalized.startsWith('/operacoes/')) {
```

(remove os dois blocos inteiros, `/pontos-de-apoio` e `/transportadores`, mantendo o `if (normalized.startsWith('/operacoes/'))` que vinha logo depois).

- [ ] **Step 3: Remover o caso especial `sla/auditoria` dentro de Configurações**

De:

```ts
    if (section === 'sla' && third === 'auditoria') {
      crumbs.push({ label: 'SLA', to: '/configuracoes/sla' })
      crumbs.push({ label: 'Auditoria' })
      return crumbs
    }

    crumbs.push({ label: configuracaoNavLabel(section) })
    return crumbs
```

Para:

```ts
    crumbs.push({ label: configuracaoNavLabel(section) })
    return crumbs
```

Note que a variável `third` deixa de ser usada nesse bloco de `/configuracoes` — verifique se ela ainda é lida em outro `if` do mesmo bloco antes de removê-la da desestruturação; hoje ela só era lida nesse caso especial, então também remova a linha:

De:

```ts
  if (normalized === '/configuracoes' || normalized.startsWith('/configuracoes/')) {
    const segments = normalized.split('/').filter(Boolean)
    const section = segments[1]
    const third = segments[2]

    const crumbs: BreadcrumbItem[] = [
```

Para:

```ts
  if (normalized === '/configuracoes' || normalized.startsWith('/configuracoes/')) {
    const segments = normalized.split('/').filter(Boolean)
    const section = segments[1]

    const crumbs: BreadcrumbItem[] = [
```

- [ ] **Step 4: Adicionar o bloco `/logs/integracao`**

Adicionar um novo `if`, próximo aos demais blocos de rota simples (por exemplo logo antes do bloco `if (normalized === '/login')`):

```ts
  if (normalized === '/logs/integracao') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Logs · Integração' }
    ]
  }

  if (normalized === '/login') {
```

- [ ] **Step 5: Rodar os testes e confirmar sucesso**

Run: `npm run test:run -- tests/integrations.spec.ts tests/p4-screens.spec.ts`
Expected: PASS em todos, incluindo `describe('breadcrumb de Logs · Integração', ...)`.

- [ ] **Step 6: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS (confirma que `third` não ficou como variável não utilizada e que o ESLint/TS não reclama de unused var — rode também `npm run lint` neste passo para garantir).

Run: `npm run lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/utils/breadcrumbs.ts tests/integrations.spec.ts tests/p4-screens.spec.ts
git commit -m "refactor: limpa breadcrumbs de rotas removidas e adiciona /logs/integracao"
```

---

### Task 13: `routes.spec.ts` — confirma materialização final das 2 páginas novas

**Files:**
- Modify: `tests/routes.spec.ts`

> Nota: as linhas de `tests/routes.spec.ts` para `configuracoes/integracoes.vue` e `logs/integracao.vue` já foram adicionadas na Task 11 (Step 6), no mesmo lugar de onde as 4 linhas antigas de SLA/Processo/Externos foram removidas — isso evita deixar a suíte vermelha entre tasks. Esta task só adiciona uma segunda linha de cobertura para cada página nova (token diferente), para alinhar com o padrão de 2 tokens por página nova visto em outras entradas da tabela (ex.: `dashboard-reversa.vue` aparece 3x com tokens diferentes).

- [ ] **Step 1: Escrever o teste que falha**

Editar a tabela `routes` em `tests/routes.spec.ts`, trocando:

```ts
  ['app/pages/configuracoes/integracoes.vue', 'MetricsStrip'],
  ['app/pages/logs/integracao.vue', 'MetricsStrip'],
```

Por:

```ts
  ['app/pages/configuracoes/integracoes.vue', 'MetricsStrip'],
  ['app/pages/configuracoes/integracoes.vue', 'AppModal'],
  ['app/pages/logs/integracao.vue', 'MetricsStrip'],
  ['app/pages/logs/integracao.vue', 'integrationOrderStatusMeta'],
```

- [ ] **Step 2: Rodar o teste e confirmar falha (se houver)**

Run: `npm run test:run -- tests/routes.spec.ts`
Expected: já deve PASSAR de imediato, pois ambos os arquivos já contêm `AppModal` (Task 7) e `integrationOrderStatusMeta` (Task 9). Se falhar, é sinal de que uma das tasks anteriores não foi aplicada — pare e revise as Tasks 7/9 antes de prosseguir.

- [ ] **Step 3: Confirmar o teste de nomenclatura completa (`não usa PA`)**

Run: `npm run test:run -- tests/routes.spec.ts`
Expected: PASS também no `it('mantém a nomenclatura completa nas páginas', ...)` — nenhum dos 2 arquivos novos usa a abreviação `PA` (usam "ponto de apoio"/"pontos de apoio" por extenso quando necessário, e nenhuma delas menciona PA).

- [ ] **Step 4: Commit**

```bash
git add tests/routes.spec.ts
git commit -m "test: reforça materialização das páginas Integrações e Logs · Integração"
```

---

### Task 14: Verificação final

**Files:** nenhum (checklist apenas)

- [ ] **Step 1: Suíte completa de testes**

Run: `npm run test:run`
Expected: PASS. Exceções conhecidas e aceitas (ver Contexto): `tests/p3-screens.spec.ts` (`configuracoesNavigation.map`, `secondaryNavigation.map`), `tests/p4-screens.spec.ts` (`secondaryNavigation.map`, `cadastroNavItems.every(ready)`) e `tests/data-table.spec.ts` (`cadastrosNavigation.map(label)` com "Ocorrências Externas") só ficam 100% corretas depois que o plano irmão de navegação também estiver integrado — se falharem **exatamente** nessas asserções (e em nenhuma outra), documente e prossiga; qualquer outra falha deve ser investigada e corrigida antes de continuar.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS sem exceções (typecheck não depende do conteúdo de `navigation.ts`, só da forma/tipos — deve estar 100% verde independente do plano irmão).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: PASS sem exceções.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: PASS sem exceções.

- [ ] **Step 5: Verificação de fundação**

Run: `node scripts/verify-foundation.mjs`
Expected: PASS sem exceções.

- [ ] **Step 6: Revisão visual manual**

Abrir `/configuracoes/integracoes` e `/logs/integracao` em 1600×1000 e 1366×768 (`npm run dev`, navegar manualmente) e confirmar:
- `Configurações → Integrações`: `MetricsStrip` sem gráfico, tabela com switch Ativo, modal de criar/editar, modal "Configurar" listando contas vinculadas com credencial mascarada.
- `Logs → Integração`: somente leitura (nenhum botão de ação além dos filtros), badge de status sempre com ícone + texto, nunca só cor.
- `Cadastros → Operações` (`/cadastros/operacoes`): lista os 7 tipos de operação do legado.
- `Cadastros → Contas`: coluna "Tipo" visível; confirmar que ela **não aparece** em outros kinds (ex.: `/cadastros/empresas`).
- `Cadastros → Usuários`: toggle "É transportador" no modal de criar/editar.

- [ ] **Step 7: Commit final (se houver ajustes da revisão visual)**

```bash
git add -A
git commit -m "chore: ajustes finais de revisão visual (Integrações, Logs, Operações, Contas, Usuários)"
```

Se não houver ajustes, nenhum commit é necessário neste passo.

---

## Self-Review

**1. Cobertura do spec:**
- Tipos e fixtures (`Integration`/`IntegrationOperator`/`IntegrationOrder`) → Task 1.
- `Configurações → Integrações` CRUD completo + modal Configurar → Tasks 6-7.
- `Gestão → Logs → Integração` somente leitura → Task 9.
- `Cadastros → Operações` novo kind → Task 3.
- `Cadastros → Contas` campo Tipo → Task 4.
- `Cadastros → Usuários` toggle É transportador → Task 5.
- Remoções (pontos-de-apoio, transportadores, sla, processo, externos, ocorrencias-externas) → Tasks 3, 8, 10, 11.
- `breadcrumbs.ts` limpeza + `/logs/integracao` → Task 12.
- Decisão sobre `gestao-rede.ts` → Task 10 (deletado, com grep documentado no Contexto).
- Grep de testes cobrindo as rotas deletadas e plano de deletar/reescrever cada um → Tasks 8, 10, 11, 13 (cobrem `p3-screens.spec.ts`, `p4-screens.spec.ts`, `routes.spec.ts`; `auth-resumos.spec.ts` foi verificado e **não** precisa de mudança, pois sua única ocorrência de "pontos-de-apoio" é a rota `/resumos/pontos-de-apoio`, de uma fixture e página diferentes, não tocadas por este plano).
- Checklist final do `CLAUDE.md` → Task 14.

**2. Placeholder scan:** nenhum "TBD"/"implementar depois"/"adicionar validação apropriada" — todos os steps têm código completo, incluindo os de teste. As únicas menções a "decisão" (gestao-rede.ts, configuracoes.ts, redirect de configuracoes/index.vue) vêm acompanhadas do grep que a fundamenta e da ação concreta tomada.

**3. Consistência de tipos:** `Integration`/`IntegrationOperator`/`IntegrationOrder` usam os mesmos nomes de campo em `integrations.ts` (Task 1), `integracoes.vue` (Tasks 6-7) e `logs/integracao.vue` (Task 9) — `provider`, `kind`, `label`, `active`, `createdAt` / `integrationId`, `accountId`, `apiKeyMasked`, `config`, `lastSyncLabel` / `orderId`, `status`, `errorMessage`, `requestedAt`, `respondedAt`. `CadastroOnda3Row.tipo`/`isTransporter` são consistentes entre `cadastros-onda3.ts` (Tasks 3-5) e `CadastroOnda3Page.vue` (Task 4). Funções `getIntegrations`/`setIntegrations`/`getIntegrationOperators`/`setIntegrationOperators`/`getIntegrationOrders` têm a mesma assinatura em todos os arquivos que as consomem.
