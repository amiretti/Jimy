import type { Routine } from '@domain/routine/routine'
import type { LastPerformance, Session, SetLog } from '@domain/session/session'
import type { ItemResolution, ItemStatus } from '@domain/session/progress'
import type { BodyWeight } from '@domain/body-weight/body-weight'
import type { Exercise } from '@domain/catalog/exercise'

/** Puertos: Application define qué necesita; Infrastructure (Supabase) lo implementa. */

export interface AuthUser {
  readonly id: string
  readonly email?: string
  readonly name?: string
  readonly avatarUrl?: string
}

export interface AuthPort {
  currentUser(): Promise<AuthUser | null>
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  onChange(listener: (user: AuthUser | null) => void): () => void
}

export interface RoutineRepository {
  getActive(): Promise<Routine | null>
  /** Copia días e ítems de la rutina activa en una nueva (inactiva hasta confirmar). */
  duplicate(routineId: string, name: string): Promise<Routine>
  /** Activa la rutina y archiva la anterior. */
  activate(routineId: string): Promise<void>
  /** Primera carga: crea la rutina inicial del profe (seed) para el usuario logueado. */
  seedInitial(): Promise<void>
}

export interface SessionRepository {
  start(routineDayId: string): Promise<Session>
  findOpen(): Promise<Session | null>
  lastDayId(): Promise<string | undefined>
  finish(sessionId: string): Promise<void>
  logSet(set: Omit<SetLog, 'id' | 'loggedAt'>): Promise<SetLog>
  removeSet(setId: string): Promise<void>
  setLogs(sessionId: string): Promise<SetLog[]>
  /** `null` = destildado explícito (pisa el tilde automático). */
  setItemStatus(sessionId: string, routineItemId: string, status: ItemStatus | null): Promise<void>
  itemStatuses(sessionId: string): Promise<(Omit<ItemResolution, 'status'> & { status: ItemStatus | null })[]>
}

export interface PerformanceRepository {
  /** Última sesión de cada ejercicio, de cualquier rutina, excluyendo la sesión actual. */
  lastPerformances(exerciseIds: readonly string[], excludeSessionId?: string): Promise<LastPerformance[]>
  /** Historial de un ejercicio, de la sesión más nueva a la más vieja. */
  history(exerciseId: string, limit?: number): Promise<LastPerformance[]>
}

export interface BodyWeightRepository {
  upsert(entry: BodyWeight): Promise<void>
  list(fromDate?: string): Promise<BodyWeight[]>
}

export interface ExerciseCatalog {
  /** Búsqueda difusa (pg_trgm) sobre nombre y alias. */
  search(query: string, limit?: number): Promise<Exercise[]>
}
