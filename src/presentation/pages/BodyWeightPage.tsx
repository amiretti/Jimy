import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import type { BodyWeightPoint } from '@domain/body-weight/body-weight'
import { useServices } from '../hooks/services'
import { LineChartWithTable } from '../components/LineChartWithTable'

const today = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD en hora local

/** Peso corporal: opcional, sin recordatorios. */
export function BodyWeightPage() {
  const { progress } = useServices()
  const [points, setPoints] = useState<BodyWeightPoint[]>([])
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(today)
  const [feedback, setFeedback] = useState<string | null>(null)
  const weightId = useId()
  const dateId = useId()

  const load = useCallback(async () => setPoints(await progress.bodyWeightTrend()), [progress])
  useEffect(() => {
    let alive = true
    progress.bodyWeightTrend().then((p) => alive && setPoints(p))
    return () => {
      alive = false
    }
  }, [progress])

  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      await progress.logBodyWeight({ date, weightKg: Number(weight.replace(',', '.')) })
      setFeedback('Peso guardado.')
      setWeight('')
      await load()
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'No se pudo guardar.')
    }
  }

  return (
    <main className="page">
      <h1>Peso corporal</h1>
      <form className="form" onSubmit={submit}>
        <div className="form__row">
          <label htmlFor={weightId}>Peso (kg)</label>
          <input id={weightId} inputMode="decimal" required value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div className="form__row">
          <label htmlFor={dateId}>Fecha</label>
          <input id={dateId} type="date" required value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button type="submit" className="btn btn--primary btn--block">
          Guardar
        </button>
        <p aria-live="polite" className="form__feedback">
          {feedback}
        </p>
      </form>

      <LineChartWithTable
        title="Tendencia (media móvil de 7 días)"
        unit="kg"
        data={points}
        series={[
          { key: 'movingAvg7', label: 'Media 7 días' },
          { key: 'weightKg', label: 'Peso del día' },
        ]}
      />
    </main>
  )
}
