# Feature Flags & Cargos → Configurações + Detalhe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover "Feature Flags" e "Cargos" do grupo Cadastros para um grupo novo "Configurações" na sidebar (junto com Integrações), mover suas páginas para `/configuracoes/feature-flags` e `/configuracoes/cargos`, e trocar a gestão de vínculo (Operadores/Usuários) de um modal na listagem para uma página de detalhe dedicada (`/configuracoes/feature-flags/:id` e `/configuracoes/cargos/:id`) com informações da entidade, tabela enriquecida dos vínculos e paginação.

**Architecture:** `navigation.ts` continua sendo a única fonte de verdade da sidebar — ganha `configuracoesNavigation`/`configuracoesNavGroup` (Integrações + Feature Flags + Cargos) e `cadastrosNavigation` volta a 13 itens. As duas páginas de listagem (`feature-flags.vue`/`cargos.vue`) mudam de pasta, perdem o modal de vínculo e passam a `navigateTo` a rota de detalhe ao clicar "Ver operadores"/"Ver usuários". As páginas de detalhe são novas (`[id].vue`), seguem o padrão já usado em `app/pages/operacao/lotes/[id].vue` (`PageHeader` com `back-to`, `MetricsStrip`, bloco `<dl>` de informações, `DataTable` + `Pagination` da lista relacionada, modais para editar/vincular). Os fixtures (`features.ts`/`cargos.ts`) ganham helpers novos para as métricas de detalhe; `Cargo` ganha `createdAt` (Feature já tinha). `breadcrumbs.ts` ganha 2 labels no mapa de Configurações + 2 blocos novos para resolver o nome da entidade nas rotas `:id`.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>` + TypeScript, Nuxt UI 4 (`UInput`/`USelectMenu`/`USwitch`/`UIcon`), Tailwind CSS 4 (utilitários inline), Vitest + `@nuxt/test-utils/runtime`, ESLint, `nuxt typecheck`.

**Projeto:** `D:/DEVJUANMARCOS/PROJETOS/KEENER/VIA REVERSA/V2/ViaReversaV2_Front/.worktrees/sidebar-navegacao-v2` (worktree isolado, branch `feat/sidebar-navegacao-v2`).

---

## Decisões registradas

1. **`CadastroKind` (em `app/types/domain.ts`) não é alterado.** Ele continua incluindo os literais `'feature-flags' | 'cargos'` — remover exigiria também editar os dicionários `descriptions`/`readyKinds` em `app/data/demo/cadastros.ts` (que são `Record<CadastroKind, string/boolean>` e travariam o typecheck se um literal sumisse do tipo mas não do `Record`). Como `cadastroNavItems` é derivado de `cadastrosNavigation` (não de `CadastroKind` diretamente), remover as 2 rotas de `cadastrosNavigation` já é suficiente: `cadastroNavItems`/`isCadastroKind` deixam de reconhecer `'feature-flags'`/`'cargos'` como cadastro válido, sem precisar tocar em `domain.ts` ou `cadastros.ts`. Os 2 literais ficam como membros "mortos" do union, o que é inofensivo (só tipo, não runtime).
2. **`AppSidebar.vue` mantém o `v-for` sobre `secondaryNavigation` mesmo ele ficando `[]`.** Confirmado lendo o template (`app/components/app/AppSidebar.vue:119-131`): é um `v-for` puro, sem `v-else`/contagem esperada — itera 0 vezes e não renderiza nada. Manter o loop custa 0 e evita destruir um ponto de extensão caso um item solto volte no futuro.
3. **Métricas numéricas vs. campos descritivos nas páginas de detalhe:** seguindo o padrão de `app/pages/operacao/lotes/[id].vue`, os números (total de vínculos, ativos, inativos) vão no `MetricsStrip`; código/descrição/status/criada em vão num bloco `<dl>` abaixo. Nenhum badge decorativo — status é texto (`Ativa`/`Inativa`) com cor de texto, nunca só cor.
4. **`StatusLabel` não é usado nos blocos de status das páginas de detalhe.** `StatusLabel` exige uma `StatusKey` resolvida em `statusMeta` (`app/types/domain.ts`), que é o vocabulário de status de **pedido** (`new`/`assigned`/`done`/...) — não existe (e não deveria ser inventada) uma `StatusKey` genérica para "ativo/inativo" de Feature/Cargo. Por isso o `<dl>` das 2 páginas de detalhe renderiza o texto (`Ativa`/`Inativa`, `Ativo`/`Inativo`) direto, com classe de cor (`text-via-green`/`text-via-red`) — texto sempre presente, nunca só cor, o que já satisfaz o banimento "status sem texto" do `CLAUDE.md` sem precisar do componente.
5. **`FeatureOperatorLink` tem campo `active` próprio (switch do vínculo, pedido explicitamente na spec) — `CargoUserLink` não tem.** Por isso a tabela de operadores da feature tem coluna switch "Ativo" e a de usuários do cargo não. As métricas Ativos/Inativos do cargo usam o campo `active` da **linha de usuário** (`CadastroOnda3Row`, kind `'usuarios'`), não do vínculo.
6. **Nenhum componente novo foi extraído entre as 2 páginas de detalhe.** Ambas repetem a mesma forma (`PageHeader` + `MetricsStrip` + `<dl>` + filtro + `DataTable` + `Pagination` + 2 modais), mas os campos do `<dl>` e as colunas da tabela relacionada são diferentes o suficiente (Feature: código/descrição/status/criada em, operadores com switch de vínculo; Cargo: status/criada em/descrição, usuários sem switch, com e-mail/transportador) que extrair um componente compartilhado agora exigiria props tão genéricas quanto as próprias páginas — YAGNI com só 2 usos concretos. Se um 3º cadastro com o mesmo padrão aparecer, extrair nesse momento.
7. **Ordem final do grupo Configurações:** Integrações, Feature Flags, Cargos (ordem em que a spec os cita). `navigationGroups` recebe `configuracoesNavGroup` como último grupo da seção "Gestão" (depois de Cadastros).

## Riscos / testes que ficam vermelhos entre tasks

`tests/routes.spec.ts` referencia os caminhos antigos (`app/pages/cadastros/feature-flags.vue`, `app/pages/cadastros/cargos.vue`) até a Task 12. Entre a Task 8 (move Feature Flags) e a Task 12, rodar a suíte inteira mostra esse arquivo vermelho — **esperado**. Cada task abaixo roda só o arquivo de teste que ela própria edita (`npx vitest run tests/<arquivo>.spec.ts`); o `npm run test:run` completo só é usado na Task 13 (verificação final).

---

## File Structure

- **Modify:** `app/data/demo/cargos.ts` — `Cargo` ganha `createdAt`; `createEmptyCargo()` preenche data atual; fixtures ganham datas; novo helper `buildCargoDetailMetrics`.
- **Modify:** `app/data/demo/features.ts` — novos helpers `linkedOperatorsActiveCount` e `buildFeatureDetailMetrics`.
- **Modify:** `app/components/app/navigation.ts` — novo `configuracoesNavigation`/`configuracoesNavGroup`; `cadastrosNavigation` volta a 13 itens; `secondaryNavigation` fica `[]`; `navigationGroups` ganha o grupo novo no final.
- **Modify:** `app/components/app/AppSidebar.vue` — importa e renderiza `configuracoesNavGroup` via `<NavGroup>` (após o de Cadastros).
- **Modify:** `app/utils/breadcrumbs.ts` — `CONFIGURACOES_LABELS` ganha `feature-flags`/`cargos`; 2 blocos novos resolvem `/configuracoes/feature-flags/:id` e `/configuracoes/cargos/:id` com o nome da entidade.
- **Delete + Create:** `app/pages/cadastros/feature-flags.vue` → `app/pages/configuracoes/feature-flags.vue` (remove modal de vínculo, `navigateTo` no lugar, colunas "Criada em" e resumo de operadores).
- **Delete + Create:** `app/pages/cadastros/cargos.vue` → `app/pages/configuracoes/cargos.vue` (remove modal de vínculo, `navigateTo` no lugar, coluna "Criado em").
- **Create:** `app/pages/configuracoes/feature-flags/[id].vue` — detalhe da feature + tabela de operadores vinculados.
- **Create:** `app/pages/configuracoes/cargos/[id].vue` — detalhe do cargo + tabela de usuários vinculados.
- **Modify:** `tests/feature-flags-cargos.spec.ts` — reescreve as seções afetadas (fixtures novas, navegação, breadcrumbs, conteúdo das 4 páginas).
- **Modify:** `tests/navigation.spec.ts` — `cadastrosNavigation` 13 itens, `secondaryNavigation` vazio, `navigationGroups` com Configurações, novo describe do grupo Configurações.
- **Modify:** `tests/sidebar-orders.spec.ts` — novo teste que abre o grupo Configurações e confere os 3 links.
- **Modify:** `tests/routes.spec.ts` — caminhos novos das 2 páginas movidas + 2 entradas novas para as páginas de detalhe.
- **No changes needed:** `app/data/demo/cadastros.ts`, `app/types/domain.ts`, `app/utils/cadastros.ts` — ver Decisão registrada 1.

---

### Task 1: `Cargo` ganha `createdAt`

**Files:**
- Modify: `app/data/demo/cargos.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Em `tests/feature-flags-cargos.spec.ts`, dentro do describe `'fixtures de Cargos'`, troque o teste:

```ts
  it('expõe ao menos 3 cargos com ids/nomes únicos', () => {
    const rows = getCargos()
    expect(rows.length).toBeGreaterThanOrEqual(3)
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
    expect(new Set(rows.map((row) => row.name)).size).toBe(rows.length)
  })
```

