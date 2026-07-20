import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
  type TooltipItem
} from 'chart.js'
import type { StatusKey } from '../types/domain'

let registered = false

/** Registra plugins Chart.js uma vez (idempotente). */
export function ensureChartJsRegistered() {
  if (registered) return
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
  )
  registered = true
}

/** Cores de canvas (hex) alinhadas ao DS / legado Dashboard Reversa. */
export const chartColors = {
  vol: '#1e3a5f',
  invol: '#f97316',
  coletado: '#16a34a',
  agendado: '#2563eb',
  /** Evita roxo genérico de IA — tom azul-acinzentado do DS. */
  pct: '#475569',
  grid: '#eef2f7',
  tick: '#64748b',
  tooltipBg: '#0f172a',
  surface: '#ffffff'
} as const

const tooltipDefaults = {
  backgroundColor: chartColors.tooltipBg,
  titleColor: '#ffffff',
  bodyColor: '#e2e8f0',
  cornerRadius: 6,
  padding: 10
}

export function baseChartOptions(overrides: ChartOptions = {}): ChartOptions {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 520,
      easing: 'easeOutQuart'
    },
    layout: {
      padding: { top: 8, right: 12, bottom: 4, left: 4 }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 14,
          color: chartColors.tick,
          font: { size: 11 }
        }
      },
      tooltip: tooltipDefaults
    },
    ...overrides
  }
}

export function stackedBarOptions(horizontal: boolean): ChartOptions<'bar'> {
  const category = {
    stacked: true,
    grid: { display: false },
    ticks: {
      color: chartColors.tick,
      font: { size: 11 },
      maxRotation: horizontal ? 0 : 35,
      minRotation: 0,
      autoSkip: true,
      autoSkipPadding: 6
    }
  }
  const value = {
    stacked: true,
    beginAtZero: true,
    grid: { color: chartColors.grid },
    ticks: {
      color: chartColors.tick,
      font: { size: 11 },
      padding: 6
    }
  }

  return baseChartOptions({
    indexAxis: horizontal ? 'y' : 'x',
    scales: horizontal
      ? { x: value, y: category }
      : { x: category, y: value },
    layout: {
      padding: horizontal
        ? { top: 4, right: 28, bottom: 4, left: 4 }
        : { top: 8, right: 8, bottom: 2, left: 4 }
    }
  }) as ChartOptions<'bar'>
}

export function donutOptions(): ChartOptions<'doughnut'> {
  return baseChartOptions({
    cutout: '68%',
    layout: { padding: 8 },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 14,
          color: chartColors.tick,
          font: { size: 11 }
        }
      },
      tooltip: tooltipDefaults
    }
  }) as ChartOptions<'doughnut'>
}

export function percentLineOptions(): ChartOptions<'line'> {
  return baseChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          label(ctx: TooltipItem<'line'>) {
            const v = ctx.parsed.y
            return `${ctx.dataset.label ?? ''}: ${v ?? 0}%`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chartColors.tick, font: { size: 11 } }
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: chartColors.grid },
        ticks: {
          color: chartColors.tick,
          font: { size: 11 },
          stepSize: 20,
          callback: (value) => `${value}%`
        }
      }
    }
  }) as ChartOptions<'line'>
}

export function multiAxisLineOptions(): ChartOptions<'line'> {
  return baseChartOptions({
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chartColors.tick, font: { size: 11 } }
      },
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.tick, font: { size: 11 } },
        title: {
          display: true,
          text: 'Volume',
          color: chartColors.tick,
          font: { size: 11 }
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: {
          color: chartColors.tick,
          font: { size: 11 },
          callback: (value) => `${value}%`
        },
        title: {
          display: true,
          text: '% Cumprimento',
          color: chartColors.tick,
          font: { size: 11 }
        }
      }
    },
    layout: { padding: { top: 8, right: 8, bottom: 4, left: 4 } }
  }) as ChartOptions<'line'>
}

export function comboBarLineOptions(): ChartOptions {
  return baseChartOptions({
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          color: chartColors.tick,
          font: { size: 11 },
          maxRotation: 40,
          autoSkip: true
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.tick, font: { size: 11 } }
      }
    }
  })
}

/** Hex aproximados dos tokens semânticos (canvas não resolve CSS vars). */
export const statusChartColors: Record<StatusKey, string> = {
  new: '#8b93a1',
  supportMissing: '#d4a017',
  assigned: '#7c5cbf',
  stock: '#8b93a1',
  backOrder: '#d4a017',
  route: '#3b82f6',
  done: '#22a05b',
  occurrence: '#dc2626',
  cancelled: '#dc2626'
}

export function statusChartColor(status: StatusKey): string {
  return statusChartColors[status] ?? chartColors.tick
}

export function volumeTrendOptions(): ChartOptions<'line'> {
  return baseChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: tooltipDefaults
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: chartColors.tick,
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 8
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: chartColors.grid },
        ticks: {
          color: chartColors.tick,
          font: { size: 10 },
          padding: 4
        }
      }
    },
    layout: { padding: { top: 6, right: 8, bottom: 2, left: 2 } }
  }) as ChartOptions<'line'>
}

export function statusDistributionOptions(): ChartOptions<'bar'> {
  return baseChartOptions({
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: tooltipDefaults
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: chartColors.grid },
        ticks: {
          color: chartColors.tick,
          font: { size: 10 },
          precision: 0
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: chartColors.tick,
          font: { size: 11 },
          autoSkip: false
        }
      }
    },
    layout: { padding: { top: 2, right: 16, bottom: 2, left: 4 } }
  }) as ChartOptions<'bar'>
}

export function pctTone(pct: number, invert = false): 'good' | 'mid' | 'bad' {
  const v = Number(pct) || 0
  const good = invert ? v <= 20 : v >= 80
  const bad = invert ? v >= 50 : v < 50
  if (good) return 'good'
  if (bad) return 'bad'
  return 'mid'
}

export function ageTone(bucket: 'd0_3' | 'd4_7' | 'd8_15' | 'd15plus'): 'g' | 'a' | 'o' | 'r' {
  if (bucket === 'd0_3') return 'g'
  if (bucket === 'd4_7') return 'a'
  if (bucket === 'd8_15') return 'o'
  return 'r'
}
