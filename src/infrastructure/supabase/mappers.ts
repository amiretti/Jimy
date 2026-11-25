import type { LoadType, Routine, RoutineItem, Range } from '@domain/routine/routine'
import type { LastPerformance, Session, SetLog } from '@domain/session/session'
import type { Exercise } from '@domain/catalog/exercise'

/** Filas tal como vienen de Postgres (snake_case). Solo Infrastructure las conoce. */
export interface RoutineItemRow {
  id: string
  position: number
  kind: 'exercise' | 'note'
  exercise_id: string | null
  name: string
  superset_group: number | null
  sets_min: number | null
  sets_max: number | null
  reps_min: number | null
  reps_max: number | null
  duration_min_s: number | null
  duration_max_s: number | null
  load_type: LoadType
  load_min: number | null
  load_max: number | null
  load_label: string | null
  warmup_sets: number | null
  warmup_reps: number | null
  per_side: boolean
  variants: number | null
  notes: string | null
}

export interface RoutineRow {
  id: string
  name: string
  valid_from: string
  active: boolean
  routine_days: { id: string; label: string; position: number; routine_items: RoutineItemRow[] }[]
}

export interface SetLogRow {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  kind: 'warmup' | 'work'
  reps: number | null
  load: number | null
  load_label: string | null
  duration_s: number | null
  logged_at: string
}

export interface SessionRow {
  id: string
  routine_day_id: string
  started_at: string
  finished_at: string | null
}

export interface ExerciseRow {
  id: string
  name: string
  slug: string
  aliases: string[]
  muscle_groups: string[]
  equipment: string | null
  default_load_type: LoadType
  instructions: string | null
}

const range = (min: number | null, max: number | null): Range | undefined =>
  min === null && max === null ? undefined : { min: min ?? max ?? 0, max: max ?? min ?? 0 }

const opt = <T>(value: T | null): T | undefined => value ?? undefined

export function toRoutineItem(row: RoutineItemRow): RoutineItem {
  return {
    id: row.id,
    position: row.position,
    kind: row.kind,
    exerciseId: opt(row.exercise_id),
    name: row.name,
    supersetGroup: opt(row.superset_group),
    sets: range(row.sets_min, row.sets_max),
    reps: range(row.reps_min, row.reps_max),
    durationS: range(row.duration_min_s, row.duration_max_s),
    load: {
      type: row.load_type,
      min: opt(row.load_min === null ? null : Number(row.load_min)),
      max: opt(row.load_max === null ? null : Number(row.load_max)),
      label: opt(row.load_label),
    },
    warmup: row.warmup_sets && row.warmup_reps ? { sets: row.warmup_sets, reps: row.warmup_reps } : undefined,
    perSide: row.per_side,
    variants: opt(row.variants),
    notes: opt(row.notes),
  }
}

export function toRoutine(row: RoutineRow): Routine {
  return {
    id: row.id,
    name: row.name,
    validFrom: row.valid_from,
    active: row.active,
    days: [...row.routine_days]
      .sort((a, b) => a.position - b.position)
      .map((d) => ({
        id: d.id,
        label: d.label,
        position: d.position,
        items: [...d.routine_items].sort((a, b) => a.position - b.position).map(toRoutineItem),
      })),
  }
}

export function toSetLog(row: SetLogRow): SetLog {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    kind: row.kind,
    reps: opt(row.reps),
    load: row.load === null ? undefined : Number(row.load),
    loadLabel: opt(row.load_label),
    durationS: opt(row.duration_s),
    loggedAt: row.logged_at,
  }
}

export function toSession(row: SessionRow): Session {
  return { id: row.id, routineDayId: row.routine_day_id, startedAt: row.started_at, finishedAt: opt(row.finished_at) }
}

export function toPerformance(exerciseId: string, date: string, sets: SetLogRow[]): LastPerformance {
  return { exerciseId, date: date.slice(0, 10), sets: sets.map(toSetLog) }
}

export function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    aliases: row.aliases,
    muscleGroups: row.muscle_groups,
    equipment: opt(row.equipment),
    defaultLoadType: row.default_load_type,
    instructions: opt(row.instructions),
  }
}
