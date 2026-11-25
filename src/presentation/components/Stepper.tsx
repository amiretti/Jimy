import { useId } from 'react'
import { adjust } from '@domain/session/session'

interface StepperProps {
  readonly label: string
  readonly unit?: string
  readonly value: number | undefined
  readonly step: number
  readonly onChange: (value: number) => void
}

/** Campo numérico con botones +/− de 48 px, pensado para usar con una mano. */
export function Stepper({ label, unit, value, step, onChange }: StepperProps) {
  const id = useId()
  const shown = value ?? 0
  return (
    <div className="stepper">
      <label htmlFor={id} className="stepper__label">
        {label}
      </label>
      <div className="stepper__controls">
        <button
          type="button"
          className="btn btn--icon"
          aria-label={`Bajar ${label.toLowerCase()}, ahora ${shown}${unit ? ` ${unit}` : ''}`}
          onClick={() => onChange(adjust(value, step, -1))}
        >
          −
        </button>
        <input
          id={id}
          className="stepper__input"
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={shown}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        />
        {unit && <span className="stepper__unit">{unit}</span>}
        <button
          type="button"
          className="btn btn--icon"
          aria-label={`Subir ${label.toLowerCase()}, ahora ${shown}${unit ? ` ${unit}` : ''}`}
          onClick={() => onChange(adjust(value, step, 1))}
        >
          +
        </button>
      </div>
    </div>
  )
}
