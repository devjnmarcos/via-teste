import fs from 'node:fs/promises'
import path from 'node:path'
import { routeSlug } from './capture.mjs'

const exists = (file) => fs.access(file).then(() => true).catch(() => false)
const write = (file, content) => fs.writeFile(file, content, 'utf8')

function overview(coverage) {
  const families = Object.entries(Object.groupBy(coverage.routes, (route) => route.family)).map(([family, routes]) => `| ${family} | ${routes.length} | ${routes.filter((route) => route.status === 'captured').length} | ${routes.filter((route) => route.status === 'failed').length} |`).join('\n')
  return `# Harvest visual do Front V2\n\nEste pacote é a fonte de evidência renderizada do Front V2 para o Claude Design. Ele usa a sessão demo e não representa dados reais.\n\n## Como navegar\n\n1. Leia este arquivo e o inventário em \`manifest/coverage.json\`.\n2. Abra \`docs/02-page-flow.md\` para entender a navegação.\n3. Entre em \`routes/<slug>/\` para ver \`screen.html\`, \`screen.png\`, estados, fluxo, análise e evidências brutas.\n4. Use \`docs/03-components.md\` e \`docs/01-design-system-map.md\` antes de propor componentes novos.\n\n## Demo\n\n- Login: \`demo@viareversa.com.br / demo123\`\n- Tokens públicos: \`demo-coleta\`, \`kangu-demo\`, \`reset-demo-ok\` quando aplicável.\n- Persona: uma conta demo; rotas sem item de sidebar aparecem como acesso direto.\n\n## Cobertura\n\n- Total no run: **${coverage.total}**\n- Capturadas: **${coverage.captured}**\n- Falhas documentadas: **${coverage.failed}**\n- Viewport principal: 1600×1000\n- Validação: 1366×768\n- Mobile por família: 390×844\n\n| Família | Rotas | Capturadas | Falhas |\n|---|---:|---:|---:|\n${families}\n\n## Briefing para Claude Design\n\nCrie dois modelos alternativos navegáveis preservando todas as rotas, a sidebar, suas opções, o conteúdo, as ações e os estados observados. Mude o design system, a linguagem visual e a composição espacial quando isso melhorar a clareza, mas não mude a lógica operacional nem os fluxos. Os dois modelos devem transmitir seriedade de produto operacional, manter leitura de tabela e métricas, ter responsividade e acessibilidade, e evitar estética genérica, cards excessivamente arredondados, ícones decorativos, badges sem semântica e qualquer aparência de protótipo gerado automaticamente.\n\n## Limites da evidência\n\nA fonte usa fixtures/mock. Rotas marcadas como \`failed\`, \`redirect\` ou \`container\` devem ser lidas junto do motivo registrado no manifesto; nenhum estado não observado deve ser tratado como fato.\n`
}

