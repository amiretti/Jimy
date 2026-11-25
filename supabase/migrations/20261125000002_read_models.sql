-- Modelos de lectura (RPC). Corren con los permisos del usuario (security invoker), así que respetan RLS.

-- Búsqueda difusa en el catálogo: nombre y alias, con y sin tildes.
create or replace function search_exercises(q text, max_results int default 20)
returns setof exercises
language sql stable security invoker as $$
  select e.*
  from exercises e
  where unaccent(exercise_search_text(e)) % unaccent(lower(q))
     or unaccent(exercise_search_text(e)) like '%' || unaccent(lower(q)) || '%'
  order by similarity(unaccent(exercise_search_text(e)), unaccent(lower(q))) desc
  limit max_results
$$;

-- "La última vez": última sesión de cada ejercicio (de cualquier rutina) con sus series.
create or replace function last_performances(exercise_ids uuid[], exclude_session uuid default null)
returns table (exercise_id uuid, session_id uuid, session_date timestamptz, sets jsonb)
language sql stable security invoker as $$
  with latest as (
    select distinct on (l.exercise_id) l.exercise_id, s.id as session_id, s.started_at
    from set_logs l
    join sessions s on s.id = l.session_id
    where l.exercise_id = any(exercise_ids)
      and (exclude_session is null or s.id <> exclude_session)
    order by l.exercise_id, s.started_at desc
  )
  select lt.exercise_id, lt.session_id, lt.started_at,
         jsonb_agg(to_jsonb(l) order by l.kind, l.set_number)
  from latest lt
  join set_logs l on l.session_id = lt.session_id and l.exercise_id = lt.exercise_id
  group by lt.exercise_id, lt.session_id, lt.started_at
$$;

-- Historial de un ejercicio: una fila por sesión, de la más nueva a la más vieja.
create or replace function exercise_history(p_exercise_id uuid, max_sessions int default 50)
returns table (session_id uuid, session_date timestamptz, sets jsonb)
language sql stable security invoker as $$
  select s.id, s.started_at, jsonb_agg(to_jsonb(l) order by l.kind, l.set_number)
  from set_logs l
  join sessions s on s.id = l.session_id
  where l.exercise_id = p_exercise_id
  group by s.id, s.started_at
  order by s.started_at desc
  limit max_sessions
$$;

-- Duplica una rutina (días + ítems) para cargar la nueva rutina del profe.
create or replace function duplicate_routine(p_routine_id uuid, p_name text)
returns uuid
language plpgsql security invoker as $$
declare
  new_routine uuid;
  d record;
  new_day uuid;
begin
  insert into routines (name) values (p_name) returning id into new_routine;
  for d in select * from routine_days where routine_id = p_routine_id order by position loop
    insert into routine_days (routine_id, label, position) values (new_routine, d.label, d.position) returning id into new_day;
    insert into routine_items (day_id, position, kind, exercise_id, name, superset_group, sets_min, sets_max, reps_min, reps_max,
                               duration_min_s, duration_max_s, load_type, load_min, load_max, load_label, warmup_sets, warmup_reps,
                               per_side, variants, notes)
    select new_day, position, kind, exercise_id, name, superset_group, sets_min, sets_max, reps_min, reps_max,
           duration_min_s, duration_max_s, load_type, load_min, load_max, load_label, warmup_sets, warmup_reps,
           per_side, variants, notes
    from routine_items where day_id = d.id;
  end loop;
  return new_routine;
end $$;

-- Activa una rutina y archiva la anterior.
create or replace function activate_routine(p_routine_id uuid)
returns void
language plpgsql security invoker as $$
begin
  update routines set active = false, archived_at = now() where user_id = auth.uid() and active and id <> p_routine_id;
  update routines set active = true, archived_at = null where id = p_routine_id and user_id = auth.uid();
end $$;
