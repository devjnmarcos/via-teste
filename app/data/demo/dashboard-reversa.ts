import type { Metric } from '../../types/domain'
import type {
  AgendamentosFixture,
  BacklogFixture,
  MailingFixture,
  MotoboysFixture,
  ResumoFixture,
  PeriodKind,
  TrabalhadoFixture,
  VisaoGeralFixture
} from '../../types/dashboard-reversa'

export const dashboardReversaTabs = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'mailing', label: 'Mailing' },
  { id: 'trabalhado', label: 'Trabalhado' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'motoboys', label: 'Motoboys' },
  { id: 'agendamentos', label: 'Agendamentos' },
  { id: 'resumo', label: 'Resumo' }
] as const

export const resumoSubTabs = [
  { id: 'geral', label: 'Geral' },
  { id: 'vol', label: 'Voluntário' },
  { id: 'invol', label: 'Involuntário' }
] as const

export const accountFilterOptions = [
  { label: 'Todas as contas', value: 'all' },
  { label: 'Conta Demo Alpha', value: 'alpha' },
  { label: 'Conta Demo Beta', value: 'beta' },
  { label: 'Conta Demo Gama', value: 'gama' }
] as const

export const periodKindOptions: Array<{ label: string, value: PeriodKind }> = [
  { label: 'Criação', value: 'created_at' },
  { label: 'Encerramento', value: 'closed_at' },
  { label: 'Atribuição', value: 'assigned_at' },
  { label: 'Agendamento', value: 'scheduled_time' }
]

export const monthFilterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Janeiro', value: '1' },
  { label: 'Fevereiro', value: '2' },
  { label: 'Março', value: '3' },
  { label: 'Abril', value: '4' },
  { label: 'Maio', value: '5' },
  { label: 'Junho', value: '6' },
  { label: 'Julho', value: '7' },
  { label: 'Agosto', value: '8' },
  { label: 'Setembro', value: '9' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' }
] as const

export const visaoGeralFixture: VisaoGeralFixture = {
  kpis: {
    total: 1284,
    coletados: 742,
    ocorrencias: 86,
    pendentes: 456,
    vol_total: 518,
    invol_total: 766
  },
  statusStacked: [
    { label: 'Não processado', vol: 42, invol: 68 },
    { label: 'Atribuído', vol: 88, invol: 112 },
    { label: 'Em rota', vol: 156, invol: 204 },
    { label: 'Coletado', vol: 198, invol: 286 },
    { label: 'Ocorrência', vol: 34, invol: 52 }
  ],
  ufStacked: [
    { label: 'SP', vol: 210, invol: 298 },
    { label: 'RJ', vol: 98, invol: 142 },
    { label: 'MG', vol: 76, invol: 110 },
    { label: 'PR', vol: 54, invol: 82 },
    { label: 'RS', vol: 48, invol: 66 },
    { label: 'BA', vol: 32, invol: 68 }
  ],
  topCities: [
    { id: '1', city: 'São Paulo', uf: 'SP', total: 312, vol: 128, invol: 184 },
    { id: '2', city: 'Rio de Janeiro', uf: 'RJ', total: 186, vol: 72, invol: 114 },
    { id: '3', city: 'Belo Horizonte', uf: 'MG', total: 124, vol: 51, invol: 73 },
    { id: '4', city: 'Curitiba', uf: 'PR', total: 98, vol: 40, invol: 58 },
    { id: '5', city: 'Porto Alegre', uf: 'RS', total: 84, vol: 34, invol: 50 },
    { id: '6', city: 'Salvador', uf: 'BA', total: 72, vol: 22, invol: 50 },
    { id: '7', city: 'Campinas', uf: 'SP', total: 64, vol: 28, invol: 36 },
    { id: '8', city: 'Niterói', uf: 'RJ', total: 48, vol: 18, invol: 30 },
    { id: '9', city: 'Uberlândia', uf: 'MG', total: 41, vol: 16, invol: 25 },
    { id: '10', city: 'Joinville', uf: 'SC', total: 36, vol: 14, invol: 22 }
  ]
}

