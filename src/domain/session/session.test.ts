import { describe, expect, it } from 'vitest'
import type { RoutineItem } from '../routine/routine'
import { adjust, prefillSet, type LastPerformance, type SetLog } from './session'
import { computeProgress, jimyMessage, resolveStatuses } from './progress'

const bench: RoutineItem = {
  id: 'i-bench',
  position: 4,
  kind: 'exercise',
  exerciseId: 'ex-bench',
  name: 'Banco plano',
  sets: { min: 3, max: 3 },
  reps: { min: 6, max: 8 },
  load: { type: 'kg', min: 30, max: 60 },
  warmup: { sets: 1, reps: 10 },
  perSide: false,
}

const foam: RoutineItem = { id: 'i-foam', position: 9, kind: 'note', name: 'Foam + elongo', load: { type: 'none' }, perSide: false }

const log = (setNumber: number, load: number, reps: number, kind: SetLog['kind'] = 'work'): SetLog => ({
  sessionId: 's1',
  exerciseId: 'ex-bench',
  setNumber,
  kind,
  load,
  reps,
  loggedAt: '2026-11-20T10:00:00Z',
})

describe('prefillSet', () => {
  it('sin historial usa el mínimo del rango', () => {
    expect(prefillSet(bench, 1)).toEqual({ reps: 6, load: 30, loadLabel: undefined, durationS: undefined })
  })

  it('usa la misma serie de la última vez, ignorando la aproximación', () => {
    const last: LastPerformance = {
      exerciseId: 'ex-bench',
      date: '2026-11-20',
      sets: [log(1, 20, 10, 'warmup'), log(1, 40, 8), log(2, 42.5, 7)],
    }
    expect(prefillSet(bench, 2, last)).toMatchObject({ load: 42.5, reps: 7 })
  })

  it('si la serie no existió, repite la última serie efectiva', () => {
    const last: LastPerformance = { exerciseId: 'ex-bench', date: '2026-11-20', sets: [log(1, 40, 8)] }
    expect(prefillSet(bench, 3, last)).toMatchObject({ load: 40, reps: 8 })
  })
})

describe('adjust', () => {
  it('suma y resta sin bajar de cero', () => {
    expect(adjust(40, 2.5, 1)).toBe(42.5)
    expect(adjust(1, 2.5, -1)).toBe(0)
  })
})

describe('progreso de la sesión', () => {
  const items = [bench, foam]

  it('tilda solo al llegar a sets.min series efectivas', () => {
    const two = resolveStatuses(items, [log(1, 20, 10, 'warmup'), log(1, 40, 8), log(2, 40, 8)], new Map())
    expect(two.has('i-bench')).toBe(false)
    const three = resolveStatuses(items, [log(1, 40, 8), log(2, 40, 8), log(3, 40, 7)], new Map())
    expect(three.get('i-bench')).toBe('done')
  })

  it('lo manual manda: destildar y saltear', () => {
    const logs = [log(1, 40, 8), log(2, 40, 8), log(3, 40, 7)]
    const statuses = resolveStatuses(items, logs, new Map([['i-bench', null], ['i-foam', 'skipped']]))
    expect(statuses.has('i-bench')).toBe(false)
    expect(statuses.get('i-foam')).toBe('skipped')
  })

  it('calcula porcentaje y mensajes de Jimy', () => {
    const p = computeProgress(items, new Map([['i-bench', 'done' as const]]))
    expect(p).toEqual({ resolved: 1, total: 2, percent: 50 })
    expect(jimyMessage(p)).toBe('Último y a casa.')
    expect(jimyMessage({ resolved: 2, total: 2, percent: 100 })).toBe('¡Rutina completa! Presente dado.')
    expect(jimyMessage({ resolved: 5, total: 9, percent: 56 })).toBe('Mitad hecha. Dale que falta menos.')
    expect(jimyMessage({ resolved: 1, total: 9, percent: 11 })).toBe('Arrancamos. Una menos.')
  })
})
