import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createSupabase(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example).')
  }
  return createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
}

/** Lanza si Supabase devolvió error; si no, devuelve los datos. */
export function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}
