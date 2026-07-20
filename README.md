# Via Reversa V2 Front

Frontend oficial do novo Via Reversa, construído com Nuxt 4, Nuxt UI 4, Tailwind CSS 4 e Lucide via Iconify.

## Desenvolvimento

Requisitos: Node.js 22 ou superior.

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

Para validação pixel perfect, a suíte aprovada de ontem está preservada em `http://localhost:3000/validation-suite-operational-index-v12.html`. Ela é a fonte de verdade visual enquanto os estados são extraídos gradualmente para componentes Nuxt.

## Rotas da fundação

- `/` — Home operacional.
- `/operacoes/logistica-reversa` — detalhe por operação.
- `/operacao/ao-vivo` — operação ao vivo.
- `/pedidos` — listagem de pedidos.
- `/pedidos/48224` — detalhe do pedido.

## Documentação

- `DESIGN_SYSTEM.md` — uso diário do código.
- `AGENTS.md` — regras para agentes.
- `CLAUDE.md` — regras específicas para Claude.
- `../../handoff-claude-design/` — contrato visual completo.
- `../../documentacao/` — comportamento factual do legado.

## Verificação

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build
node scripts/verify-foundation.mjs
```

As fixtures em `app/data/demo/` são determinísticas e servem somente para validar navegação e composição visual antes da integração com a API.
