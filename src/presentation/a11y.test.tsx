import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axe from 'axe-core'
import { LoginPage } from './pages/LoginPage'
import { ProgressBar } from './components/ProgressBar'
import { ExerciseCard } from './components/ExerciseCard'
import type { RoutineItem } from '@domain/routine/routine'

afterEach(cleanup)

async function violations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } }) // jsdom no calcula estilos
  return result.violations.map((v) => `${v.id}: ${v.help}`)
}

const item: RoutineItem = {
  id: 'i1',
  position: 1,
  kind: 'exercise',
  exerciseId: 'e1',
  name: 'Press de banco plano',
  sets: { min: 3, max: 3 },
  reps: { min: 6, max: 8 },
  load: { type: 'kg', min: 30, max: 60 },
  warmup: { sets: 1, reps: 10 },
  perSide: false,
}

describe('accesibilidad (axe-core)', () => {
  it('login', async () => {
    const { container } = render(<LoginPage onSignIn={async () => {}} />)
    expect(await violations(container)).toEqual([])
  })

  it('barra de avance', async () => {
    const { container } = render(<ProgressBar progress={{ resolved: 5, total: 9, percent: 56 }} message="Mitad hecha." />)
    expect(await violations(container)).toEqual([])
  })

  it('tarjeta de ejercicio', async () => {
    const { container } = render(
      <MemoryRouter>
        <ExerciseCard item={item} logs={[]} disabled={false} onLog={async () => {}} onResolve={async () => {}} />
      </MemoryRouter>,
    )
    expect(await violations(container)).toEqual([])
  })
})
