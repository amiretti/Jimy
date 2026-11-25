-- Seed de la fase 1: ejercicios de la rutina actual del profe (catálogo universal)
-- y una función que crea esa rutina para el usuario logueado.
-- El import masivo de free-exercise-db va aparte (scripts/import-free-exercise-db.ts).

insert into exercises (name, slug, aliases, muscle_groups, equipment, default_load_type, source) values
  ('Abdominales largos',              'abdominales-largos',              '{}',                        '{abdominales}',            null,        'kg',         'user'),
  ('Equilibrio a 1 pie',              'equilibrio-a-1-pie',              '{}',                        '{piernas,core}',           'mancuerna', 'kg',         'user'),
  ('Extensión de cuádriceps',         'extension-de-cuadriceps',         '{Cuádriceps}',              '{cuadriceps}',             'máquina',   'kg',         'user'),
  ('Gemelos power',                   'gemelos-power',                   '{}',                        '{gemelos}',                'máquina',   'kg',         'user'),
  ('Jalón al pecho prono',            'jalon-al-pecho-prono',            '{Dorsal prona,Dorsal}',     '{espalda}',                'polea',     'kg',         'user'),
  ('Remo agarre neutro',              'remo-agarre-neutro',              '{Remo neutro}',             '{espalda}',                'polea',     'kg',         'user'),
  ('Curl martillo',                   'curl-martillo',                   '{Hammer}',                  '{biceps,antebrazo}',       'mancuerna', 'kg',         'user'),
  ('Tríceps con barra',               'triceps-con-barra',               '{Tríceps barra}',           '{triceps}',                'barra',     'kg',         'user'),
  ('Extensión de cadera',             'extension-de-cadera',             '{Hip ext}',                 '{gluteos}',                'banda',     'band',       'user'),
  ('Abdominales con rodillas',        'abdominales-con-rodillas',        '{Abd c/t rod.}',            '{abdominales}',            null,        'bodyweight', 'user'),
  ('Peso muerto rumano',              'peso-muerto-rumano',              '{P. muerto rumano,PMR}',    '{isquios,gluteos}',        'barra',     'kg',         'user'),
  ('Curl de isquios',                 'curl-de-isquios',                 '{Isquios}',                 '{isquios}',                'máquina',   'kg',         'user'),
  ('Press de banco plano',            'press-de-banco-plano',            '{Banco plano}',             '{pecho,triceps}',          'barra',     'kg',         'user'),
  ('Aperturas en máquina',            'aperturas-en-maquina',            '{Ap. máq.}',                '{pecho}',                  'máquina',   'kg',         'user'),
  ('Pallof en polea',                 'pallof-en-polea',                 '{Pallof}',                  '{core}',                   'polea',     'kg',         'user'),
  ('Vuelo lateral',                   'vuelo-lateral',                   '{Elevaciones laterales}',   '{hombros}',                'mancuerna', 'kg',         'user'),
  ('Curl de bíceps con barra',        'curl-de-biceps-con-barra',        '{Bíceps barra}',            '{biceps}',                 'barra',     'kg',         'user'),
  ('Unilateral pared a 1 pie',        'unilateral-pared-a-1-pie',        '{}',                        '{piernas,core}',           'mancuerna', 'kg',         'user'),
  ('Elevación de cadera en máquina',  'elevacion-de-cadera-en-maquina',  '{Elev. cad. máq.,Hip thrust}', '{gluteos}',             'máquina',   'kg',         'user'),
  ('Sentadilla búlgara',              'sentadilla-bulgara',              '{Búlgaras}',                '{cuadriceps,gluteos}',     'mancuerna', 'kg',         'user'),
  ('Salto de gemelos',                'salto-de-gemelos',                '{Salto gemelos}',           '{gemelos}',                null,        'bodyweight', 'user'),
  ('Salto al cajón',                  'salto-al-cajon',                  '{Salto cajón}',             '{piernas}',                'cajón',     'bodyweight', 'user'),
  ('Press militar',                   'press-militar',                   '{P. militar}',              '{hombros}',                'barra',     'kg',         'user'),
  ('Remo supino en polea',            'remo-supino-en-polea',            '{}',                        '{espalda,biceps}',         'polea',     'kg',         'user'),
  ('Press de banco inclinado',        'press-de-banco-inclinado',        '{B. inc. power}',           '{pecho,hombros}',          'mancuerna', 'kg',         'user'),
  ('Tríceps invertido a 1 brazo',     'triceps-invertido-a-1-brazo',     '{Tríceps inv a 1B}',        '{triceps}',                'polea',     'kg',         'user'),
  ('Abdominales',                     'abdominales',                     '{}',                        '{abdominales}',            null,        'bodyweight', 'user'),
  ('Plancha caminando',               'plancha-caminando',               '{}',                        '{core}',                   null,        'bodyweight', 'user')
