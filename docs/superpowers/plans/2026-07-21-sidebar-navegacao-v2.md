# Sidebar & Navegação V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestruturar `app/components/app/navigation.ts` para a nova hierarquia definitiva da V2 (dissolve os grupos Operação/Configurações, cria Rotas & Rastreio/Logs, renomeia Devoluções→Remessas e vários itens), extrair um componente `NavGroup.vue` reutilizável para substituir os 8 blocos de accordion copiados manualmente em `AppSidebar.vue`, e ajustar `app/utils/breadcrumbs.ts` + todos os testes que dependem da forma antiga dos exports de navegação.

**Architecture:** `navigation.ts` continua sendo a única fonte de verdade (arrays `NavigationItem[]`/`NavigationGroup`); `AppSidebar.vue` passa a apenas orquestrar imports + renderizar `<NavGroup>` uma vez por grupo (em vez de 8 blocos `<button>`/`<div v-if>` copiados). `NavGroup.vue` é um componente novo, autocontido (lê a própria rota via `useRoute()`, controla seu próprio `open` state, expõe os mesmos `data-testid`/`aria-*` de hoje) para não quebrar os testes de accordion existentes. `breadcrumbs.ts` para de importar os grupos que deixam de existir (Faturas/Resumos/SLA analytics/Configurações) e passa a usar mapas de label locais fixos para essas rotas órfãs (a página continua existindo, só sai do menu); os grupos que sobrevivem (Dashboards/Devoluções/Cadastros) continuam lendo label/rota dinamicamente de `navigation.ts`, então renomear ali já reflete no breadcrumb sem código extra.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>` + TypeScript, Nuxt UI 4 (`UIcon`), Tailwind CSS 4 (utilitários inline, sem CSS novo), Vitest + `@nuxt/test-utils/runtime` (`mountSuspended`), ESLint, `nuxt typecheck`.

**Projeto:** `D:/DEVJUANMARCOS/PROJETOS/KEENER/VIA REVERSA/V2/ViaReversaV2_Front` (não tocar na cópia de deploy `.../via-teste` — replicada manualmente depois).

---

## Contexto e decisões de design

Este é 1 de 6 planos paralelos da reestruturação V2. Este plano é a **base**: define a estrutura de navegação que os outros 5 dependem. Arquivos de propriedade exclusiva deste plano: `app/components/app/navigation.ts`, `app/components/app/AppSidebar.vue` (novo `app/components/app/NavGroup.vue`), e as partes de `app/utils/breadcrumbs.ts` que dependem da forma dos exports de `navigation.ts`.

### Decisão registrada (ambiguidade da spec original)

A spec entregue diz duas coisas sobre "Pedidos": (1) na justificativa de por que o grupo Operação sobra só com 2 filhos, diz explicitamente **"Pedidos vai pra Cadastros"**; (2) na enumeração final e exaustiva do grupo Cadastros ("filhos finais... Mantenha os demais como estão: SLA, Fretes, Empresas, Usuários, Aprovações PA's, Ocorrências, Regiões, Feriados, Produtos, Templates Chatbot"), Pedidos não é citado. Resolvi essa ambiguidade tratando a frase "(1)" como a intenção real (é uma afirmação direta e não uma lista exaustiva) e a enumeração "(2)" como referente apenas aos 12 itens que já viviam em Cadastros antes desta mudança (por isso ela não repete um item que está migrando de outro grupo). **Decisão: `cadastrosNavigation` passa a ter 13 itens, com "Pedidos" (rota `/pedidos` inalterada) como primeiro item da lista.** Se essa leitura estiver errada, é a Task 2 que precisa ajustar (mover/remover "Pedidos" de `cadastrosNavigation`) — o resto do plano não depende de onde exatamente Pedidos fica dentro do grupo.

### Risco de execução paralela — arquivos compartilhados com planos irmãos

Os planos `2026-07-21-pedidos-listagem-bulk-expedicao-chatbot.md` e `2026-07-21-dashboards-consolidacao-telas.md` (já escritos, no mesmo diretório) também tocam nestes arquivos:

- `app/utils/breadcrumbs.ts` — o plano `pedidos-listagem-bulk-expedicao-chatbot` já corrige o bloco de `/operacao/chatbot-monitor` (removendo o pai morto "Disparo Chatbot") e remove os blocos de `/operacao/expedicao`, `/operacao/disparo-chatbot`, `/loja/check-in`. **Este plano NÃO duplica a correção do bloco `chatbot-monitor`** (ver Task 3) para não colidir linha-a-linha com esse outro plano — só renomeia os 3 labels literais que nenhum outro plano toca (Dashboard Reversa, Tratativas, Auditoria geográfica) e desacopla os imports dos grupos dissolvidos.
- `tests/p2-screens.spec.ts`, `tests/p3-screens.spec.ts` — ambos os planos irmãos mexem nesses arquivos (imports/testes de Expedição, Disparo Chatbot, Check In). O plano `pedidos-listagem-bulk-expedicao-chatbot` já declara explicitamente que não toca nos testes que comparam a lista completa de `navigationItems` nesses 2 arquivos — esse pedaço é responsabilidade deste plano (Tasks 9 e 10).
- `tests/dashboard-reversa.spec.ts`, `tests/lotes-faturas.spec.ts` — o plano `dashboards-consolidacao-telas` também edita esses arquivos (remoção de seções de gráfico), em blocos/describes diferentes dos que este plano toca (navegação/breadcrumb).
- **Recomendação:** aplicar este plano (base) antes dos outros 5, ou reconciliar manualmente os diffs desses 4 arquivos de teste ao mesclar. Nenhuma task abaixo tenta resolver o conflito — apenas evita piorá-lo tocando só nas linhas que são inequivocamente deste plano.

### Achados de acoplamento (não corrigidos aqui — fora do escopo de arquivos deste plano)

- `app/data/demo/cadastros.ts` deriva `cadastroNavItems` (e `readyKinds`/`descriptions`) a partir de `cadastrosNavigation`, e `app/utils/cadastros.ts` deriva o conjunto válido de `CadastroKind` (`isCadastroKind`) a partir de `cadastroNavItems`. Isso significa que, ao remover "Ocorrências Externas" do menu, `isCadastroKind('ocorrencias-externas')` passa a retornar `false` — a página `app/pages/cadastros/[kind]/index.vue` (rota dinâmica) vai tratar `/cadastros/ocorrencias-externas` como kind inválido, mesmo a página continuando "existindo no código". Da mesma forma, o novo item "Operações" (`/cadastros/operacoes`) e "Pedidos" (`/pedidos`, que não segue o padrão `/cadastros/:kind`) entram em `cadastroNavItems` com `description: undefined` e `ready: false` (não estão nos mapas de `cadastros.ts`). Nenhum desses efeitos quebra build/typecheck (é tudo indexação em `Record` que aceita `undefined` em runtime), mas é um efeito colateral real de dados fora dos arquivos que este plano tem permissão de tocar (`navigation.ts`/`AppSidebar.vue`/`breadcrumbs.ts`). Reportar para o plano que mexe em `cadastros.ts`/páginas de Cadastros, se houver um.

---

## File Structure

- **Modify:** `app/components/app/navigation.ts` — reescreve todos os exports para a estrutura final (grupos Dashboards/Rotas & Rastreio/Logs/Remessas/Cadastros, itens soltos, `secondaryNavigation` só com Integrações).
- **Create:** `app/components/app/NavGroup.vue` — componente de accordion reutilizável (label/icon/children + `testId`), substitui os 8 blocos copiados.
- **Modify:** `app/components/app/AppSidebar.vue` — usa `NavGroup` 5x, move o badge numérico "146" para o loop de `navigationItems`, remove os 8 `ref`/`computed`/`watch`/`toggle*` que a extração torna redundantes.
- **Modify:** `app/utils/breadcrumbs.ts` — remove imports de `configuracoesNavigation`/`configuracoesNavGroup`/`faturasNavigation`/`faturasNavGroup`/`resumosNavigation`/`resumosNavGroup`/`slaAnalyticsNavigation`/`slaAnalyticsNavGroup` (não existem mais); adiciona mapas de label locais fixos para essas 4 rotas órfãs; renomeia 3 labels literais (Dashboard Reversa→Operações, Tratativas→Ocorrências, Auditoria geográfica→Rastreio).
- **Create:** `tests/nav-group.spec.ts` — teste unitário isolado do novo componente `NavGroup.vue`.
- **Modify:** `tests/navigation.spec.ts` — reescrita completa (estrutura de navegação + breadcrumbs afetados).
- **Modify:** `tests/components.spec.ts` — conserta a rota de montagem do teste de accordion do Cadastros (Pedidos agora ativa o grupo Cadastros).
- **Modify:** `tests/data-table.spec.ts` — novo array esperado de `cadastrosNavigation` (13 itens).
- **Modify:** `tests/auth-resumos.spec.ts` — remove uso de `resumosNavigation` (export removido).
- **Modify:** `tests/dashboard-reversa.spec.ts` — `/operacao/dashboard-reversa` agora é encontrado em `dashboardsNavigation`, não em `navigationItems`.
- **Modify:** `tests/loja-tv-layout.spec.ts` — "Loja (TV)" saiu do menu; teste passa a afirmar ausência.
- **Modify:** `tests/lotes-faturas.spec.ts` — remove uso de `faturasNavigation` (export removido).
- **Modify:** `tests/p2-screens.spec.ts` — novo array de `navigationItems`, novo `dashboardsNavigation`, remove `slaAnalyticsNavigation`.
- **Modify:** `tests/p3-screens.spec.ts` — novo array de `navigationItems`, remove `configuracoesNavigation`, novo `secondaryNavigation`.
- **Modify:** `tests/p4-screens.spec.ts` — "Rastreio" agora vem de `rotasRastreioNavigation`, novo `secondaryNavigation`, ajuste do teste de `ready` em `cadastroNavItems`.
- **No changes needed:** `tests/sidebar-orders.spec.ts` — os 3 exports que importa (`assertNavigationIntegrity`, `navigationGroups`, `navigationItems`, `secondaryNavigation`) continuam existindo e as asserções são genéricas (iteram o array, não hardcodeiam conteúdo) — só precisa ser re-executado para confirmar que segue verde.

---

### Task 1: Reescrever `tests/navigation.spec.ts` para a estrutura final (RED)

**Files:**
- Modify: `tests/navigation.spec.ts`

- [ ] **Step 1: Substituir o arquivo inteiro**

Leia o arquivo atual (`tests/navigation.spec.ts`) e substitua-o integralmente por:

```ts
import { describe, expect, it } from 'vitest'
import {
  cadastrosNavigation,
  dashboardsNavigation,
  devolucoesNavGroup,
  devolucoesNavigation,
  logsNavigation,
  navigationGroups,
  navigationItems,
  rotasRastreioNavigation,
  secondaryNavigation
} from '../app/components/app/navigation'
import { getOrderDetailBundle } from '../app/data/demo/order-detail'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

