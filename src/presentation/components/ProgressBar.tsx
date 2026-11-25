import type { SessionProgress } from '@domain/session/progress'

/** Barra de avance fija. El texto se anuncia a lectores de pantalla (aria-live). */
export function ProgressBar({ progress, message }: { progress: SessionProgress; message?: string }) {
  const { resolved, total, percent } = progress
  return (
    <section className="progress" aria-label="Avance de la sesión">
      <div
        className="progress__track"
        role="progressbar"
        aria-label="Ejercicios resueltos"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${resolved} de ${total}, ${percent} %`}
      >
        <div className="progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="progress__text" aria-live="polite">
        <strong>
          {resolved} de {total} · {percent} %
        </strong>
        {message && <span className="progress__message"> {message}</span>}
      </p>
    </section>
  )
}
