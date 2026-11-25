import type { RoutineItem } from '../routine/routine'
import { countWorkSets, type SetLog } from './session'

export type ItemStatus = 'done' | 'skipped'

export interface ItemResolution {
  readonly routineItemId: string
  readonly status: ItemStatus
}

export interface SessionProgress {
  readonly resolved: number
  readonly total: number
  /** 0 a 100, redondeado. */
  readonly percent: number
}

/** Tilde automático: un ejercicio se completa al llegar a `sets.min` series efectivas. */
export function isAutoComplete(item: RoutineItem, logs: readonly SetLog[]): boolean {
  if (item.kind !== 'exercise' || !item.exerciseId) return false
  return countWorkSets(logs, item.exerciseId) >= (item.sets?.min ?? 1)
}

/**
 * Estado efectivo de cada ítem: lo resuelto a mano (tildar, destildar, saltear) manda
 * sobre el tilde automático. `manual` con `null` = destildado explícito.
 */
export function resolveStatuses(
  items: readonly RoutineItem[],
  logs: readonly SetLog[],
  manual: ReadonlyMap<string, ItemStatus | null>,
): Map<string, ItemStatus> {
  const result = new Map<string, ItemStatus>()
  for (const item of items) {
    if (manual.has(item.id)) {
      const status = manual.get(item.id)
      if (status) result.set(item.id, status)
      continue
    }
    if (isAutoComplete(item, logs)) result.set(item.id, 'done')
  }
  return result
}

/** Ítems resueltos (hechos o salteados) ÷ ítems del día. Cada ejercicio de una superserie cuenta. */
export function computeProgress(items: readonly RoutineItem[], statuses: ReadonlyMap<string, ItemStatus>): SessionProgress {
  const total = items.length
  const resolved = items.filter((i) => statuses.has(i.id)).length
  return { resolved, total, percent: total === 0 ? 0 : Math.round((resolved / total) * 100) }
}

/** Mensaje de Jimy según el avance. `undefined` = no hay mensaje nuevo para este punto. */
export function jimyMessage({ resolved, total, percent }: SessionProgress): string | undefined {
  if (total === 0 || resolved === 0) return undefined
  if (resolved === total) return '¡Rutina completa! Presente dado.'
  if (resolved === total - 1) return 'Último y a casa.'
  if (percent >= 75) return 'Ya está casi. No aflojes ahora.'
  if (percent >= 50) return 'Mitad hecha. Dale que falta menos.'
  if (resolved === 1) return 'Arrancamos. Una menos.'
  return undefined
}
