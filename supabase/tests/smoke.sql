-- Smoke test del schema contra un Postgres local con un stub de auth (no es para Supabase).
-- Uso: ver README, sección "Validar el SQL".
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create role authenticated nologin;
grant usage on schema auth, public to authenticated;
grant execute on all functions in schema auth to authenticated;

\ir ../migrations/20261125000001_init.sql
\ir ../migrations/20261125000002_read_models.sql
\ir ../migrations/20261125000003_seed_routine.sql

grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
insert into auth.users values ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222');

set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

do $$
declare
  r_old uuid; r_new uuid; s uuid; bench uuid; n int;
begin
  r_old := seed_initial_routine();
  select count(*) into n from routine_items i join routine_days d on d.id = i.day_id where d.routine_id = r_old;
  assert n = 31, format('seed: esperaba 31 ítems, hay %s', n);
  assert not exists (select 1 from routine_items where kind = 'exercise' and exercise_id is null), 'seed: ítems sin ejercicio';

  select id into bench from exercises where slug = 'press-de-banco-plano';
  insert into sessions (routine_day_id) select id from routine_days where routine_id = r_old and label = 'B' returning id into s;
  insert into set_logs (session_id, exercise_id, set_number, kind, reps, load)
  select s, bench, g, case when g = 0 then 'warmup'::set_kind else 'work' end, 8, 40 + g * 2.5 from generate_series(0, 3) g;

  select jsonb_array_length(sets) into n from last_performances(array[bench]);
  assert n = 4, 'last_performances: esperaba 4 series';
  assert (select count(*) from last_performances(array[bench], s)) = 0, 'last_performances: no excluye la sesión actual';
  assert (select count(*) from exercise_history(bench)) = 1, 'exercise_history';
  assert (select name from search_exercises('bulgaras', 1)) = 'Sentadilla búlgara', 'búsqueda sin tildes';
  assert (select name from search_exercises('dorsal', 1)) = 'Jalón al pecho prono', 'búsqueda por alias';

  r_new := duplicate_routine(r_old, 'Rutina diciembre');
  select count(*) into n from routine_items i join routine_days d on d.id = i.day_id where d.routine_id = r_new;
  assert n = 31, format('duplicar: esperaba 31 ítems, hay %s', n);
  perform activate_routine(r_new);
  assert (select active from routines where id = r_new) and not (select active from routines where id = r_old), 'activar/archivar';

  begin
    insert into exercises (name, slug) values ('X', 'x');
    raise exception 'catálogo: un no-admin pudo insertar';
  exception when insufficient_privilege then null;
  end;
  raise notice 'usuario 1: OK';
end $$;

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
do $$ begin
  assert (select count(*) from routines) = 0, 'RLS: el usuario 2 ve rutinas ajenas';
  assert (select count(*) from set_logs) = 0, 'RLS: el usuario 2 ve series ajenas';
  assert (select count(*) from exercises) > 0, 'el catálogo es visible para todos';
  raise notice 'usuario 2 (RLS): OK';
end $$;

select set_config('request.jwt.claims', '{"app_metadata":{"role":"admin"}}', false);
do $$ begin
  insert into exercises (name, slug) values ('Prueba admin', 'prueba-admin');
  raise notice 'admin escribe catálogo: OK';
end $$;
