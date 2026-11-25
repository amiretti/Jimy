-- Jimy — schema inicial (fase 1)
-- Catálogo universal (lo administra el admin) + datos privados por usuario con RLS.

create extension if not exists pg_trgm;
create extension if not exists unaccent;

create type load_type   as enum ('kg', 'band', 'bodyweight', 'time', 'none');
create type item_kind   as enum ('exercise', 'note');   -- note = elongo, foam: no se registra
create type set_kind    as enum ('warmup', 'work');
create type item_status as enum ('done', 'skipped');

-- ---------------------------------------------------------------------------
-- Admin: claim `role = 'admin'` en app_metadata del JWT (se setea desde el dashboard).
-- ---------------------------------------------------------------------------
create or replace function is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

-- ---------------------------------------------------------------------------
-- Catálogo universal
-- ---------------------------------------------------------------------------
create table exercises (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  aliases           text[] not null default '{}',
  muscle_groups     text[] not null default '{}',
  equipment         text,
  default_load_type load_type not null default 'kg',
  instructions      text,
  images            text[] not null default '{}',   -- paths en Supabase Storage (fase 1: vacío)
  source            text not null default 'user',   -- 'free-exercise-db' | 'user'
  source_id         text,
  license           text,
  created_by        uuid references auth.users,
  created_at        timestamptz not null default now(),
  unique (source, source_id)
);
create index exercises_name_trgm on exercises using gin (name gin_trgm_ops);

-- Texto buscable (nombre + alias) para la búsqueda difusa.
create or replace function exercise_search_text(e exercises) returns text
language sql immutable as $$
  select lower(e.name || ' ' || array_to_string(e.aliases, ' '))
$$;

-- ---------------------------------------------------------------------------
-- Datos privados
-- ---------------------------------------------------------------------------
create table routines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null,
  valid_from  date not null default current_date,
  active      boolean not null default false,
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);
create unique index one_active_routine on routines (user_id) where active;

create table routine_days (
  id         uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines on delete cascade,
  label      text not null,
  position   int  not null
);

create table routine_items (
  id             uuid primary key default gen_random_uuid(),
  day_id         uuid not null references routine_days on delete cascade,
  position       int  not null,
  kind           item_kind not null default 'exercise',
  exercise_id    uuid references exercises,
  name           text not null,                       -- como lo escribió el profe
  superset_group int,
  sets_min int, sets_max int,
  reps_min int, reps_max int,
  duration_min_s int, duration_max_s int,
  load_type      load_type not null default 'kg',
  load_min numeric, load_max numeric,
  load_label     text,
  warmup_sets int, warmup_reps int,
  per_side       boolean not null default false,
  variants       int,
  notes          text,
  check (kind = 'note' or exercise_id is not null)
);

create table sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  routine_day_id uuid references routine_days on delete set null,
  started_at     timestamptz not null default now(),
  finished_at    timestamptz
);
create index sessions_user_started on sessions (user_id, started_at desc);

create table set_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions on delete cascade,
  exercise_id uuid not null references exercises,
  set_number  int  not null,
  kind        set_kind not null default 'work',
  reps        int,
  load        numeric,
  load_label  text,
  duration_s  int,
  logged_at   timestamptz not null default now()
);
create index set_logs_exercise on set_logs (exercise_id, logged_at desc);
create index set_logs_session on set_logs (session_id);

-- Avance de la sesión. status null = destildado explícito (pisa el tilde automático).
create table session_items (
  session_id      uuid not null references sessions on delete cascade,
  routine_item_id uuid not null references routine_items on delete cascade,
  status          item_status,
  resolved_at     timestamptz not null default now(),
  primary key (session_id, routine_item_id)
);

create table body_weights (
  user_id   uuid not null default auth.uid() references auth.users on delete cascade,
  date      date not null,
  weight_kg numeric(5,2) not null check (weight_kg between 20 and 400),
  note      text,
  primary key (user_id, date)
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table exercises     enable row level security;
alter table routines      enable row level security;
alter table routine_days  enable row level security;
alter table routine_items enable row level security;
alter table sessions      enable row level security;
alter table set_logs      enable row level security;
alter table session_items enable row level security;
alter table body_weights  enable row level security;

-- Catálogo: lectura para autenticados; escritura solo admin.
create policy exercises_read  on exercises for select to authenticated using (true);
create policy exercises_write on exercises for all    to authenticated using (is_admin()) with check (is_admin());

-- Dueño directo.
create policy routines_owner     on routines     for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sessions_owner     on sessions     for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy body_weights_owner on body_weights for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Dueño a través del padre.
create policy routine_days_owner on routine_days for all to authenticated
  using (exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid()))
  with check (exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid()));

create policy routine_items_owner on routine_items for all to authenticated
  using (exists (select 1 from routine_days d join routines r on r.id = d.routine_id where d.id = day_id and r.user_id = auth.uid()))
  with check (exists (select 1 from routine_days d join routines r on r.id = d.routine_id where d.id = day_id and r.user_id = auth.uid()));

create policy set_logs_owner on set_logs for all to authenticated
  using (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy session_items_owner on session_items for all to authenticated
  using (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()));
