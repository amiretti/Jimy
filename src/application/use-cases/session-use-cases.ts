import { suggestNextDay, type Routine, type RoutineDay } from '@domain/routine/routine'
import type { LastPerformance, Session, SetLog } from '@domain/session/session'
import {
  computeProgress,
  jimyMessage,
  resolveStatuses,
  type ItemStatus,
  type SessionProgress,
} from '@domain/session/progress'
import type { PerformanceRepository, RoutineRepository, SessionRepository } from '../ports/ports'

export interface TodayView {
  readonly routine: Routine
  readonly day: RoutineDay
  readonly session: Session | null
  readonly lastPerformances: ReadonlyMap<string, LastPerformance>
  readonly logs: readonly SetLog[]
  readonly statuses: ReadonlyMap<string, ItemStatus>
  readonly progress: SessionProgress
  readonly message?: string
}

export interface SessionDeps {
  readonly routines: RoutineRepository
  readonly sessions: SessionRepository
  readonly performance: PerformanceRepository
}

/** Casos de uso de la pantalla "Hoy". Funciones simples sobre puertos (KISS). */
export function createSessionUseCases({ routines, sessions, performance }: SessionDeps) {
  async function loadToday(dayId?: string): Promise<TodayView | null> {
    const routine = await routines.getActive()
    if (!routine) return null

    const open = await sessions.findOpen()
    const day =
      routine.days.find((d) => d.id === (dayId ?? open?.routineDayId)) ??
      suggestNextDay(routine.days, await sessions.lastDayId())
    if (!day) return null

    const session = open && open.routineDayId === day.id ? open : null
    const exerciseIds = day.items.flatMap((i) => (i.exerciseId ? [i.exerciseId] : []))
    const [last, logs, manual] = await Promise.all([
      performance.lastPerformances(exerciseIds, session?.id),
      session ? sessions.setLogs(session.id) : Promise.resolve([]),
      session ? sessions.itemStatuses(session.id) : Promise.resolve([]),
    ])

    const statuses = resolveStatuses(day.items, logs, new Map(manual.map((m) => [m.routineItemId, m.status])))
    const progress = computeProgress(day.items, statuses)
    return {
      routine,
      day,
      session,
      lastPerformances: new Map(last.map((p) => [p.exerciseId, p])),
      logs,
      statuses,
      progress,
      message: jimyMessage(progress),
    }
  }

  return {
    loadToday,
    seedInitialRoutine: () => routines.seedInitial(),
    startSession: (dayId: string) => sessions.start(dayId),
    finishSession: (sessionId: string) => sessions.finish(sessionId),
    logSet: (set: Omit<SetLog, 'id' | 'loggedAt'>) => sessions.logSet(set),
    removeSet: (setId: string) => sessions.removeSet(setId),
    /** Tildar, destildar (`null`) o saltear un ítem. */
    resolveItem: (sessionId: string, itemId: string, status: ItemStatus | null) =>
      sessions.setItemStatus(sessionId, itemId, status),
  }
}

export type SessionUseCases = ReturnType<typeof createSessionUseCases>