por:

```ts
  it('expõe ao menos 3 cargos com ids/nomes únicos e data de criação pt-BR', () => {
    const rows = getCargos()
    expect(rows.length).toBeGreaterThanOrEqual(3)
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
    expect(new Set(rows.map((row) => row.name)).size).toBe(rows.length)
    expect(rows.every((row) => /^\d{2}\/\d{2}\/\d{4}$/.test(row.createdAt))).toBe(true)
  })
```

E troque o teste:

```ts
  it('cria e persiste um cargo novo (mock)', () => {
    const before = getCargos().length
    const draft = createEmptyCargo()
    expect(draft.active).toBe(true)
    expect(draft.name).toBe('')
    setCargos([...getCargos(), { id: 'cgo-test', ...draft, name: 'Teste' }])
    expect(getCargos().length).toBe(before + 1)
    setCargos(getCargos().filter((row) => row.id !== 'cgo-test'))
    expect(getCargos().length).toBe(before)
  })
```

por:

```ts
  it('cria e persiste um cargo novo (mock) com createdAt padrão pt-BR', () => {
    const before = getCargos().length
    const draft = createEmptyCargo()
    expect(draft.active).toBe(true)
    expect(draft.name).toBe('')
    expect(draft.createdAt).toBeTruthy()
    setCargos([...getCargos(), { id: 'cgo-test', ...draft, name: 'Teste' }])
    expect(getCargos().length).toBe(before + 1)
    setCargos(getCargos().filter((row) => row.id !== 'cgo-test'))
    expect(getCargos().length).toBe(before)
  })
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Cargos"`
Expected: FAIL — `row.createdAt` é `undefined` (regex não casa) e `draft.createdAt` é `undefined`.

- [ ] **Step 3: Implementar em `app/data/demo/cargos.ts`**

Troque a interface `Cargo`:

```ts
export interface Cargo {
  id: string
  name: string
  detail: string
  active: boolean
  createdAt: string
}
```

Troque o seed `cargosSeed`:

```ts
const cargosSeed: Cargo[] = [
  { id: 'cgo-1', name: 'Coordenador de Operações', detail: 'Responde pela operação diária do ponto de apoio.', active: true, createdAt: '08/01/2025' },
  { id: 'cgo-2', name: 'Analista de SLA', detail: 'Acompanha indicadores de atendimento e prazo.', active: true, createdAt: '19/02/2025' },
  { id: 'cgo-3', name: 'Auxiliar de Backoffice', detail: 'Suporte administrativo e cadastro.', active: true, createdAt: '02/03/2025' },
  { id: 'cgo-4', name: 'Supervisor de Rota', detail: 'Planeja e acompanha roteirização.', active: false, createdAt: '25/04/2025' }
]
```

Troque `createEmptyCargo`:

```ts
export function createEmptyCargo(): Omit<Cargo, 'id'> {
  return { name: '', detail: '', active: true, createdAt: new Date().toLocaleDateString('pt-BR') }
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Cargos"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/data/demo/cargos.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat(cargos): adiciona createdAt à entidade Cargo"
```

---

### Task 2: Features — `linkedOperatorsActiveCount` e `buildFeatureDetailMetrics`

**Files:**
- Modify: `app/data/demo/features.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

No describe `'fixtures de Feature Flags'` de `tests/feature-flags-cargos.spec.ts`, adicione (depois do teste `'calcula adoção...'`, ainda dentro do mesmo describe):

```ts
  it('conta só os vínculos ativos de uma feature (linkedOperatorsActiveCount)', () => {
    const withLinks = getFeatures().find((row) => getFeatureLinks(row.id).length > 0)!
    const links = getFeatureLinks(withLinks.id)
    expect(linkedOperatorsActiveCount(withLinks.id)).toBe(links.filter((link) => link.active).length)
  })

  it('calcula métricas de detalhe (operadores/ativos/inativos) a partir dos vínculos informados', () => {
    const feature = getFeatures()[0]!
    const links = getFeatureLinks(feature.id)
    const metrics = buildFeatureDetailMetrics(feature, links)
    expect(metrics.map((metric) => metric.label)).toEqual(['Operadores', 'Ativos', 'Inativos'])
    expect(metrics[0]).toMatchObject({ value: links.length })
    const active = links.filter((link) => link.active).length
    expect(metrics[1]).toMatchObject({ value: active })
    expect(metrics[2]).toMatchObject({ value: links.length - active })
  })
```

E adicione `buildFeatureDetailMetrics` e `linkedOperatorsActiveCount` ao bloco de import do topo do arquivo:

```ts
import {
  buildFeatureDetailMetrics,
  buildFeatureRankingSeries,
  buildFeaturesMetrics,
  createEmptyFeature,
  createEmptyFeatureLink,
  featureAdoptionCounts,
  featureOperatorOptions,
  getFeatureLinks,
  getFeatures,
  linkedOperatorsActiveCount,
  linkedOperatorsCount,
  resolveOperatorLabel,
  setFeatureLinks,
  setFeatures
} from '../app/data/demo/features'
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Feature Flags"`
Expected: FAIL — `linkedOperatorsActiveCount`/`buildFeatureDetailMetrics` não existem no módulo.

- [ ] **Step 3: Implementar em `app/data/demo/features.ts`**

Depois de `linkedOperatorsCount`, adicione:

```ts
export function linkedOperatorsActiveCount(featureId: string): number {
  return linksStore.filter((link) => link.featureId === featureId && link.active).length
}
```

No final do arquivo (depois de `featureAdoptionCounts`), adicione:

```ts
export function buildFeatureDetailMetrics(feature: Feature, links: FeatureOperatorLink[]): Metric[] {
  const active = links.filter((link) => link.active).length
  const inactive = links.length - active
  return [
    { label: 'Operadores', value: links.length, note: 'vinculados a esta feature', icon: 'i-lucide-wallet-cards' },
    { label: 'Ativos', value: active, note: 'vínculo habilitado', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Inativos', value: inactive, note: 'vínculo desabilitado', icon: 'i-lucide-circle-off', tone: inactive > 0 ? 'warning' : undefined }
  ]
}
```

`feature` não é usado no corpo além do tipo — é intencional (a assinatura recebe a feature para deixar a chamada explícita no call site e para uso futuro, ex.: nota com o código da feature). Mantenha o parâmetro.

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Feature Flags"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/data/demo/features.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat(feature-flags): adiciona linkedOperatorsActiveCount e buildFeatureDetailMetrics"
```

---

### Task 3: Cargos — `buildCargoDetailMetrics`

**Files:**
- Modify: `app/data/demo/cargos.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

No describe `'fixtures de Cargos'`, adicione (depois de `'expõe opções de usuário...'`):

```ts
  it('calcula métricas de detalhe (usuários/ativos/inativos) a partir das linhas de usuário vinculadas', () => {
    const cargo = getCargos().find((row) => getCargoLinks(row.id).length > 0)!
    const userRows = getCadastroOnda3Rows('usuarios')
    const linkedUsers = getCargoLinks(cargo.id)
      .map((link) => userRows.find((row) => row.id === link.userId))
      .filter((row): row is CadastroOnda3Row => Boolean(row))
    const metrics = buildCargoDetailMetrics(cargo, linkedUsers)
    expect(metrics.map((metric) => metric.label)).toEqual(['Usuários', 'Ativos', 'Inativos'])
    expect(metrics[0]).toMatchObject({ value: linkedUsers.length })
    const active = linkedUsers.filter((row) => row.active).length
    expect(metrics[1]).toMatchObject({ value: active })
    expect(metrics[2]).toMatchObject({ value: linkedUsers.length - active })
  })
```

Atualize os imports do topo do arquivo — troque:

```ts
import { cadastroOnda3Configs, isCadastroOnda3Kind } from '../app/data/demo/cadastros-onda3'
```

por:

```ts
import type { CadastroOnda3Row } from '../app/data/demo/cadastros-onda3'
import { cadastroOnda3Configs, getCadastroOnda3Rows, isCadastroOnda3Kind } from '../app/data/demo/cadastros-onda3'
```

E troque o import de cargos:

```ts
import {
  buildCargosMetrics,
  cargoUserOptions,
  createEmptyCargo,
  createEmptyCargoLink,
  getCargoLinks,
  getCargos,
  linkedUsersCount,
  resolveUserLabel,
  setCargoLinks,
  setCargos
} from '../app/data/demo/cargos'
```

por:

```ts
import {
  buildCargoDetailMetrics,
  buildCargosMetrics,
  cargoUserOptions,
  createEmptyCargo,
  createEmptyCargoLink,
  getCargoLinks,
  getCargos,
  linkedUsersCount,
  resolveUserLabel,
  setCargoLinks,
  setCargos
} from '../app/data/demo/cargos'
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Cargos"`
Expected: FAIL — `buildCargoDetailMetrics` não existe.

- [ ] **Step 3: Implementar em `app/data/demo/cargos.ts`**

Troque o import do topo:

```ts
import type { Metric } from '../../types/domain'
import { getCadastroOnda3Rows } from './cadastros-onda3'
```

por:

```ts
import type { Metric } from '../../types/domain'
import type { CadastroOnda3Row } from './cadastros-onda3'
import { getCadastroOnda3Rows } from './cadastros-onda3'
```

No final do arquivo (depois de `buildCargosMetrics`), adicione:

```ts
export function buildCargoDetailMetrics(cargo: Cargo, linkedUsers: CadastroOnda3Row[]): Metric[] {
  const active = linkedUsers.filter((row) => row.active).length
  const inactive = linkedUsers.length - active
  return [
    { label: 'Usuários', value: linkedUsers.length, note: 'vinculados a este cargo', icon: 'i-lucide-users' },
    { label: 'Ativos', value: active, note: 'usuário ativo', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Inativos', value: inactive, note: 'usuário inativo', icon: 'i-lucide-circle-off', tone: inactive > 0 ? 'warning' : undefined }
  ]
}
```

