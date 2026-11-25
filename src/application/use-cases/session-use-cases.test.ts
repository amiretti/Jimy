import { describe, expect, it } from 'vitest'
import type { Routine } from '@domain/routine/routine'
import type { Session, SetLog } from '@domain/session/session'
import type { ItemStatus } from '@domain/session/progress'
import type { PerformanceRepository, RoutineRepository, SessionRepository } from '../ports/ports'
import { createSessionUseCases } from './session-use-cases'

const routine: Routine = {
  id: 'r1',
  name: 'Rutina noviembre',
  validFrom: '2026-11-23',
  active: true,
  days: [
    {
      id: 'dA',
      label: 'A',
      position: 0,
      items: [
        { id: 'i1', position: 1, kind: 'exercise', exerciseId: 'quads', name: 'Cuádriceps', sets: { min: 4, max: 4 }, reps: { min: 10, max: 13 }, load: { type: 'kg', min: 25, max: 65 }, perSide: false },
        { id: 'i2', position: 2, kind: 'note', name: 'Foam + elongo', load: { type: 'none' }, perSide: false },
      ],
    },
    { id: 'dB', label: 'B', position: 1, items: [] },
  ],
}

/** Fakes en memoria: los casos de uso se testean sin Supabase. */
function fakes() {
  let session: Session | null = null
  const logs: SetLog[] = []
  const manual = new Map<string, ItemStatus | null>()
  const routines: RoutineRepository = {
    getActive: async () => routine,
    duplicate: async () => routine,
    activate: async () => {},
    seedInitial: async () => {},
  }
  const sessions: SessionRepository = {
    start: async (dayId) => (session = { id: 's1', routineDayId: dayId, startedAt: '2026-11-25T10:00:00Z' }),
    findOpen: async () => session,
    lastDayId: async () => 'dB',
    finish: async () => {},
    logSet: async (set) => {
      const saved = { ...set, id: `l${logs.length}`, loggedAt: '2026-11-25T10:05:00Z' }
      logs.push(saved)
      return saved
    },
    removeSet: async () => {},
    setLogs: async () => logs,
    setItemStatus: async (_s, itemId, status) => void manual.set(itemId, status),
    itemStatuses: async () => [...manual].map(([routineItemId, status]) => ({ routineItemId, status })),
  }
  const performance: PerformanceRepository = {
    lastPerformances: async () => [],
    history: async () => [],
  }
  return createSessionUseCases({ routines, sessions, performance })
}

describe('casos de uso de sesión', () => {
  it('sugiere el día siguiente al último entrenado', async () => {
    const view = await fakes().loadToday()
    expect(view?.day.label).toBe('A')
    expect(view?.progress).toEqual({ resolved: 0, total: 2, percent: 0 })
  })

  it('el avance sube con el tilde automático y el manual', async () => {
    const uc = fakes()
    const session = await uc.startSession('dA')
    for (let n = 1; n <= 4; n++) {
      await uc.logSet({ sessionId: session.id, exerciseId: 'quads', setNumber: n, kind: 'work', reps: 10, load: 40 })
    }
    let view = await uc.loadToday()
    expect(view?.progress.percent).toBe(50)
    expect(view?.message).toBe('Último y a casa.')

    await uc.resolveItem(session.id, 'i2', 'done')
    view = await uc.loadToday()
    expect(view?.progress.percent).toBe(100)
    expect(view?.message).toBe('¡Rutina completa! Presente dado.')
  })
})
