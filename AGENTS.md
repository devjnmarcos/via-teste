# Regras do agente — Via Reversa

Leia `DESIGN_SYSTEM.md` antes de qualquer alteração de interface. A documentação normativa completa vive em `../../handoff-claude-design/`; a documentação em `../../documentacao/` é somente referência factual do legado.

## Stack obrigatória

Nuxt 4, Vue 3, TypeScript, Nuxt UI 4, Tailwind CSS 4 e Lucide via Iconify.

## Arquivos importantes

- Tokens e CSS global mínimo: `app/assets/css/main.css` (`@theme`, `--via-*`, keyframes de rota/toast/wizard).
- Variantes globais: `app/app.config.ts`.
- Shell: `app/layouts/default.vue` e `app/components/app/`.
- Operações: `app/components/operations/`.
- Pedidos: `app/components/orders/`.
- Gráficos: `app/components/charts/` + `app/utils/chart-theme.ts`.
- Dados e contratos: `app/data/demo/` e `app/types/`.

## Estilos

- **Priorize Tailwind** no markup; evite CSS “solto” ou `<style scoped>` grande.
- Exceções só para tokens/keyframes/resets globais em `main.css` (documentados em `CLAUDE.md`).
- Cores/espaçamentos via tokens Via (`text-via-ink`, `border-via-line`, `bg-via-surface`, etc.).

## Regras obrigatórias

- Reutilize componentes existentes antes de criar outro.
- Use `<script setup lang="ts">` e props tipadas.
- Use tokens de `main.css`; não crie cor ou espaçamento local sem atualizar o token.
- Use `UIcon` com nomes `i-lucide-*`.
- Status é ponto + texto.
- Métrica usa faixa contínua com divisores (sem gap entre cards).
- Filtros avançados usam painel lateral.
- Valide em 1600×1000 e 1366×768.
- Escreva teste antes de comportamento novo.
- Escreva “ponto de apoio” por extenso.

## Nunca fazer

- Não substituir o shell por outra sidebar.
- Não transformar toda seção em cartão arredondado.
- Não colocar ícone em fundo pastel.
- Não reduzir fonte para resolver overflow.
- Não indicar estado apenas com cor.
- Não colocar linha vertical colorida ao lado do status.
- Não construir timeline vertical central.
- Não colocar explicações internas de design nos textos da interface.
- Não reintroduzir folhas CSS locais grandes quando utilitários Tailwind bastam.

## Comandos de verificação

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build
node scripts/verify-foundation.mjs
```