describe('navegação oficial', () => {
  it('expõe Home, Calendário, Operação ao vivo e Lotes soltos no topo (seção Operação)', () => {
    expect(navigationItems.map((item) => item.to)).toEqual([
      '/',
      '/calendario',
      '/operacao/ao-vivo',
      '/operacao/lotes'
    ])
    expect(navigationItems.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
  })

  it('grupo Dashboards: Ponto de apoios, Operações, Ocorrências, SLA, Monitor do chatbot', () => {
    expect(dashboardsNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Ponto de apoios', to: '/dashboards/indicadores' },
      { label: 'Operações', to: '/operacao/dashboard-reversa' },
      { label: 'Ocorrências', to: '/operacao/tratativas' },
      { label: 'SLA', to: '/dashboards/sla' },
      { label: 'Monitor do chatbot', to: '/operacao/chatbot-monitor' }
    ])
    expect(dashboardsNavigation.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
  })

  it('grupo novo Rotas & Rastreio: Rotas, Roteirização, Rastreio', () => {
    expect(rotasRastreioNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Rotas', to: '/operacao/rotas' },
      { label: 'Roteirização', to: '/operacao/roteirizacao' },
      { label: 'Rastreio', to: '/operacao/geo-audit' }
    ])
  })

  it('grupo novo Logs: Ocorrências NG, Integração', () => {
    expect(logsNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Ocorrências NG', to: '/operacao/ocorrencias-ng' },
      { label: 'Integração', to: '/logs/integracao' }
    ])
  })

  it('grupo Devoluções renomeado Remessas: Caixas e Despachos', () => {
    expect(devolucoesNavGroup.label).toBe('Remessas')
    expect(devolucoesNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Caixas', to: '/devolucoes/dev-in' },
      { label: 'Despachos', to: '/devolucoes/dev-out' }
    ])
  })

  it('grupo Cadastros com 13 itens (Pedidos + 12 cadastros, Operadores renomeado, Operações novo)', () => {
    expect(cadastrosNavigation.map((item) => item.label)).toEqual([
      'Pedidos',
      'SLA',
      'Fretes',
      'Empresas',
      'Operadores',
      'Usuários',
      "Aprovações PA's",
      'Ocorrências',
      'Regiões',
      'Feriados',
      'Produtos',
      'Templates Chatbot',
      'Operações'
    ])
    expect(cadastrosNavigation.find((item) => item.label === 'Operadores')?.to).toBe('/cadastros/contas')
    expect(cadastrosNavigation.find((item) => item.label === 'Operações')?.to).toBe('/cadastros/operacoes')
    expect(cadastrosNavigation.some((item) => item.label === 'Ocorrências Externas')).toBe(false)
  })

  it('secondaryNavigation só tem Integrações', () => {
    expect(secondaryNavigation).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' }
    ])
  })

  it('navigationGroups segue a ordem final da seção Gestão', () => {
    expect(navigationGroups.map((group) => group.label)).toEqual([
      'Dashboards',
      'Rotas & Rastreio',
      'Logs',
      'Remessas',
      'Cadastros'
    ])
    expect(navigationGroups.every((group) => group.children.length > 0)).toBe(true)
  })
})

describe('breadcrumbs do topbar', () => {
  it('resolve Cadastros → SLA sem duplicar Via Reversa', () => {
    expect(resolveBreadcrumbs('/cadastros/sla')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'SLA' }
    ])
  })

  it('resolve Cadastros → Fretes e stubs', () => {
    expect(resolveBreadcrumbs('/cadastros/fretes')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Fretes' }
    ])
    expect(resolveBreadcrumbs('/cadastros/empresas')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Empresas' }
    ])
  })

  it('resolve cadastro aninhado Novo/Editar com links intermediários (Contas renomeado Operadores)', () => {
    expect(resolveBreadcrumbs('/cadastros/empresas/novo')).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Empresas', to: '/cadastros/empresas' },
      { label: 'Novo' }
    ])
    expect(resolveBreadcrumbs('/cadastros/contas/42', { kind: 'contas', id: '42' })).toEqual([
      { label: 'Cadastros', to: '/cadastros' },
      { label: 'Operadores', to: '/cadastros/contas' },
      { label: 'Editar' }
    ])
  })

  it('resolve Remessas → Caixas / Despachos e detalhe', () => {
    expect(resolveBreadcrumbs('/devolucoes/dev-in')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Remessas', to: '/devolucoes' },
      { label: 'Caixas' }
    ])
    expect(resolveBreadcrumbs('/devolucoes/dev-out')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Remessas', to: '/devolucoes' },
      { label: 'Despachos' }
    ])
    expect(resolveBreadcrumbs('/devolucoes/dev-in/1042', { id: '1042' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Remessas', to: '/devolucoes' },
      { label: 'Caixas', to: '/devolucoes/dev-in' },
      { label: '#1042' }
    ])
  })

  it('resolve Home, operação ao vivo, dashboard de operações, lotes e detalhe', () => {
    expect(resolveBreadcrumbs('/')).toEqual([{ label: 'Home' }])
    expect(resolveBreadcrumbs('/operacao/ao-vivo')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Operação ao vivo' }
    ])
    expect(resolveBreadcrumbs('/operacao/dashboard-reversa')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Operações' }
    ])
    expect(resolveBreadcrumbs('/operacao/lotes')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Lotes' }
    ])
    expect(resolveBreadcrumbs('/pedidos')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos' }
    ])
    expect(resolveBreadcrumbs('/pedidos/novo')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: 'Novo pedido' }
    ])
    expect(resolveBreadcrumbs('/pedidos/48224', { id: '48224' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Pedidos', to: '/pedidos' },
      { label: '#48224' }
    ])
  })

  it('resolve Rastreio (ex-Auditoria geográfica) e Ocorrências (ex-Tratativas)', () => {
    expect(resolveBreadcrumbs('/operacao/geo-audit')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Rastreio' }
    ])
    expect(resolveBreadcrumbs('/operacao/tratativas')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Ocorrências' }
    ])
  })

  it('resolve operação a partir do slug', () => {
    expect(resolveBreadcrumbs('/operacoes/logistica-reversa', { slug: 'logistica-reversa' })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Logística Reversa' }
    ])
  })

  it('marca só o último item como página atual (sem to)', () => {
    const crumbs = resolveBreadcrumbs('/cadastros/sla')
    expect(crumbs.at(-1)?.to).toBeUndefined()
    expect(crumbs.slice(0, -1).every((item) => Boolean(item.to))).toBe(true)
  })
})

