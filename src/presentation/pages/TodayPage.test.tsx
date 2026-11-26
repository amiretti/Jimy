import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ServicesProvider, type Services } from '../hooks/services'
import { TodayPage } from './TodayPage'

afterEach(cleanup)

const failing = {
  session: { loadToday: () => Promise.reject(new Error('relation "routines" does not exist')) },
} as unknown as Services

describe('TodayPage', () => {
  it('muestra el error en lugar de quedarse en "Cargando…"', async () => {
    render(
      <ServicesProvider services={failing}>
        <MemoryRouter>
          <TodayPage />
        </MemoryRouter>
      </ServicesProvider>,
    )
    expect((await screen.findByRole('alert')).textContent).toContain('relation "routines" does not exist')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeDefined()
  })
})
