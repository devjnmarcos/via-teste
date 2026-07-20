# Instruções do Claude — Via Reversa

Use `DESIGN_SYSTEM.md` como contrato visual obrigatório e consulte `../../handoff-claude-design/` antes de gerar qualquer tela. O modelo oficial é a suíte operacional V12 aprovada.

Stack: Nuxt 4, Vue 3, TypeScript, Nuxt UI 4, Tailwind CSS 4 e Lucide via Iconify.

A interface deve manter canvas contínuo, sidebar escura única, topbar clara, divisores, tipografia de trabalho, métricas em faixa, tabelas navegáveis, tabs com underline, gráficos funcionais e jornada horizontal. Reutilize os componentes existentes em `app/components/` e os tokens de `app/assets/css/main.css`.

## Estilos (prioridade Tailwind)

- **Priorize utilitários Tailwind** no markup (`class="…"`) para layout, espaçamento, tipografia, bordas, hovers e estados.
- Use tokens Via via classes geradas do `@theme` (`text-via-ink`, `bg-via-surface`, `border-via-line`, `rounded-via-control`, etc.) ou `var(--via-*)` em valores arbitrários quando necessário.
- **Evite CSS solto / `<style scoped>` grande** em componentes e páginas. Não reintroduza folhas locais para o que Tailwind resolve.
- Exceções documentadas (ficam em `app/assets/css/main.css`):
  - tokens / `@theme` / variáveis `--via-*` e layout (`--app-sidebar-width`, etc.);
  - resets e foco global;
  - tipografia compartilhada (`.via-page-title`, `.via-section-title`, `.via-helper`, `.numeric`);
  - keyframes / transições de rota e toast (`.via-page-*`, `.via-toast-*`, `.via-step-*`);
  - hover de linhas de tabela e `prefers-reduced-motion`.
- Gráficos: Chart.js + wrappers em `app/components/charts/` + `app/utils/chart-theme.ts` (não inventar SVG/chart ad-hoc).

Não use cartões arredondados em excesso, ícones em fundos pastéis, badges decorativos, fontes pequenas, status sem texto ou timeline vertical central. Escreva “ponto de apoio” por extenso.

Antes de concluir, execute:

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build
node scripts/verify-foundation.mjs
```

## Padrão de componentes

- Use `AppButton` para todas as ações; novas variantes devem ser adicionadas nele, nunca em botões locais duplicados.
- Use `MetricsStrip` para faixas de indicadores da Home, operação ao vivo, pedidos e operação por ID; mantenha ícone, valor, label e nota na mesma hierarquia. Faixa contínua sem gap entre cards (`gap-0` + `border-r`).
- Use `OrderJourney` para a timeline horizontal do pedido e `OrderSummary` para o resumo operacional com ícones Lucide visíveis.
- O bloco de itens, ocorrências, evidências e agendamento é um contador SCAR: cada item precisa de ícone, valor legível, label textual e tom semântico consistente.
- Use `OperationFlow` para o fluxo por status dos pedidos. Não introduza métricas de ponto de apoio dentro desse bloco.
- Transições entre rotas devem usar a transição `via-page`; respeite `prefers-reduced-motion`.
- Evite texto abaixo de 11px em dados operacionais e não reduza ícones funcionais abaixo de 17px.

Faça revisão visual em 1600×1000 e 1366×768 para toda rota afetada.