describe('detalhe do pedido', () => {
  it('expõe bundle completo do pedido em destaque', () => {
    const detail = getOrderDetailBundle('48224')
    expect(detail.items).toHaveLength(1)
    expect(detail.occurrences).toHaveLength(3)
    expect(detail.evidences).toHaveLength(3)
    expect(detail.materials.length).toBeGreaterThan(0)
    expect(detail.barcodes.length).toBeGreaterThan(0)
    expect(detail.locker).not.toBeNull()
    expect(detail.fiscal).not.toBeNull()
    expect(detail.scheduling).toHaveLength(1)
    expect(detail.history.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test:run -- tests/navigation.spec.ts`
Expected: FAIL — `navigation.ts` ainda não exporta `dashboardsNavigation`/`rotasRastreioNavigation`/`logsNavigation` na nova forma, e `breadcrumbs.ts` ainda importa exports que este arquivo não espera mais quebrar (o arquivo todo pode falhar já na etapa de import/coleta, não só nas asserções — isso é esperado neste ponto).

---

### Task 2: Reescrever `app/components/app/navigation.ts` (GREEN para a estrutura de navegação)

**Files:**
- Modify: `app/components/app/navigation.ts`

- [ ] **Step 1: Substituir o arquivo inteiro**

```ts
export interface NavigationItem {
  label: string
  to: string
  icon: string
}

export interface NavigationGroup {
  label: string
  icon: string
  children: NavigationItem[]
}

/**
 * Itens soltos no topo, seção "Operação": Home, Calendário e os 2 sobreviventes
 * do extinto grupo Operação (Operação ao vivo, Lotes) — só 2 filhos não justificam
 * accordion, por isso viraram itens soltos junto com Home/Calendário.
 */
export const navigationItems: NavigationItem[] = [
  { label: 'Home', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Calendário', to: '/calendario', icon: 'i-lucide-calendar' },
  { label: 'Operação ao vivo', to: '/operacao/ao-vivo', icon: 'i-lucide-radio-tower' },
  { label: 'Lotes', to: '/operacao/lotes', icon: 'i-lucide-layers' }
]

/**
 * Grupo Dashboards — Ponto de apoios (ex-Indicadores), Operações (ex-Dashboard Reversa),
 * Ocorrências (ex-Tratativas), SLA (rota nova, substitui os 8 relatórios antigos de /sla/*)
 * e Monitor do chatbot (rota já existia como deep-link sem entrada de menu).
 * Loja / Loja (TV) saem do menu (páginas continuam existindo no código).
 */
export const dashboardsNavigation: NavigationItem[] = [
  { label: 'Ponto de apoios', to: '/dashboards/indicadores', icon: 'i-lucide-gauge' },
  { label: 'Operações', to: '/operacao/dashboard-reversa', icon: 'i-lucide-chart-column-increasing' },
  { label: 'Ocorrências', to: '/operacao/tratativas', icon: 'i-lucide-messages-square' },
  { label: 'SLA', to: '/dashboards/sla', icon: 'i-lucide-timer' },
  { label: 'Monitor do chatbot', to: '/operacao/chatbot-monitor', icon: 'i-lucide-bot' }
]

export const dashboardsNavGroup: NavigationGroup = {
  label: 'Dashboards',
  icon: 'i-lucide-layout-dashboard',
  children: dashboardsNavigation
}

/**
 * Grupo novo Rotas & Rastreio — Rotas e Roteirização (vieram do extinto grupo Operação)
 * e Rastreio (ex-Auditoria geográfica, mesma rota /operacao/geo-audit).
 */
export const rotasRastreioNavigation: NavigationItem[] = [
  { label: 'Rotas', to: '/operacao/rotas', icon: 'i-lucide-map-pinned' },
  { label: 'Roteirização', to: '/operacao/roteirizacao', icon: 'i-lucide-route' },
  { label: 'Rastreio', to: '/operacao/geo-audit', icon: 'i-lucide-map-pin-off' }
]

export const rotasRastreioNavGroup: NavigationGroup = {
  label: 'Rotas & Rastreio',
  icon: 'i-lucide-route',
  children: rotasRastreioNavigation
}

/**
 * Grupo novo Logs — Ocorrências NG (veio do extinto grupo Operação) e Integração
 * (rota nova, página ainda não existe — criada por outro plano).
 */
export const logsNavigation: NavigationItem[] = [
  { label: 'Ocorrências NG', to: '/operacao/ocorrencias-ng', icon: 'i-lucide-radar' },
  { label: 'Integração', to: '/logs/integracao', icon: 'i-lucide-scroll-text' }
]

export const logsNavGroup: NavigationGroup = {
  label: 'Logs',
  icon: 'i-lucide-scroll-text',
  children: logsNavigation
}

/**
 * Grupo Devoluções renomeado Remessas — Caixas (ex-DEV IN) e Despachos (ex-DEV OUT).
 * "Acompanhamento" sai do menu (página continua existindo no código).
 */
export const devolucoesNavigation: NavigationItem[] = [
  { label: 'Caixas', to: '/devolucoes/dev-in', icon: 'i-lucide-package-plus' },
  { label: 'Despachos', to: '/devolucoes/dev-out', icon: 'i-lucide-truck' }
]

export const devolucoesNavGroup: NavigationGroup = {
  label: 'Remessas',
  icon: 'i-lucide-undo-2',
  children: devolucoesNavigation
}

/**
 * Grupo Cadastros — Pedidos migrou do extinto grupo Operação (rota /pedidos inalterada,
 * ver "Decisão registrada" no plano); Contas renomeada Operadores; Ocorrências Externas
 * saiu do menu; Operações é rota nova (página ainda não existe).
 */
export const cadastrosNavigation: NavigationItem[] = [
  { label: 'Pedidos', to: '/pedidos', icon: 'i-lucide-package-search' },
  { label: 'SLA', to: '/cadastros/sla', icon: 'i-lucide-timer' },
  { label: 'Fretes', to: '/cadastros/fretes', icon: 'i-lucide-banknote' },
  { label: 'Empresas', to: '/cadastros/empresas', icon: 'i-lucide-building-2' },
  { label: 'Operadores', to: '/cadastros/contas', icon: 'i-lucide-wallet-cards' },
  { label: 'Usuários', to: '/cadastros/usuarios', icon: 'i-lucide-users' },
  { label: "Aprovações PA's", to: '/cadastros/aprovacoes-pas', icon: 'i-lucide-user-check' },
  { label: 'Ocorrências', to: '/cadastros/ocorrencias', icon: 'i-lucide-triangle-alert' },
  { label: 'Regiões', to: '/cadastros/regioes', icon: 'i-lucide-map' },
  { label: 'Feriados', to: '/cadastros/feriados', icon: 'i-lucide-calendar-off' },
  { label: 'Produtos', to: '/cadastros/produtos', icon: 'i-lucide-package' },
  { label: 'Templates Chatbot', to: '/cadastros/templates-chatbot', icon: 'i-lucide-bot' },
  { label: 'Operações', to: '/cadastros/operacoes', icon: 'i-lucide-shuffle' }
]

export const cadastrosNavGroup: NavigationGroup = {
  label: 'Cadastros',
  icon: 'i-lucide-folder-cog',
  children: cadastrosNavigation
}

/**
 * Item solto final — Integrações substitui o extinto grupo Configurações (só sobrou
 * 1 filho depois de remover SLA/Processamento) e o antigo secondaryNavigation
 * (Pontos de apoio/Transportadores saíram do menu — páginas deletadas por outro plano).
 */
export const secondaryNavigation: NavigationItem[] = [
  { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' }
]

/** Todos os grupos com submenu na sidebar, na ordem final da seção "Gestão". */
export const navigationGroups: NavigationGroup[] = [
  dashboardsNavGroup,
  rotasRastreioNavGroup,
  logsNavGroup,
  devolucoesNavGroup,
  cadastrosNavGroup
]

/** Garante contrato mínimo dos itens (to/label/icon) para o render da sidebar. */
export function assertNavigationIntegrity(items: NavigationItem[] = [
  ...navigationItems,
  ...secondaryNavigation,
  ...navigationGroups.flatMap((group) => group.children)
]) {
  for (const item of items) {
    if (!item.label?.trim()) throw new Error('NavigationItem sem label')
    if (!item.to?.startsWith('/')) throw new Error(`NavigationItem sem to válido: ${item.label}`)
    if (!item.icon?.startsWith('i-lucide-')) throw new Error(`NavigationItem sem ícone Lucide: ${item.label}`)
  }
  return true
}
```

- [ ] **Step 2: Rodar e confirmar que a parte de estrutura passa (breadcrumbs ainda vai falhar)**

Run: `npm run test:run -- tests/navigation.spec.ts`
Expected: o describe `navegação oficial` passa; o describe `breadcrumbs do topbar` ainda falha, porque `app/utils/breadcrumbs.ts` continua importando `configuracoesNavigation`/`configuracoesNavGroup`/`faturasNavigation`/`faturasNavGroup`/`resumosNavigation`/`resumosNavGroup`/`slaAnalyticsNavigation`/`slaAnalyticsNavGroup`, que não existem mais em `navigation.ts` — o módulo falha ao importar.

- [ ] **Step 3: Corrigir `app/utils/breadcrumbs.ts` (imports + labels locais + 3 renomeações literais)**

No topo do arquivo, substitua:

```ts
import {
  cadastrosNavigation,
  cadastrosNavGroup,
  configuracoesNavigation,
  configuracoesNavGroup,
  dashboardsNavigation,
  dashboardsNavGroup,
  devolucoesNavigation,
  devolucoesNavGroup,
  faturasNavigation,
  faturasNavGroup,
  resumosNavigation,
  resumosNavGroup,
  slaAnalyticsNavigation,
  slaAnalyticsNavGroup
} from '../components/app/navigation'
import { operations } from '../data/demo/operations'
import { isCadastroKind } from './cadastros'
import { isFaturaKind, faturaKindLabel } from '../data/demo/faturas'
```

por:

```ts
import {
  cadastrosNavigation,
  cadastrosNavGroup,
  dashboardsNavigation,
  dashboardsNavGroup,
  devolucoesNavigation,
  devolucoesNavGroup
} from '../components/app/navigation'
import { operations } from '../data/demo/operations'
import { isCadastroKind } from './cadastros'
import { isFaturaKind, faturaKindLabel } from '../data/demo/faturas'

/**
 * Faturas, Resumos, SLA analytics e Configurações saíram da sidebar (grupos dissolvidos
 * em navigation.ts), mas as páginas continuam existindo no código — o breadcrumb dessas
 * rotas usa labels locais fixos em vez de ler de grupos que não existem mais.
 */
const FATURAS_GROUP_LABEL = 'Faturas'
const FATURAS_LABELS: Record<string, string> = {
  'a-receber': 'A receber',
  'a-pagar': 'A pagar'
}

const RESUMOS_GROUP_LABEL = 'Resumos'
const RESUMOS_LABELS: Record<string, string> = {
  'totais-por-operacao': 'Totais por Operação',
  'pedidos-por-cliente': 'Pedidos por Cliente',
  'pedidos-por-estado': 'Pedidos por Estado',
  'pontos-de-apoio': 'Pontos de apoio',
  transportadores: 'Transportadores',
  mapa: 'Mapa'
}

const SLA_GROUP_LABEL = 'SLA'
const SLA_LABELS: Record<string, string> = {
  'cliente-por-data': 'SLA por Cliente (Data)',
  'estado-por-data': 'SLA por Estado (Data)',
  'pa-por-data': 'SLA por PA (Data)',
  'transportador-por-data': 'SLA por Transportador (Data)',
  'por-cliente': 'SLA por Cliente',
  'por-estado': 'SLA por Estado',
  'por-pa': 'SLA por PA',
  'por-transportador': 'SLA por Transportador'
}

const CONFIGURACOES_GROUP_LABEL = 'Configurações'
const CONFIGURACOES_LABELS: Record<string, string> = {
  sla: 'SLA',
  processo: 'Processamento',
  integracoes: 'Integrações'
}
```

Substitua as 4 funções de label que dependiam dos grupos removidos:

```ts
function faturaNavLabel(segment: string): string {
  return (
    faturasNavigation.find((item) => item.to === `/faturas/${segment}`)?.label
    ?? segment
  )
}

function resumoNavLabel(segment: string): string {
  const drillLabels: Record<string, string> = {
    'pontos-de-apoio': 'Pontos de apoio',
    transportadores: 'Transportadores',
    mapa: 'Mapa'
  }
  return (
    resumosNavigation.find((item) => item.to === `/resumos/${segment}`)?.label
    ?? drillLabels[segment]
    ?? segment
  )
}

function slaNavLabel(segment: string): string {
  return (
    slaAnalyticsNavigation.find((item) => item.to === `/sla/${segment}`)?.label
    ?? segment
  )
}
```

por:

```ts
function faturaNavLabel(segment: string): string {
  return FATURAS_LABELS[segment] ?? segment
}

function resumoNavLabel(segment: string): string {
  return RESUMOS_LABELS[segment] ?? segment
}

function slaNavLabel(segment: string): string {
  return SLA_LABELS[segment] ?? segment
}
```

E substitua:

```ts
function configuracaoNavLabel(segment: string): string {
  return (
    configuracoesNavigation.find((item) => item.to === `/configuracoes/${segment}`)?.label
    ?? segment
  )
}
```

por:

```ts
function configuracaoNavLabel(segment: string): string {
  return CONFIGURACOES_LABELS[segment] ?? segment
}
```

`dashboardNavLabel` **não muda** (continua lendo de `dashboardsNavigation` dinamicamente — é assim que "Ponto de apoios"/"Operações"/etc. chegam automaticamente no breadcrumb de `/dashboards/indicadores` etc. sem código extra).

Agora troque os 3 labels literais renomeados. Substitua:

```ts
  if (normalized === '/operacao/dashboard-reversa') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Dashboard Reversa' }
    ]
  }
```

por:

```ts
  if (normalized === '/operacao/dashboard-reversa') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Operações' }
    ]
  }
```

Substitua:

```ts
  if (normalized === '/operacao/tratativas') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Tratativas' }
    ]
  }
```

por:

```ts
  if (normalized === '/operacao/tratativas') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Ocorrências' }
    ]
  }