on conflict (slug) do nothing;

-- Crea la rutina de noviembre 2026 para el usuario logueado (se llama una vez desde la app).
create or replace function seed_initial_routine()
returns uuid
language plpgsql security invoker as $$
declare
  r uuid; a uuid; b uuid; c uuid;
begin
  if auth.uid() is null then raise exception 'Requiere usuario logueado'; end if;
  if exists (select 1 from routines where user_id = auth.uid()) then
    raise exception 'El usuario ya tiene rutinas cargadas';
  end if;

  insert into routines (name, valid_from, active) values ('Rutina noviembre 2026', '2026-11-23', true) returning id into r;
  insert into routine_days (routine_id, label, position) values (r, 'A', 0) returning id into a;
  insert into routine_days (routine_id, label, position) values (r, 'B', 1) returning id into b;
  insert into routine_days (routine_id, label, position) values (r, 'C', 2) returning id into c;

  insert into routine_items (day_id, position, kind, exercise_id, name, superset_group,
                             sets_min, sets_max, reps_min, reps_max, duration_min_s, duration_max_s,
                             load_type, load_min, load_max, load_label, warmup_sets, warmup_reps, per_side, variants, notes)
  select v.day_id, v.position, v.kind::item_kind, e.id, v.name, v.superset_group,
         v.sets_min, v.sets_max, v.reps_min, v.reps_max, v.dmin, v.dmax,
         v.load_type::load_type, v.load_min, v.load_max, v.load_label, v.wsets, v.wreps, v.per_side, v.variants, v.notes
  from (values
    -- Día A
    (a, 1, 'note',     null,                              'Elongo c/t',                      null, null, null, null, null, 20, 30, 'none', null, null, null, null, null, false, null, 'Elongación 2×20-30 s'),
    (a, 2, 'exercise', 'abdominales-largos',              'Abdominales largos',              null, 3, 3, 8, 12,  null, null, 'kg', 6, 15, null, null, null, false, null, null),
    (a, 3, 'exercise', 'equilibrio-a-1-pie',              'Equilibrio a 1 pie',              null, 3, 3, 10, 10, null, null, 'kg', 5, 20, null, null, null, true,  null, null),
    (a, 4, 'exercise', 'extension-de-cuadriceps',         'Cuádriceps',                      null, 4, 4, 10, 13, null, null, 'kg', 25, 65, null, null, null, false, null, null),
    (a, 5, 'exercise', 'gemelos-power',                   'Gemelos power',                   null, 3, 4, 10, 13, null, null, 'kg', 25, 60, null, null, null, false, null, null),
    (a, 6, 'exercise', 'jalon-al-pecho-prono',            'Dorsal prona',                    null, 4, 4, 6, 8,   null, null, 'kg', 35, 75, null, null, null, false, null, null),
    (a, 7, 'exercise', 'remo-agarre-neutro',              'Remo neutro',                     null, 3, 3, 10, 12, null, null, 'kg', 15, 35, null, null, null, false, null, null),
    (a, 8, 'exercise', 'curl-martillo',                   'Hammer',                          null, 3, 3, 10, 12, null, null, 'kg', 10, 30, null, null, null, false, null, null),
    (a, 9, 'exercise', 'triceps-con-barra',               'Tríceps barra',                   null, 3, 3, 12, 15, null, null, 'kg', 20, 45, null, null, null, false, null, null),
    (a,10, 'note',     null,                              'Foam + elongo',                   null, null, null, null, null, null, null, 'none', null, null, null, null, null, false, null, 'Espalda y piernas'),
    -- Día B
    (b, 1, 'exercise', 'extension-de-cadera',             'Hip ext c/t',                     null, 2, 3, 7, 10,  null, null, 'band', null, null, 'violeta', null, null, false, null, null),
    (b, 2, 'exercise', 'abdominales-con-rodillas',        'Abd c/t rod.',                    null, 2, 3, 12, 20, null, null, 'bodyweight', null, null, null, null, null, false, null, null),
    (b, 3, 'exercise', 'peso-muerto-rumano',              'Peso muerto rumano',              null, 3, 3, 7, 10,  null, null, 'kg', 25, 60, null, null, null, false, null, null),
    (b, 4, 'exercise', 'curl-de-isquios',                 'Isquios',                         null, 3, 3, 8, 12,  null, null, 'kg', 15, 35, null, null, null, false, null, null),
    (b, 5, 'exercise', 'press-de-banco-plano',            'Banco plano',                     null, 3, 3, 6, 8,   null, null, 'kg', 30, 60, null, 1, 10, false, null, null),
    (b, 6, 'exercise', 'aperturas-en-maquina',            'Aperturas en máquina',            null, 3, 3, 10, 12, null, null, 'kg', 15, 40, null, null, null, false, null, null),
    (b, 7, 'exercise', 'pallof-en-polea',                 'Pallof polea',                    null, 3, 3, 7, 10,  null, null, 'kg', 10, 25, null, null, null, false, null, 'Alternar variantes'),
    (b, 8, 'exercise', 'vuelo-lateral',                   'Vuelo lateral',                   1,    3, 3, 7, 10,  null, null, 'kg', 6, 12, null, null, null, false, null, null),
    (b, 9, 'exercise', 'curl-de-biceps-con-barra',        'Bíceps barra',                    1,    3, 3, 10, 13, null, null, 'kg', 15, 30, null, null, null, false, null, null),
    (b,10, 'exercise', 'unilateral-pared-a-1-pie',        'Unilateral pared a 1 pie',        null, 3, 5, 7, 10,  null, null, 'kg', 3, 9, null, null, null, true, 3, null),
    -- Día C
    (c, 1, 'exercise', 'elevacion-de-cadera-en-maquina',  'Elev. cad. máq.',                 null, 3, 3, 10, 13, null, null, 'kg', 40, 80, null, 1, 10, false, null, null),
    (c, 2, 'exercise', 'sentadilla-bulgara',              'Búlgaras',                        null, 3, 3, 5, 7,   null, null, 'kg', null, 15, 'sin', null, null, true, null, null),
    (c, 3, 'exercise', 'salto-de-gemelos',                'Salto gemelos',                   null, 1, 1, 10, 10, null, null, 'bodyweight', null, null, null, null, null, true, 3, null),
    (c, 4, 'exercise', 'salto-al-cajon',                  'Salto cajón',                     null, 3, 3, 5, 8,   null, null, 'bodyweight', null, null, null, null, null, false, null, null),
    (c, 5, 'exercise', 'press-militar',                   'Press militar',                   null, 4, 4, 6, 8,   null, null, 'kg', 15, 35, null, null, null, false, null, null),
    (c, 6, 'exercise', 'remo-supino-en-polea',            'Remo supino en polea',            null, 4, 4, 7, 10,  null, null, 'kg', 40, 75, null, null, null, false, null, null),
    (c, 7, 'exercise', 'press-de-banco-inclinado',        'B. inc. power',                   null, 3, 3, 7, 10,  null, null, 'kg', 2.5, 15, null, null, null, false, null, null),
    (c, 8, 'exercise', 'triceps-invertido-a-1-brazo',     'Tríceps inv. a 1 brazo',          null, 3, 3, 8, 12,  null, null, 'kg', 5, 20, null, null, null, true, null, null),
    (c, 9, 'exercise', 'abdominales',                     'Abdominales',                     null, 3, 3, 25, 35, null, null, 'bodyweight', null, null, null, null, null, false, null, 'Confirmar nombre con el profe'),
    (c,10, 'exercise', 'plancha-caminando',               'Plancha caminando',               null, 1, 1, 10, 15, null, null, 'bodyweight', null, null, null, null, null, false, null, null),
    (c,11, 'note',     null,                              'Foam + elongo',                   null, null, null, null, null, null, null, 'none', null, null, null, null, null, false, null, 'Espalda, piernas, glúteos y abdominales')
  ) as v(day_id, position, kind, slug, name, superset_group, sets_min, sets_max, reps_min, reps_max, dmin, dmax,
         load_type, load_min, load_max, load_label, wsets, wreps, per_side, variants, notes)
  left join exercises e on e.slug = v.slug;

  return r;
end $$;
