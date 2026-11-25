import { createContext, useContext, type ReactNode } from 'react'
import type { AuthPort } from '@application/ports/ports'
import type { SessionUseCases } from '@application/use-cases/session-use-cases'
import type { ProgressUseCases } from '@application/use-cases/progress-use-cases'

/** Lo que Presentation necesita: casos de uso y auth. Lo arma el composition root. */
export interface Services {
  readonly auth: AuthPort
  readonly session: SessionUseCases
  readonly progress: ProgressUseCases
}

const ServicesContext = createContext<Services | null>(null)

export function ServicesProvider({ services, children }: { services: Services; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>
}

export function useServices(): Services {
  const services = useContext(ServicesContext)
  if (!services) throw new Error('useServices fuera de ServicesProvider')
  return services
}
