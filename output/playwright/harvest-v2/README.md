# Harvest visual do Front V2

Este pacote é a fonte de evidência renderizada do Front V2 para o Claude Design. Ele usa a sessão demo e não representa dados reais.

## Como navegar

1. Leia este arquivo e o inventário em `manifest/coverage.json`.
2. Abra `docs/02-page-flow.md` para entender a navegação.
3. Entre em `routes/<slug>/` para ver `screen.html`, `screen.png`, estados, fluxo, análise e evidências brutas.
4. Use `docs/03-components.md` e `docs/01-design-system-map.md` antes de propor componentes novos.

## Demo

- Login: `demo@viareversa.com.br / demo123`
- Tokens públicos: `demo-coleta`, `kangu-demo`, `reset-demo-ok` quando aplicável.
- Persona: uma conta demo; rotas sem item de sidebar aparecem como acesso direto.

## Cobertura

- Total no run: **83**
- Capturadas: **83**
- Falhas documentadas: **0**
- Viewport principal: 1600×1000
- Validação: 1366×768
- Mobile por família: 390×844

| Família | Rotas | Capturadas | Falhas |
|---|---:|---:|---:|
| home | 2 | 2 | 0 |
| auth | 6 | 6 | 0 |
| publico | 7 | 7 | 0 |
| cadastros | 8 | 8 | 0 |
| analytics | 21 | 21 | 0 |
| configuracoes | 5 | 5 | 0 |
| devolucoes | 7 | 7 | 0 |
| faturas | 5 | 5 | 0 |
| loja | 1 | 1 | 0 |
| operacao | 15 | 15 | 0 |
| pedidos | 6 | 6 | 0 |

## Briefing para Claude Design

Crie dois modelos alternativos navegáveis preservando todas as rotas, a sidebar, suas opções, o conteúdo, as ações e os estados observados. Mude o design system, a linguagem visual e a composição espacial quando isso melhorar a clareza, mas não mude a lógica operacional nem os fluxos. Os dois modelos devem transmitir seriedade de produto operacional, manter leitura de tabela e métricas, ter responsividade e acessibilidade, e evitar estética genérica, cards excessivamente arredondados, ícones decorativos, badges sem semântica e qualquer aparência de protótipo gerado automaticamente.

## Limites da evidência

A fonte usa fixtures/mock. Rotas marcadas como `failed`, `redirect` ou `container` devem ser lidas junto do motivo registrado no manifesto; nenhum estado não observado deve ser tratado como fato.
