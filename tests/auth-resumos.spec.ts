import { describe, expect, it } from 'vitest'
import {
  authenticateMock,
  createEmptyExcluirContaForm,
  createEmptyLojaForm,
  createEmptyMotoboyForm,
  createEmptyTransportadorForm,
  DEMO_AUTH,
  isValidEmailFormat,
  isValidResetToken,
  validateExcluirContaForm,
  validateLojaForm,
  validateMotoboyForm,
  validateTransportadorForm
} from '../app/data/demo/auth'
import {
  buildClienteDistribution,
  buildEstadoDistribution,
  buildOperacaoDistribution,
  buildPaDistribution,
  buildTransportadorDistribution,
  resumosClienteRows,
  resumosEstadoRows,
  resumosMapPoints,
  resumosOperacaoRows,
  resumosPaRows,
  resumosTransportadorRows
} from '../app/data/demo/resumos'
import {
  buildPedidosClienteMetrics,
  buildPedidosEstadoMetrics,
  buildPedidosPaMetrics,
  buildPedidosTransportadorMetrics,
  buildTotaisOperacaoMetrics
} from '../app/utils/resumos-metrics'
import { resolveBreadcrumbs } from '../app/utils/breadcrumbs'
import {
  resumosNavigation,
  secondaryNavigation
} from '../app/components/app/navigation'

describe('auth fixtures e validação', () => {
  it('autentica apenas a credencial demo', () => {
    expect(authenticateMock(DEMO_AUTH.email, DEMO_AUTH.password)).toBe(true)
    expect(authenticateMock('outro@email.com', DEMO_AUTH.password)).toBe(false)
    expect(authenticateMock(DEMO_AUTH.email, 'errada')).toBe(false)
  })

  it('valida e-mail e token de reset', () => {
    expect(isValidEmailFormat('a@b.com')).toBe(true)
    expect(isValidEmailFormat('invalido')).toBe(false)
    expect(isValidResetToken(DEMO_AUTH.validResetToken)).toBe(true)
    expect(isValidResetToken(DEMO_AUTH.expiredResetToken)).toBe(false)
    expect(isValidResetToken('curto')).toBe(false)
  })

  it('valida formulário de transportador (wizard 5 steps)', () => {
    const empty = createEmptyTransportadorForm()
    expect(validateTransportadorForm(empty)).toBeTruthy()
    expect(
      validateTransportadorForm({
        name: 'Ana Transportadora',
        email: 'contato@transp.com',
        cellphone: '(11) 99999-0000',
        federalId: '123.456.789-09',
        zipCode: '01310-100',
        address: 'Av. Paulista',
        number: '1000',
        complement: '',
        quarter: 'Bela Vista',
        city: 'São Paulo',
        stateCode: 'SP',
        documentFileName: 'cnh.pdf',
        facePhotoFileName: 'rosto.jpg',
        regionIds: ['reg-1'],
        termsAccepted: true
      })
    ).toBeNull()
  })

  it('valida cadastros públicos complementares e exclusão de conta', () => {
    expect(validateMotoboyForm(createEmptyMotoboyForm())).toBeTruthy()
    expect(
      validateMotoboyForm({
        fullName: 'João Motoboy',
        cpf: '123.456.789-09',
        email: 'joao@email.com',
        phone: '(11) 98888-0000',
        city: 'São Paulo'
      })
    ).toBeNull()

    expect(validateLojaForm(createEmptyLojaForm())).toBeTruthy()
    expect(
      validateLojaForm({
        fullName: 'Maria Loja',
        email: 'maria@loja.com',
        phone: '(11) 97777-0000',
        storeName: 'Loja Centro',
        document: '12345678909'
      })
    ).toBeNull()

    expect(validateExcluirContaForm(createEmptyExcluirContaForm())).toBeTruthy()
    expect(
      validateExcluirContaForm({
        email: 'user@via.com',
        reason: 'Não uso mais',
        confirmText: 'EXCLUIR'
      })
    ).toBeNull()
  })
})

