import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  navigationItems,
  secondaryNavigation
} from '../app/components/app/navigation'
import {
  buildTratativasDistribution,
  markTratativaWorked,
  markTratativasDispatched,
  tratativasState
} from '../app/data/demo/tratativas'
import {
  buildOcorrenciasNgDistribution,
  ocorrenciasNgState,
  resendMiletoOccurrence
} from '../app/data/demo/ocorrencias-ng'
import {
  chatbotMonitorQueues,
  miletoBackfillState,
  startMiletoBackfill
} from '../app/data/demo/chatbot-operacional'
import {
  confirmPublicSchedule,
  getPublicOrderByHash,
  payPublicCheckout,
  searchPublicOrder
} from '../app/data/demo/compartilhamento-publico'
import {
  buildChatbotMonitorMetrics,
  buildMiletoBackfillMetrics,
  buildOcorrenciasNgMetrics,
  buildTratativasMetrics
} from '../app/utils/operacao-p3-metrics'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

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

describe('fixtures e métricas P3', () => {
  it('tratativas: métricas, distribuição e ações mock', () => {
    expect(buildTratativasMetrics(tratativasState.orders, 10, 5, 2)).toHaveLength(6)
    expect(buildTratativasDistribution(tratativasState.orders).length).toBe(4)
    const pending = tratativasState.orders.find((row) => row.status === 'pendente')
    expect(pending).toBeTruthy()
    expect(markTratativaWorked(pending!.orderId)).toBe(true)
    expect(markTratativasDispatched([pending!.orderId])).toBeGreaterThanOrEqual(0)
  })

  it('ocorrências NG: métricas e reenvio', () => {
    expect(
      buildOcorrenciasNgMetrics(
        ocorrenciasNgState.rows,
        ocorrenciasNgState.completed,
        ocorrenciasNgState.cancelled,
        ocorrenciasNgState.withOccurrence,
        ocorrenciasNgState.divergences
      )
    ).toHaveLength(6)
    expect(buildOcorrenciasNgDistribution(ocorrenciasNgState.rows).length).toBe(3)
    const divergente = ocorrenciasNgState.rows.find((row) => row.canResend)
    expect(divergente).toBeTruthy()
    expect(resendMiletoOccurrence(divergente!.orderId)).toBe(true)
  })

  it('chatbot: monitor e backfill', () => {
    expect(buildChatbotMonitorMetrics(chatbotMonitorQueues)[0]?.label).toBe('Aguardando')
    expect(buildMiletoBackfillMetrics(miletoBackfillState.jobs).length).toBe(5)
    const idle = miletoBackfillState.jobs.find((job) => job.status === 'idle')
    expect(idle).toBeTruthy()
    expect(startMiletoBackfill(idle!.id)).toBe(true)
  })

  it('configs e público', () => {
    expect(searchPublicOrder('53101')?.hash).toBe('abc123')
    expect(getPublicOrderByHash('abc123')?.orderId).toBe('53101')
    expect(confirmPublicSchedule('demo', 'slot-1')?.available).toBe(true)
    expect(payPublicCheckout('kangu-demo')?.status).toBe('paid')
  })
})

describe('remoção de Configurações → Externos', () => {
  it('a página externos.vue não existe mais', () => {
    expect(existsSync('app/pages/configuracoes/externos.vue')).toBe(false)
  })

  it('a fixture configuracoes.ts não existe mais', () => {
    expect(existsSync('app/data/demo/configuracoes.ts')).toBe(false)
  })
})

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

describe('breadcrumbs P3', () => {
  it('resolve operação P3, check-in e configurações', () => {
    expect(resolveBreadcrumbs('/operacao/tratativas')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Ocorrências' }
    ])
    expect(resolveBreadcrumbs('/operacao/ocorrencias-ng')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Ocorrências NG' }
    ])
    expect(resolveBreadcrumbs('/operacao/chatbot-monitor')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Monitor' }
    ])
    expect(resolveBreadcrumbs('/operacao/mileto-backfill')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Ocorrências NG', to: '/operacao/ocorrencias-ng' },
      { label: 'Mileto backfill' }
    ])
  })
})

describe('conteúdo da tela de Tratativas', () => {
  it('remove listagem de pedidos e disparo em lote, mantém métricas e gráficos', () => {
    const path = 'app/pages/operacao/tratativas.vue'
    expect(existsSync(path)).toBe(true)
    const source = readFileSync(path, 'utf8')
    expect(source).not.toContain('<DataTable')
    expect(source).not.toContain('<Pagination')
    expect(source).not.toContain('dispatchOpen')
    expect(source).not.toContain('markTratativasDispatched')
    expect(source).not.toContain('/operacao/disparo-chatbot')
    expect(source).not.toContain('>Disparar<')
    expect(source).toContain('/operacao/chatbot-monitor')
    expect(source).toContain('VolumeTrendChart')
    expect(source).toContain('StatusDistribution')
    expect(source).toContain('<MetricsStrip')
  })
})

describe('conteúdo da tela de Ocorrências NG', () => {
  it('remove os gráficos de divergência e alinhamento, mantém tabela e modal', () => {
    const path = 'app/pages/operacao/ocorrencias-ng.vue'
    expect(existsSync(path)).toBe(true)
    const source = readFileSync(path, 'utf8')
    expect(source).not.toContain('VolumeTrendChart')
    expect(source).not.toContain('StatusDistribution')
    expect(source).not.toContain('ChartPanel')
    expect(source).not.toContain('ocorrenciasNgTrend')
    expect(source).toContain('<DataTable')
    expect(source).toContain('<Pagination')
    expect(source).toContain('<AppModal')
  })
})
