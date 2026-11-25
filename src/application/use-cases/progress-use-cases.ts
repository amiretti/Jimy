import { metricSeries, type MetricKind, type MetricPoint } from '@domain/metrics/metrics'
import { isValidWeight, withMovingAverage, type BodyWeight, type BodyWeightPoint } from '@domain/body-weight/body-weight'
import type { LastPerformance } from '@domain/session/session'
import type { BodyWeightRepository, PerformanceRepository } from '../ports/ports'

export interface ProgressDeps {
  readonly performance: PerformanceRepository
  readonly bodyWeights: BodyWeightRepository
}

/** Historial, evolución por ejercicio y peso corporal. */
export function createProgressUseCases({ performance, bodyWeights }: ProgressDeps) {
  return {
    history: (exerciseId: string): Promise<LastPerformance[]> => performance.history(exerciseId),

    async evolution(exerciseId: string, metric: MetricKind): Promise<MetricPoint[]> {
      return metricSeries(await performance.history(exerciseId, 200), metric)
    },

    async logBodyWeight(entry: BodyWeight): Promise<void> {
      if (!isValidWeight(entry.weightKg)) throw new Error('Peso fuera de rango (20 a 400 kg).')
      await bodyWeights.upsert(entry)
    },

    async bodyWeightTrend(fromDate?: string): Promise<BodyWeightPoint[]> {
      return withMovingAverage(await bodyWeights.list(fromDate))
    },
  }
}

export type ProgressUseCases = ReturnType<typeof createProgressUseCases>