describe('resumos fixtures e métricas', () => {
  it('expõe breakdowns com volume suficiente', () => {
    expect(resumosOperacaoRows.length).toBeGreaterThanOrEqual(4)
    expect(resumosClienteRows.length).toBeGreaterThanOrEqual(5)
    expect(resumosEstadoRows.length).toBeGreaterThanOrEqual(6)
    expect(resumosPaRows.length).toBeGreaterThanOrEqual(4)
    expect(resumosTransportadorRows.length).toBeGreaterThanOrEqual(4)
    expect(resumosMapPoints.length).toBeGreaterThanOrEqual(6)
  })

  it('monta MetricsStrip 3/3 de totais por operação', () => {
    const metrics = buildTotaisOperacaoMetrics(resumosOperacaoRows)
    expect(metrics).toHaveLength(9)
    expect(metrics[0]?.label).toBe('Novos')
    expect(metrics.at(-1)?.label).toBe('Produtividade')
    expect(buildOperacaoDistribution(resumosOperacaoRows).length).toBeGreaterThanOrEqual(6)
  })

  it('agrega métricas por cliente e por estado', () => {
    const clientMetrics = buildPedidosClienteMetrics(resumosClienteRows)
    expect(clientMetrics).toHaveLength(6)
    expect(clientMetrics[0]?.label).toBe('Contas')
    expect(buildClienteDistribution(resumosClienteRows).some((item) => item.status === 'route')).toBe(true)

    const stateMetrics = buildPedidosEstadoMetrics(resumosEstadoRows)
    expect(stateMetrics).toHaveLength(6)
    expect(stateMetrics[0]?.label).toBe('UFs')
    expect(buildEstadoDistribution(resumosEstadoRows)[0]?.label).toBe('SP')
  })

  it('agrega métricas dos drills PA e transportador', () => {
    expect(buildPedidosPaMetrics(resumosPaRows)[0]?.label).toBe('Pontos de apoio')
    expect(buildPaDistribution(resumosPaRows).length).toBeGreaterThanOrEqual(4)
    expect(buildPedidosTransportadorMetrics(resumosTransportadorRows)[0]?.label).toBe('Transportadores')
    expect(buildTransportadorDistribution(resumosTransportadorRows).length).toBeGreaterThanOrEqual(4)
  })
})

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

  it('resolve breadcrumbs de Resumos', () => {
    expect(resolveBreadcrumbs('/resumos')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Resumos' }
    ])
    expect(resolveBreadcrumbs('/resumos/totais-por-operacao')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Resumos', to: '/resumos' },
      { label: 'Totais por Operação' }
    ])
    expect(resolveBreadcrumbs('/resumos/pedidos-por-cliente')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Resumos', to: '/resumos' },
      { label: 'Pedidos por Cliente' }
    ])
    expect(resolveBreadcrumbs('/resumos/pedidos-por-estado')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Resumos', to: '/resumos' },
      { label: 'Pedidos por Estado' }
    ])
    expect(resolveBreadcrumbs('/resumos/pontos-de-apoio')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Resumos', to: '/resumos' },
      { label: 'Pontos de apoio' }
    ])
    expect(resolveBreadcrumbs('/resumos/mapa')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Resumos', to: '/resumos' },
      { label: 'Mapa' }
    ])
  })

  it('resolve breadcrumbs de auth pública', () => {
    expect(resolveBreadcrumbs('/login')).toEqual([{ label: 'Entrar' }])
    expect(resolveBreadcrumbs('/auth/recuperar-senha')).toEqual([
      { label: 'Entrar', to: '/login' },
      { label: 'Recuperar senha' }
    ])
    expect(resolveBreadcrumbs('/auth/nova-senha')).toEqual([
      { label: 'Entrar', to: '/login' },
      { label: 'Nova senha' }
    ])
    expect(resolveBreadcrumbs('/cadastro-transportador')).toEqual([
      { label: 'Entrar', to: '/login' },
      { label: 'Cadastro transportador' }
    ])
    expect(resolveBreadcrumbs('/cadastro-motoboy')).toEqual([
      { label: 'Entrar', to: '/login' },
      { label: 'Cadastro motoboy' }
    ])
    expect(resolveBreadcrumbs('/excluir-conta')).toEqual([
      { label: 'Entrar', to: '/login' },
      { label: 'Excluir conta' }
    ])
    expect(resolveBreadcrumbs('/auth/cadastro-loja')).toEqual([
      { label: 'Entrar', to: '/login' },
      { label: 'Cadastro loja' }
    ])
  })
})