export const mailingFixture: MailingFixture = {
  kpis: {
    total: 960,
    vol: 410,
    invol: 550,
    agendado: 372
  },
  byDay: [
    { dia: '01/07', vol: 18, invol: 24, agendado: 12 },
    { dia: '02/07', vol: 22, invol: 28, agendado: 16 },
    { dia: '03/07', vol: 16, invol: 31, agendado: 14 },
    { dia: '04/07', vol: 25, invol: 29, agendado: 19 },
    { dia: '05/07', vol: 14, invol: 22, agendado: 11 },
    { dia: '06/07', vol: 9, invol: 14, agendado: 6 },
    { dia: '07/07', vol: 28, invol: 35, agendado: 22 },
    { dia: '08/07', vol: 31, invol: 38, agendado: 26 },
    { dia: '09/07', vol: 24, invol: 33, agendado: 20 },
    { dia: '10/07', vol: 27, invol: 36, agendado: 23 },
    { dia: '11/07', vol: 21, invol: 30, agendado: 18 },
    { dia: '12/07', vol: 12, invol: 18, agendado: 9 },
    { dia: '13/07', vol: 8, invol: 12, agendado: 5 },
    { dia: '14/07', vol: 29, invol: 40, agendado: 27 },
    { dia: '15/07', vol: 33, invol: 42, agendado: 30 },
    { dia: '16/07', vol: 26, invol: 34, agendado: 21 },
    { dia: '17/07', vol: 27, invol: 44, agendado: 28 }
  ],
  consolidado: [
    {
      id: '1',
      conta: 'Conta Demo Alpha',
      mes: '2026-07',
      total: 420,
      vol: 180,
      invol: 240,
      agendado: 168,
      media_geral: 24.7,
      uf_sp: 168,
      uf_rj: 72,
      uf_mg: 54,
      uf_pr: 36,
      uf_sc: 22,
      uf_rs: 28,
      uf_ba: 18,
      uf_pe: 8,
      uf_ce: 6,
      uf_df: 4,
      uf_go: 3,
      uf_pb: 1
    },
    {
      id: '2',
      conta: 'Conta Demo Beta',
      mes: '2026-07',
      total: 310,
      vol: 130,
      invol: 180,
      agendado: 122,
      media_geral: 18.2,
      uf_sp: 98,
      uf_rj: 64,
      uf_mg: 42,
      uf_pr: 28,
      uf_sc: 18,
      uf_rs: 22,
      uf_ba: 16,
      uf_pe: 10,
      uf_ce: 6,
      uf_df: 3,
      uf_go: 2,
      uf_pb: 1
    },
    {
      id: '3',
      conta: 'Conta Demo Gama',
      mes: '2026-07',
      total: 230,
      vol: 100,
      invol: 130,
      agendado: 82,
      media_geral: 13.5,
      uf_sp: 72,
      uf_rj: 38,
      uf_mg: 34,
      uf_pr: 24,
      uf_sc: 14,
      uf_rs: 16,
      uf_ba: 12,
      uf_pe: 8,
      uf_ce: 5,
      uf_df: 3,
      uf_go: 2,
      uf_pb: 2
    }
  ]
}

export const trabalhadoFixture: TrabalhadoFixture = {
  kpis: {
    trabalhado: 820,
    concluidos: 610,
    ocorrencias: 54,
    vol_concluidos: 268,
    invol_concluidos: 342
  },
  efetividadeEvolution: [
    { mes: 'Jan', efetividade: 68.2 },
    { mes: 'Fev', efetividade: 71.4 },
    { mes: 'Mar', efetividade: 69.8 },
    { mes: 'Abr', efetividade: 73.1 },
    { mes: 'Mai', efetividade: 75.6 },
    { mes: 'Jun', efetividade: 72.9 },
    { mes: 'Jul', efetividade: 74.4 }
  ],
  occurrencesBreakdown: [
    { label: 'Cliente ausente', vol: 12, invol: 18 },
    { label: 'Endereço incorreto', vol: 8, invol: 14 },
    { label: 'Recusa', vol: 6, invol: 9 },
    { label: 'Área de risco', vol: 4, invol: 7 },
    { label: 'Sem documento', vol: 3, invol: 5 },
    { label: 'Horário inválido', vol: 2, invol: 4 },
    { label: 'Produto divergente', vol: 2, invol: 3 },
    { label: 'Acesso bloqueado', vol: 1, invol: 3 }
  ],
  byUf: [
    { id: '1', uf: 'SP', trabalhado: 320, concluidos: 248, ocorrencias: 18, efetividade: 77.5 },
    { id: '2', uf: 'RJ', trabalhado: 148, concluidos: 112, ocorrencias: 11, efetividade: 75.7 },
    { id: '3', uf: 'MG', trabalhado: 110, concluidos: 84, ocorrencias: 8, efetividade: 76.4 },
    { id: '4', uf: 'PR', trabalhado: 86, concluidos: 61, ocorrencias: 6, efetividade: 70.9 },
    { id: '5', uf: 'RS', trabalhado: 72, concluidos: 49, ocorrencias: 5, efetividade: 68.1 },
    { id: '6', uf: 'BA', trabalhado: 84, concluidos: 56, ocorrencias: 6, efetividade: 66.7 }
  ]
}