(`cargo` não é lido no corpo, é intencional — mesma razão da Task 2.)

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Cargos"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/data/demo/cargos.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat(cargos): adiciona buildCargoDetailMetrics"
```

---

### Task 4: Navigation — grupo Configurações novo, Cadastros volta a 13 itens

**Files:**
- Modify: `app/components/app/navigation.ts`
- Test: `tests/navigation.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Substitua em `tests/navigation.spec.ts` o import do topo:

```ts
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
```

por:

```ts
import {
  cadastrosNavigation,
  configuracoesNavGroup,
  configuracoesNavigation,
  dashboardsNavigation,
  devolucoesNavGroup,
  devolucoesNavigation,
  logsNavigation,
  navigationGroups,
  navigationItems,
  rotasRastreioNavigation,
  secondaryNavigation
} from '../app/components/app/navigation'
```

Troque o teste:

```ts
  it('grupo Cadastros com 15 itens (Pedidos + 12 cadastros + Operações + Feature Flags + Cargos)', () => {
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
      'Operações',
      'Feature Flags',
      'Cargos'
    ])
    expect(cadastrosNavigation.find((item) => item.label === 'Operadores')?.to).toBe('/cadastros/contas')
    expect(cadastrosNavigation.find((item) => item.label === 'Operações')?.to).toBe('/cadastros/operacoes')
    expect(cadastrosNavigation.find((item) => item.label === 'Feature Flags')?.to).toBe('/cadastros/feature-flags')
    expect(cadastrosNavigation.find((item) => item.label === 'Cargos')?.to).toBe('/cadastros/cargos')
    expect(cadastrosNavigation.some((item) => item.label === 'Ocorrências Externas')).toBe(false)
  })
```

por:

```ts
  it('grupo Cadastros com 13 itens (Pedidos + 12 cadastros + Operações — Feature Flags/Cargos migraram para Configurações)', () => {
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
    expect(cadastrosNavigation.some((item) => item.label === 'Feature Flags')).toBe(false)
    expect(cadastrosNavigation.some((item) => item.label === 'Cargos')).toBe(false)
  })

  it('grupo novo Configurações: Integrações, Feature Flags, Cargos apontando para /configuracoes/*', () => {
    expect(configuracoesNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes' },
      { label: 'Feature Flags', to: '/configuracoes/feature-flags' },
      { label: 'Cargos', to: '/configuracoes/cargos' }
    ])
    expect(configuracoesNavigation.every((item) => item.icon.startsWith('i-lucide-'))).toBe(true)
    expect(configuracoesNavGroup.label).toBe('Configurações')
  })
```

Troque o teste:

```ts
  it('secondaryNavigation só tem Integrações', () => {
    expect(secondaryNavigation).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' }
    ])
  })
```

por:

```ts
  it('secondaryNavigation fica vazio (Integrações migrou para o grupo Configurações)', () => {
    expect(secondaryNavigation).toEqual([])
  })
```

Troque o teste:

```ts
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
```

por:

```ts
  it('navigationGroups segue a ordem final da seção Gestão (Configurações por último)', () => {
    expect(navigationGroups.map((group) => group.label)).toEqual([
      'Dashboards',
      'Rotas & Rastreio',
      'Logs',
      'Remessas',
      'Cadastros',
      'Configurações'
    ])
    expect(navigationGroups.every((group) => group.children.length > 0)).toBe(true)
  })
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/navigation.spec.ts`
Expected: FAIL — `configuracoesNavGroup`/`configuracoesNavigation` não existem; `cadastrosNavigation` ainda tem 15 itens; `secondaryNavigation` ainda tem 1 item; `navigationGroups` ainda tem 5 grupos.

- [ ] **Step 3: Implementar em `app/components/app/navigation.ts`**

Troque o bloco de `cadastrosNavigation` (remova as 2 últimas entradas e ajuste o comentário):

```ts
/**
 * Grupo Cadastros — Pedidos migrou do extinto grupo Operação (rota /pedidos inalterada,
 * ver "Decisão registrada" no plano); Contas renomeada Operadores; Ocorrências Externas
 * saiu do menu; Operações é rota nova (página ainda não existe). Feature Flags e Cargos
 * migraram para o grupo Configurações (rotas /configuracoes/feature-flags e /configuracoes/cargos).
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
 * Grupo novo Configurações — Integrações (vinha do extinto secondaryNavigation),
 * Feature Flags e Cargos (vieram do extinto grupo Cadastros, mudam de rota para /configuracoes/*).
 */
export const configuracoesNavigation: NavigationItem[] = [
  { label: 'Integrações', to: '/configuracoes/integracoes', icon: 'i-lucide-plug' },
  { label: 'Feature Flags', to: '/configuracoes/feature-flags', icon: 'i-lucide-toggle-right' },
  { label: 'Cargos', to: '/configuracoes/cargos', icon: 'i-lucide-id-card' }
]

export const configuracoesNavGroup: NavigationGroup = {
  label: 'Configurações',
  icon: 'i-lucide-settings-2',
  children: configuracoesNavigation
}

/**
 * secondaryNavigation fica vazio — Integrações migrou para o grupo Configurações acima.
 * Mantido como export (ver Decisão registrada 2 no plano) para não obrigar AppSidebar.vue
 * a remover o v-for que hoje itera este array.
 */
export const secondaryNavigation: NavigationItem[] = []

/** Todos os grupos com submenu na sidebar, na ordem final da seção "Gestão". */
export const navigationGroups: NavigationGroup[] = [
  dashboardsNavGroup,
  rotasRastreioNavGroup,
  logsNavGroup,
  devolucoesNavGroup,
  cadastrosNavGroup,
  configuracoesNavGroup
]
```

Isso substitui inteiramente o trecho atual do arquivo que vai do comentário de `cadastrosNavigation` (linha ~91) até o fim do bloco `secondaryNavigation`/`navigationGroups` atuais (linha ~136) — o restante do arquivo (`NavigationItem`/`NavigationGroup` no topo, `assertNavigationIntegrity` no final) não muda.

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/navigation.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/app/navigation.ts tests/navigation.spec.ts
git commit -m "feat(navigation): cria grupo Configuracoes com Integracoes/Feature Flags/Cargos"
```

---

### Task 5: `AppSidebar.vue` renderiza o grupo Configurações

**Files:**
- Modify: `app/components/app/AppSidebar.vue`
- Test: `tests/sidebar-orders.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Em `tests/sidebar-orders.spec.ts`, adicione um novo teste dentro do describe `'integridade da navegação da sidebar'` (depois de `'renderiza a sidebar com os itens oficiais de operação'`):

```ts
  it('renderiza e abre o grupo Configurações com Integrações, Feature Flags e Cargos', async () => {
    const wrapper = await mountSuspended(AppSidebar, { route: '/pedidos' })

    const toggle = wrapper.get('[data-testid="nav-group-configuracoes"]')
    await toggle.trigger('click')

    expect(wrapper.get('a[href="/configuracoes/integracoes"]').exists()).toBe(true)
    expect(wrapper.get('a[href="/configuracoes/feature-flags"]').exists()).toBe(true)
    expect(wrapper.get('a[href="/configuracoes/cargos"]').exists()).toBe(true)
  })
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/sidebar-orders.spec.ts`
Expected: FAIL — `[data-testid="nav-group-configuracoes"]` não existe.

- [ ] **Step 3: Implementar em `app/components/app/AppSidebar.vue`**

Troque o import do topo:

```ts
import {
  cadastrosNavGroup,
  dashboardsNavGroup,
  devolucoesNavGroup,
  logsNavGroup,
  navigationItems,
  rotasRastreioNavGroup,
  secondaryNavigation
} from './navigation'
```

por:

```ts
import {
  cadastrosNavGroup,
  configuracoesNavGroup,
  dashboardsNavGroup,
  devolucoesNavGroup,
  logsNavGroup,
  navigationItems,
  rotasRastreioNavGroup,
  secondaryNavigation
} from './navigation'
```

Depois do bloco `<NavGroup :label="cadastrosNavGroup.label" ... />` (antes do `<NuxtLink v-for="item in secondaryNavigation" ...>`), adicione:

```html
      <NavGroup
        :label="configuracoesNavGroup.label"
        :icon="configuracoesNavGroup.icon"
        :children="configuracoesNavGroup.children"
        test-id="configuracoes"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/sidebar-orders.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/app/AppSidebar.vue tests/sidebar-orders.spec.ts
git commit -m "feat(sidebar): renderiza o grupo Configuracoes"
```

---

### Task 6: Breadcrumbs — labels de listagem + Feature Flags/Cargos saem do catálogo de Cadastros

