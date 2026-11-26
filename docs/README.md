# Documentación de Jimy

| Documento | Qué contiene |
| --- | --- |
| [Manual de marca](brand/README.md) | Identidad: logo, color, tipografía, voz, iconografía, accesibilidad. Incluye `tokens.json` y los SVG del logo y el ícono. |
| [Manual de marca (PDF)](brand/jimy-manual-de-marca.pdf) | La misma versión, maquetada para compartir o imprimir. Se regenera con `python scripts/build-brand-pdf.py`. |
| [Spec v1 (fase 1)](https://claude.ai/artifact/6z1BZQ7sHN6dagsigXept8) | Alcance, modelo de datos, decisiones. Todavía vive fuera del repo. |

Regla: los cambios de marca entran por commit en `docs/brand/`; en el mismo commit se regenera el PDF, y después se refleja en la vista navegable del manual.