export const backlogFixture: BacklogFixture = {
  agingMatrix: [
    { id: '1', status: 'Não processado', d0_3: 42, d4_7: 28, d8_15: 16, d15plus: 8, total: 94 },
    { id: '2', status: 'Atribuído', d0_3: 56, d4_7: 34, d8_15: 22, d15plus: 12, total: 124 },
    { id: '3', status: 'Em rota', d0_3: 68, d4_7: 41, d8_15: 18, d15plus: 6, total: 133 },
    { id: '4', status: 'Agendado', d0_3: 38, d4_7: 24, d8_15: 14, d15plus: 9, total: 85 },
    { id: '5', status: 'Ocorrência aberta', d0_3: 12, d4_7: 9, d8_15: 7, d15plus: 5, total: 33 }
  ],
  agendadoByUf: [
    { id: '1', uf: 'SP', vol: 48, invol: 62, total: 110 },
    { id: '2', uf: 'RJ', vol: 22, invol: 31, total: 53 },
    { id: '3', uf: 'MG', vol: 18, invol: 24, total: 42 },
    { id: '4', uf: 'PR', vol: 12, invol: 16, total: 28 },
    { id: '5', uf: 'RS', vol: 9, invol: 14, total: 23 }
  ],
  naoAgendadoByUf: [
    { id: '1', uf: 'SP', vol: 36, invol: 54, total: 90 },
    { id: '2', uf: 'RJ', vol: 18, invol: 28, total: 46 },
    { id: '3', uf: 'MG', vol: 14, invol: 22, total: 36 },
    { id: '4', uf: 'BA', vol: 16, invol: 26, total: 42 },
    { id: '5', uf: 'PE', vol: 8, invol: 14, total: 22 }
  ]
}

