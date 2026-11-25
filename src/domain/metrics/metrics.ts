import type { LoadType } from '../routine/routine'
import type { SetLog } from '../session/session'

export type MetricKind = 'maxLoad' | 'e1rm' | 'volume' | 'totalReps' | 'maxDuration'

export interface MetricPoint {
  readonly date: string
  readonly value: number
}

/** 1RM estimado con la fórmula de Epley: kg × (1 + reps / 30). */
export function epley1RM(kg: number, reps: number): number {
  if (reps <= 0 || kg <= 0) return 0
  if (reps === 1) return kg
  return Math.round(kg * (1 + reps / 30) * 10) / 10
}

/** Métrica por defecto según el tipo de carga. */
export function defaultMetric(loadType: LoadType): MetricKind | undefined {
  switch (loadType) {
    case 'kg':
      return 'maxLoad'
    case 'band':
    case 'bodyweight':
      return 'totalReps'
    case 'time':
      return 'maxDuration'
    default:
      return undefined
  }
}

/** Valor de una métrica para las series de una sesión. Las series de aproximación no cuentan. */
export function sessionMetric(sets: readonly SetLog[], metric: MetricKind): number {
  const work = sets.filter((s) => s.kind === 'work')
  if (work.length === 0) return 0
  switch (metric) {
    case 'maxLoad':
      return Math.max(...work.map((s) => s.load ?? 0))
    case 'e1rm':
      return Math.max(...work.map((s) => epley1RM(s.load ?? 0, s.reps ?? 0)))
    case 'volume':
      return work.reduce((sum, s) => sum + (s.reps ?? 0) * (s.load ?? 0), 0)
    case 'totalReps':
      return work.reduce((sum, s) => sum + (s.reps ?? 0), 0)
    case 'maxDuration':
      return Math.max(...work.map((s) => s.durationS ?? 0))
  }
}

/** Serie temporal de una métrica a partir de las sesiones de un ejercicio, de la más vieja a la más nueva. */
export function metricSeries(
  sessions: readonly { readonly date: string; readonly sets: readonly SetLog[] }[],
  metric: MetricKind,
): MetricPoint[] {
  return [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({ date: s.date, value: sessionMetric(s.sets, metric) }))
    .filter((p) => p.value > 0)
}
