export type DashboardReversaTabId =
  | 'visao-geral'
  | 'mailing'
  | 'trabalhado'
  | 'backlog'
  | 'motoboys'
  | 'agendamentos'
  | 'resumo'

export type ResumoSubTabId = 'geral' | 'vol' | 'invol'

export type PeriodKind = 'created_at' | 'closed_at' | 'assigned_at' | 'scheduled_time'

export interface StackedSeriesPoint {
  label: string
  vol: number
  invol: number
}

export interface DashboardCityRow extends Record<string, unknown> {
  id: string
  city: string
  uf: string
  total: number
  vol: number
  invol: number
}

export interface VisaoGeralFixture {
  kpis: {
    total: number
    coletados: number
    ocorrencias: number
    pendentes: number
    vol_total: number
    invol_total: number
  }
  statusStacked: StackedSeriesPoint[]
  ufStacked: StackedSeriesPoint[]
  topCities: DashboardCityRow[]
}

export interface MailingDayPoint {
  dia: string
  vol: number
  invol: number
  agendado: number
}

export interface MailingConsolidadoRow extends Record<string, unknown> {
  id: string
  conta: string
  mes: string
  total: number
  vol: number
  invol: number
  agendado: number
  media_geral: number
  uf_sp: number
  uf_rj: number
  uf_mg: number
  uf_pr: number
  uf_sc: number
  uf_rs: number
  uf_ba: number
  uf_pe: number
  uf_ce: number
  uf_df: number
  uf_go: number
  uf_pb: number
}

export interface MailingFixture {
  kpis: {
    total: number
    vol: number
    invol: number
    agendado: number
  }
  byDay: MailingDayPoint[]
  consolidado: MailingConsolidadoRow[]
}

export interface TrabalhadoUfRow extends Record<string, unknown> {
  id: string
  uf: string
  trabalhado: number
  concluidos: number
  ocorrencias: number
  efetividade: number
}

export interface TrabalhadoFixture {
  kpis: {
    trabalhado: number
    concluidos: number
    ocorrencias: number
    vol_concluidos: number
    invol_concluidos: number
  }
  efetividadeEvolution: Array<{ mes: string, efetividade: number }>
  occurrencesBreakdown: StackedSeriesPoint[]
  byUf: TrabalhadoUfRow[]
}

export interface AgingStatusRow extends Record<string, unknown> {
  id: string
  status: string
  d0_3: number
  d4_7: number
  d8_15: number
  d15plus: number
  total: number
}

export interface BacklogUfRow extends Record<string, unknown> {
  id: string
  uf: string
  vol: number
  invol: number
  total: number
}

export interface BacklogFixture {
  agingMatrix: AgingStatusRow[]
  agendadoByUf: BacklogUfRow[]
  naoAgendadoByUf: BacklogUfRow[]
}

export interface MotoboyAgingRow extends Record<string, unknown> {
  id: string
  transporter: string
  d0_3: number
  d4_7: number
  d8_15: number
  d15plus: number
  total: number
}

export interface MotoboyPerfRow extends Record<string, unknown> {
  id: string
  transporter: string
  uf: string
  total_atribuidos: number
  coletados: number
  pct_coletados: number
  ocorrencias: number
  pct_ocorrencias: number
  pendentes: number
  pct_pendentes: number
  agenda_total: number
  agenda_cumprida: number
  pct_agenda: number
}

export interface MotoboyOccRow extends Record<string, unknown> {
  id: string
  transporter: string
  uf: string
  tipo: string
  total: number
}

export interface MotoboysFixture {
  backlogAging: MotoboyAgingRow[]
  performance: MotoboyPerfRow[]
  occurrences: MotoboyOccRow[]
}

export interface AgendamentoEvolutionPoint {
  mes: string
  agendamentos: number
  cumpridos: number
  pct_cumprimento: number
}

export interface AgendamentoRegionRow extends Record<string, unknown> {
  id: string
  uf: string
  cidade: string
  total_agendas: number
  cumprimentos: number
  pct_cumprimento: number
  coletas: number
  pct_coletado: number
}

export interface AgendamentosFixture {
  evolution: AgendamentoEvolutionPoint[]
  byRegion: AgendamentoRegionRow[]
}

export interface ResumoContaRow extends Record<string, unknown> {
  id: string
  conta: string
  trabalhado: number
  pct_trabalhado: number
  concluidos: number
  pct_concluidos: number
  ocorrencias: number
  pct_ocorrencias: number
}

export interface ResumoFixture {
  geral: ResumoContaRow[]
  vol: ResumoContaRow[]
  invol: ResumoContaRow[]
}
