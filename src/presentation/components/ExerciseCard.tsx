import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrescription, type RoutineItem } from '@domain/routine/routine'
import { prefillSet, STEP, type LastPerformance, type SetDraft, type SetKind, type SetLog } from '@domain/session/session'
import type { ItemStatus } from '@domain/session/progress'
import { Stepper } from './Stepper'
import { formatDate, formatSet } from './format'

interface ExerciseCardProps {
  readonly item: RoutineItem
  readonly last?: LastPerformance
  readonly logs: readonly SetLog[]
  readonly status?: ItemStatus
  readonly disabled: boolean
  readonly onLog: (draft: SetDraft, kind: SetKind, setNumber: number) => Promise<void>
  readonly onResolve: (status: ItemStatus | null) => Promise<void>
}

export function ExerciseCard({ item, last, logs, status, disabled, onLog, onResolve }: ExerciseCardProps) {
  const mine = logs.filter((l) => l.exerciseId === item.exerciseId)
  const workDone = mine.filter((l) => l.kind === 'work').length
  const warmupPending = item.warmup !== undefined && !mine.some((l) => l.kind === 'warmup')
  const nextSet = workDone + 1
  const [draft, setDraft] = useState<SetDraft>(() => prefillSet(item, nextSet, last))
  const [saving, setSaving] = useState(false)
  const titleId = `item-${item.id}`

  async function log(kind: SetKind) {
    setSaving(true)
    try {
      const values = kind === 'warmup' ? { ...draft, reps: item.warmup?.reps } : draft
      await onLog(values, kind, kind === 'warmup' ? 1 : nextSet)
      if (kind === 'work') setDraft(prefillSet(item, nextSet + 1, last))
    } finally {
      setSaving(false)
    }
  }

  const isNote = item.kind === 'note'
  const loadType = item.load.type

  return (
    <article className={`card${status ? ' card--resolved' : ''}`} aria-labelledby={titleId}>
      <header className="card__header">
        <div>
          <h2 id={titleId} className="card__title">
            {item.name}
            {item.supersetGroup !== undefined && <span className="badge">Superserie</span>}
          </h2>
          <p className="card__prescription">{formatPrescription(item)}</p>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={status === 'done'}
            disabled={disabled}
            onChange={(e) => onResolve(e.target.checked ? 'done' : null)}
          />
          <span>Hecho</span>
        </label>
      </header>

      {!isNote && (
        <>
          <p className="card__last">
            {last ? (
              <>
                <span className="card__last-label">Última vez ({formatDate(last.date)}):</span>{' '}
                {last.sets
                  .filter((s) => s.kind === 'work')
                  .map(formatSet)
                  .join(' · ')}
              </>
            ) : (
              'Primera vez con este ejercicio.'
            )}
          </p>

          {mine.length > 0 && (
            <ol className="card__sets" aria-label="Series registradas hoy">
              {mine.map((s) => (
                <li key={s.id ?? `${s.kind}-${s.setNumber}`}>
                  {s.kind === 'warmup' ? 'Aproximación' : `Serie ${s.setNumber}`}: {formatSet(s)}
                </li>
              ))}
            </ol>
          )}

          {status !== 'skipped' && (
            <div className="card__form">
              {loadType === 'kg' && (
                <Stepper label="Peso" unit="kg" value={draft.load} step={STEP.kg} onChange={(load) => setDraft({ ...draft, load })} />
              )}
              {loadType === 'band' && <p className="card__band">Banda: {draft.loadLabel ?? item.load.label ?? 'sin indicar'}</p>}
              {item.durationS ? (
                <Stepper label="Tiempo" unit="s" value={draft.durationS} step={STEP.durationS} onChange={(durationS) => setDraft({ ...draft, durationS })} />
              ) : (
                <Stepper label="Reps" value={draft.reps} step={STEP.reps} onChange={(reps) => setDraft({ ...draft, reps })} />
              )}
              <div className="card__actions">
                {warmupPending && (
                  <button type="button" className="btn" disabled={disabled || saving} onClick={() => log('warmup')}>
                    Aproximación ({item.warmup?.sets}×{item.warmup?.reps})
                  </button>
                )}
                <button type="button" className="btn btn--primary" disabled={disabled || saving} onClick={() => log('work')}>
                  Registrar serie {nextSet}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <footer className="card__footer">
        {item.exerciseId && <Link to={`/ejercicio/${item.exerciseId}`}>Ver evolución</Link>}
        <button
          type="button"
          className="btn btn--ghost"
          disabled={disabled}
          onClick={() => onResolve(status === 'skipped' ? null : 'skipped')}
        >
          {status === 'skipped' ? 'Deshacer salteo' : 'Saltear'}
        </button>
      </footer>
    </article>
  )
}