**Files:**
- Modify: `app/utils/breadcrumbs.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Em `tests/feature-flags-cargos.spec.ts`, troque todo o describe `'sidebar e CadastroKind — Feature Flags e Cargos'` por:

```ts
describe('Feature Flags e Cargos saem de Cadastros, entram em Configurações', () => {
  it('Feature Flags e Cargos NÃO são kinds onda3 (têm página dedicada, não CadastroOnda3Page)', () => {
    expect(isCadastroOnda3Kind('feature-flags')).toBe(false)
    expect(isCadastroOnda3Kind('cargos')).toBe(false)
  })

  it('cadastrosNavigation não tem mais Feature Flags/Cargos (mudaram para o grupo Configurações)', () => {
    const labels = cadastrosNavigation.map((item) => item.label)
    expect(labels).not.toContain('Feature Flags')
    expect(labels).not.toContain('Cargos')
    expect(labels.at(-1)).toBe('Operações')
  })

  it('configuracoesNavigation tem Integrações, Feature Flags e Cargos apontando para /configuracoes/*', () => {
    expect(configuracoesNavigation.map((item) => ({ label: item.label, to: item.to }))).toEqual([
      { label: 'Integrações', to: '/configuracoes/integracoes' },
      { label: 'Feature Flags', to: '/configuracoes/feature-flags' },
      { label: 'Cargos', to: '/configuracoes/cargos' }
    ])
  })

  it('cadastroNavItems/isCadastroKind não conhecem mais feature-flags/cargos como cadastro', () => {
    expect(cadastroNavItems.some((item) => item.kind === 'feature-flags')).toBe(false)
    expect(cadastroNavItems.some((item) => item.kind === 'cargos')).toBe(false)
    expect(isCadastroKind('feature-flags')).toBe(false)
    expect(isCadastroKind('cargos')).toBe(false)
  })

  it('breadcrumb resolve /configuracoes/feature-flags e /configuracoes/cargos (listagem)', () => {
    expect(resolveBreadcrumbs('/configuracoes/feature-flags')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Feature Flags' }
    ])
    expect(resolveBreadcrumbs('/configuracoes/cargos')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Cargos' }
    ])
  })
})
```

Ajuste os imports do topo do arquivo — troque:

```ts
import { cadastrosNavigation } from '../app/components/app/navigation'
```

por:

```ts
import { cadastrosNavigation, configuracoesNavigation } from '../app/components/app/navigation'
```

E adicione (junto dos outros imports de `app/data/demo/cadastros` e `app/utils`):

```ts
import { cadastroNavItems } from '../app/data/demo/cadastros'
import { isCadastroKind } from '../app/utils/cadastros'
```

(Remova o import antigo de `cadastroNavItems, getCadastroMeta` de `'../app/data/demo/cadastros'` se ele já existir com `getCadastroMeta` — `getCadastroMeta` não é mais usado por este arquivo depois desta task.)

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Configurações"`
Expected: FAIL — `configuracoesNavigation` não resolvido no teste até a Task 4 estar aplicada (deve já estar, se as tasks correrem em ordem); o breadcrumb de `/configuracoes/feature-flags` ainda cai no fallback genérico sem o label certo (`configuracaoNavLabel('feature-flags')` retorna `'feature-flags'` cru, não `'Feature Flags'`).

- [ ] **Step 3: Implementar em `app/utils/breadcrumbs.ts`**

Troque:

```ts
const CONFIGURACOES_GROUP_LABEL = 'Configurações'
const CONFIGURACOES_LABELS: Record<string, string> = {
  sla: 'SLA',
  processo: 'Processamento',
  integracoes: 'Integrações'
}
```

por:

```ts
const CONFIGURACOES_GROUP_LABEL = 'Configurações'
const CONFIGURACOES_LABELS: Record<string, string> = {
  sla: 'SLA',
  processo: 'Processamento',
  integracoes: 'Integrações',
  'feature-flags': 'Feature Flags',
  cargos: 'Cargos'
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Configurações"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/utils/breadcrumbs.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat(breadcrumbs): resolve /configuracoes/feature-flags e /configuracoes/cargos"
```

---

### Task 7: Breadcrumbs — detalhe com nome da entidade

**Files:**
- Modify: `app/utils/breadcrumbs.ts`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Adicione ao describe `'Feature Flags e Cargos saem de Cadastros, entram em Configurações'` (criado na Task 6):

```ts
  it('breadcrumb resolve /configuracoes/feature-flags/:id e /configuracoes/cargos/:id com o nome da entidade', () => {
    const feature = getFeatures()[0]!
    expect(resolveBreadcrumbs(`/configuracoes/feature-flags/${feature.id}`, { id: feature.id })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Feature Flags', to: '/configuracoes/feature-flags' },
      { label: feature.name }
    ])

    const cargo = getCargos()[0]!
    expect(resolveBreadcrumbs(`/configuracoes/cargos/${cargo.id}`, { id: cargo.id })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Cargos', to: '/configuracoes/cargos' },
      { label: cargo.name }
    ])
  })
```

