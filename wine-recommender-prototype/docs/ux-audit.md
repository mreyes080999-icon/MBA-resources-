# Auditoría funcional y visual (paso 6 de la consigna)

Ejecutada abriendo `index.html` con Chromium real vía Playwright (no solo inspección de
código), en dos viewports (1280×900 escritorio, 390×844 móvil) y en ambos esquemas de
color (`light`/`dark`). Scripts de auditoría en el scratchpad de la sesión, resultados
íntegros abajo.

## Primera pasada — qué se probó
- Cargar cada uno de los 3 perfiles de ejemplo y completar el flujo hasta el resumen de compra.
- Elegir la alternativa (no solo la principal) y confirmar que la pantalla 3 refleja el vino correcto.
- Botón "Ajustar respuestas" (volver de recomendación a preferencias) y verificar que las respuestas no se pierden.
- Botón "Empezar de nuevo" y verificar que sí resetea a los valores por defecto.
- Enviar la encuesta sin tocar nada (respuestas por defecto) para simular un usuario apurado.
- Caso contradictorio manual (cena con maridaje + dulce + ligero + presupuesto bajo).
- Tope de selección de sabores (máximo 3 chips activos).
- Navegación por teclado (Tab) y visibilidad del foco.
- Ancho de scroll horizontal en ambos viewports.

## Defectos encontrados y corregidos
1. **(Lógica, encontrado antes de tocar la interfaz)** Alternativa `undefined` cuando el
   presupuesto se relajaba a un solo candidato — ver `docs/test-results.md`. Corregido en
   `logic.js` y replicado el fix en el motor embebido de `index.html` antes de la primera
   ejecución en navegador (por eso la auditoría visual no lo volvió a encontrar).
2. Ningún otro defecto funcional apareció en la auditoría de navegador: los 3 perfiles
   llegan al momento de valor, el botón "Elegir esta" de la alternativa navega
   correctamente, volver y avanzar conserva las respuestas, y "Empezar de nuevo" sí
   resetea. Verificado que ningún texto "undefined" queda visible en pantalla.

## Segunda pasada — resultado
Repetida la batería completa tras el fix de lógica: **sin errores de página**
(`pageerror`) y **sin excepciones**. El único mensaje de consola detectado
(`ERR_CERT_AUTHORITY_INVALID` al pedir la fuente de Google Fonts) es una restricción de
red del entorno de pruebas (proxy/sandbox sin salida a `fonts.googleapis.com`), no un
defecto del prototipo: la hoja de estilos ya declara familias de reserva
(`Georgia, serif` / `system-ui, sans-serif` / `monospace`), así que la página se ve y
funciona igual si la fuente no carga. Se dejó constancia aquí en vez de ocultarlo.

## Accesibilidad básica revisada
- Todos los controles interactivos son `<button>` reales (no `<div onclick>`), con
  `aria-pressed` en los chips de selección única y múltiple.
- Los grupos de preguntas usan `<fieldset>`/`<legend>`/`role="group"` con `aria-label`.
- El foco de teclado es visible (`outline: 2px solid var(--accent)`, confirmado con
  `getComputedStyle` tras `Tab`: `outlineStyle: solid`).
- Paleta verificada en ambos temas (claro/oscuro) con contraste suficiente entre texto y
  fondo en las capturas (ver `docs/screenshots/` referenciadas abajo).
- Los precios de muestra usan un mínimo ($6) para no mostrar valores irrisorios o en $0.

## Desbordes y estados
- Sin scroll horizontal en 1280px ni en 390px (`document.documentElement.scrollWidth`
  igual al ancho del viewport en ambos casos).
- Los chips de sabores y presupuesto envuelven correctamente a 1 columna útil en móvil.
- El panel de confirmación de compra empieza oculto (`hidden`) y solo aparece tras un
  clic explícito — no hay estados vacíos huérfanos ni textos placeholder visibles.
- Ninguna pantalla promete algo que el prototipo no cumple: cada precio y cada botón de
  compra están junto a la etiqueta "datos de demostración" / "Simulación", y el resumen
  de compra aclara explícitamente que no hubo pago ni pedido real.

## Capturas de referencia
Se generaron capturas de las 3 pantallas en escritorio, la pantalla 1 en móvil, y la
pantalla 2 en modo oscuro, usadas para esta auditoría (disponibles en el scratchpad de la
sesión; no se incluyen en el repo para no aumentar su peso — el prototipo publicado como
Artifact permite verlas en vivo, en cualquier tamaño de pantalla y en ambos temas).
