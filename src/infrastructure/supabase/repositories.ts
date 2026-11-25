import type { SupabaseClient, User } from '@supabase/supabase-js'
import type {
  AuthPort,
  AuthUser,
  BodyWeightRepository,
  ExerciseCatalog,
  PerformanceRepository,
  RoutineRepository,
  SessionRepository,
} from '@application/ports/ports'
import { unwrap } from './client'
import {
  toExercise,
  toPerformance,
  toRoutine,
  toSession,
  toSetLog,
  type ExerciseRow,
  type RoutineRow,
  type SessionRow,
  type SetLogRow,
} from './mappers'

const ROUTINE_SELECT = 'id, name, valid_from, active, routine_days ( id, label, position, routine_items ( * ) )'

const toAuthUser = (user: User | null | undefined): AuthUser | null =>
  user
    ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name as string | undefined,
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
      }
    : null

export function createSupabaseAuth(db: SupabaseClient): AuthPort {
  return {
    async currentUser() {
      const { data } = await db.auth.getUser()
      return toAuthUser(data.user)
    },
    async signInWithGoogle() {
      const { error } = await db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
      if (error) throw new Error(error.message)
    },
    async signOut() {
      await db.auth.signOut()
    },
    onChange(listener) {
      const { data } = db.auth.onAuthStateChange((_event, session) => listener(toAuthUser(session?.user)))
      return () => data.subscription.unsubscribe()
    },
  }
}

export function createSupabaseRoutines(db: SupabaseClient): RoutineRepository {
  async function byId(id: string) {
    return toRoutine(unwrap(await db.from('routines').select(ROUTINE_SELECT).eq('id', id).single<RoutineRow>()))
  }
  return {
    async getActive() {
      const row = unwrap(await db.from('routines').select(ROUTINE_SELECT).eq('active', true).maybeSingle<RoutineRow>())
      return row ? toRoutine(row) : null
    },
    async duplicate(routineId, name) {
      const id = unwrap(await db.rpc('duplicate_routine', { p_routine_id: routineId, p_name: name })) as string
      return byId(id)
    },
    async activate(routineId) {
      unwrap(await db.rpc('activate_routine', { p_routine_id: routineId }))
    },
    async seedInitial() {
      unwrap(await db.rpc('seed_initial_routine'))
    },
  }
}

export function createSupabaseSessions(db: SupabaseClient): SessionRepository {
  return {
    async start(routineDayId) {
      return toSession(unwrap(await db.from('sessions').insert({ routine_day_id: routineDayId }).select().single<SessionRow>()))
    },
    async findOpen() {
      const row = unwrap(
        await db
          .from('sessions')
          .select()
          .is('finished_at', null)
          .gte('started_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle<SessionRow>(),
      )
      return row ? toSession(row) : null
    },
    async lastDayId() {
      const row = unwrap(
        await db.from('sessions').select('routine_day_id').order('started_at', { ascending: false }).limit(1).maybeSingle<{ routine_day_id: string }>(),
      )
      return row?.routine_day_id
    },
    async finish(sessionId) {
      unwrap(await db.from('sessions').update({ finished_at: new Date().toISOString() }).eq('id', sessionId))
    },
    async logSet(set) {
      const row = unwrap(
        await db
          .from('set_logs')
          .insert({
            session_id: set.sessionId,
            exercise_id: set.exerciseId,
            set_number: set.setNumber,
            kind: set.kind,
            reps: set.reps ?? null,
            load: set.load ?? null,
            load_label: set.loadLabel ?? null,
            duration_s: set.durationS ?? null,
          })
          .select()
          .single<SetLogRow>(),
      )
      return toSetLog(row)
    },
    async removeSet(setId) {
      unwrap(await db.from('set_logs').delete().eq('id', setId))
    },
    async setLogs(sessionId) {
      const rows = unwrap(await db.from('set_logs').select().eq('session_id', sessionId).order('logged_at').returns<SetLogRow[]>())
      return rows.map(toSetLog)
    },
    async setItemStatus(sessionId, routineItemId, status) {
      unwrap(
        await db
          .from('session_items')
          .upsert({ session_id: sessionId, routine_item_id: routineItemId, status, resolved_at: new Date().toISOString() }),
      )
    },
    async itemStatuses(sessionId) {
      const rows = unwrap(
        await db
          .from('session_items')
          .select('routine_item_id, status')
          .eq('session_id', sessionId)
          .returns<{ routine_item_id: string; status: 'done' | 'skipped' | null }[]>(),
      )
      return rows.map((r) => ({ routineItemId: r.routine_item_id, status: r.status }))
    },
  }
}

type PerformanceRow = { exercise_id?: string; session_date: string; sets: SetLogRow[] }

export function createSupabasePerformance(db: SupabaseClient): PerformanceRepository {
  return {
    async lastPerformances(exerciseIds, excludeSessionId) {
      if (exerciseIds.length === 0) return []
      const rows = unwrap(
        await db.rpc('last_performances', { exercise_ids: exerciseIds, exclude_session: excludeSessionId ?? null }),
      ) as PerformanceRow[]
      return rows.map((r) => toPerformance(r.exercise_id ?? '', r.session_date, r.sets))
    },
    async history(exerciseId, limit = 50) {
      const rows = unwrap(await db.rpc('exercise_history', { p_exercise_id: exerciseId, max_sessions: limit })) as PerformanceRow[]
      return rows.map((r) => toPerformance(exerciseId, r.session_date, r.sets))
    },
  }
}

export function createSupabaseBodyWeights(db: SupabaseClient): BodyWeightRepository {
  return {
    async upsert(entry) {
      unwrap(await db.from('body_weights').upsert({ date: entry.date, weight_kg: entry.weightKg, note: entry.note ?? null }))
    },
    async list(fromDate) {
      let query = db.from('body_weights').select('date, weight_kg, note').order('date')
      if (fromDate) query = query.gte('date', fromDate)
      const rows = unwrap(await query.returns<{ date: string; weight_kg: number; note: string | null }[]>())
      return rows.map((r) => ({ date: r.date, weightKg: Number(r.weight_kg), note: r.note ?? undefined }))
    },
  }
}

export function createSupabaseCatalog(db: SupabaseClient): ExerciseCatalog {
  return {
    async search(query, limit = 20) {
      const rows = unwrap(await db.rpc('search_exercises', { q: query, max_results: limit })) as ExerciseRow[]
      return rows.map(toExercise)
    },
  }
}
