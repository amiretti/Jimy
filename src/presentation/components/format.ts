import type { SetLog } from '@domain/session/session'

const kg = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

/** "40 kg × 8", "violeta × 10", "30 s". */
export function formatSet(set: Pick<SetLog, 'reps' | 'load' | 'loadLabel' | 'durationS'>): string {
  if (set.durationS) return `${set.durationS} s`
  const load = set.load !== undefined && set.load > 0 ? `${kg.format(set.load)} kg` : set.loadLabel
  return [load, set.reps !== undefined ? `${set.reps}` : undefined].filter(Boolean).join(' × ')
}

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-')
  return `${d}/${m}/${y?.slice(2)}`
}
