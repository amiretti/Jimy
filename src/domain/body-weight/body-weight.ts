export interface BodyWeight {
  /** YYYY-MM-DD. Una medición por día. */
  readonly date: string
  readonly weightKg: number
  readonly note?: string
}

export interface BodyWeightPoint extends BodyWeight {
  /** Media móvil de los últimos 7 días calendario (incluye el día). */
  readonly movingAvg7: number
}

const DAY_MS = 24 * 60 * 60 * 1000

export function withMovingAverage(entries: readonly BodyWeight[]): BodyWeightPoint[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.map((entry) => {
    const end = Date.parse(entry.date)
    const window = sorted.filter((e) => {
      const t = Date.parse(e.date)
      return t <= end && t > end - 7 * DAY_MS
    })
    const avg = window.reduce((sum, e) => sum + e.weightKg, 0) / window.length
    return { ...entry, movingAvg7: Math.round(avg * 10) / 10 }
  })
}

export function isValidWeight(kg: number): boolean {
  return Number.isFinite(kg) && kg >= 20 && kg <= 400
}