export async function generateReport(outputDir, coverage) {
  const docsDir = path.join(outputDir, 'docs')
  await fs.mkdir(docsDir, { recursive: true })
  await write(path.join(outputDir, 'README.md'), overview(coverage))
  await write(path.join(docsDir, '00-overview.md'), '# Visão geral\n\nO Front V2 é um portal operacional de micrologística em Nuxt 4, organizado por sidebar, topbar, métricas, tabelas, jornadas, dashboards e formulários.\n')
  await write(path.join(docsDir, '01-design-system-map.md'), '# Mapa do design system\n\nA evidência bruta de cada rota contém variáveis `--via-*`, tipografia, cores, raios, sombras e landmarks medidos. Componentes recorrentes incluem sidebar, topbar, breadcrumbs, PageHeader, MetricsStrip, DataTable, StatusLabel, AppButton, AppModal, gráficos e painéis de pedido.\n\nRecomendações devem preservar os fatos medidos e mapear cada token para o sistema alternativo escolhido.\n')
  await write(path.join(docsDir, '02-page-flow.md'), `# Fluxo global de páginas\n\nO fluxo começa em \`/login\`, segue para \`/\` e se ramifica por pedidos, operação, devoluções, faturas, cadastros, analytics, configurações, loja e páginas públicas.\n\nCada rota tem seu fluxo detalhado em \`routes/<slug>/flow.md\`; o manifesto diferencia rotas de sidebar e acesso direto.\n\n## Rotas capturadas\n\n${coverage.routes.map((route) => `- [${route.path}](../routes/${routeSlug(route.path)}/flow.md) — ${route.status}`).join('\n')}\n`)
  await write(path.join(docsDir, '03-components.md'), '# Inventário de componentes\n\nOs componentes Vue usados em cada tela estão listados em `routes/<slug>/components.md`; a captura também coleta classes e landmarks no `raw/live-extract.json`. Famílias de repetição: shell autenticado, shell público/auth, navegação, cabeçalho, métricas, tabelas, formulários, modais, gráficos e painéis de pedido.\n')
  await write(path.join(docsDir, '04-interactions-motion.md'), '# Interações e movimento\n\nEstados capturados: base, ação interativa encontrada pelo handler, modal/toast quando reproduzível, erros de console e requests falhos. Hovers triviais não recebem arquivo separado.\n')
  await write(path.join(docsDir, '05-assets.md'), '# Assets\n\nPNGs são evidência de referência. Assets do produto devem ser classificados antes de serem reutilizados: `reference-only`, `temporary-placeholder`, `replace-with-own` ou `safe-system-asset`.\n')
  await write(path.join(docsDir, '06-responsive.md'), '# Responsividade\n\nCada rota tem desktop 1600×1000 e validação 1366×768. Famílias de layout também recebem 390×844; a tela TV recebe viewport amplo. Compare os PNGs e os boxes do `live-extract.json`.\n')
  await write(path.join(docsDir, '07-implementation-plan.md'), '# Plano para os dois modelos alternativos\n\n1. Reconstituir tokens e shell.\n2. Recriar sidebar/topbar e rotas.\n3. Recriar componentes de métricas, tabelas, gráficos, formulários e jornadas.\n4. Reaplicar fluxos e estados documentados.\n5. Validar cada modelo nos mesmos viewports e rotas.\n')
  await write(path.join(docsDir, '08-playwright-evidence.md'), `# Evidências Playwright\n\n- Run: ${coverage.generatedAt}\n- Rotas: ${coverage.total}\n- Capturadas: ${coverage.captured}\n- Falhas: ${coverage.failed}\n\nCada rota possui HTML renderizado, PNG, fluxo, inspeção DOM, variáveis CSS, landmarks, console e rede.\n`)
  for (const route of coverage.routes) {
    const directory = path.join(outputDir, 'routes', routeSlug(route.path))
    await fs.mkdir(directory, { recursive: true })
    const evidence = JSON.parse(await fs.readFile(path.join(directory, 'raw', 'live-extract.json'), 'utf8').catch(() => '{}'))
    const components = [...new Set((evidence.components ?? []).filter(Boolean))].slice(0, 80)
    await write(path.join(directory, 'components.md'), `# Componentização — ${route.path}\n\n- Fonte: \`${route.source}\`\n- Família: ${route.family}\n- Layout/acesso: ${route.access}\n\n## Componentes identificados\n\n${components.length ? components.map((component) => `- \`${component}\``).join('\n') : '- Nenhuma classe de componente foi exposta no DOM; consulte a página fonte e os landmarks.'}\n\n## Padrões a preservar\n\n- Shell e navegação devem permanecer consistentes com as rotas da mesma família.\n- Ações devem manter nome, posição semântica e estado de acessibilidade.\n- Tabelas, métricas e gráficos devem continuar legíveis em 1600×1000, 1366×768 e, quando aplicável, 390×844.\n`)
    const landmarks = (evidence.landmarks ?? []).map((item) => `- \`${item.selector}\`: ${item.box?.width ?? 0}×${item.box?.height ?? 0}; ${item.styles?.fontFamily ?? 'tipografia não informada'}`).join('\n')
    const variables = Object.entries(evidence.variables ?? {}).slice(0, 40).map(([name, value]) => `- \`${name}\`: \`${value}\``).join('\n')
    await write(path.join(directory, 'design-analysis.md'), `# Análise técnica de design — ${route.path}\n\n## Fatos observados\n\n- URL final: \`${evidence.url ?? 'não capturada'}\`\n- Título: ${evidence.title ?? 'não informado'}\n- Scroll: ${evidence.scroll?.width ?? 0}×${evidence.scroll?.height ?? 0}\n\n### Landmarks e medidas\n\n${landmarks || '- Não disponíveis.'}\n\n### Tokens CSS observados\n\n${variables || '- Nenhuma variável `--via-*` exposta nesta captura.'}\n\n## Design system e usabilidade\n\nA tela deve ser lida em conjunto com os componentes identificados, manter hierarquia de título/ação/dados, texto de status legível, foco de teclado, alvo de ação claro e mensagens de erro/sucesso associadas à ação. Registre no redesign qualquer alteração de contraste, densidade, ordenação, feedback, responsividade ou redução de movimento.\n\n## Limites\n\nEsta análise descreve o DOM renderizado em fixture demo; não infere comportamento de API real nem estados não capturados.\n`)
  }
}

export async function validateCoverage(outputDir) {
  const file = path.join(outputDir, 'manifest', 'coverage.json')
  const coverage = JSON.parse(await fs.readFile(file, 'utf8'))
  const errors = []
  for (const route of coverage.routes) {
    const directory = path.join(outputDir, 'routes', routeSlug(route.path))
    if (route.status === 'captured') {
      for (const required of ['screen.html', 'screen.png', 'flow.md']) if (!(await exists(path.join(directory, required)))) errors.push(`${route.path}: ${required}`)
      if ((await fs.readFile(path.join(directory, 'screen.html'), 'utf8').catch(() => '')) .trim().length < 30) errors.push(`${route.path}: screen.html vazio`)
    }
    if (!route.status) errors.push(`${route.path}: status ausente`)
  }
  return { valid: errors.length === 0, errors, coverage }
}
