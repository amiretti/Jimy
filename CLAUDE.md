# Jimy — guía para agentes

PWA de seguimiento de gym (proyecto CuervoDev). Idioma del producto y del código de UI: español rioplatense (voseo).

## Reglas

- **Clean Architecture**: `domain` no importa nada; `application` solo `domain`; `presentation` no importa `infrastructure` ni `@supabase/*`. ESLint lo verifica: no lo desactives.
- **SOLID, KISS, DRY**: una interfaz existe solo si tiene más de una implementación o hace falta para testear. Las reglas de negocio viven una vez en `domain`.
- **Sin dependencias pagas**: solo licencias MIT, Apache 2.0, BSD, ISC o MPL 2.0 (y OFL 1.1 únicamente para fuentes) y sin features detrás de un plan pago. Revisá la licencia antes de agregar un paquete.
- **Frontend**: priorizá la skill UI UX Pro Max para diseño. Accesibilidad WCAG 2.2 AA: áreas táctiles de 48 px en acciones de registro, color nunca como única señal, `aria-live` para avances, alternativa en tabla para cada gráfico, `prefers-reduced-motion`.
- **Marca**: [`docs/brand/README.md`](docs/brand/README.md) es la fuente de verdad versionada (vista navegable: [manual de marca](https://claude.ai/artifact/V35Q4FRVpDYSDUdugYRPbQ)) (logo, paleta Volt nocturno, Rubik + Plus Jakarta Sans, voz). El logo se usa con `<Logo />`, nunca escribiendo "jimy" con la fuente. Volt solo para la acción principal y el avance; texto blanco sobre teal, tinta sobre volt.
- **Tokens de diseño** solo en `src/presentation/styles/tokens.css`, en sintonía con `docs/brand/tokens.json`: si cambia uno, cambian los dos en el mismo commit.
- **SQL**: todo cambio de schema va en una migración nueva en `supabase/migrations/`; actualizá `supabase/tests/smoke.sql` si cambia el comportamiento.

## Antes de cerrar una tarea

`npm run lint && npm test && npm run build`
