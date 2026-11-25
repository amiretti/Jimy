import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { metricSeries, type MetricKind } from '@domain/metrics/metrics'
import type { LastPerformance } from '@domain/session/session'
import { useServices } from '../hooks/services'
import { LineChartWithTable } from '../components/LineChartWithTable'
import { formatDate, formatSet } from '../components/format'

const METRICS: { kind: MetricKind; label: string; unit: string }[] = [
  { kind: 'maxLoad', label: 'Peso máximo', unit: 'kg' },
  { kind: 'e1rm', label: '1RM estimado', unit: 'kg' },
  { kind: 'volume', label: 'Volumen', unit: 'kg' },
  { kind: 'totalReps', label: 'Reps totales', unit: 'reps' },
]

/** Historial y evolución de un ejercicio (atraviesa rutinas). */
export function ExercisePage() {
  const { exerciseId = '' } = useParams()
  const { progress } = useServices()
  const [history, setHistory] = useState<LastPerformance[] | null>(null)
  const [metric, setMetric] = useState<MetricKind>('maxLoad')

  useEffect(() => {
    progress.history(exerciseId).then(setHistory)
  }, [progress, exerciseId])

  if (!history) return <p className="status">Cargando…</p>
  const current = METRICS.find((m) => m.kind === metric) ?? METRICS[0]!

  return (
    <main className="page">
      <Link to="/">← Volver a Hoy</Link>
      <h1>Evolución</h1>

      <fieldset className="segmented">
        <legend className="visually-hidden">Métrica</legend>
        {METRICS.map((m) => (
          <label key={m.kind} className={`segmented__option${m.kind === metric ? ' segmented__option--active' : ''}`}>
            <input type="radio" name="metric" value={m.kind} checked={m.kind === metric} onChange={() => setMetric(m.kind)} />
            {m.label}
          </label>
        ))}
      </fieldset>

      <LineChartWithTable
        title={current.label}
        unit={current.unit}
        data={metricSeries(history, metric)}
        series={[{ key: 'value', label: current.label }]}
      />

      <h2>Historial</h2>
      {history.length === 0 ? (
        <p>Sin registros todavía.</p>
      ) : (
        <ul className="history">
          {history.map((h) => (
            <li key={h.date + h.sets[0]?.sessionId}>
              <strong>{formatDate(h.date)}</strong>:{' '}
              {h.sets
                .filter((s) => s.kind === 'work')
                .map(formatSet)
                .join(' · ')}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
