# Jimy

Tu compañero de gym. PWA para registrar cada serie y ver al instante qué hiciste la última vez, con historial, gráficos de evolución y peso corporal.

Proyecto de **CuervoDev**. La especificación funcional (spec v1) vive en el doc del proyecto.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | Vite + React 19 + TypeScript + vite-plugin-pwa |
| Backend | Supabase (Postgres + RLS + Auth con Google) |
| Gráficos | Recharts |
| Tests | Vitest + Testing Library + axe-core |

Todas las dependencias son gratuitas y open source (MIT, Apache 2.0, BSD, ISC o MPL 2.0; las fuentes Rubik y Plus Jakarta Sans, OFL 1.1, autoalojadas con Fontsource).

Identidad visual: [manual de marca](docs/brand/README.md) (versionado en el repo; [vista navegable](https://claude.ai/artifact/V35Q4FRVpDYSDUdugYRPbQ)). Índice de documentación: [`docs/`](docs/README.md).

## Arquitectura

Clean Architecture con SOLID, KISS y DRY. Las dependencias apuntan hacia adentro y ESLint lo hace cumplir (`no-restricted-imports` por capa).

```
src/
  domain/          Entidades y reglas puras (precarga, avance, métricas). Sin dependencias.
  application/     Puertos (interfaces) y casos de uso. Solo depende de domain.
  infrastructure/  Adaptadores de Supabase que implementan los puertos.
  presentation/    React: páginas, componentes, hooks. Solo usa casos de uso.
  composition/     Composition root: arma repositorios y casos de uso.
supabase/
  migrations/      Schema, RLS, modelos de lectura (RPC) y seed de la rutina.
  tests/           Smoke test del SQL contra un Postgres local.
scripts/           Import del catálogo de free-exercise-db.
```

## Puesta en marcha

1. **Node 22+** y `npm install`.
2. **Supabase**: crear un proyecto (plan gratuito).
3. **Migraciones**: correr en orden los archivos de `supabase/migrations/` en el SQL Editor, o con la CLI: `supabase link` y después `supabase db push`.
4. **Google login**: Authentication → Providers → Google. Cargar el Client ID y el Secret de Google Cloud. Agregar `http://localhost:5173` y la URL de producción en Authentication → URL Configuration.
5. **Variables**: copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
6. `npm run dev`. En el primer login, el botón **Cargar rutina inicial** crea la rutina de noviembre 2026.
7. **Admin del catálogo** (opcional): en Authentication → Users, setear `app_metadata = {"role": "admin"}` para tu usuario.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck + build de producción (con service worker) |
| `npm run lint` | ESLint (incluye jsx-a11y y reglas de capas) |
| `npm test` | Tests de dominio, casos de uso y accesibilidad |

## Validar el SQL

Con un Postgres 16 local (sin Supabase), el smoke test crea un stub de `auth`, aplica las migraciones y verifica seed, RPC, RLS y permisos de admin:

```bash
createdb jimy_test && psql -v ON_ERROR_STOP=1 -d jimy_test -f supabase/tests/smoke.sql
```

## Keepalive y backup

`.github/workflows/keepalive-backup.yml` hace una consulta cada 3 días (para que el plan gratuito no pause el proyecto) y un `pg_dump` semanal guardado como artifact. Requiere los secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_DB_URL`.

## Pendientes de la fase 1

- Editor de rutinas (duplicar está implementado en SQL y en el repositorio; falta la UI).
- Búsqueda en el catálogo desde la UI (la RPC `search_exercises` ya existe).
- Traducción al español en el import de free-exercise-db.
- Swipe en las tarjetas (derecha = hecho, izquierda = saltear, con deshacer), según la spec.
- Pulido visual con la skill UI UX Pro Max sobre la marca ya aplicada.
- Pasada manual con TalkBack o VoiceOver.