export const motoboysFixture: MotoboysFixture = {
  backlogAging: [
    { id: '1', transporter: 'Carlos Mendes', d0_3: 14, d4_7: 8, d8_15: 4, d15plus: 2, total: 28 },
    { id: '2', transporter: 'Ana Paula Souza', d0_3: 11, d4_7: 6, d8_15: 3, d15plus: 1, total: 21 },
    { id: '3', transporter: 'Rafael Lima', d0_3: 9, d4_7: 7, d8_15: 5, d15plus: 3, total: 24 },
    { id: '4', transporter: 'Juliana Costa', d0_3: 7, d4_7: 4, d8_15: 2, d15plus: 1, total: 14 },
    { id: '5', transporter: 'Pedro Almeida', d0_3: 12, d4_7: 9, d8_15: 6, d15plus: 4, total: 31 }
  ],
  performance: [
    {
      id: '1',
      transporter: 'Carlos Mendes',
      uf: 'SP',
      total_atribuidos: 186,
      coletados: 148,
      pct_coletados: 79.6,
      ocorrencias: 12,
      pct_ocorrencias: 6.5,
      pendentes: 26,
      pct_pendentes: 14.0,
      agenda_total: 92,
      agenda_cumprida: 78,
      pct_agenda: 84.8
    },
    {
      id: '2',
      transporter: 'Ana Paula Souza',
      uf: 'RJ',
      total_atribuidos: 142,
      coletados: 118,
      pct_coletados: 83.1,
      ocorrencias: 8,
      pct_ocorrencias: 5.6,
      pendentes: 16,
      pct_pendentes: 11.3,
      agenda_total: 70,
      agenda_cumprida: 61,
      pct_agenda: 87.1
    },
    {
      id: '3',
      transporter: 'Rafael Lima',
      uf: 'MG',
      total_atribuidos: 128,
      coletados: 94,
      pct_coletados: 73.4,
      ocorrencias: 14,
      pct_ocorrencias: 10.9,
      pendentes: 20,
      pct_pendentes: 15.6,
      agenda_total: 54,
      agenda_cumprida: 39,
      pct_agenda: 72.2
    },
    {
      id: '4',
      transporter: 'Juliana Costa',
      uf: 'PR',
      total_atribuidos: 96,
      coletados: 81,
      pct_coletados: 84.4,
      ocorrencias: 5,
      pct_ocorrencias: 5.2,
      pendentes: 10,
      pct_pendentes: 10.4,
      agenda_total: 48,
      agenda_cumprida: 42,
      pct_agenda: 87.5
    },
    {
      id: '5',
      transporter: 'Pedro Almeida',
      uf: 'SP',
      total_atribuidos: 164,
      coletados: 102,
      pct_coletados: 62.2,
      ocorrencias: 22,
      pct_ocorrencias: 13.4,
      pendentes: 40,
      pct_pendentes: 24.4,
      agenda_total: 0,
      agenda_cumprida: 0,
      pct_agenda: 0
    }
  ],
  occurrences: [
    { id: '1', transporter: 'Carlos Mendes', uf: 'SP', tipo: 'Cliente ausente', total: 6 },
    { id: '2', transporter: 'Carlos Mendes', uf: 'SP', tipo: 'Endereço incorreto', total: 4 },
    { id: '3', transporter: 'Ana Paula Souza', uf: 'RJ', tipo: 'Recusa', total: 5 },
    { id: '4', transporter: 'Rafael Lima', uf: 'MG', tipo: 'Área de risco', total: 7 },
    { id: '5', transporter: 'Pedro Almeida', uf: 'SP', tipo: 'Cliente ausente', total: 9 },
    { id: '6', transporter: 'Pedro Almeida', uf: 'SP', tipo: 'Horário inválido', total: 5 },
    { id: '7', transporter: 'Juliana Costa', uf: 'PR', tipo: 'Sem documento', total: 3 }
  ]
}

export const agendamentosFixture: AgendamentosFixture = {
  evolution: [
    { mes: 'Jan', agendamentos: 420, cumpridos: 318, pct_cumprimento: 75.7 },
    { mes: 'Fev', agendamentos: 398, cumpridos: 312, pct_cumprimento: 78.4 },
    { mes: 'Mar', agendamentos: 456, cumpridos: 348, pct_cumprimento: 76.3 },
    { mes: 'Abr', agendamentos: 482, cumpridos: 392, pct_cumprimento: 81.3 },
    { mes: 'Mai', agendamentos: 510, cumpridos: 428, pct_cumprimento: 83.9 },
    { mes: 'Jun', agendamentos: 498, cumpridos: 401, pct_cumprimento: 80.5 },
    { mes: 'Jul', agendamentos: 536, cumpridos: 452, pct_cumprimento: 84.3 }
  ],
  byRegion: [
    { id: '1', uf: 'SP', cidade: 'São Paulo', total_agendas: 186, cumprimentos: 158, pct_cumprimento: 84.9, coletas: 142, pct_coletado: 76.3 },
    { id: '2', uf: 'SP', cidade: 'Campinas', total_agendas: 64, cumprimentos: 54, pct_cumprimento: 84.4, coletas: 49, pct_coletado: 76.6 },
    { id: '3', uf: 'RJ', cidade: 'Rio de Janeiro', total_agendas: 112, cumprimentos: 96, pct_cumprimento: 85.7, coletas: 88, pct_coletado: 78.6 },
    { id: '4', uf: 'MG', cidade: 'Belo Horizonte', total_agendas: 78, cumprimentos: 61, pct_cumprimento: 78.2, coletas: 55, pct_coletado: 70.5 },
    { id: '5', uf: 'PR', cidade: 'Curitiba', total_agendas: 54, cumprimentos: 47, pct_cumprimento: 87.0, coletas: 42, pct_coletado: 77.8 },
    { id: '6', uf: 'RS', cidade: 'Porto Alegre', total_agendas: 42, cumprimentos: 36, pct_cumprimento: 85.7, coletas: 31, pct_coletado: 73.8 }
  ]
}