`getFeatures`/`getCargos` já estão importados no topo do arquivo (usados pelos describes de fixtures das Tasks 1–3).

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "nome da entidade"`
Expected: FAIL — hoje `/configuracoes/feature-flags/:id` cai no bloco genérico de `/configuracoes` e ignora o 3º segmento, retornando só 3 crumbs sem o nome da entidade.

- [ ] **Step 3: Implementar em `app/utils/breadcrumbs.ts`**

Adicione os imports no topo do arquivo (junto dos outros imports de `../data/demo/*`):

```ts
import { getCargos } from '../data/demo/cargos'
import { getFeatures } from '../data/demo/features'
```

Insira 2 blocos novos **imediatamente antes** do bloco `if (normalized === '/configuracoes' || normalized.startsWith('/configuracoes/')) { ... }` (a ordem importa — o genérico usa `.startsWith('/configuracoes/')` e captura tudo se vier primeiro):

```ts
  if (normalized.startsWith('/configuracoes/feature-flags/')) {
    const id = paramValue(params.id) ?? normalized.split('/').pop() ?? ''
    const feature = getFeatures().find((row) => row.id === id)
    return [
      { label: 'Home', to: '/' },
      { label: CONFIGURACOES_GROUP_LABEL, to: '/configuracoes' },
      { label: 'Feature Flags', to: '/configuracoes/feature-flags' },
      { label: feature?.name ?? `#${id}` }
    ]
  }

  if (normalized.startsWith('/configuracoes/cargos/')) {
    const id = paramValue(params.id) ?? normalized.split('/').pop() ?? ''
    const cargo = getCargos().find((row) => row.id === id)
    return [
      { label: 'Home', to: '/' },
      { label: CONFIGURACOES_GROUP_LABEL, to: '/configuracoes' },
      { label: 'Cargos', to: '/configuracoes/cargos' },
      { label: cargo?.name ?? `#${id}` }
    ]
  }

  if (normalized === '/configuracoes' || normalized.startsWith('/configuracoes/')) {
```

(A linha `if (normalized === '/configuracoes' || normalized.startsWith('/configuracoes/')) {` já existe — só adicione os 2 blocos novos acima dela, sem duplicá-la.)

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "nome da entidade"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/utils/breadcrumbs.ts tests/feature-flags-cargos.spec.ts
git commit -m "feat(breadcrumbs): resolve nome da entidade em /configuracoes/feature-flags/:id e /cargos/:id"
```

---

### Task 8: Mover `feature-flags.vue` para Configurações, remover modal, `navigateTo`

**Files:**
- Delete: `app/pages/cadastros/feature-flags.vue`
- Create: `app/pages/configuracoes/feature-flags.vue`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Em `tests/feature-flags-cargos.spec.ts`, troque todo o describe `'página Cadastros · Feature Flags'` por:

```ts
describe('página Configurações · Feature Flags (listagem)', () => {
  const source = readFileSync('app/pages/configuracoes/feature-flags.vue', 'utf8')

  it('materializa CRUD completo com MetricsStrip, DataTable e modais', () => {
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('<DataTable')
    expect(source).toContain('variant="form"')
    expect(source).toContain('variant="confirm"')
    expect(source).toContain('Nova feature')
  })

  it('tem abas Tabela/Gráfico no padrão de dashboards/sla.vue (nav + button + underline ativo)', () => {
    expect(source).toContain("activeTab === tab.id ? 'border-via-blue font-bold text-via-ink' : undefined")
    expect(source).toContain('Tabela')
    expect(source).toContain('Gráfico')
  })

  it('a aba gráfico usa DonutChart (adoção) e StackedBarChart (ranking) dentro de ChartPanel', () => {
    expect(source).toContain('<ChartPanel')
    expect(source).toContain('<DonutChart')
    expect(source).toContain('<StackedBarChart')
  })

  it('Ver operadores navega para a página de detalhe em vez de abrir modal', () => {
    expect(source).toContain("key: 'operators'")
    expect(source).toContain('Ver operadores')
    expect(source).toContain('navigateTo(`/configuracoes/feature-flags/${payload.row.id}`)')
    expect(source).not.toContain('Vincular operadores')
    expect(source).not.toContain('operatorsOpen')
  })

  it('coluna Criada em e resumo de vínculos (N ativos) aparecem na tabela', () => {
    expect(source).toContain("key: 'createdAt'")
    expect(source).toContain('Criada em')
    expect(source).toContain('linkedSummary')
    expect(source).toContain('linkedOperatorsActiveCount')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "listagem"`
Expected: FAIL — `app/pages/configuracoes/feature-flags.vue` ainda não existe (`readFileSync` lança `ENOENT`).

- [ ] **Step 3: Implementar — apagar o arquivo antigo e criar o novo**

Delete `app/pages/cadastros/feature-flags.vue`.

Crie `app/pages/configuracoes/feature-flags.vue`:

```vue
<script setup lang="ts">
/**
 * Configurações → Feature Flags — CRUD de features (mock). O vínculo N:N com Operador
 * (kind 'contas' em cadastros-onda3.ts) vive na página de detalhe
 * (/configuracoes/feature-flags/:id) — "Ver operadores" navega em vez de abrir modal.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Feature } from '~/data/demo/features'
import {
  buildFeatureRankingSeries,
  buildFeaturesMetrics,
  createEmptyFeature,
  featureAdoptionCounts,
  getFeatures,
  linkedOperatorsActiveCount,
  linkedOperatorsCount,
  setFeatures
} from '~/data/demo/features'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Feature Flags · Configurações · Via Reversa' })

type FeatureFlagsTabId = 'tabela' | 'grafico'

interface FeatureDisplayRow extends Record<string, unknown> {
  id: string
  name: string
  code: string
  description: string
  active: boolean
  createdAt: string
  linkedCount: number
  linkedSummary: string
}

const toast = useToast()

const activeTab = ref<FeatureFlagsTabId>('tabela')
const tabs: { id: FeatureFlagsTabId; label: string }[] = [
  { id: 'tabela', label: 'Tabela' },
  { id: 'grafico', label: 'Gráfico' }
]

const rows = ref<Feature[]>(structuredClone(getFeatures()))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<Feature | null>(null)
const form = reactive(createEmptyFeature())

const columns: DataTableColumn<FeatureDisplayRow>[] = [
  { type: 'text', key: 'name', label: 'Nome', width: '20%', secondaryKey: 'description' },
  { type: 'text', key: 'code', label: 'Código', width: '16%' },
  { type: 'text', key: 'createdAt', label: 'Criada em', width: '110px' },
  { type: 'text', key: 'linkedSummary', label: 'Operadores', width: '130px', align: 'right' },
  { type: 'switch', key: 'active', label: 'Ativa', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '210px',
    items: (row) => [
      { key: 'operators', label: 'Ver operadores', icon: 'i-lucide-wallet-cards', variant: 'ghost', ariaLabel: `Ver operadores de ${row.name}` },
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.name}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.name}` }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.code, row.description].some((value) => value.toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildFeaturesMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const displayRows = computed((): FeatureDisplayRow[] =>
  pagedRows.value.map((row) => {
    const linkedCount = linkedOperatorsCount(row.id)
    const activeCount = linkedOperatorsActiveCount(row.id)
    return {
      ...row,
      linkedCount,
      linkedSummary: linkedCount > 0 ? `${linkedCount} (${activeCount} ativos)` : '0'
    }
  })
)

const rankingSeries = computed(() => buildFeatureRankingSeries(filteredRows.value))
const adoption = computed(() => featureAdoptionCounts(filteredRows.value))

watch(search, () => {
  page.value = 1
})

function selectTab(tab: FeatureFlagsTabId) {
  activeTab.value = tab
}

function persist() {
  setFeatures(structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyFeature())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: Feature) {
  editingId.value = row.id
  form.name = row.name
  form.code = row.code
  form.description = row.description
  form.active = row.active
  form.createdAt = row.createdAt
  formOpen.value = true
}

function openDelete(row: Feature) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: FeatureDisplayRow; action: string }) {
  if (payload.action === 'operators') navigateTo(`/configuracoes/feature-flags/${payload.row.id}`)
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: FeatureDisplayRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target) {
    target.active = payload.value
    persist()
  }
}

function saveForm() {
  if (!form.name.trim() || !form.code.trim()) {
    toast.error('Campo obrigatório', 'Informe nome e código antes de salvar.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.code = form.code.trim()
      target.description = form.description.trim()
      target.active = form.active
    }
  }
  else {
    const created: Feature = {
      id: `feat-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      active: form.active,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `Feature ${wasEdit ? 'atualizada' : 'criada'} (mock).`)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  persist()
  toast.success('Excluída', `${pendingDelete.value.name} removida (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="feature-flags-page">
    <PageHeader
      title="Feature Flags"
      subtitle="Recursos habilitados por operador (mock)"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Nova feature
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
        placeholder="Buscar por nome ou código…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <nav
      class="flex min-h-[49px] flex-wrap gap-[18px] border-b border-via-line px-[18px]"
      aria-label="Abas de Feature Flags"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="inline-flex cursor-pointer items-center border-0 border-b-2 border-transparent bg-transparent text-xs text-via-muted transition-[color,border-color] duration-150"
        :class="activeTab === tab.id ? 'border-via-blue font-bold text-via-ink' : undefined"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <template v-if="activeTab === 'tabela'">
      <DataTable
        :columns="columns"
        :rows="displayRows"
        min-width="920px"
        empty-title="Nenhuma feature"
        empty-description="Cadastre a primeira feature ou ajuste a busca."
        @action="onAction"
        @update:switch="onSwitch"
      />

      <Pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="filteredRows.length"
      />
    </template>

    <template v-else>
      <section
        class="grid grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)] border-b border-via-line max-[1100px]:grid-cols-1"
        aria-label="Gráficos de Feature Flags"
      >
        <div class="min-w-0 border-r border-via-line max-[1100px]:border-r-0 max-[1100px]:border-b">
          <ChartPanel
            title="Adoção por operador"
            note="features com × sem vínculo"
          >
            <DonutChart
              :vol="adoption.withOperators"
              :invol="adoption.withoutOperators"
              vol-label="Com operadores"
              invol-label="Sem operadores"
              aria-label="Features com operadores vinculados versus sem vínculo"
              :height="220"
            />
          </ChartPanel>
        </div>
        <div class="min-w-0">
          <ChartPanel
            title="Ranking de features"
            note="operadores ativos × inativos por feature"
          >
            <StackedBarChart
              :series="rankingSeries"
              orientation="horizontal"
              vol-label="Ativos"
              invol-label="Inativos"
              aria-label="Ranking de features por operadores vinculados"
              :height="240"
            />
          </ChartPanel>
        </div>
      </section>
    </template>

    <AppModal
      v-model:open="formOpen"
      variant="form"
      :title="editingId ? 'Editar feature' : 'Nova feature'"
      :description="editingId ? 'Atualize os dados da feature.' : 'Informe os dados da nova feature.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Nome *">
        <UInput
          v-model="form.name"
          placeholder="Ex.: Habilitar empresa"
        />
      </AppFormField>
      <AppFormField label="Código *">
        <UInput
          v-model="form.code"
          placeholder="Ex.: enable_company"
        />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput
          v-model="form.description"
          placeholder="Explique o que a feature libera"
        />
      </AppFormField>
      <AppFormField label="Ativa">
        <USwitch v-model="form.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir feature"
      :description="pendingDelete ? `“${pendingDelete.name}” será removida. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "listagem"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A app/pages/cadastros/feature-flags.vue app/pages/configuracoes/feature-flags.vue tests/feature-flags-cargos.spec.ts
git commit -m "feat(feature-flags): move listagem para /configuracoes, remove modal de vinculo"
```

---

### Task 9: Mover `cargos.vue` para Configurações, remover modal, `navigateTo`

**Files:**
- Delete: `app/pages/cadastros/cargos.vue`
- Create: `app/pages/configuracoes/cargos.vue`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Troque todo o describe `'página Cadastros · Cargos'` por:

```ts
describe('página Configurações · Cargos (listagem)', () => {
  const source = readFileSync('app/pages/configuracoes/cargos.vue', 'utf8')

  it('materializa CRUD completo com MetricsStrip, DataTable e modais', () => {
    expect(source).toContain('MetricsStrip')
    expect(source).toContain('<DataTable')
    expect(source).toContain('variant="form"')
    expect(source).toContain('variant="confirm"')
    expect(source).toContain('Novo cargo')
  })

  it('Ver usuários navega para a página de detalhe em vez de abrir modal', () => {
    expect(source).toContain("key: 'users'")
    expect(source).toContain('Ver usuários')
    expect(source).toContain('navigateTo(`/configuracoes/cargos/${payload.row.id}`)')
    expect(source).not.toContain('Vincular usuários')
    expect(source).not.toContain('usersOpen')
  })

  it('coluna Criado em aparece na tabela (Cargo ganha createdAt)', () => {
    expect(source).toContain("key: 'createdAt'")
    expect(source).toContain('Criado em')
  })

  it('não tem abas nem gráfico (fora de escopo para Cargos)', () => {
    expect(source).not.toContain('ChartPanel')
    expect(source).not.toContain('DonutChart')
    expect(source).not.toContain('StackedBarChart')
    expect(source).not.toContain('aria-label="Abas')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Cargos (listagem)"`
Expected: FAIL — `app/pages/configuracoes/cargos.vue` ainda não existe.

- [ ] **Step 3: Implementar — apagar o arquivo antigo e criar o novo**

Delete `app/pages/cadastros/cargos.vue`.

Crie `app/pages/configuracoes/cargos.vue`:

```vue
<script setup lang="ts">
/**
 * Configurações → Cargos — CRUD de cargos (mock). O vínculo N:N com Usuário
 * (kind 'usuarios' em cadastros-onda3.ts) vive na página de detalhe
 * (/configuracoes/cargos/:id) — "Ver usuários" navega em vez de abrir modal.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { Cargo } from '~/data/demo/cargos'
import {
  buildCargosMetrics,
  createEmptyCargo,
  getCargos,
  linkedUsersCount,
  setCargos
} from '~/data/demo/cargos'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

useSeoMeta({ title: 'Cargos · Configurações · Via Reversa' })

interface CargoDisplayRow extends Record<string, unknown> {
  id: string
  name: string
  detail: string
  active: boolean
  createdAt: string
  linkedCount: number
}

const toast = useToast()

const rows = ref<Cargo[]>(structuredClone(getCargos()))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<Cargo | null>(null)
const form = reactive(createEmptyCargo())

const columns: DataTableColumn<CargoDisplayRow>[] = [
  { type: 'text', key: 'name', label: 'Cargo', width: '26%', secondaryKey: 'detail' },
  { type: 'text', key: 'createdAt', label: 'Criado em', width: '110px' },
  { type: 'text', key: 'linkedCount', label: 'Usuários', width: '100px', align: 'right' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '72px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '210px',
    items: (row) => [
      { key: 'users', label: 'Ver usuários', icon: 'i-lucide-users', variant: 'ghost', ariaLabel: `Ver usuários de ${row.name}` },
      { key: 'edit', label: 'Editar', icon: 'i-lucide-pencil', variant: 'ghost', ariaLabel: `Editar ${row.name}` },
      { key: 'delete', label: 'Excluir', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Excluir ${row.name}` }
    ]
  }
]

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    [row.name, row.detail].some((value) => value.toLowerCase().includes(query))
  )
})

const listMetrics = computed(() => buildCargosMetrics(filteredRows.value))
const pagedRows = computed(() => slicePage(filteredRows.value, page.value, pageSize.value))
const displayRows = computed((): CargoDisplayRow[] =>
  pagedRows.value.map((row) => ({ ...row, linkedCount: linkedUsersCount(row.id) }))
)

watch(search, () => {
  page.value = 1
})

function persist() {
  setCargos(structuredClone(rows.value))
}

function resetForm() {
  Object.assign(form, createEmptyCargo())
  editingId.value = null
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(row: Cargo) {
  editingId.value = row.id
  form.name = row.name
  form.detail = row.detail
  form.active = row.active
  form.createdAt = row.createdAt
  formOpen.value = true
}

function openDelete(row: Cargo) {
  pendingDelete.value = row
  deleteOpen.value = true
}

function onAction(payload: { row: CargoDisplayRow; action: string }) {
  if (payload.action === 'users') navigateTo(`/configuracoes/cargos/${payload.row.id}`)
  if (payload.action === 'edit') openEdit(payload.row)
  if (payload.action === 'delete') openDelete(payload.row)
}

function onSwitch(payload: { row: CargoDisplayRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = rows.value.find((row) => row.id === payload.row.id)
  if (target) {
    target.active = payload.value
    persist()
  }
}

function saveForm() {
  if (!form.name.trim()) {
    toast.error('Campo obrigatório', 'Informe o nome do cargo antes de salvar.')
    return
  }

  if (editingId.value) {
    const target = rows.value.find((row) => row.id === editingId.value)
    if (target) {
      target.name = form.name.trim()
      target.detail = form.detail.trim()
      target.active = form.active
    }
  }
  else {
    const created: Cargo = {
      id: `cgo-${Date.now()}`,
      name: form.name.trim(),
      detail: form.detail.trim(),
      active: form.active,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }
    rows.value = [created, ...rows.value]
  }

  const wasEdit = Boolean(editingId.value)
  persist()
  formOpen.value = false
  resetForm()
  toast.success(wasEdit ? 'Salvo' : 'Criado', `Cargo ${wasEdit ? 'atualizado' : 'criado'} (mock).`)
}

function confirmDelete() {
  if (!pendingDelete.value) return
  rows.value = rows.value.filter((row) => row.id !== pendingDelete.value!.id)
  persist()
  toast.success('Excluído', `${pendingDelete.value.name} removido (mock).`)
  pendingDelete.value = null
  deleteOpen.value = false
}
</script>

<template>
  <div class="cargos-page">
    <PageHeader
      title="Cargos"
      subtitle="Cargos vinculados a usuários do sistema (mock)"
    >
      <AppButton
        variant="primary"
        icon="i-lucide-plus"
        @click="openCreate"
      >
        Novo cargo
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
        placeholder="Buscar cargo…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
    </section>

    <DataTable
      :columns="columns"
      :rows="displayRows"
      min-width="760px"
      empty-title="Nenhum cargo"
      empty-description="Cadastre o primeiro cargo ou ajuste a busca."
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
      :title="editingId ? 'Editar cargo' : 'Novo cargo'"
      :description="editingId ? 'Atualize os dados do cargo.' : 'Informe os dados do novo cargo.'"
      :confirm-label="editingId ? 'Salvar' : 'Criar'"
      @confirm="saveForm"
    >
      <AppFormField label="Nome *">
        <UInput
          v-model="form.name"
          placeholder="Ex.: Coordenador de Operações"
        />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput
          v-model="form.detail"
          placeholder="Descreva a responsabilidade do cargo"
        />
      </AppFormField>
      <AppFormField label="Ativo">
        <USwitch v-model="form.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="deleteOpen"
      variant="confirm"
      title="Excluir cargo"
      :description="pendingDelete ? `“${pendingDelete.name}” será removido. Esta ação não pode ser desfeita.` : ''"
      confirm-label="Excluir"
      @confirm="confirmDelete"
    />
  </div>
</template>
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Cargos (listagem)"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A app/pages/cadastros/cargos.vue app/pages/configuracoes/cargos.vue tests/feature-flags-cargos.spec.ts
git commit -m "feat(cargos): move listagem para /configuracoes, remove modal de vinculo"
```

---

### Task 10: Criar `app/pages/configuracoes/feature-flags/[id].vue`

**Files:**
- Create: `app/pages/configuracoes/feature-flags/[id].vue`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Adicione em `tests/feature-flags-cargos.spec.ts` (depois do describe `'página Configurações · Feature Flags (listagem)'`):

```ts
describe('página Configurações · Feature Flags (detalhe)', () => {
  const source = readFileSync('app/pages/configuracoes/feature-flags/[id].vue', 'utf8')

  it('busca a feature pela rota e 404 quando não existe', () => {
    expect(source).toContain('route.params.id')
    expect(source).toContain('createError({ statusCode: 404')
  })

  it('mostra MetricsStrip de detalhe e a tabela de operadores vinculados com switch e remoção', () => {
    expect(source).toContain('buildFeatureDetailMetrics')
    expect(source).toContain('<DataTable')
    expect(source).toContain("type: 'switch'")
    expect(source).toContain("key: 'remove'")
    expect(source).toContain('getCadastroOnda3Rows')
  })

  it('permite editar a feature e vincular novos operadores por modal picker', () => {
    expect(source).toContain('Editar feature')
    expect(source).toContain('Vincular operadores')
    expect(source).toContain('multiple')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Feature Flags (detalhe)"`
Expected: FAIL — arquivo não existe.

- [ ] **Step 3: Implementar**

Crie `app/pages/configuracoes/feature-flags/[id].vue`:

```vue
<script setup lang="ts">
/**
 * Configurações → Feature Flags → detalhe — informações da feature + gestão dos
 * vínculos com Operador (kind 'contas' em cadastros-onda3.ts). Substitui o antigo
 * modal "Operadores" da listagem.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { CadastroOnda3Row } from '~/data/demo/cadastros-onda3'
import { getCadastroOnda3Rows } from '~/data/demo/cadastros-onda3'
import type { Feature, FeatureOperatorLink } from '~/data/demo/features'
import {
  buildFeatureDetailMetrics,
  featureOperatorOptions,
  getFeatureLinks,
  getFeatures,
  setFeatureLinks,
  setFeatures
} from '~/data/demo/features'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

interface OperatorLinkRow extends Record<string, unknown> {
  id: string
  accountId: string
  name: string
  detail: string
  meta: string
  tipo: string
  linkedAt: string
  active: boolean
}

const route = useRoute()
const toast = useToast()
const featureId = computed(() => String(route.params.id ?? ''))

const feature = ref<Feature | null>(null)

function loadFeature() {
  const found = getFeatures().find((row) => row.id === featureId.value)
  feature.value = found ? structuredClone(found) : null
}
loadFeature()

if (!feature.value) {
  throw createError({ statusCode: 404, statusMessage: 'Feature não encontrada' })
}

useSeoMeta({ title: () => `${feature.value?.name ?? 'Feature'} · Configurações · Via Reversa` })

const links = ref<FeatureOperatorLink[]>(structuredClone(getFeatureLinks(featureId.value)))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const editOpen = ref(false)
const editForm = reactive({ name: '', code: '', description: '', active: true })

const pickerOpen = ref(false)
const selectedOperatorIds = ref<string[]>([])

const accountsById = computed(() => new Map(getCadastroOnda3Rows('contas').map((row) => [row.id, row])))

const enrichedLinks = computed((): OperatorLinkRow[] =>
  links.value.map((link) => {
    const account: CadastroOnda3Row | undefined = accountsById.value.get(link.accountId)
    return {
      id: link.id,
      accountId: link.accountId,
      name: account?.name ?? link.accountId,
      detail: account?.detail ?? '—',
      meta: account?.meta ?? '—',
      tipo: account?.tipo ?? '—',
      linkedAt: link.linkedAt,
      active: link.active
    }
  })
)

const filteredLinks = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return enrichedLinks.value
  return enrichedLinks.value.filter((row) =>
    [row.name, row.detail, row.meta, row.tipo].some((value) => value.toLowerCase().includes(query))
  )
})

const pagedLinks = computed(() => slicePage(filteredLinks.value, page.value, pageSize.value))
const metrics = computed(() => (feature.value ? buildFeatureDetailMetrics(feature.value, links.value) : []))

const availableOperatorOptions = computed(() =>
  featureOperatorOptions().filter((opt) => !links.value.some((link) => link.accountId === opt.value))
)

const linkColumns: DataTableColumn<OperatorLinkRow>[] = [
  { type: 'text', key: 'name', label: 'Operador', width: '22%', secondaryKey: 'detail' },
  { type: 'text', key: 'meta', label: 'Operação / UF', width: '16%' },
  { type: 'text', key: 'tipo', label: 'Tipo', width: '120px' },
  { type: 'text', key: 'linkedAt', label: 'Vinculado em', width: '130px' },
  { type: 'switch', key: 'active', label: 'Ativo', width: '80px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '100px',
    items: (row) => [
      { key: 'remove', label: 'Remover', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Remover ${row.name}` }
    ]
  }
]

watch(search, () => {
  page.value = 1
})

function openEditFeature() {
  if (!feature.value) return
  editForm.name = feature.value.name
  editForm.code = feature.value.code
  editForm.description = feature.value.description
  editForm.active = feature.value.active
  editOpen.value = true
}

function saveEditFeature() {
  if (!feature.value) return
  if (!editForm.name.trim() || !editForm.code.trim()) {
    toast.error('Campo obrigatório', 'Informe nome e código antes de salvar.')
    return
  }
  const updatedId = feature.value.id
  const rows = getFeatures().map((row) =>
    row.id === updatedId
      ? { ...row, name: editForm.name.trim(), code: editForm.code.trim(), description: editForm.description.trim(), active: editForm.active }
      : row
  )
  setFeatures(rows)
  loadFeature()
  editOpen.value = false
  toast.success('Salvo', 'Feature atualizada (mock).')
}

function openPicker() {
  selectedOperatorIds.value = []
  pickerOpen.value = true
}

function confirmPicker() {
  if (!selectedOperatorIds.value.length) {
    toast.error('Selecione ao menos 1 operador', 'Escolha na lista antes de vincular.')
    return
  }
  const created = selectedOperatorIds.value.map((accountId) => ({
    id: `flk-${Date.now()}-${accountId}`,
    featureId: featureId.value,
    accountId,
    active: true,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }))
  links.value = [...created, ...links.value]
  setFeatureLinks(featureId.value, links.value)
  pickerOpen.value = false
  selectedOperatorIds.value = []
  toast.success('Vinculado', 'Operadores vinculados à feature (mock).')
}

function onLinkSwitch(payload: { row: OperatorLinkRow; key: string; value: boolean }) {
  if (payload.key !== 'active') return
  const target = links.value.find((link) => link.id === payload.row.id)
  if (target) {
    target.active = payload.value
    setFeatureLinks(featureId.value, links.value)
  }
}

function onLinkAction(payload: { row: OperatorLinkRow; action: string }) {
  if (payload.action !== 'remove') return
  links.value = links.value.filter((link) => link.id !== payload.row.id)
  setFeatureLinks(featureId.value, links.value)
  toast.success('Removido', 'Vínculo de operador removido (mock).')
}
</script>

<template>
  <div
    v-if="feature"
    class="feature-flag-detail"
  >
    <PageHeader
      back-to="/configuracoes/feature-flags"
      :title="feature.name"
      :subtitle="`${feature.code} · ${feature.active ? 'Ativa' : 'Inativa'}`"
    >
      <AppButton
        icon="i-lucide-pencil"
        @click="openEditFeature"
      >
        Editar
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="metrics" />

    <dl class="m-0 grid gap-3 border-b border-via-line bg-via-surface px-[18px] py-4 md:grid-cols-2">
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Código</dt>
        <dd class="numeric m-0 text-via-ink">{{ feature.code }}</dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Status</dt>
        <dd
          class="m-0 font-bold"
          :class="feature.active ? 'text-via-green' : 'text-via-red'"
        >
          {{ feature.active ? 'Ativa' : 'Inativa' }}
        </dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs md:col-span-2">
        <dt class="m-0 text-via-muted">Descrição</dt>
        <dd class="m-0 text-via-ink">{{ feature.description || '—' }}</dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Criada em</dt>
        <dd class="numeric m-0 text-via-ink">{{ feature.createdAt }}</dd>
      </div>
    </dl>

    <section
      class="flex min-h-[58px] items-center justify-between gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar operador…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <AppButton
        variant="secondary"
        icon="i-lucide-plus"
        @click="openPicker"
      >
        Vincular operadores
      </AppButton>
    </section>

    <DataTable
      :columns="linkColumns"
      :rows="pagedLinks"
      min-width="880px"
      empty-title="Nenhum operador vinculado"
      empty-description="Vincule operadores a esta feature ou ajuste a busca."
      @action="onLinkAction"
      @update:switch="onLinkSwitch"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredLinks.length"
    />

    <AppModal
      v-model:open="editOpen"
      variant="form"
      title="Editar feature"
      description="Atualize os dados da feature."
      confirm-label="Salvar"
      @confirm="saveEditFeature"
    >
      <AppFormField label="Nome *">
        <UInput v-model="editForm.name" />
      </AppFormField>
      <AppFormField label="Código *">
        <UInput v-model="editForm.code" />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput v-model="editForm.description" />
      </AppFormField>
      <AppFormField label="Ativa">
        <USwitch v-model="editForm.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="pickerOpen"
      variant="form"
      title="Vincular operadores"
      description="Selecione operadores para vincular a esta feature."
      confirm-label="Vincular"
      @confirm="confirmPicker"
    >
      <AppFormField label="Operadores *">
        <USelectMenu
          v-model="selectedOperatorIds"
          multiple
          value-key="value"
          :items="availableOperatorOptions"
          placeholder="Selecione um ou mais operadores"
        />
      </AppFormField>
    </AppModal>
  </div>
</template>
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Feature Flags (detalhe)"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/configuracoes/feature-flags/[id].vue tests/feature-flags-cargos.spec.ts
git commit -m "feat(feature-flags): cria pagina de detalhe com gestao de operadores vinculados"
```

---

### Task 11: Criar `app/pages/configuracoes/cargos/[id].vue`

**Files:**
- Create: `app/pages/configuracoes/cargos/[id].vue`
- Test: `tests/feature-flags-cargos.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Adicione em `tests/feature-flags-cargos.spec.ts` (depois do describe `'página Configurações · Cargos (listagem)'`):

```ts
describe('página Configurações · Cargos (detalhe)', () => {
  const source = readFileSync('app/pages/configuracoes/cargos/[id].vue', 'utf8')

  it('busca o cargo pela rota e 404 quando não existe', () => {
    expect(source).toContain('route.params.id')
    expect(source).toContain('createError({ statusCode: 404')
  })

  it('mostra MetricsStrip de detalhe e a tabela de usuários vinculados (sem switch, com remoção)', () => {
    expect(source).toContain('buildCargoDetailMetrics')
    expect(source).toContain('<DataTable')
    expect(source).toContain("key: 'remove'")
    expect(source).toContain('getCadastroOnda3Rows')
  })

  it('permite editar o cargo e vincular novos usuários por modal picker', () => {
    expect(source).toContain('Editar cargo')
    expect(source).toContain('Vincular usuários')
    expect(source).toContain('multiple')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Cargos (detalhe)"`
Expected: FAIL — arquivo não existe.

- [ ] **Step 3: Implementar**

Crie `app/pages/configuracoes/cargos/[id].vue`:

```vue
<script setup lang="ts">
/**
 * Configurações → Cargos → detalhe — informações do cargo + gestão dos vínculos com
 * Usuário (kind 'usuarios' em cadastros-onda3.ts). Substitui o antigo modal "Usuários"
 * da listagem.
 */
