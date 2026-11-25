import type { LoadType } from '../routine/routine'

/** Ejercicio del catálogo universal (compartido entre usuarios, lo administra el admin). */
export interface Exercise {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly aliases: readonly string[]
  readonly muscleGroups: readonly string[]
  readonly equipment?: string
  readonly defaultLoadType: LoadType
  readonly instructions?: string
}

/** Slug normalizado: minúsculas, sin tildes ni signos. Es único en el catálogo. */
export function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
