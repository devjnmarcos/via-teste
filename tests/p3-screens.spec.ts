import { describe, expect, it } from 'vitest'
import {
  configuracoesNavigation,
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
  chatbotDispatchState,
  chatbotMonitorQueues,
  dispatchChatbotOrders,
  miletoBackfillState,
  startMiletoBackfill
} from '../app/data/demo/chatbot-operacional'
import {
  confirmCheckIn,
  lookupCheckInOrder,
  lojaCheckInState
} from '../app/data/demo/loja-check-in'
import {
  configExternalsState,
  configSlaAuditRows,
  toggleExternalActive
} from '../app/data/demo/configuracoes'
import {
  confirmPublicSchedule,
  getPublicOrderByHash,
  payPublicCheckout,
  searchPublicOrder
} from '../app/data/demo/compartilhamento-publico'
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
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'

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

  it('chatbot: disparo, monitor e backfill', () => {
    expect(
      buildChatbotDispatchMetrics(chatbotDispatchState.orders, 1, 1, 1, 1, 1)[0]?.label
    ).toBe('Selecionados')
    expect(buildChatbotMonitorMetrics(chatbotMonitorQueues)[0]?.label).toBe('Aguardando')
    expect(buildMiletoBackfillMetrics(miletoBackfillState.jobs).length).toBe(5)
    const elegivel = chatbotDispatchState.orders.find((row) => row.status === 'elegivel')
    expect(elegivel).toBeTruthy()
    expect(dispatchChatbotOrders([elegivel!.orderId])).toBe(1)
    const idle = miletoBackfillState.jobs.find((job) => job.status === 'idle')
    expect(idle).toBeTruthy()
    expect(startMiletoBackfill(idle!.id)).toBe(true)
  })

  it('check-in, configs e público', () => {
    expect(lookupCheckInOrder('52120')?.canConfirm).toBe(true)
    expect(confirmCheckIn('52120')?.orderId).toBe('52120')
    expect(
      buildLojaCheckInMetrics(
        lojaCheckInState.checkInsToday,
        lojaCheckInState.queue,
        lojaCheckInState.divergences,
        lojaCheckInState.history
      )[0]?.label
    ).toBe('Check-ins hoje')

    expect(buildConfigExternalsMetrics(configExternalsState.rows).length).toBe(3)
    expect(toggleExternalActive(configExternalsState.rows[0]!.id, false)).toBe(true)
    expect(buildConfigAuditMetrics(configSlaAuditRows)[0]?.label).toBe('Alterações')

    expect(searchPublicOrder('53101')?.hash).toBe('abc123')
    expect(getPublicOrderByHash('abc123')?.orderId).toBe('53101')
    expect(confirmPublicSchedule('demo', 'slot-1')?.available).toBe(true)
    expect(payPublicCheckout('kangu-demo')?.status).toBe('paid')
  })
})

describe('breadcrumbs P3', () => {
  it('resolve operação P3, check-in e configurações', () => {
    expect(resolveBreadcrumbs('/operacao/tratativas')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Tratativas' }
    ])
    expect(resolveBreadcrumbs('/operacao/ocorrencias-ng')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Ocorrências NG' }
    ])
    expect(resolveBreadcrumbs('/operacao/disparo-chatbot')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Disparo Chatbot' }
    ])
    expect(resolveBreadcrumbs('/operacao/chatbot-monitor')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Disparo Chatbot', to: '/operacao/disparo-chatbot' },
      { label: 'Monitor' }
    ])
    expect(resolveBreadcrumbs('/operacao/mileto-backfill')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Ocorrências NG', to: '/operacao/ocorrencias-ng' },
      { label: 'Mileto backfill' }
    ])
    expect(resolveBreadcrumbs('/loja/check-in')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Check In' }
    ])
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
  })
})