import type { DataTableColumn } from '~/types/data-table'
import type { CadastroOnda3Row } from '~/data/demo/cadastros-onda3'
import { getCadastroOnda3Rows } from '~/data/demo/cadastros-onda3'
import type { Cargo, CargoUserLink } from '~/data/demo/cargos'
import {
  buildCargoDetailMetrics,
  cargoUserOptions,
  getCargoLinks,
  getCargos,
  setCargoLinks,
  setCargos
} from '~/data/demo/cargos'
import { DEFAULT_PAGE_SIZE, slicePage } from '~/utils/pagination'
import { useToast } from '~/composables/useToast'

interface UserLinkRow extends Record<string, unknown> {
  id: string
  userId: string
  name: string
  detail: string
  meta: string
  keyword: string
  isTransporterLabel: string
  active: boolean
  linkedAt: string
}

const route = useRoute()
const toast = useToast()
const cargoId = computed(() => String(route.params.id ?? ''))

const cargo = ref<Cargo | null>(null)

function loadCargo() {
  const found = getCargos().find((row) => row.id === cargoId.value)
  cargo.value = found ? structuredClone(found) : null
}
loadCargo()

if (!cargo.value) {
  throw createError({ statusCode: 404, statusMessage: 'Cargo não encontrado' })
}

