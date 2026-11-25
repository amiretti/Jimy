import { useEffect, useState } from 'react'
import type { AuthUser } from '@application/ports/ports'
import { useServices } from './services'

export function useAuth() {
  const { auth } = useServices()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    auth.currentUser().then((u) => {
      if (alive) {
        setUser(u)
        setLoading(false)
      }
    })
    const unsubscribe = auth.onChange(setUser)
    return () => {
      alive = false
      unsubscribe()
    }
  }, [auth])

  return { user, loading, signIn: auth.signInWithGoogle, signOut: auth.signOut }
}