export const resumoFixture: ResumoFixture = {
  geral: [
    { id: '1', conta: 'Conta Demo Alpha', trabalhado: 420, pct_trabalhado: 41.2, concluidos: 318, pct_concluidos: 75.7, ocorrencias: 22, pct_ocorrencias: 5.2 },
    { id: '2', conta: 'Conta Demo Beta', trabalhado: 310, pct_trabalhado: 30.4, concluidos: 241, pct_concluidos: 77.7, ocorrencias: 18, pct_ocorrencias: 5.8 },
    { id: '3', conta: 'Conta Demo Gama', trabalhado: 290, pct_trabalhado: 28.4, concluidos: 201, pct_concluidos: 69.3, ocorrencias: 28, pct_ocorrencias: 9.7 }
  ],
  vol: [
    { id: '1', conta: 'Conta Demo Alpha', trabalhado: 180, pct_trabalhado: 43.9, concluidos: 142, pct_concluidos: 78.9, ocorrencias: 8, pct_ocorrencias: 4.4 },
    { id: '2', conta: 'Conta Demo Beta', trabalhado: 130, pct_trabalhado: 31.7, concluidos: 104, pct_concluidos: 80.0, ocorrencias: 6, pct_ocorrencias: 4.6 },
    { id: '3', conta: 'Conta Demo Gama', trabalhado: 100, pct_trabalhado: 24.4, concluidos: 72, pct_concluidos: 72.0, ocorrencias: 9, pct_ocorrencias: 9.0 }
  ],
  invol: [
    { id: '1', conta: 'Conta Demo Alpha', trabalhado: 240, pct_trabalhado: 39.3, concluidos: 176, pct_concluidos: 73.3, ocorrencias: 14, pct_ocorrencias: 5.8 },
    { id: '2', conta: 'Conta Demo Beta', trabalhado: 180, pct_trabalhado: 29.5, concluidos: 137, pct_concluidos: 76.1, ocorrencias: 12, pct_ocorrencias: 6.7 },
    { id: '3', conta: 'Conta Demo Gama', trabalhado: 190, pct_trabalhado: 31.1, concluidos: 129, pct_concluidos: 67.9, ocorrencias: 19, pct_ocorrencias: 10.0 }
  ]
}