useSeoMeta({ title: () => `${cargo.value?.name ?? 'Cargo'} · Configurações · Via Reversa` })

const links = ref<CargoUserLink[]>(structuredClone(getCargoLinks(cargoId.value)))
const search = ref('')
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const editOpen = ref(false)
const editForm = reactive({ name: '', detail: '', active: true })

const pickerOpen = ref(false)
const selectedUserIds = ref<string[]>([])

const usersById = computed(() => new Map(getCadastroOnda3Rows('usuarios').map((row) => [row.id, row])))

const linkedUserRows = computed(() =>
  links.value
    .map((link) => {
      const user: CadastroOnda3Row | undefined = usersById.value.get(link.userId)
      return user ? { link, user } : null
    })
    .filter((entry): entry is { link: CargoUserLink; user: CadastroOnda3Row } => entry !== null)
)

const enrichedLinks = computed((): UserLinkRow[] =>
  linkedUserRows.value.map(({ link, user }) => ({
    id: link.id,
    userId: link.userId,
    name: user.name,
    detail: user.detail,
    meta: user.meta,
    keyword: user.keyword ?? '—',
    isTransporterLabel: user.isTransporter ? 'Sim' : 'Não',
    active: user.active,
    linkedAt: link.linkedAt
  }))
)

const filteredLinks = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return enrichedLinks.value
  return enrichedLinks.value.filter((row) =>
    [row.name, row.detail, row.meta, row.keyword].some((value) => value.toLowerCase().includes(query))
  )
})

