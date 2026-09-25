# Evaluación final (0–10 por criterio, con evidencia)

| Criterio | Nota | Evidencia |
|---|---|---|
| Recorte de alcance (1 página, ≤3 pantallas, sin registro/perfil/menú) | 10 | `index.html` tiene exactamente 3 `<section>` de paso y ningún control ajeno al flujo; verificado en `docs/compliance-matrix.md` ítems 1–2 |
| Calidad de la lógica de recomendación (determinismo, explicabilidad, manejo de límites) | 9 | 39/39 pruebas automatizadas en verde (`docs/test-results.md`), incluye presupuesto sin coincidencias y respuestas contradictorias sin fallar. Resta punto porque el catálogo es pequeño (12 vinos) y algunos empates de score (ver perfil "Regalo", 66 vs 64) dependen de reglas de desempate simples que no se probaron exhaustivamente con más de 2 candidatos empatados |
| Rigor de la auditoría de código (antes de construir interfaz) | 9 | Se encontró y corrigió un defecto real (alternativa `undefined`) antes de escribir una sola línea de HTML, con prueba de regresión agregada; un segundo intento de arreglo defectuoso también se documentó y se descartó en vez de ocultarlo |
| Prototipo visual (usabilidad, claridad, responsividad) | 8 | Auditoría con Playwright en 1280px y 390px sin overflow horizontal, foco de teclado visible, ambos temas verificados con capturas; resta punto porque no se probó con una persona real ajena al equipo (ver siguiente criterio) |
| Honestidad simulación vs. real | 10 | Etiquetas "datos de demostración"/"Simulación" en cada precio y botón de compra; el panel de confirmación aclara explícitamente que no hubo pago ni pedido real y que no hay convenio con ningún retailer |
| Auditoría funcional/visual ejecutada (no solo leída) | 9 | Se abrió el archivo en Chromium real (no solo se leyó el código) y se probaron los 3 perfiles, retroceso de pasos, reinicio, y el caso contradictorio manual, con resultados exactos documentados en `docs/ux-audit.md` |
| Prueba del desconocido | 2 | Plantilla completa y lista en `docs/stranger-test-template.md`, pero **no ejecutada** por falta de una persona disponible en esta sesión — se documenta como pendiente en vez de inventar resultados, que es lo que pide la consigna, pero el criterio en sí (validar con alguien ajeno) no está cumplido |
| Documentación / entregables completos | 9 | Brief, matriz de cumplimiento, resultados de pruebas, auditoría UX, plantilla de prueba, insights y este documento existen y son consistentes entre sí; resta punto porque el .docx de origen no pudo leerse (ver `docs/brief.md` §0) |
| Gestión del tiempo | 8 | Fases de definición+brief+lógica y de construcción+auditoría se completaron dentro o cerca del presupuesto de 60 minutos de la consigna (ver `docs/time-log.md`); no se pudo medir la fase de "prueba del desconocido" porque no se ejecutó |

## Nota general
**Promedio simple: 8.2/10.** El prototipo cumple el objetivo central del sprint —de cero a
una recomendación explicada y una decisión de compra simulada en menos de un minuto de
interacción, para los 3 perfiles y para respuestas incompletas o contradictorias— con
lógica auditada y corregida antes del diseño visual, como pedía la consigna. El punto más
débil y honesto es que la validación con una persona real (la "prueba del desconocido")
sigue pendiente: sin ella, la nota de "usabilidad sin explicación" (8) es una estimación
de equipo, no un hecho confirmado.
