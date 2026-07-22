/**
 * Escalonamento client-side dos fixtures do Dashboard Reversa por operação.
 *
 * Os fixtures das 7 abas (Visão Geral, Mailing, Trabalhado, Backlog, Motoboys,
 * Agendamentos, Resumo) não têm uma dimensão "operação" própria — são mocks
 * estáticos. Para o filtro de Operação afetar os números exibidos sem
 * inventar datasets paralelos por aba, aplicamos um fator de proporção
 * (operationVolumeRatio, calculado a partir do total de pedidos de cada
 * operação em app/data/demo/operations.ts) a todo campo numérico que não
 * seja uma taxa/percentual (chaves iniciadas por "pct_" ou iguais a
 * "efetividade" / "media_geral"). É uma simulação simples e honesta de
 * "essa operação representa X% do volume total" sobre os mesmos mocks —
 * não é uma segmentação real por operação.
 */

const PERCENT_LIKE_KEY = /^pct_|^efetividade$|^media_geral$/i

function scaleNode(value: unknown, ratio: number, key?: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => scaleNode(item, ratio))
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      result[childKey] = scaleNode(childValue, ratio, childKey)
    }
    return result
  }
  if (typeof value === 'number' && key && !PERCENT_LIKE_KEY.test(key)) {
    return Math.max(0, Math.round(value * ratio))
  }
  return value
}

export function scaleDashboardReversaFixture<T>(fixture: T, ratio: number): T {
  return scaleNode(fixture, ratio) as T
}