export function buildVisaoGeralMetrics(kpis: VisaoGeralFixture['kpis']): Metric[] {
  return [
    { label: 'Total', value: kpis.total, note: 'pedidos no período', icon: 'i-lucide-package', tone: 'info' },
    { label: 'Coletados', value: kpis.coletados, note: 'concluídos', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Ocorrências', value: kpis.ocorrencias, note: 'com incidente', icon: 'i-lucide-triangle-alert', tone: 'danger' },
    { label: 'Pendentes', value: kpis.pendentes, note: 'em aberto', icon: 'i-lucide-clock-3', tone: 'warning' },
    { label: 'Voluntário', value: kpis.vol_total, note: 'VOL', icon: 'i-lucide-hand-helping', tone: 'info' },
    { label: 'Involuntário', value: kpis.invol_total, note: 'INVOL', icon: 'i-lucide-package-x', tone: 'assigned' }
  ]
}

export function buildMailingMetrics(kpis: MailingFixture['kpis']): Metric[] {
  return [
    { label: 'Total recebido', value: kpis.total, note: 'mailing', icon: 'i-lucide-inbox', tone: 'info' },
    { label: 'Voluntário', value: kpis.vol, note: 'VOL', icon: 'i-lucide-hand-helping', tone: 'info' },
    { label: 'Involuntário', value: kpis.invol, note: 'INVOL', icon: 'i-lucide-package-x', tone: 'assigned' },
    { label: 'Com agendamento', value: kpis.agendado, note: 'janela marcada', icon: 'i-lucide-calendar-check', tone: 'success' }
  ]
}

export function buildTrabalhadoMetrics(kpis: TrabalhadoFixture['kpis']): Metric[] {
  const efetividade = kpis.trabalhado
    ? Math.round((kpis.concluidos / kpis.trabalhado) * 1000) / 10
    : 0

  return [
    { label: 'Trabalhado', value: kpis.trabalhado, note: 'pedidos tocados', icon: 'i-lucide-workflow', tone: 'info' },
    { label: 'Coletados', value: kpis.concluidos, note: 'concluídos', icon: 'i-lucide-circle-check', tone: 'success' },
    { label: 'Ocorrências', value: kpis.ocorrencias, note: 'com incidente', icon: 'i-lucide-triangle-alert', tone: 'danger' },
    { label: 'VOL coletados', value: kpis.vol_concluidos, note: 'voluntário', icon: 'i-lucide-hand-helping', tone: 'info' },
    { label: 'INVOL coletados', value: kpis.invol_concluidos, note: 'involuntário', icon: 'i-lucide-package-x', tone: 'assigned' },
    { label: 'Efetividade', value: `${efetividade}%`, note: 'concluídos / trabalhado', icon: 'i-lucide-percent', tone: 'success' }
  ]
}

export const topCityColumns = [
  { type: 'text' as const, key: 'city' as const, label: 'Cidade', width: '36%' },
  { type: 'text' as const, key: 'uf' as const, label: 'UF', width: '64px' },
  { type: 'text' as const, key: 'total' as const, label: 'Total', align: 'right' as const, width: '72px' },
  { type: 'text' as const, key: 'vol' as const, label: 'VOL', align: 'right' as const, width: '72px' },
  { type: 'text' as const, key: 'invol' as const, label: 'INVOL', align: 'right' as const, width: '72px' }
]

export const mailingConsolidadoColumns = [
  { type: 'text' as const, key: 'conta' as const, label: 'Conta', width: '18%' },
  { type: 'text' as const, key: 'mes' as const, label: 'Mês', width: '90px' },
  { type: 'text' as const, key: 'total' as const, label: 'Total', align: 'right' as const, width: '64px' },
  { type: 'text' as const, key: 'vol' as const, label: 'VOL', align: 'right' as const, width: '56px' },
  { type: 'text' as const, key: 'invol' as const, label: 'INVOL', align: 'right' as const, width: '56px' },
  { type: 'text' as const, key: 'agendado' as const, label: 'Agend.', align: 'right' as const, width: '64px' },
  { type: 'text' as const, key: 'media_geral' as const, label: 'Média/Dia', align: 'right' as const, width: '80px' },
  { type: 'text' as const, key: 'uf_sp' as const, label: 'SP', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_rj' as const, label: 'RJ', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_mg' as const, label: 'MG', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_pr' as const, label: 'PR', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_sc' as const, label: 'SC', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_rs' as const, label: 'RS', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_ba' as const, label: 'BA', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_pe' as const, label: 'PE', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_ce' as const, label: 'CE', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_df' as const, label: 'DF', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_go' as const, label: 'GO', align: 'right' as const, width: '48px' },
  { type: 'text' as const, key: 'uf_pb' as const, label: 'PB', align: 'right' as const, width: '48px' }
]

export const trabalhadoUfColumns = [
  { type: 'text' as const, key: 'uf' as const, label: 'UF', width: '64px' },
  { type: 'text' as const, key: 'trabalhado' as const, label: 'Trabalhado', align: 'right' as const, width: '100px' },
  { type: 'text' as const, key: 'concluidos' as const, label: 'Coletados', align: 'right' as const, width: '100px' },
  { type: 'text' as const, key: 'ocorrencias' as const, label: 'Ocorrências', align: 'right' as const, width: '100px' },
  { type: 'text' as const, key: 'efetividade' as const, label: 'Efetividade', align: 'right' as const, width: '110px' }
]

export const agingColumns = [
  { type: 'text' as const, key: 'status' as const, label: 'Status', width: '22%' },
  { type: 'text' as const, key: 'd0_3' as const, label: '0–3 dias', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'd4_7' as const, label: '4–7 dias', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'd8_15' as const, label: '8–15 dias', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'd15plus' as const, label: '>15 dias', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'total' as const, label: 'Total', align: 'right' as const, width: '80px' }
]

export const backlogUfColumns = [
  { type: 'text' as const, key: 'uf' as const, label: 'UF', width: '64px' },
  { type: 'text' as const, key: 'vol' as const, label: 'VOL', align: 'right' as const, width: '72px' },
  { type: 'text' as const, key: 'invol' as const, label: 'INVOL', align: 'right' as const, width: '72px' },
  { type: 'text' as const, key: 'total' as const, label: 'Total', align: 'right' as const, width: '72px' }
]

export const motoboyAgingColumns = [
  { type: 'text' as const, key: 'transporter' as const, label: 'Motoboy', width: '28%' },
  { type: 'text' as const, key: 'd0_3' as const, label: '0–3 dias', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'd4_7' as const, label: '4–7 dias', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'd8_15' as const, label: '8–15 dias', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'd15plus' as const, label: '>15 dias', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'total' as const, label: 'Total', align: 'right' as const, width: '80px' }
]

export const motoboyPerfColumns = [
  { type: 'text' as const, key: 'transporter' as const, label: 'Motoboy', width: '18%' },
  { type: 'text' as const, key: 'uf' as const, label: 'UF', width: '48px' },
  { type: 'text' as const, key: 'total_atribuidos' as const, label: 'Atribuídos', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'coletados' as const, label: 'Coletados', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'pct_coletados' as const, label: '% Colet.', align: 'right' as const, width: '80px' },
  { type: 'text' as const, key: 'ocorrencias' as const, label: 'Ocorrências', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'pct_ocorrencias' as const, label: '% Ocorr.', align: 'right' as const, width: '80px' },
  { type: 'text' as const, key: 'pendentes' as const, label: 'Pendentes', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'pct_pendentes' as const, label: '% Pend.', align: 'right' as const, width: '80px' },
  { type: 'text' as const, key: 'agenda_total' as const, label: 'Agendas', align: 'right' as const, width: '80px' },
  { type: 'text' as const, key: 'agenda_cumprida' as const, label: 'Cumpridas', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'pct_agenda' as const, label: '% Agenda', align: 'right' as const, width: '90px' }
]

export const motoboyOccColumns = [
  { type: 'text' as const, key: 'transporter' as const, label: 'Motoboy', width: '28%' },
  { type: 'text' as const, key: 'uf' as const, label: 'UF', width: '56px' },
  { type: 'text' as const, key: 'tipo' as const, label: 'Tipo de ocorrência', width: '36%' },
  { type: 'text' as const, key: 'total' as const, label: 'Total', align: 'right' as const, width: '72px' }
]

export const agendRegionColumns = [
  { type: 'text' as const, key: 'uf' as const, label: 'UF', width: '48px' },
  { type: 'text' as const, key: 'cidade' as const, label: 'Cidade', width: '22%' },
  { type: 'text' as const, key: 'total_agendas' as const, label: 'Agendas', align: 'right' as const, width: '80px' },
  { type: 'text' as const, key: 'cumprimentos' as const, label: 'Cumpridos', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'pct_cumprimento' as const, label: '% Cumprimento', align: 'right' as const, width: '110px' },
  { type: 'text' as const, key: 'coletas' as const, label: 'Coletados', align: 'right' as const, width: '90px' },
  { type: 'text' as const, key: 'pct_coletado' as const, label: '% Coletado', align: 'right' as const, width: '100px' }
]

export const resumoColumns = [
  { type: 'text' as const, key: 'conta' as const, label: 'Conta', width: '28%' },
  { type: 'text' as const, key: 'trabalhado' as const, label: 'Trabalhado', align: 'right' as const, width: '100px' },
  { type: 'text' as const, key: 'pct_trabalhado' as const, label: '% Part.', align: 'right' as const, width: '80px' },
  { type: 'text' as const, key: 'concluidos' as const, label: 'Coletados', align: 'right' as const, width: '100px' },
  { type: 'text' as const, key: 'pct_concluidos' as const, label: '% Coletados', align: 'right' as const, width: '100px' },
  { type: 'text' as const, key: 'ocorrencias' as const, label: 'Ocorrências', align: 'right' as const, width: '100px' },
  { type: 'text' as const, key: 'pct_ocorrencias' as const, label: '% Ocorr.', align: 'right' as const, width: '90px' }
]