const pagedLinks = computed(() => slicePage(filteredLinks.value, page.value, pageSize.value))
const metrics = computed(() =>
  cargo.value ? buildCargoDetailMetrics(cargo.value, linkedUserRows.value.map(({ user }) => user)) : []
)

const availableUserOptions = computed(() =>
  cargoUserOptions().filter((opt) => !links.value.some((link) => link.userId === opt.value))
)

const linkColumns: DataTableColumn<UserLinkRow>[] = [
  { type: 'text', key: 'name', label: 'Usuário', width: '20%', secondaryKey: 'detail' },
  { type: 'text', key: 'meta', label: 'Papel', width: '14%' },
  { type: 'text', key: 'keyword', label: 'E-mail', width: '22%' },
  { type: 'text', key: 'isTransporterLabel', label: 'Transportador', width: '120px' },
  { type: 'text', key: 'linkedAt', label: 'Vinculado em', width: '130px' },
  {
    type: 'actions',
    key: 'actions',
    label: 'Ações',
    width: '90px',
    items: (row) => [
      { key: 'remove', label: 'Remover', icon: 'i-lucide-trash-2', variant: 'ghost', ariaLabel: `Remover ${row.name}` }
    ]
  }
]

watch(search, () => {
  page.value = 1
})

function openEditCargo() {
  if (!cargo.value) return
  editForm.name = cargo.value.name
  editForm.detail = cargo.value.detail
  editForm.active = cargo.value.active
  editOpen.value = true
}

function saveEditCargo() {
  if (!cargo.value) return
  if (!editForm.name.trim()) {
    toast.error('Campo obrigatório', 'Informe o nome do cargo antes de salvar.')
    return
  }
  const updatedId = cargo.value.id
  const rows = getCargos().map((row) =>
    row.id === updatedId
      ? { ...row, name: editForm.name.trim(), detail: editForm.detail.trim(), active: editForm.active }
      : row
  )
  setCargos(rows)
  loadCargo()
  editOpen.value = false
  toast.success('Salvo', 'Cargo atualizado (mock).')
}

function openPicker() {
  selectedUserIds.value = []
  pickerOpen.value = true
}

function confirmPicker() {
  if (!selectedUserIds.value.length) {
    toast.error('Selecione ao menos 1 usuário', 'Escolha na lista antes de vincular.')
    return
  }
  const created = selectedUserIds.value.map((userId) => ({
    id: `cul-${Date.now()}-${userId}`,
    cargoId: cargoId.value,
    userId,
    linkedAt: new Date().toLocaleDateString('pt-BR')
  }))
  links.value = [...created, ...links.value]
  setCargoLinks(cargoId.value, links.value)
  pickerOpen.value = false
  selectedUserIds.value = []
  toast.success('Vinculado', 'Usuários vinculados ao cargo (mock).')
}

function onLinkAction(payload: { row: UserLinkRow; action: string }) {
  if (payload.action !== 'remove') return
  links.value = links.value.filter((link) => link.id !== payload.row.id)
  setCargoLinks(cargoId.value, links.value)
  toast.success('Removido', 'Vínculo de usuário removido (mock).')
}
</script>

<template>
  <div
    v-if="cargo"
    class="cargo-detail"
  >
    <PageHeader
      back-to="/configuracoes/cargos"
      :title="cargo.name"
      :subtitle="cargo.active ? 'Ativo' : 'Inativo'"
    >
      <AppButton
        icon="i-lucide-pencil"
        @click="openEditCargo"
      >
        Editar
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="metrics" />

    <dl class="m-0 grid gap-3 border-b border-via-line bg-via-surface px-[18px] py-4 md:grid-cols-2">
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Status</dt>
        <dd
          class="m-0 font-bold"
          :class="cargo.active ? 'text-via-green' : 'text-via-red'"
        >
          {{ cargo.active ? 'Ativo' : 'Inativo' }}
        </dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs">
        <dt class="m-0 text-via-muted">Criado em</dt>
        <dd class="numeric m-0 text-via-ink">{{ cargo.createdAt }}</dd>
      </div>
      <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-2 text-xs md:col-span-2">
        <dt class="m-0 text-via-muted">Descrição</dt>
        <dd class="m-0 text-via-ink">{{ cargo.detail || '—' }}</dd>
      </div>
    </dl>

    <section
      class="flex min-h-[58px] items-center justify-between gap-2 border-b border-via-line px-[18px] py-[9px]"
      aria-label="Filtros"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar usuário…"
        class="w-[280px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <AppButton
        variant="secondary"
        icon="i-lucide-plus"
        @click="openPicker"
      >
        Vincular usuários
      </AppButton>
    </section>

    <DataTable
      :columns="linkColumns"
      :rows="pagedLinks"
      min-width="880px"
      empty-title="Nenhum usuário vinculado"
      empty-description="Vincule usuários a este cargo ou ajuste a busca."
      @action="onLinkAction"
    />

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="filteredLinks.length"
    />

    <AppModal
      v-model:open="editOpen"
      variant="form"
      title="Editar cargo"
      description="Atualize os dados do cargo."
      confirm-label="Salvar"
      @confirm="saveEditCargo"
    >
      <AppFormField label="Nome *">
        <UInput v-model="editForm.name" />
      </AppFormField>
      <AppFormField label="Descrição">
        <UInput v-model="editForm.detail" />
      </AppFormField>
      <AppFormField label="Ativo">
        <USwitch v-model="editForm.active" />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="pickerOpen"
      variant="form"
      title="Vincular usuários"
      description="Selecione usuários para vincular a este cargo."
      confirm-label="Vincular"
      @confirm="confirmPicker"
    >
      <AppFormField label="Usuários *">
        <USelectMenu
          v-model="selectedUserIds"
          multiple
          value-key="value"
          :items="availableUserOptions"
          placeholder="Selecione um ou mais usuários"
        />
      </AppFormField>
    </AppModal>
  </div>
</template>
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run tests/feature-flags-cargos.spec.ts -t "Cargos (detalhe)"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/pages/configuracoes/cargos/[id].vue tests/feature-flags-cargos.spec.ts
git commit -m "feat(cargos): cria pagina de detalhe com gestao de usuarios vinculados"
```

---

### Task 12: Atualizar `tests/routes.spec.ts` com os caminhos novos

**Files:**
- Modify: `tests/routes.spec.ts`

- [ ] **Step 1: Escrever o teste (RED)**

Em `tests/routes.spec.ts`, troque as linhas:

```ts
  ['app/pages/cadastros/feature-flags.vue', 'MetricsStrip'],
  ['app/pages/cadastros/feature-flags.vue', 'DonutChart'],
  ['app/pages/cadastros/feature-flags.vue', 'StackedBarChart'],
  ['app/pages/cadastros/cargos.vue', 'MetricsStrip'],
  ['app/pages/cadastros/cargos.vue', 'AppModal'],
```

por:

```ts
  ['app/pages/configuracoes/feature-flags.vue', 'MetricsStrip'],
  ['app/pages/configuracoes/feature-flags.vue', 'DonutChart'],
  ['app/pages/configuracoes/feature-flags.vue', 'StackedBarChart'],
  ['app/pages/configuracoes/feature-flags/[id].vue', 'MetricsStrip'],
  ['app/pages/configuracoes/feature-flags/[id].vue', 'DataTable'],
  ['app/pages/configuracoes/cargos.vue', 'MetricsStrip'],
  ['app/pages/configuracoes/cargos.vue', 'AppModal'],
  ['app/pages/configuracoes/cargos/[id].vue', 'MetricsStrip'],
  ['app/pages/configuracoes/cargos/[id].vue', 'DataTable'],
```

- [ ] **Step 2: Rodar e confirmar sucesso**

(As páginas de destino já existem desde as Tasks 8–11 — este passo só corrige as referências do teste, não deveria falhar. Ainda assim, rode antes e depois para confirmar.)

Run: `npx vitest run tests/routes.spec.ts`
Expected: PASS (se falhar, revise se as Tasks 8–11 foram aplicadas antes desta).

- [ ] **Step 3: Commit**

```bash
git add tests/routes.spec.ts
git commit -m "test(routes): atualiza caminhos de feature-flags/cargos para /configuracoes"
```

---

### Task 13: Verificação final

**Files:** nenhum (só validação)

- [ ] **Step 1: Suíte de testes completa**

Run: `npm run test:run`
Expected: todos os arquivos verdes, incluindo `tests/feature-flags-cargos.spec.ts`, `tests/navigation.spec.ts`, `tests/sidebar-orders.spec.ts`, `tests/routes.spec.ts`, `tests/components.spec.ts`, `tests/import-paths.spec.ts`, `tests/design-contract.spec.ts`.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: 0 erros — confira em especial os 2 arquivos `[id].vue` novos (tipos de `DataTableColumn<...>`, `CadastroOnda3Row | undefined`, `structuredClone`).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: 0 erros/warnings — confira ordenação alfabética dos imports nomeados (padrão do repositório) nos arquivos tocados.

- [ ] **Step 4: Revisão manual dos banimentos do CLAUDE.md**

Releia `app/pages/configuracoes/feature-flags/[id].vue` e `app/pages/configuracoes/cargos/[id].vue`: sem cartão arredondado em excesso, sem ícone em fundo pastel, sem badge decorativo, sem status sem texto (o bloco `<dl>` de Status usa texto "Ativa"/"Inativa" com cor, nunca só cor ou só ícone), "ponto de apoio" escrito por extenso onde aparecer.

- [ ] **Step 5: Commit final (se houver ajustes da revisão)**

```bash
git add -A
git commit -m "chore: ajustes finais de verificacao (test/typecheck/lint)"
```

(Não rode `npm run build` — fica para verificação manual posterior, fora deste plano.)
