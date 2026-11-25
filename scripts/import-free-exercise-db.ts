/**
 * Importa el catálogo de free-exercise-db (Unlicense) a la tabla `exercises`.
 * Solo datos: la fase 1 no usa imágenes.
 *
 * Uso (requiere la service role key, nunca la subas al repo):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node --experimental-strip-types scripts/import-free-exercise-db.ts
 *
 * Pendiente (spec): traducir nombre e instrucciones al español con un LLM.
 * Por ahora el nombre queda en inglés y se guarda también como alias.
 */
import { createClient } from '@supabase/supabase-js'

const SOURCE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'

interface FreeExercise {
  id: string
  name: string
  equipment: string | null
  category: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
}

type LoadType = 'kg' | 'band' | 'bodyweight' | 'time' | 'none'

function loadTypeFor(e: FreeExercise): LoadType {
  if (e.category === 'stretching') return 'time'
  if (e.equipment === 'bands') return 'band'
  if (e.equipment === 'body only' || e.equipment === null) return 'bodyweight'
  return 'kg'
}

function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')

  const response = await fetch(SOURCE_URL)
  if (!response.ok) throw new Error(`No se pudo descargar el dataset: ${response.status}`)
  const data = (await response.json()) as FreeExercise[]

  const rows = data.map((e) => ({
    name: e.name,
    slug: `fedb-${toSlug(e.name)}`,
    aliases: [e.name],
    muscle_groups: [...e.primaryMuscles, ...e.secondaryMuscles],
    equipment: e.equipment,
    default_load_type: loadTypeFor(e),
    instructions: e.instructions.join('\n'),
    images: [],
    source: 'free-exercise-db',
    source_id: e.id,
    license: 'Unlicense',
  }))

  const db = createClient(url, key, { auth: { persistSession: false } })
  const BATCH = 200
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await db.from('exercises').upsert(rows.slice(i, i + BATCH), { onConflict: 'source,source_id' })
    if (error) throw new Error(error.message)
  }
  console.log(`Importados ${rows.length} ejercicios de free-exercise-db.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
