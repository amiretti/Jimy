import type { RoutineItem } from '../routine/routine'

export type SetKind = 'warmup' | 'work'

export interface SetLog {
  readonly id?: string
  readonly sessionId: string
  readonly exerciseId: string
  readonly setNumber: number
  readonly kind: SetKind
  readonly reps?: number
  readonly load?: number
  readonly loadLabel?: string
  readonly durationS?: number
  readonly loggedAt: string
}

export interface Session {
  readonly id: string
  readonly routineDayId: string
  readonly startedAt: string
  readonly finishedAt?: string
}

/** Lo que hice la última vez en un ejercicio (cualquier rutina). */
export interface LastPerformance {
  readonly exerciseId: string
  readonly date: string
  readonly sets: readonly SetLog[]
}

/** Valores con los que se precarga una serie. */
export interface SetDraft {
  readonly reps?: number
  readonly load?: number
  readonly loadLabel?: string
  readonly durationS?: number
}

/**
 * Precarga de una serie efectiva: la misma serie de la última vez;
 * si esa serie no existió, la última serie efectiva; sin historial, el mínimo del rango.
 */
export function prefillSet(item: RoutineItem, setNumber: number, last?: LastPerformance): SetDraft {
  const workSets = (last?.sets ?? []).filter((s) => s.kind === 'work')
  const previous = workSets.find((s) => s.setNumber === setNumber) ?? workSets.at(-1)
  if (previous) {
    return {
      reps: previous.reps,
      load: previous.load,
      loadLabel: previous.loadLabel,
      durationS: previous.durationS,
    }
  }
  return {
    reps: item.reps?.min,
    load: item.load.type === 'kg' ? (item.load.min ?? 0) : undefined,
    loadLabel: item.load.type === 'band' ? item.load.label : undefined,
    durationS: item.durationS?.min,
  }
}

export const STEP = { reps: 1, kg: 2.5, durationS: 5 } as const

/** Ajuste de los botones +/−. Nunca baja de cero. */
export function adjust(value: number | undefined, step: number, direction: 1 | -1): number {
  const next = (value ?? 0) + step * direction
  return Math.max(0, Math.round(next * 100) / 100)
}

export function countWorkSets(logs: readonly SetLog[], exerciseId: string): number {
  return logs.filter((l) => l.exerciseId === exerciseId && l.kind === 'work').length
}
