import { describe, expect, it } from 'vitest'
import type { SetLog } from '../session/session'
import { epley1RM, metricSeries, sessionMetric } from './metrics'
import { withMovingAverage } from '../body-weight/body-weight'
import { toSlug } from '../catalog/exercise'
import { formatPrescription, suggestNextDay, type RoutineDay, type RoutineItem } from '../routine/routine'

const set = (load: number, reps: number, kind: SetLog['kind'] = 'work'): SetLog => ({
  sessionId: 's',
  exerciseId: 'e',
  setNumber: 1,
  kind,
  load,
  reps,
  loggedAt: '2026-11-20T10:00:00Z',
})

describe('métricas', () => {
  it('Epley', () => {
    expect(epley1RM(40, 10)).toBe(53.3)
    expect(epley1RM(100, 1)).toBe(100)
  })

  it('excluye series de aproximación', () => {
    const sets = [set(60, 5, 'warmup'), set(40, 10), set(42.5, 8)]
    expect(sessionMetric(sets, 'maxLoad')).toBe(42.5)
    expect(sessionMetric(sets, 'volume')).toBe(740)
    expect(sessionMetric(sets, 'totalReps')).toBe(18)
  })

  it('arma la serie ordenada por fecha', () => {
    const series = metricSeries(
      [
        { date: '2026-11-20', sets: [set(45, 8)] },
        { date: '2026-11-13', sets: [set(40, 8)] },
      ],
      'maxLoad',
    )
    expect(series.map((p) => p.value)).toEqual([40, 45])
  })
})

describe('peso corporal', () => {
  it('media móvil de 7 días', () => {
    const points = withMovingAverage([
      { date: '2026-11-01', weightKg: 80 },
      { date: '2026-11-03', weightKg: 81 },
      { date: '2026-11-10', weightKg: 79 },
    ])
    expect(points.map((p) => p.movingAvg7)).toEqual([80, 80.5, 79])
  })
})

describe('catálogo y rutina', () => {
  it('slug sin tildes ni signos', () => {
    expect(toSlug('Búlgaras  (a 1 pie)')).toBe('bulgaras-a-1-pie')
  })

  it('formatea como el papel del profe', () => {
    const item: RoutineItem = {
      id: 'i',
      position: 1,
      kind: 'exercise',
      exerciseId: 'e',
      name: 'Banco plano',
      sets: { min: 3, max: 3 },
      reps: { min: 6, max: 8 },
      load: { type: 'kg', min: 30, max: 60 },
      warmup: { sets: 1, reps: 10 },
      perSide: false,
    }
    expect(formatPrescription(item)).toBe('1×10 / 3×6-8×30-60 kg')
    expect(formatPrescription({ ...item, warmup: undefined, sets: { min: 3, max: 3 }, reps: { min: 5, max: 7 }, load: { type: 'kg', label: 'sin', max: 15 }, perSide: true })).toBe(
      '3×5-7 c/lado×sin-15 kg',
    )
  })

  it('sugiere el día siguiente', () => {
    const days: RoutineDay[] = ['A', 'B', 'C'].map((label, position) => ({ id: label, label, position, items: [] }))
    expect(suggestNextDay(days)?.label).toBe('A')
    expect(suggestNextDay(days, 'C')?.label).toBe('A')
    expect(suggestNextDay(days, 'A')?.label).toBe('B')
  })
})
