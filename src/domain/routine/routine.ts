/** Rango indicado por el profe. Es guía de progresión, no un límite estricto. */
export interface Range {
  readonly min: number
  readonly max: number
}

export type LoadType = 'kg' | 'band' | 'bodyweight' | 'time' | 'none'

export interface LoadPrescription {
  readonly type: LoadType
  readonly min?: number
  readonly max?: number
  /** Texto libre: color de banda ("violeta") o "sin" para peso corporal. */
  readonly label?: string
}

export type RoutineItemKind = 'exercise' | 'note'

export interface RoutineItem {
  readonly id: string
  readonly position: number
  /** `note` = elongo, foam, etc.: se muestra pero no se registra. */
  readonly kind: RoutineItemKind
  readonly exerciseId?: string
  readonly name: string
  /** Mismo número = superserie. */
  readonly supersetGroup?: number
  readonly sets?: Range
  readonly reps?: Range
  readonly durationS?: Range
  readonly load: LoadPrescription
  /** Series de aproximación, por ejemplo el "1×10 /". */
  readonly warmup?: { readonly sets: number; readonly reps: number }
  /** Se registra un solo valor, entendido como lo hecho en cada lado. */
  readonly perSide: boolean
  readonly variants?: number
  readonly notes?: string
}

export interface RoutineDay {
  readonly id: string
  readonly label: string
  readonly position: number
  readonly items: readonly RoutineItem[]
}

export interface Routine {
  readonly id: string
  readonly name: string
  readonly validFrom: string
  readonly active: boolean
  readonly days: readonly RoutineDay[]
}

/** Sugiere el día que sigue al último entrenado (A → B → C → A). */
export function suggestNextDay(days: readonly RoutineDay[], lastDayId?: string): RoutineDay | undefined {
  const ordered = [...days].sort((a, b) => a.position - b.position)
  if (ordered.length === 0) return undefined
  const lastIndex = ordered.findIndex((d) => d.id === lastDayId)
  return ordered[(lastIndex + 1) % ordered.length]
}

/** Formatea la prescripción como en el papel del profe: "4×10-13×25-65 kg". */
export function formatPrescription(item: RoutineItem): string {
  if (item.kind === 'note') return item.notes ?? ''
  const parts: string[] = []
  if (item.sets) parts.push(formatRange(item.sets))
  if (item.reps) parts.push(formatRange(item.reps) + (item.perSide ? ' c/lado' : ''))
  if (item.durationS) parts.push(`${formatRange(item.durationS)} s`)
  const load = formatLoad(item.load)
  if (load) parts.push(load)
  const main = parts.join('×')
  return item.warmup ? `${item.warmup.sets}×${item.warmup.reps} / ${main}` : main
}

function formatRange({ min, max }: Range): string {
  return min === max ? `${min}` : `${min}-${max}`
}

function formatLoad(load: LoadPrescription): string {
  switch (load.type) {
    case 'kg':
      if (load.min === undefined && load.max === undefined) return ''
      return `${load.label ?? load.min ?? ''}${load.max !== undefined ? `-${load.max}` : ''} kg`
    case 'band':
      return `banda ${load.label ?? ''}`.trim()
    case 'bodyweight':
      return load.label ?? 'peso corporal'
    default:
      return ''
  }
}