```

Substitua:

```ts
  if (normalized === '/operacao/geo-audit') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Auditoria geográfica' }
    ]
  }
```

por:

```ts
  if (normalized === '/operacao/geo-audit') {
    return [
      { label: 'Home', to: '/' },
      { label: 'Rastreio' }
    ]
  }
```

**Não mexa** no bloco de `/operacao/chatbot-monitor` (fica com o pai "Disparo Chatbot", que ainda existe até o plano irmão remover a página) e **não mexa** nos blocos de `/operacao/expedicao`, `/loja/check-in`, `/operacao/disparo-chatbot`, `/operacao/mileto-backfill` — são donos de outro plano (ver seção "Risco de execução paralela" acima).

Por fim, troque as 4 ocorrências de `.label` do grupo nos blocos `/faturas`, `/resumos`, `/sla`, `/configuracoes` (cada bloco tem 2 ocorrências — uma no array inicial de `crumbs`, outra no `if (!section)`):

- `faturasNavGroup.label` → `FATURAS_GROUP_LABEL` (2 ocorrências, dentro do bloco `if (normalized === '/faturas' || ...)`)
- `resumosNavGroup.label` → `RESUMOS_GROUP_LABEL` (2 ocorrências, bloco `/resumos`)
- `slaAnalyticsNavGroup.label` → `SLA_GROUP_LABEL` (2 ocorrências, bloco `/sla`)
- `configuracoesNavGroup.label` → `CONFIGURACOES_GROUP_LABEL` (2 ocorrências, bloco `/configuracoes`)

`cadastrosNavGroup.label`, `devolucoesNavGroup.label` e `dashboardsNavGroup.label` **não mudam de código** — continuam sendo lidos dinamicamente (o valor de `devolucoesNavGroup.label` já é `'Remessas'` depois da Task 2, então o breadcrumb de `/devolucoes/*` reflete sozinho).

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/navigation.spec.ts`
Expected: PASS — os 2 describes (`navegação oficial` e `breadcrumbs do topbar`) e o describe `detalhe do pedido` (inalterado) passam.

- [ ] **Step 5: Commit**

```bash
git add app/components/app/navigation.ts app/utils/breadcrumbs.ts tests/navigation.spec.ts
git commit -m "refactor(nav): reestrutura navigation.ts e breadcrumbs.ts para a hierarquia V2"
```

---

### Task 3: Corrigir `tests/components.spec.ts` (Pedidos agora ativa o grupo Cadastros)

**Contexto:** o teste "abre e fecha Cadastros pelo rótulo do grupo" monta a sidebar na rota `/pedidos` esperando o grupo Cadastros **fechado** por padrão. Depois da Task 2, `/pedidos` é filho de `cadastrosNavGroup`, então o accordion abre automaticamente ao montar nessa rota — o teste precisa montar numa rota neutra (que não pertence a nenhum grupo) para continuar testando o estado "fechado por padrão".

**Files:**
- Modify: `tests/components.spec.ts:76-78`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/components.spec.ts`
Expected: FAIL no teste `abre e fecha Cadastros pelo rótulo do grupo` — `aria-expanded` já vem `'true'` na montagem (porque `/pedidos` agora é filho ativo de Cadastros), quebrando a asserção `expect(toggle.attributes('aria-expanded')).toBe('false')`.

- [ ] **Step 2: Trocar a rota de montagem**

Em `tests/components.spec.ts`, dentro de `it('abre e fecha Cadastros pelo rótulo do grupo', ...)`, substitua:

```ts
    const wrapper = await mountSuspended(AppSidebar, {
      route: '/pedidos'
    })
```

por:

```ts
    const wrapper = await mountSuspended(AppSidebar, {
      route: '/'
    })
```

- [ ] **Step 3: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/components.spec.ts`
Expected: PASS em todos os testes do describe `AppSidebar accordion` (o teste de auto-abertura em `/cadastros/sla` já usava uma rota de Cadastros e continua correto sem mudanças; o de Devoluções já monta em `/`, também sem mudanças).

- [ ] **Step 4: Commit**

```bash
git add tests/components.spec.ts
git commit -m "test(sidebar): usa rota neutra para testar accordion fechado por padrão"
```

---

### Task 4: Atualizar `tests/data-table.spec.ts` (novo `cadastrosNavigation`)

**Files:**
- Modify: `tests/data-table.spec.ts:32-53`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/data-table.spec.ts`
Expected: FAIL — `cadastrosNavigation` agora tem 13 itens (Pedidos + 12), na ordem definida na Task 2, e o item `to.startsWith('/cadastros/')` deixa de ser verdade para todos (Pedidos é `/pedidos`).

- [ ] **Step 2: Substituir o describe `menu Cadastros`**

Substitua:

```ts
describe('menu Cadastros', () => {
  it('expõe 12 itens na ordem e labels do legado', () => {
    expect(cadastrosNavigation.map((item) => item.label)).toEqual([
      'SLA',
      'Fretes',
      'Empresas',
      'Contas',
      'Usuários',
      "Aprovações PA's",
      'Ocorrências',
      'Ocorrências Externas',
      'Regiões',
      'Feriados',
      'Produtos',
      'Templates Chatbot'
    ])
  })

  it('usa rotas sob /cadastros/', () => {
    expect(cadastrosNavigation.every((item) => item.to.startsWith('/cadastros/'))).toBe(true)
  })
})
```

por:

```ts
describe('menu Cadastros', () => {
  it('expõe 13 itens na ordem final (Pedidos + 12 cadastros, Operadores renomeado, Operações novo)', () => {
    expect(cadastrosNavigation.map((item) => item.label)).toEqual([
      'Pedidos',
      'SLA',
      'Fretes',
      'Empresas',
      'Operadores',
      'Usuários',
      "Aprovações PA's",
      'Ocorrências',
      'Regiões',
      'Feriados',
      'Produtos',
      'Templates Chatbot',
      'Operações'
    ])
  })

  it('usa rotas sob /cadastros/, exceto Pedidos (que mantém /pedidos)', () => {
    const [pedidos, ...resto] = cadastrosNavigation
    expect(pedidos?.to).toBe('/pedidos')
    expect(resto.every((item) => item.to.startsWith('/cadastros/'))).toBe(true)
  })
})
```

- [ ] **Step 3: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/data-table.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tests/data-table.spec.ts
git commit -m "test(nav): atualiza asserção de cadastrosNavigation para 13 itens"
```

---

### Task 5: Atualizar `tests/auth-resumos.spec.ts` (remove `resumosNavigation`, export extinto)

**Files:**
- Modify: `tests/auth-resumos.spec.ts:37-40, 153-162`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/auth-resumos.spec.ts`
Expected: FAIL — o módulo falha ao importar `resumosNavigation`, que não existe mais em `navigation.ts`.

- [ ] **Step 2: Ajustar o import**

Substitua:

```ts
import {
  resumosNavigation,
  secondaryNavigation
} from '../app/components/app/navigation'
```

por:

```ts
import { secondaryNavigation } from '../app/components/app/navigation'
```

- [ ] **Step 3: Substituir o teste que usava `resumosNavigation`**

Substitua:

```ts
describe('navegação e breadcrumbs — auth e resumos', () => {
  it('expõe submenu Resumos e remove placeholder Análises', () => {
    expect(resumosNavigation.map((item) => item.to)).toEqual([
      '/resumos/totais-por-operacao',
      '/resumos/pedidos-por-cliente',
      '/resumos/pedidos-por-estado'
    ])
    expect(secondaryNavigation.map((item) => item.label)).not.toContain('Análises')
    expect(resumosNavigation.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
  })
```

por:

```ts
describe('navegação e breadcrumbs — auth e resumos', () => {
  it('expõe Integrações como único item solto (Resumos saiu do menu, mas a página segue existindo)', () => {
    expect(secondaryNavigation).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' }
    ])
  })
```

(o restante do describe — teste `resolve breadcrumbs de Resumos` e `resolve breadcrumbs de auth pública` — **não muda**, continua usando só `resolveBreadcrumbs`.)

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/auth-resumos.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/auth-resumos.spec.ts
git commit -m "test(nav): remove uso de resumosNavigation (export extinto)"
```

---

### Task 6: Atualizar `tests/dashboard-reversa.spec.ts` (rota agora vive em `dashboardsNavigation`)

**Files:**
- Modify: `tests/dashboard-reversa.spec.ts:22, 49-51`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/dashboard-reversa.spec.ts`
Expected: FAIL — `/operacao/dashboard-reversa` não está mais em `navigationItems` (moveu para `dashboardsNavigation`, com label "Operações").

- [ ] **Step 2: Trocar o import e o teste**

Substitua:

```ts
import { navigationItems } from '../app/components/app/navigation'
```

por:

```ts
import { dashboardsNavigation } from '../app/components/app/navigation'
```

Substitua:

```ts
  it('está na navegação de Operação', () => {
    expect(navigationItems.some((item) => item.to === '/operacao/dashboard-reversa')).toBe(true)
  })
```

por:

```ts
  it('está no grupo Dashboards, renomeado para "Operações"', () => {
    const item = dashboardsNavigation.find((entry) => entry.to === '/operacao/dashboard-reversa')
    expect(item?.label).toBe('Operações')
  })
```

- [ ] **Step 3: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/dashboard-reversa.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tests/dashboard-reversa.spec.ts
git commit -m "test(nav): Dashboard Reversa agora é encontrado em dashboardsNavigation"
```

---

### Task 7: Atualizar `tests/loja-tv-layout.spec.ts` ("Loja (TV)" saiu do menu)

**Files:**
- Modify: `tests/loja-tv-layout.spec.ts:15-20`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/loja-tv-layout.spec.ts`
Expected: FAIL — `dashboardsNavigation.find(entry => entry.to === '/dashboards/loja-tv')` agora retorna `undefined` (item removido do menu), quebrando `expect(item?.label).toBe('Loja (TV)')`.

- [ ] **Step 2: Substituir o teste**

Substitua:

```ts
  it('item da sidebar aponta para a rota embedded (sem fullscreen)', () => {
    const item = dashboardsNavigation.find((entry) => entry.to === '/dashboards/loja-tv')
    expect(item?.label).toBe('Loja (TV)')
    expect(item?.to).toBe('/dashboards/loja-tv')
    expect(item?.to).not.toContain('fullscreen')
  })
```

por:

```ts
  it('não tem mais entrada de menu (saiu do grupo Dashboards, mas a página segue existindo como deep-link)', () => {
    const item = dashboardsNavigation.find((entry) => entry.to === '/dashboards/loja-tv')
    expect(item).toBeUndefined()
  })
```

(os outros 2 testes do arquivo — que montam `LojaTvPage` diretamente e verificam `setPageLayout`/banner — **não mudam**, continuam validando a página em si, que não foi tocada.)

- [ ] **Step 3: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/loja-tv-layout.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tests/loja-tv-layout.spec.ts
git commit -m "test(nav): Loja (TV) sai do menu, página segue como deep-link"
```

---

### Task 8: Atualizar `tests/lotes-faturas.spec.ts` (remove `faturasNavigation`, export extinto)

**Files:**
- Modify: `tests/lotes-faturas.spec.ts:7-10, 67-72`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/lotes-faturas.spec.ts`
Expected: FAIL — o módulo falha ao importar `faturasNavigation`, que não existe mais.

- [ ] **Step 2: Ajustar o import**

Substitua:

```ts
import {
  faturasNavigation,
  navigationItems
} from '../app/components/app/navigation'
```

por:

```ts
import { navigationItems } from '../app/components/app/navigation'
```

- [ ] **Step 3: Remover o teste que usava `faturasNavigation`**

Remova o bloco:

```ts
  it('expõe submenu Faturas a receber / a pagar', () => {
    expect(faturasNavigation.map((item) => item.to)).toEqual([
      '/faturas/a-receber',
      '/faturas/a-pagar'
    ])
  })
```

(o teste `inclui Lotes na navegação principal`, logo acima, **não muda** — Lotes continua em `navigationItems` com o mesmo ícone; o teste `resolve breadcrumbs de lotes e faturas`, logo abaixo, também **não muda** — usa só `resolveBreadcrumbs`, que continua resolvendo Faturas via o mapa local criado na Task 2.)

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/lotes-faturas.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/lotes-faturas.spec.ts
git commit -m "test(nav): remove uso de faturasNavigation (export extinto)"
```

---

### Task 9: Atualizar `tests/p2-screens.spec.ts` (novo `navigationItems`, novo `dashboardsNavigation`, remove `slaAnalyticsNavigation`)

**Files:**
- Modify: `tests/p2-screens.spec.ts:2-6, 52-97`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/p2-screens.spec.ts`
Expected: FAIL — o módulo falha ao importar `slaAnalyticsNavigation` (não existe mais), e mesmo corrigindo o import, os arrays esperados de `navigationItems`/`dashboardsNavigation` não batem mais com a nova estrutura.

- [ ] **Step 2: Ajustar o import**

Substitua:

```ts
import {
  dashboardsNavigation,
  navigationItems,
  slaAnalyticsNavigation
} from '../app/components/app/navigation'
```

por:

```ts
import {
  dashboardsNavigation,
  navigationItems
} from '../app/components/app/navigation'
```

- [ ] **Step 3: Substituir o describe `navegação P2`**

Substitua o describe inteiro:

```ts
describe('navegação P2', () => {
  it('expõe Expedição, Roteirização, Rotas e Calendário na operação', () => {
    expect(navigationItems.map((item) => item.to)).toEqual([
      '/',
      '/operacao/ao-vivo',
      '/pedidos',
      '/operacao/lotes',
      '/operacao/expedicao',
      '/operacao/roteirizacao',
      '/operacao/rotas',
      '/loja/check-in',
      '/operacao/tratativas',
      '/operacao/ocorrencias-ng',
      '/operacao/disparo-chatbot',
      '/operacao/geo-audit',
      '/operacao/dashboard-reversa',
      '/calendario'
    ])
  })

  it('expõe submenu SLA analytics com rotas do legado (6 menu + 2 transportador)', () => {
    expect(slaAnalyticsNavigation.map((item) => item.to)).toEqual([
      '/sla/cliente-por-data',
      '/sla/estado-por-data',
      '/sla/pa-por-data',
      '/sla/transportador-por-data',
      '/sla/por-cliente',
      '/sla/por-estado',
      '/sla/por-pa',
      '/sla/por-transportador'
    ])
    expect(slaAnalyticsNavigation.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
  })

  it('expõe submenu Dashboards sem Dashboard Reversa', () => {
    expect(dashboardsNavigation.map((item) => item.label)).toEqual([
      'Indicadores',
      'Loja',
      'Loja (TV)'
    ])
    expect(dashboardsNavigation.map((item) => item.to)).toEqual([
      '/dashboards/indicadores',
      '/dashboards/loja',
      '/dashboards/loja-tv'
    ])
  })
})
```

por:

```ts
describe('navegação P2', () => {
  it('expõe Home, Calendário, Operação ao vivo e Lotes soltos no topo', () => {
    expect(navigationItems.map((item) => item.to)).toEqual([
      '/',
      '/calendario',
      '/operacao/ao-vivo',
      '/operacao/lotes'
    ])
  })

  it('expõe submenu Dashboards com Ponto de apoios, Operações, Ocorrências, SLA e Monitor do chatbot', () => {
    expect(dashboardsNavigation.map((item) => item.label)).toEqual([
      'Ponto de apoios',
      'Operações',
      'Ocorrências',
      'SLA',
      'Monitor do chatbot'
    ])
    expect(dashboardsNavigation.map((item) => item.to)).toEqual([
      '/dashboards/indicadores',
      '/operacao/dashboard-reversa',
      '/operacao/tratativas',
      '/dashboards/sla',
      '/operacao/chatbot-monitor'
    ])
  })
})
```

(o restante do arquivo — fixtures/métricas de SLA analytics, dashboards P2, roteirização/rotas, expedição/calendário e o describe `breadcrumbs P2` — **não muda**: `slaVariantMeta`/`entitiesForDimension`/etc. vêm de `app/data/demo/sla-analytics.ts`, não de `navigation.ts`, e os breadcrumbs de `/sla/por-cliente`, `/sla/cliente-por-data`, `/sla/por-transportador`, `/dashboards/loja-tv`, `/operacao/expedicao`, `/operacao/roteirizacao`, `/operacao/rotas/:id`, `/calendario` continuam idênticos — `/dashboards/loja-tv` cai no fallback de segmento cru "loja-tv" já antes desta mudança pelo mesmo motivo do item sair do menu, e o teste já esperava o label completo "Loja (TV)" antes fixo — **confira ao rodar**: se esse assert quebrar, é porque `dashboardNavLabel('loja-tv')` agora cai no `?? segment` do helper, retornando o texto cru `'loja-tv'` em vez de `'Loja (TV)'`; ajuste a expectativa desse assert específico para `{ label: 'loja-tv' }` caso a Task 6/7 já não tenha coberto isso — é um efeito colateral esperado de remover o item do menu, documentado no plano.)

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/p2-screens.spec.ts`
Expected: PASS. Se o assert de breadcrumb de `/dashboards/loja-tv` (dentro do describe `breadcrumbs P2`) falhar por causa do fallback de label cru, ajuste-o conforme a nota acima antes de seguir.

- [ ] **Step 5: Commit**

```bash
git add tests/p2-screens.spec.ts
git commit -m "test(nav): atualiza p2-screens para a nova estrutura de navigation.ts"
```

---

### Task 10: Atualizar `tests/p3-screens.spec.ts` (novo `navigationItems`, remove `configuracoesNavigation`, novo `secondaryNavigation`)

**Files:**
- Modify: `tests/p3-screens.spec.ts:2-6, 53-84`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: FAIL — o módulo falha ao importar `configuracoesNavigation` (não existe mais).

- [ ] **Step 2: Ajustar o import**

Substitua:

```ts
import {
  configuracoesNavigation,
  navigationItems,
  secondaryNavigation
} from '../app/components/app/navigation'
```

por:

```ts
import {
  navigationItems,
  secondaryNavigation
} from '../app/components/app/navigation'
```

- [ ] **Step 3: Substituir o describe `navegação P3`**

Substitua:

```ts
describe('navegação P3', () => {
  it('expõe Check In, Tratativas, Ocorrências NG e Disparo na operação', () => {
    expect(navigationItems.map((item) => item.to)).toEqual([
      '/',
      '/operacao/ao-vivo',
      '/pedidos',
      '/operacao/lotes',
      '/operacao/expedicao',
      '/operacao/roteirizacao',
      '/operacao/rotas',
      '/loja/check-in',
      '/operacao/tratativas',
      '/operacao/ocorrencias-ng',
      '/operacao/disparo-chatbot',
      '/operacao/geo-audit',
      '/operacao/dashboard-reversa',
      '/calendario'
    ])
  })

  it('materializa Configurações como submenu e remove placeholder', () => {
    expect(configuracoesNavigation.map((item) => item.to)).toEqual([
      '/configuracoes/sla',
      '/configuracoes/processo',
      '/configuracoes/externos'
    ])
    expect(secondaryNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Pontos de apoio', to: '/pontos-de-apoio' },
      { label: 'Transportadores', to: '/transportadores' }
    ])
  })
})
```

por:

```ts
describe('navegação P3', () => {
  it('expõe Home, Calendário, Operação ao vivo e Lotes soltos no topo', () => {
    expect(navigationItems.map((item) => item.to)).toEqual([
      '/',
      '/calendario',
      '/operacao/ao-vivo',
      '/operacao/lotes'
    ])
  })

  it('extingue o grupo Configurações; Integrações vira o único item solto final', () => {
    expect(secondaryNavigation).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' }
    ])
  })
})
```

(o restante — fixtures/métricas P3, e o describe `breadcrumbs P3` — **não muda**: os breadcrumbs de `/operacao/tratativas` já são cobertos por `tests/navigation.spec.ts` reescrito na Task 1 com o novo label "Ocorrências"; **confira** se este arquivo também tem uma asserção duplicada de `/operacao/tratativas` esperando `{ label: 'Tratativas' }` — se tiver, troque para `{ label: 'Ocorrências' }` para não conflitar com a Task 2.)

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/p3-screens.spec.ts`
Expected: PASS. Se a asserção de `resolveBreadcrumbs('/operacao/tratativas')` dentro do describe `breadcrumbs P3` ainda esperar `{ label: 'Tratativas' }`, troque para `{ label: 'Ocorrências' }` (mesma renomeação da Task 2).

- [ ] **Step 5: Commit**

```bash
git add tests/p3-screens.spec.ts
git commit -m "test(nav): atualiza p3-screens para a nova estrutura de navigation.ts"
```

---

### Task 11: Atualizar `tests/p4-screens.spec.ts` (Rastreio, secondaryNavigation, `ready` em `cadastroNavItems`)

**Files:**
- Modify: `tests/p4-screens.spec.ts:2, 25-39`

- [ ] **Step 1: Rodar o teste atual e confirmar que falha**

Run: `npm run test:run -- tests/p4-screens.spec.ts`
Expected: FAIL — `/operacao/geo-audit` não está mais em `navigationItems` (moveu para `rotasRastreioNavigation` com label "Rastreio"); `secondaryNavigation` não tem mais Pontos de apoio/Transportadores; e nem todos os itens de `cadastroNavItems` são mais `ready` (Pedidos e Operações entraram no catálogo sem estar em `readyKinds`).

- [ ] **Step 2: Ajustar o import**

Substitua:

```ts
import { navigationItems, secondaryNavigation } from '../app/components/app/navigation'
```

por:

```ts
import { rotasRastreioNavigation, secondaryNavigation } from '../app/components/app/navigation'
```

- [ ] **Step 3: Substituir o describe `navegação P4 / gap fechado`**

Substitua:

```ts
describe('navegação P4 / gap fechado', () => {
  it('inclui Auditoria geográfica na operação', () => {
    expect(navigationItems.some((item) => item.to === '/operacao/geo-audit')).toBe(true)
  })

  it('materializa Pontos de apoio e Transportadores com rotas', () => {
    expect(secondaryNavigation.map((item) => item.to)).toEqual([
      '/pontos-de-apoio',
      '/transportadores'
    ])
  })

  it('marca todos os 12 cadastros como ready', () => {
    expect(cadastroNavItems.every((item) => item.ready)).toBe(true)
  })
})
```

por:

```ts
describe('navegação P4 / gap fechado', () => {
  it('inclui Rastreio (ex-Auditoria geográfica) no grupo Rotas & Rastreio', () => {
    const item = rotasRastreioNavigation.find((entry) => entry.to === '/operacao/geo-audit')
    expect(item?.label).toBe('Rastreio')
  })

  it('Pontos de apoio e Transportadores saíram do menu; só resta Integrações', () => {
    expect(secondaryNavigation).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' }
    ])
  })

  it('mantém os 11 cadastros legados como ready; Operações é stub novo ainda não implementado', () => {
    const legacyReadyLabels = [
      'SLA', 'Fretes', 'Empresas', 'Operadores', 'Usuários',
      "Aprovações PA's", 'Ocorrências', 'Regiões', 'Feriados', 'Produtos', 'Templates Chatbot'
    ]
    const legacyItems = cadastroNavItems.filter((item) => legacyReadyLabels.includes(item.label))
    expect(legacyItems).toHaveLength(11)
    expect(legacyItems.every((item) => item.ready)).toBe(true)

    const operacoesItem = cadastroNavItems.find((item) => item.label === 'Operações')
    expect(operacoesItem?.ready).toBe(false)
  })
})
```

- [ ] **Step 4: Ajustar o breadcrumb de `/operacao/geo-audit` no describe `breadcrumbs P4`**

Substitua:

```ts
    expect(resolveBreadcrumbs('/operacao/geo-audit')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Auditoria geográfica' }
    ])
```

por:

```ts
    expect(resolveBreadcrumbs('/operacao/geo-audit')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Rastreio' }
    ])
```

(as demais asserções desse describe — `/pontos-de-apoio`, `/transportadores`, `/pedidos/novo-proprio`, `/pedidos/:id/editar`, `/pedidos/:id/checkout` — **não mudam**, os breadcrumbs hardcoded dessas rotas continuam idênticos, mesmo com os itens fora do menu; e o describe `rotas P4 materializadas`, que só confere existência de arquivo, **não muda**.)

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/p4-screens.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tests/p4-screens.spec.ts
git commit -m "test(nav): atualiza p4-screens para Rastreio, Integrações e ready de Operações"
```

---

### Task 12: Criar teste unitário isolado de `NavGroup.vue` (RED)

**Files:**
- Create: `tests/nav-group.spec.ts`

- [ ] **Step 1: Escrever o teste**

```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import NavGroup from '../app/components/app/NavGroup.vue'

const navLinkClass = 'nav-link'
const navLinkActiveClass = 'nav-link--active'
const navLinkSubClass = 'nav-link--sub'

const baseProps = {
  label: 'Exemplo',
  icon: 'i-lucide-folder',
  children: [
    { label: 'Item A', to: '/exemplo/a', icon: 'i-lucide-circle' },
    { label: 'Item B', to: '/exemplo/b', icon: 'i-lucide-circle' }
  ],
  testId: 'exemplo',
  navLinkClass,
  navLinkActiveClass,
  navLinkSubClass
}

describe('NavGroup', () => {
  it('inicia fechado quando nenhum filho está ativo e abre/fecha ao clicar', async () => {
    const wrapper = await mountSuspended(NavGroup, {
      route: '/',
      props: baseProps
    })

    const toggle = wrapper.get('[data-testid="nav-group-exemplo"]')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="nav-submenu-exemplo"]').exists()).toBe(false)

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="nav-submenu-exemplo"]').exists()).toBe(true)
    expect(wrapper.get('a[href="/exemplo/a"]').exists()).toBe(true)
    expect(toggle.find('.nav-chevron--open').exists()).toBe(true)

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="nav-submenu-exemplo"]').exists()).toBe(false)
  })

  it('inicia aberto quando a rota atual é filha de um item do grupo', async () => {
    const wrapper = await mountSuspended(NavGroup, {
      route: '/exemplo/a',
      props: baseProps
    })

    const toggle = wrapper.get('[data-testid="nav-group-exemplo"]')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('a[href="/exemplo/a"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('a[href="/exemplo/b"]').attributes('aria-current')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test:run -- tests/nav-group.spec.ts`
Expected: FAIL — `app/components/app/NavGroup.vue` ainda não existe (erro de resolução de módulo).

---

### Task 13: Implementar `app/components/app/NavGroup.vue` (GREEN)

**Files:**
- Create: `app/components/app/NavGroup.vue`

- [ ] **Step 1: Criar o componente**

```vue
<script setup lang="ts">
import type { NavigationItem } from './navigation'

const props = defineProps<{
  label: string
  icon: string
  children: NavigationItem[]
  testId: string
  navLinkClass: string
  navLinkActiveClass: string
  navLinkSubClass: string
}>()

const route = useRoute()

function isActive(to: string | undefined) {
  if (!to) return false
  return route.path === to || route.path.startsWith(`${to}/`)
}

function groupHasActiveChild() {
  return props.children.some((item) => isActive(item.to))
}

const open = ref(groupHasActiveChild())

watch(
  () => route.path,
  () => {
    if (groupHasActiveChild()) open.value = true
  }
)

function toggle() {
  open.value = !open.value
}
</script>

<template>
  <div class="my-px">
    <button
      :class="[navLinkClass, 'cursor-pointer']"
      type="button"
      :aria-expanded="open"
      :aria-controls="`nav-${testId}-submenu`"
      :data-testid="`nav-group-${testId}`"
      @click="toggle"
    >
      <UIcon
        :name="icon"
        aria-hidden="true"
      />
      <span>{{ label }}</span>
      <UIcon
        name="i-lucide-chevron-right"
        class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
        :class="open ? 'nav-chevron--open rotate-90' : undefined"
        aria-hidden="true"
      />
    </button>
    <div
      v-if="open"
      :id="`nav-${testId}-submenu`"
      class="py-0.5 pb-1.5"
      role="group"
      :aria-label="label"
      :data-testid="`nav-submenu-${testId}`"
    >
      <NuxtLink
        v-for="item in children"
        :key="item.to"
        :to="item.to"
        :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <UIcon
          :name="item.icon"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Rodar e confirmar que passa**

Run: `npm run test:run -- tests/nav-group.spec.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/components/app/NavGroup.vue tests/nav-group.spec.ts
git commit -m "feat(sidebar): extrai NavGroup.vue como accordion reutilizável"
```

---

### Task 14: Reescrever `app/components/app/AppSidebar.vue` para usar `NavGroup` (GREEN final)

**Contexto:** troca os 8 blocos `<button>`/`<div v-if>` copiados (e os 8 `ref`/`computed`/`watch`/`toggle*` correspondentes) por 5 instâncias de `<NavGroup>`. Move o badge numérico "146" do loop de `operacaoNavGroup.children` (que não existe mais) para o loop de `navigationItems` (onde "Operação ao vivo" mora agora). Visual e classes idênticos ao atual — só a estrutura de código muda.

**Files:**
- Modify: `app/components/app/AppSidebar.vue`

- [ ] **Step 1: Substituir o `<script setup>`**

Substitua todo o bloco de `<script setup lang="ts">` até `</script>` por:

```vue
<script setup lang="ts">
import {
  cadastrosNavGroup,
  dashboardsNavGroup,
  devolucoesNavGroup,
  logsNavGroup,
  navigationItems,
  rotasRastreioNavGroup,
  secondaryNavigation
} from './navigation'

const route = useRoute()

function isActive(to: string | undefined) {
  if (!to) return false
  if (to === '/') return route.path === '/' || route.path.startsWith('/operacoes/')
  return route.path === to || route.path.startsWith(`${to}/`)
}

const navLinkClass = 'nav-link flex w-full min-h-10 items-center gap-2.5 my-px rounded-md border-0 bg-transparent px-2.5 text-left text-[13px] text-[oklch(80%_0.03_253)] no-underline hover:bg-[oklch(29%_0.045_253)] [&_svg]:size-[15px] [&_svg]:shrink-0 [&_svg]:text-[oklch(66%_0.035_253)] [&>span:nth-child(2)]:flex-1'
const navLinkActiveClass = 'nav-link--active bg-[oklch(34%_0.075_253)] font-bold text-[oklch(98%_0.005_253)] [&_svg]:text-[oklch(95%_0.02_253)]'
const navLinkSubClass = 'nav-link--sub min-h-[34px] pl-[18px] text-xs [&_svg]:size-[13px] [&_svg]:shrink-0'
</script>
```

- [ ] **Step 2: Substituir o corpo do `<nav>` no template**

Substitua tudo entre `<nav ...>` e `</nav>` (o loop de `navigationItems`, o bloco `Operação` inteiro, e os 8 blocos de grupo — Dashboards/SLA/Resumos/Faturas/Devoluções/Cadastros/Configurações — até o `<NuxtLink v-for="item in secondaryNavigation" ...>` final) por:

```html
    <nav
      class="min-h-0 overflow-auto [scrollbar-width:none]"
      aria-label="Navegação principal"
    >
      <p class="mx-2.5 my-1.5 text-[10px] font-bold tracking-[0.13em] text-[oklch(66%_0.045_253)] uppercase">Operação</p>
      <NuxtLink
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        :class="[navLinkClass, isActive(item.to) ? navLinkActiveClass : undefined]"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <UIcon
          :name="item.icon"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
        <span
          v-if="item.to === '/operacao/ao-vivo'"
          class="numeric min-w-[25px] rounded-[10px] bg-[oklch(34%_0.05_253)] px-1.5 py-0.5 text-center text-[10px] font-bold text-[oklch(87%_0.025_253)]"
        >146</span>
      </NuxtLink>

      <p class="mx-2.5 mt-[18px] mb-1.5 text-[10px] font-bold tracking-[0.13em] text-[oklch(66%_0.045_253)] uppercase">Gestão</p>

      <NavGroup
        :label="dashboardsNavGroup.label"
        :icon="dashboardsNavGroup.icon"
        :children="dashboardsNavGroup.children"
        test-id="dashboards"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NavGroup
        :label="rotasRastreioNavGroup.label"
        :icon="rotasRastreioNavGroup.icon"
        :children="rotasRastreioNavGroup.children"
        test-id="rotas-rastreio"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NavGroup
        :label="logsNavGroup.label"
        :icon="logsNavGroup.icon"
        :children="logsNavGroup.children"
        test-id="logs"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NavGroup
        :label="devolucoesNavGroup.label"
        :icon="devolucoesNavGroup.icon"
        :children="devolucoesNavGroup.children"
        test-id="devolucoes"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NavGroup
        :label="cadastrosNavGroup.label"
        :icon="cadastrosNavGroup.icon"
        :children="cadastrosNavGroup.children"
        test-id="cadastros"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NuxtLink
        v-for="item in secondaryNavigation"
        :key="item.label"
        :to="item.to"
        :class="[navLinkClass, isActive(item.to) ? navLinkActiveClass : undefined]"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <UIcon
          :name="item.icon"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
```

(`NavGroup` é resolvido automaticamente pelo auto-import de componentes do Nuxt a partir de `app/components/app/NavGroup.vue` — não precisa de import explícito no `<script setup>`. O restante do template — `<aside>`, cabeçalho com logo, `<div class="flex-1" />` e `<footer>` com "Central de ajuda" — **não muda**.)

- [ ] **Step 3: Rodar os testes de sidebar**

Run: `npm run test:run -- tests/components.spec.ts tests/sidebar-orders.spec.ts tests/navigation.spec.ts`
Expected: PASS em todos — `components.spec.ts` confirma que os `data-testid`/`aria-expanded`/`.nav-chevron--open` continuam idênticos para Cadastros e Devoluções; `sidebar-orders.spec.ts` confirma que todo item de `navigationItems`/`secondaryNavigation` aparece como link renderizado e que `assertNavigationIntegrity()` continua `true`.

- [ ] **Step 4: Commit**

```bash
git add app/components/app/AppSidebar.vue
git commit -m "refactor(sidebar): usa NavGroup para os 5 grupos da seção Gestão"
```

---

### Task 15: Checklist final do projeto

**Files:** nenhum (só verificação)

- [ ] **Step 1: Suíte de testes completa**

Run: `npm run test:run`
Expected: PASS em toda a suíte (inclui os arquivos tocados nas Tasks 1-14 e todos os demais, que não foram alterados por este plano).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: sem erros — `NavGroup.vue` tipa `children: NavigationItem[]` importando o tipo de `./navigation`; `AppSidebar.vue` não referencia mais nenhum `ref`/`computed` removido; `breadcrumbs.ts` não importa nenhum export inexistente.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: sem erros — nenhuma variável/import não utilizado deve sobrar em `AppSidebar.vue` (os 8 `ref`/`computed`/`watch`/`toggle*` antigos foram removidos por completo na Task 14) nem em `breadcrumbs.ts` (os imports de grupos extintos foram removidos na Task 2).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build concluído sem erros.

- [ ] **Step 5: Verify foundation**

Run: `node scripts/verify-foundation.mjs`
Expected: saída `{"status": "ok", ...}` — este script não depende de `navigation.ts` (só confere arquivos de config/design system), então não deve ser afetado por este plano.

- [ ] **Step 6: Revisão visual manual**

Abrir a aplicação (`npm run dev`) e conferir em 1600×1000 e 1366×768: seção "Operação" com Home/Calendário/Operação ao vivo (badge "146")/Lotes soltos; seção "Gestão" com os 5 accordions na ordem Dashboards → Rotas & Rastreio → Logs → Remessas → Cadastros; item solto "Integrações" ao final; nenhuma mudança visual de espaçamento/cor em relação ao estado anterior (só rótulos/agrupamento).

---

## Self-Review

**1. Cobertura da spec:**
- Itens soltos do topo (Home, Calendário, Operação ao vivo, Lotes) → Task 2 (`navigationItems`), verificado em Task 1.
- Grupo Dashboards (5 filhos, labels renomeados, SLA/Monitor do chatbot novos, Loja/Loja TV removidos) → Task 2, verificado em Tasks 1, 6, 7, 9.
- Grupo novo Rotas & Rastreio → Task 2, verificado em Tasks 1, 11.
- Grupo novo Logs → Task 2, verificado em Task 1.
- Grupo Devoluções→Remessas (Caixas/Despachos, Acompanhamento fora) → Task 2, verificado em Task 1.
- Grupo Cadastros (Operadores, Operações novo, Ocorrências Externas fora, Pedidos migrado) → Task 2, verificado em Tasks 1, 4, 11.
- Grupo Configurações dissolvido → Integrações solta → Task 2, verificado em Tasks 1, 5, 10, 11.
- `secondaryNavigation` só com Integrações → Task 2, verificado em Tasks 1, 5, 10, 11.
- Ordem final da sidebar (Operação: Home/Calendário/Operação ao vivo/Lotes; Gestão: Dashboards/Rotas & Rastreio/Logs/Remessas/Cadastros; solto: Integrações) → `navigationGroups` na Task 2, template da Task 14, verificado em Task 1 (`navigationGroups.map(label)`) e Task 15 Step 6 (visual).
- `NavGroup.vue` extraído substituindo os 8 blocos copiados → Tasks 12, 13, 14.
- Badge "146" preservado em "Operação ao vivo" → Task 14 Step 2.
- `tests/navigation.spec.ts` reescrito → Task 1.
- Grep de referências aos exports/arrays antigos em `breadcrumbs.ts` e `.vue`s, com ajuste → Task 2 Step 3 (breadcrumbs.ts) — grep completo já feito durante a pesquisa deste plano confirmou que **nenhum `.vue` fora de `AppSidebar.vue`/`breadcrumbs.ts`** importa `navigation.ts` (só `app/data/demo/cadastros.ts`, que importa `cadastrosNavigation` — nome que não muda, só o conteúdo do array — logo nenhum import quebra ali; documentado na seção "Achados de acoplamento").
- Checklist do CLAUDE.md (test:run/typecheck/lint/build/verify-foundation) → Task 15.

**2. Placeholder scan:** revisão de todo o texto acima não encontrou "TBD"/"implementar depois"/instruções sem código. Os únicos pontos com incerteza explícita (decisão de onde "Pedidos" entra em Cadastros; possível ajuste de assert de fallback de label em `/dashboards/loja-tv`) estão marcados como decisão registrada com justificativa e como nota de "confira ao rodar" com o valor exato a usar em cada branch possível — não são placeholders, são pontos de verificação com resultado explícito nos dois cenários.

**3. Consistência de tipos/nomes:** conferido que `NavigationItem`/`NavigationGroup` (Task 2) são os mesmos tipos importados em `NavGroup.vue` (Task 13); que os nomes de export finais (`navigationItems`, `dashboardsNavigation`/`dashboardsNavGroup`, `rotasRastreioNavigation`/`rotasRastreioNavGroup`, `logsNavigation`/`logsNavGroup`, `devolucoesNavigation`/`devolucoesNavGroup`, `cadastrosNavigation`/`cadastrosNavGroup`, `secondaryNavigation`, `navigationGroups`, `assertNavigationIntegrity`) são usados de forma idêntica em `AppSidebar.vue` (Task 14), `breadcrumbs.ts` (Task 2 Step 3) e em todos os testes (Tasks 1, 4-11); que os `data-testid`/`id`/`aria-controls` gerados por `NavGroup.vue` (`nav-group-${testId}`, `nav-submenu-${testId}`, `nav-${testId}-submenu`) reproduzem exatamente o padrão hardcoded anterior usado por `tests/components.spec.ts` (`nav-group-cadastros`, `nav-submenu-cadastros`, `nav-group-devolucoes`, `nav-submenu-devolucoes`) — corrigido um `testId` divergente (`rotas-rastreio` em vez de `rotasRastreio`) para manter kebab-case consistente com `cadastros`/`devolucoes`.
