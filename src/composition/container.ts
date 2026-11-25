import { createSupabase } from '@infrastructure/supabase/client'
import {
  createSupabaseAuth,
  createSupabaseBodyWeights,
  createSupabasePerformance,
  createSupabaseRoutines,
  createSupabaseSessions,
} from '@infrastructure/supabase/repositories'
import { createSessionUseCases } from '@application/use-cases/session-use-cases'
import { createProgressUseCases } from '@application/use-cases/progress-use-cases'
import type { Services } from '@presentation/hooks/services'

/** Composition root: el único lugar que conoce las implementaciones concretas. */
export function createServices(): Services {
  const db = createSupabase()
  const performance = createSupabasePerformance(db)
  return {
    auth: createSupabaseAuth(db),
    session: createSessionUseCases({
      routines: createSupabaseRoutines(db),
      sessions: createSupabaseSessions(db),
      performance,
    }),
    progress: createProgressUseCases({ performance, bodyWeights: createSupabaseBodyWeights(db) }),
  }
}
