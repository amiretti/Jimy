import { useCallback, useEffect, useState } from 'react'
import type { TodayView } from '@application/use-cases/session-use-cases'
import type { SetDraft, SetKind } from '@domain/session/session'
import type { ItemStatus } from '@domain/session/progress'
import { useServices } from '../hooks/services'
import { ExerciseCard } from '../components/ExerciseCard'
import { ProgressBar } from '../components/ProgressBar'
import { Logo } from '../components/Logo'

export function TodayPage() {
  const { session: uc } = useServices()
  const [view, setView] = useState<TodayView | null | undefined>(undefined)
  const [dayId, setDayId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(
    async (id?: string) => {
      try {
        setView(await uc.loadToday(id))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar la rutina.')
      }
    },
    [uc],
  )

  useEffect(() => {
    let alive = true
    uc.loadToday(dayId)
      .then((v) => alive && setView(v))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : 'Error al cargar la rutina.'))
    return () => {
      alive = false
    }
  }, [uc, dayId])

  async function run(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
      await reload(dayId ?? view?.day.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.')
    }
  }

  if (view === undefined) {
    return error ? (
      <main className="page">
        <h1>No pudimos cargar tu rutina</h1>
        <p role="alert" className="error">
          {error}
        </p>
        <button type="button" className="btn btn--primary btn--block" onClick={() => run(async () => {})}>
          Reintentar
        </button>
      </main>
    ) : (
      <p className="status">Cargando…</p>
    )
  }

  if (view === null) {
    return (
      <main className="page">
        <h1>Todavía no tenés rutina</h1>
        <p>Cargá la rutina inicial para arrancar.</p>
        <button type="button" className="btn btn--primary btn--block" onClick={() => run(uc.seedInitialRoutine)}>
          Cargar rutina inicial
        </button>
        {error && <p role="alert" className="error">{error}</p>}
      </main>
    )
  }

  const { routine, day, session } = view

  async function ensureSession() {
    return session ?? (await uc.startSession(day.id))
  }

  const onLog = (exerciseId: string) => (draft: SetDraft, kind: SetKind, setNumber: number) =>
    run(async () => {
      const s = await ensureSession()
      await uc.logSet({ sessionId: s.id, exerciseId, setNumber, kind, ...draft })
    })

  const onResolve = (itemId: string) => (status: ItemStatus | null) =>
    run(async () => {
      const s = await ensureSession()
      await uc.resolveItem(s.id, itemId, status)
    })

  return (
    <main className="page">
      <header className="page__header">
        <div className="brand-header">
          <Logo height={32} />
          <span className="page__subtitle">{routine.name}</span>
        </div>
        <h1>Hoy · Día {day.label}</h1>
        <nav aria-label="Día de la rutina">
          <ul className="tabs">
            {routine.days.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className={`tab${d.id === day.id ? ' tab--active' : ''}`}
                  aria-pressed={d.id === day.id}
                  disabled={session !== null && d.id !== day.id}
                  onClick={() => setDayId(d.id)}
                >
                  Día {d.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <ProgressBar progress={view.progress} message={view.message} />
      {error && <p role="alert" className="error">{error}</p>}

      <ol className="items">
        {day.items.map((item) => (
          <li key={item.id}>
            <ExerciseCard
              item={item}
              last={item.exerciseId ? view.lastPerformances.get(item.exerciseId) : undefined}
              logs={view.logs}
              status={view.statuses.get(item.id)}
              disabled={false}
              onLog={onLog(item.exerciseId ?? '')}
              onResolve={onResolve(item.id)}
            />
          </li>
        ))}
      </ol>

      {session && (
        <button type="button" className="btn btn--primary btn--block" onClick={() => run(() => uc.finishSession(session.id))}>
          Terminar sesión
        </button>
      )}
    </main>
  )
}
