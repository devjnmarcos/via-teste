# Via Reversa — Design system oficial

Este arquivo é o manual local de implementação do frontend. A referência visual canônica é a suíte V12 aprovada no workspace, junto ao handoff em `../../handoff-claude-design/`.

## Stack

- Nuxt 4 + Vue 3 + TypeScript.
- Nuxt UI 4 para primitives acessíveis e overlays.
- Tailwind CSS 4 com tokens CSS-first em `app/assets/css/main.css`.
- Lucide via Iconify/Nuxt Icon, usando coleção local.
- Vitest + Nuxt Test Utils.

## Estrutura

```text
app/
  assets/css/main.css       tokens e regras globais
  components/app/           shell e primitives
  components/charts/        gráficos Chart.js + vue-chartjs (wrappers DS)
  components/operations/    Home, operação e execução ao vivo
  components/orders/        tabelas, jornada e detalhe
  data/demo/                fixtures determinísticas
  pages/                    rotas
  types/                    contratos de domínio
```

## Referência visual

O padrão é um canvas contínuo com sidebar escura, topbar clara, divisores e superfícies quase brancas. Métricas usam faixa contínua; tabelas, gráficos e jornadas não são colocados em uma grade de cartões arredondados.

Valores oficiais:

- texto principal: `oklch(25% 0.025 253)`;
- texto secundário: `oklch(51% 0.022 253)`;
- superfície: `oklch(99% 0.004 253)`;
- azul de ação: `oklch(62% 0.19 254)`;
- verde: `oklch(59% 0.13 146)`;
- âmbar: `oklch(68% 0.14 73)`;
- vermelho: `oklch(59% 0.19 27)`;
- fonte: `"Segoe UI", Roboto, Arial, sans-serif`;
- corpo: 13px;
- auxiliar: 11px;
- título de página: 20px;
- métrica: 22–24px;
- controles: raio 5–6px;
- dados: raio 0–2px;
- shell: raio 9px apenas nos cantos externos.

## Componentes oficiais

Reutilize, nesta ordem:

1. `UButton`, `UInput`, `USelectMenu`, `USwitch`, `UTable`, `UTabs`, `USlideover`, `UModal`, `UTooltip`, `USkeleton`, `UAlert` e `UIcon`.
2. `AppSidebar`, `AppTopbar`, `PageHeader`, `MetricsStrip`, `StatusLabel`, `AppButton`, `AppModal`, `AppToast`, `AppToastHost`, `DataTable`, `Pagination` e `EmptyState`.
3. `OperationsBoard`, `OperationFlow`, `AttentionQueue`, `OrdersTable`, `OrderCreateWizard`, `OrderCreateStepper`, `OrderJourney`, `OrderSummary`, `OrderItemsPanel`, `OrderOccurrencesPanel`, `OrderEvidencesPanel`, `OrderSchedulingPanel`, `OrderHistoryPanel`, `DecisionPanel`, `VolumeTrendChart` e `StatusDistribution`.

### AppToast

Notificações efêmeras Via. Host no layout (`AppToastHost`); API em `useToast()`:

| Método | Uso |
|--------|-----|
| `success(title, description?)` | Conclusão de ação (ex.: pedido criado) |
| `error(title, description?)` | Falha / validação ao avançar step |
| `info(title, description?)` | Aviso neutro |
| `dismiss(id)` / `clear()` | Fechar |

Tons usam tokens `--via-green` / `--via-red` / `--via-blue`. Auto-dismiss ~4s.

### AppModal (CRUD)

Anatomia fixa em três regiões — não inventar layout paralelo por tela:

| Região | Conteúdo |
|--------|----------|
| Header | Título (ação + entidade), descrição curta, fechar |
| Content | **form** (create/edit) **ou** **confirm** / **confirm-keyword** (delete) — mutuamente exclusivos |
| Footer | Somente `AppButton` (`primary`, `secondary`, `ghost`, `danger`) |

Variantes:

- `form` — campos no body; Cancelar + Salvar/Criar.
- `confirm` — confirmação simples; Cancelar + Excluir (`danger`).
- `confirm-keyword` — Excluir desabilitado até digitar o identificador (`keyword`). Usar só em entidades críticas (ex.: Usuários).

**Modal vs página (híbrido):** formulário curto → modal; longo / multi-seção / permissões / anexos → página (`/novo`, `/[id]`).

### DataTable tipada

Contrato em `app/types/data-table.ts`. Colunas discriminadas por `type`:

| `type` | Papel |
|--------|-------|
| `text` | Leitura (`strong` + `secondaryKey` opcional) |
| `switch` | Toggle na linha → `update:switch` |
| `select` | Select na linha → `update:select` |
| `actions` | Grupo de ações via `AppButton` → `action` |
| `expand` | Expande linha; conteúdo no slot `#expand="{ row }"` |

Modo legado: sem prop `rows`, o `tbody` usa o slot padrão (header tipográfico + hover suave). Pedidos/operação podem migrar depois; Cadastros consome o contrato tipado.

Hover global das tabelas: `transition` + `color-mix` com `--via-blue-soft` — preservar.

Não criar tabela paralela que destoe do visual (header `surface-2`, tipografia 10/12px, hover suave).

### Pagination

Primitive de listagens longas em `app/components/app/Pagination.vue` (contrato em `app/types/pagination.ts` + helpers em `app/utils/pagination.ts`).

| Prop / modelo | Papel |
|---------------|--------|
| `v-model:page` | Página atual (1-based); clampa ao mudar `total` / `pageSize` |
| `v-model:pageSize` | Itens por página (default legado: 25; opções 10/25/50) |
| `total` | Total no escopo filtrado |
| `showSummary` | Texto “Exibindo a–b de total” com `aria-live="polite"` |
| `showPageSize` | Seletor “Itens por página” |
| `disabled` | Bloqueia controles (loading) |
| `ariaLabel` | Label do `<nav>` (default: “Paginação”) |

**Composição (fase 1):** fatia client-side na página — `DataTable` recebe `pagedRows`; `Pagination` fica abaixo com `border-top` e fundo `--via-surface`. Não embutir paginação na `DataTable` até várias telas repetirem o mesmo boilerplate.

Não usar `UPagination` solto sem o wrapper Via (summary, page size, a11y e tokens).

Não criar uma variante local de botão, tab ou status se a necessidade já estiver coberta por esses componentes.

## Regras de tela

- Home: panorama das operações; não concentrar execução detalhada.
- Operação por ID: cinco métricas, fluxo de cinco estágios, clientes e análises.
- Operação ao vivo: tabela de pedidos ativos e fila lateral de atenção.
- Pedidos: métricas, tabs, filtros e tabela navegável.
- Pedido por ID: jornada horizontal, contadores, tabs, resumo, estabelecimentos e decisão.

## Status e iconografia

Status sempre usa ponto colorido + label. Não depender apenas de cor. Ícones usam `i-lucide-*`, 14–20px, traço linear e `currentColor`. Não usar ícones em caixas pastéis.

## Gráficos

**Lib oficial:** Chart.js 4 + vue-chartjs. Todos os gráficos do app passam por wrappers em `app/components/charts/` + tema em `app/utils/chart-theme.ts` (cores hex alinhadas aos tokens Via, animação padrão, layout/padding para labels sem corte).

| Wrapper | Uso |
|---------|-----|
| `ChartPanel` | Header + body de painel contínuo (Dashboard Reversa) |
| `VolumeTrendChart` | Linha com fill (Home, Operação, Acompanhamento) |
| `StatusDistribution` | Barras horizontais por status |
| `StackedBarChart` | Barras empilhadas VOL/INVOL |
| `DonutChart` | VOL × INVOL |
| `ComboBarLineChart` | Barras + linha (Mailing) |
| `PercentTrendChart` | Linha 0–100% (Efetividade) |
| `MultiAxisLineChart` | Dual axis (Agendamentos) |

**Proibido:** SVG/chart ad-hoc novo, Chart.js solto na página sem wrapper, gap entre cards de `MetricsStrip` (faixa contínua com `border-right`).

## Responsividade

Validar em 1600×1000 e 1366×768. O shell usa uma rolagem principal. Tabelas podem rolar horizontalmente apenas dentro de sua região. O fluxo da operação reserva duas linhas para labels longos.

## Estados

Toda superfície de dados deve ter loading, vazio, erro e sucesso. Ações proibidas por permissão devem desaparecer ou explicar somente leitura; não criar itens cinza sem ação.

## Anti-padrões

- cartões arredondados para cada dado;
- ícones com fundo colorido decorativo;
- badges usados como decoração;
- gradiente ornamental fora de gráfico;
- corpo abaixo de 13px;
- status sem texto;
- linha vertical ao lado do status;
- timeline vertical atravessando conteúdo;
- texto de processo interno na interface;
- abreviação de ponto de apoio.

## Baseline visual

`public/validation-suite-operational-index-v12.html` preserva a composição navegável aprovada. Use essa suíte como referência pixel perfect durante a extração dos estados para componentes Nuxt.
