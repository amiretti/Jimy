# Jimy — Manual de marca

> **Fuente de verdad versionada.** Este archivo, `tokens.json` y los SVG de esta carpeta son la versión oficial de la marca. La [vista navegable](https://claude.ai/artifact/V35Q4FRVpDYSDUdugYRPbQ) (tokens, previews y descargas) se actualiza a partir de acá: cualquier cambio de marca entra primero por un commit en `docs/brand/`.


Tu compañero de gym. Se acuerda de lo que levantaste.

Manual de marca de Jimy, una PWA de CuervoDev para registrar series y ver la evolución en el gym. Este documento define la identidad: logo, color, tipografía, voz y reglas de uso. Los valores exactos están en los tokens del sistema.

## Esencia

**Qué es.** Jimy es el compañero que te acompaña en el gym y se acuerda de todo: con qué peso hiciste cada serie, cuántas repeticiones, cómo venís progresando. Reemplaza el papel de la rutina por el celular que ya tenés en la mano.

**Para quién.** Gente que entrena en gimnasios de Argentina con una rutina que les da el profe. Primero uso personal; después, grupos de amigos que compiten por asistencias.

**Personalidad.**

| Es | No es |
| --- | --- |
| Un compa que te banca | Un coach que te reta |
| Directo y corto | Técnico o verborrágico |
| Entusiasta | Exagerado ni de gritos |
| Rioplatense, con voseo | Neutro ni "influencer fitness" |
| Preciso con los números | Ambiguo con los datos |

**Promesa.** Abrís Jimy entre series y en un segundo sabés qué hiciste la última vez y qué toca ahora.

## Logo

### Concepto

El logotipo es la palabra **jimy** en minúscula, con los puntos de la j y la i unidos en una **mancuerna**. Es la única marca de la identidad: no hay símbolo aparte. El ícono de app toma las letras "ji" con su mancuerna.

- **Tipografía de base:** Rubik ExtraBold (800), convertida a trazos y ajustada. Nunca se recompone escribiendo con la fuente.
- **La mancuerna:** dos discos verticales de esquinas redondeadas (las ex tildes de la j y la i) unidos por una barra que asoma a los costados.

### Versiones

| Archivo | Uso |
| --- | --- |
| [`jimy-logo-sobre-oscuro.svg`](logo/jimy-logo-sobre-oscuro.svg) | Versión principal. Letras blancas y mancuerna volt sobre brand-tinta o brand-teal. |
| [`jimy-logo-sobre-claro.svg`](logo/jimy-logo-sobre-claro.svg) | Sobre fondos claros. Letras tinta y mancuerna brand-teal. |
| [`jimy-logo-mono-blanco.svg`](logo/jimy-logo-mono-blanco.svg) | Una tinta blanca: fotos, fondos de color no previstos, grabado. |
| [`jimy-logo-mono-tinta.svg`](logo/jimy-logo-mono-tinta.svg) | Una tinta oscura: impresión en blanco y negro, documentos. |

### Área de respeto y tamaños

- **Área de respeto:** alrededor del logo, un margen igual a la altura de un disco de la mancuerna. Ningún texto ni borde entra en esa zona.
- **Tamaño mínimo del logotipo:** 72 px de ancho en pantalla, 20 mm en impresión. Por debajo, usá el ícono.
- **Tamaño mínimo del ícono:** 28 px. Se probó a 168, 64, 44 y 28 px.

### Usos incorrectos

- No poner la mancuerna en volt sobre fondos claros: no se ve (1,2:1 sobre blanco).
- No cambiar los colores fuera de las cuatro versiones: nada de mancuerna teal sobre tinta ni letras volt.
- No separar, mover ni escalar la mancuerna por separado de las letras.
- No volver a poner los puntos redondos de la j y la i.
- No deformar, inclinar, contornear ni sumarle sombras o degradados.
- No reconstruir el logo escribiendo "jimy" con Rubik.
- No usar el logo sobre fotos sin un fondo plano debajo; si no queda otra, la versión mono.

## Ícono de app

Fondo **brand-teal**, letras "ji" en blanco y mancuerna en **brand-volt** (9,5:1 contra el fondo). Esquinas a radius-lg (22 % del lado).

| Archivo | Uso |
| --- | --- |
| [`jimy-icono.svg`](icono/jimy-icono.svg) | Ícono maestro, con esquinas redondeadas. |
| [`jimy-icono-maskable.svg`](icono/jimy-icono-maskable.svg) | Versión cuadrada a sangre para Android: el contenido queda dentro de la zona segura del 80 %. |
| [`icon-192.png`](../../public/icon-192.png), [`icon-512.png`](../../public/icon-512.png) | `icons` del manifest de la PWA (`purpose: any`). |
| [`icon-maskable-512.png`](../../public/icon-maskable-512.png) | `icons` del manifest (`purpose: maskable`). |
| [`apple-touch-icon.png`](../../public/apple-touch-icon.png) | `<link rel="apple-touch-icon">` para iOS. |

`theme_color` y `background_color` del manifest: brand-tinta `#0E1020`.

## Color

La paleta se llama **Volt nocturno**: una base oscura con un único acento ácido. La regla de proporción es 70 / 20 / 10.

| Rol | Token | Hex | Proporción | Para qué |
| --- | --- | --- | --- | --- |
| Primario | brand-tinta | `#0E1020` | ~70 % | Fondo de la app. Es lo que define la marca a simple vista. |
| Secundario | brand-teal | `#08434A` | ~20 % | Navegación, estado activo, botones secundarios, etiquetas, fondo del ícono. |
| Acento | brand-volt | `#D4FF2E` | ~10 % | Acción principal, avance, tilde de hecho, mancuerna del logo. |

### Reglas

1. **El volt es la acción.** Si hay volt en la pantalla, ahí está lo que tenés que hacer: registrar la serie o ver cuánto falta. Una sola acción en volt por vista.
2. **El volt nunca va como texto sobre fondo claro** ni para links. Sobre la tinta, como texto, solo en mensajes cortos de Jimy.
3. **Sobre el teal, el texto es blanco.** Sobre el volt, el texto es tinta. Nunca al revés.
4. **El teal sobre la tinta lleva borde.** La diferencia es sutil a propósito (1,7:1), así que botones y chips teal llevan 1 px de border-secondary `#2E8A93`. La barra de navegación no lo necesita: la delimita su texto y su posición.
5. **El color nunca es la única señal.** Hecho = tilde + volt; salteado = texto "Salteado"; error = mensaje + danger.

### Contrastes verificados

| Par | Contraste | Nivel |
| --- | --- | --- |
| Blanco sobre tinta | 18,9:1 | AAA |
| Volt sobre tinta | 16,3:1 | AAA |
| Tinta sobre volt | 16,3:1 | AAA |
| Blanco sobre teal | 11,0:1 | AAA |
| Volt sobre teal | 9,5:1 | AAA |
| text-muted sobre tinta | 8,6:1 | AAA |
| link `#5FC4CC` sobre tinta | 9,2:1 | AAA |
| border-secondary sobre tinta | 4,6:1 | UI ≥ 3:1 |
| Teal sobre tinta | 1,7:1 | Solo decorativo: requiere borde |
| Volt sobre blanco | 1,2:1 | Prohibido |

## Tipografía

Dos familias, ambas libres (Google Fonts, licencia OFL):

| Familia | Token | Uso |
| --- | --- | --- |
| **Rubik** 700–800 | display | Títulos, nombres de ejercicio, momentos de logro. Es la familia del logo: redonda y amigable. |
| **Plus Jakarta Sans** 400–800 | sans | Todo lo demás: texto, prescripciones, botones, números. |

- Escala: display 40/44, title 28/34, heading 20/26, body 16/24, label 14/20, caption 12/16, number 28/32.
- **Números:** siempre con `tabular-nums`, para que los pesos no "bailen" al cambiar con +/−.
- **Decimales con coma** y unidad separada: `42,5 kg`. Repeticiones con "×": `40 kg × 8`.
- Tamaño mínimo en la app: 14 px para información; 12 px solo para etiquetas no críticas.
- Nunca más de dos familias ni otra tipografía display.

## Voz y tono

Jimy habla como un compañero de gym argentino: **voseo, frases cortas, un empujón sin gritar.**

| Así sí | Así no |
| --- | --- |
| Mitad hecha. Dale que falta menos. | ¡¡¡Vamos campeón, estás destruyendo!!! 💪🔥 |
| La semana pasada: 40 kg × 8. | Según tus registros históricos, en la sesión anterior realizaste… |
| No se pudo guardar. Probá de nuevo. | Error 500: fallo en la persistencia. |
| Cargá tu peso cuando quieras. | ¡No te olvides de pesarte hoy! |

**Mensajes de avance** (el personaje habla en estos momentos):

| Momento | Mensaje |
| --- | --- |
| Primer ítem resuelto | Arrancamos. Una menos. |
| 50 % | Mitad hecha. Dale que falta menos. |
| 75 % | Ya está casi. No aflojes ahora. |
| Último ítem | Último y a casa. |
| 100 % | ¡Rutina completa! Presente dado. |

Reglas: sin emoji en la interfaz; sin culpa ni presión (nunca "no fuiste", "perdiste tu racha" en tono de reto); los números siempre exactos.

## Iconografía

- Íconos de línea, trazo de 2 px, extremos y uniones redondeadas, sobre grilla de 24 px. Si se suma una librería, que sea libre (MIT/ISC), por ejemplo Lucide.
- Color: text o text-muted; activo en accent solo si es la acción principal.
- Sin emoji ni ilustraciones dentro de la UI. El único "personaje" es la voz de Jimy.

## Movimiento e interacción

- Transiciones cortas: 150–250 ms, easing de salida. La barra de avance crece en 300 ms.
- Al completar un ítem, la tarjeta se marca con volt y el porcentaje se anuncia.
- **Swipe en las tarjetas:** derecha para hecho (feedback volt), izquierda para saltear (feedback teal), con "Deshacer" durante 5 s. El tilde y el botón Saltear siguen visibles como alternativa accesible.
- Con `prefers-reduced-motion`, sin animaciones: los cambios de estado son inmediatos.

## Accesibilidad

Objetivo WCAG 2.2 AA en todo lo que lleve la marca:

- Contrastes de la tabla de color; ninguna combinación nueva sin medirla.
- Áreas táctiles: touch-target 48 px para registrar; touch-min 44 px para el resto.
- Foco visible con el token focus (3 px).
- `lang="es-AR"`; cada gráfico con su tabla equivalente; avances anunciados con `aria-live`.

## Uso en el código

Los valores de [`tokens.json`](tokens.json) están aplicados en [`src/presentation/styles/tokens.css`](../../src/presentation/styles/tokens.css); si cambia uno, cambian los dos en el mismo commit. Correspondencia: `--color-bg` → surface, `--color-surface` → surface-raised, `--color-secondary` → surface-secondary, `--color-accent` → accent, `--color-text` → text, `--color-muted` → text-muted, `--color-link` → link, `--color-border` → border-hairline, `--color-border-control` → border-control, `--color-border-secondary` → border-secondary, `--color-focus` → focus. El logo en la app es el componente [`Logo.tsx`](../../src/presentation/components/Logo.tsx).
