# Matriz de cumplimiento de la consigna

| # | Requisito | Cumplido | Evidencia |
|---|---|---|---|
| 1 | Una sola página, flujo de máximo 3 pantallas | ✅ | `index.html` — `#step-1`/`#step-2`/`#step-3`, un solo archivo, indicador de 3 puntos |
| 2 | Sin registro, perfil, menú ni funciones ajenas al momento de valor | ✅ | No hay formulario de login, ni navegación, ni ajustes de cuenta en todo el archivo |
| 3 | Encuesta breve y fácil (ocasión, sabores, dulzor, intensidad, presupuesto) | ✅ | 5 campos, todos de selección por chips, sin texto libre |
| 4 | Catálogo semilla verosímil con atributos suficientes | ✅ | `CATALOG` en `logic.js` / `index.html`, 12 vinos, 4 tipos, atributos de sabor/dulzor/intensidad/precio/región |
| 5 | 3 perfiles de prueba distintos, cargables sin escribir datos | ✅ | `DEMO_PROFILES`, 3 botones en la barra superior de la interfaz |
| 6 | Lógica determinista y explicable, no aleatoria ni genérica | ✅ | `scoreWine`/`buildReason` en `logic.js`, mismas entradas → misma salida, razones construidas desde los atributos que sí coincidieron |
| 7 | Respeta presupuesto; señala cuando no hay coincidencia | ✅ | Filtro por `budgetMax`, bandera `overBudget` + chip de advertencia visible en la interfaz |
| 8 | Recomendación principal + alternativa con razón concreta cada una | ✅ | `result.primary` / `result.alternative`, ambas con `reason` propio |
| 9 | Código probado con 3 perfiles + casos límite ANTES de construir la interfaz | ✅ | `test-logic.mjs` ejecutado y corregido antes de escribir `index.html` (ver `docs/test-results.md` y timestamps del repo) |
| 10 | Interfaz autocontenida, responsiva, usable sin explicación | ✅ | Un solo archivo HTML sin build step; probado en 1280px y 390px sin overflow (`docs/ux-audit.md`) |
| 11 | Botella y muestras con precio y contenido, claramente distinguidas | ✅ | Pantalla 3: dos tarjetas lado a lado, 750 ml vs. 50 ml, precio de cada una |
| 12 | Datos de catálogo/precio etiquetados como demo; ninguna compra real afirmada | ✅ | Etiquetas "datos de demostración" y "Simulación" visibles en pantallas 1–3; panel final aclara "no se procesó ningún pago ni pedido real" |
| 13 | Botones con resultado comprobable dentro del prototipo | ✅ | Panel de confirmación inline tras elegir botella/muestras, sin `alert()` |
| 14 | Auditoría del prototipo ejecutándolo, con registro de defectos y correcciones | ✅ | `docs/ux-audit.md`, auditoría con Playwright/Chromium real, 1 defecto de lógica encontrado y corregido antes de la interfaz |
| 15 | Plantilla de prueba del desconocido, sin resultados inventados | ✅ | `docs/stranger-test-template.md` — plantilla lista, explícitamente marcada como pendiente de ejecución real |
| 16 | Registro de tiempo real por etapa | ✅ | `docs/time-log.md` |
| 17 | 5 insights separando observado de hipótesis | ✅ | `docs/insights.md` |
| 18 | Evaluación final 0–10 con evidencia | ✅ | `docs/final-evaluation.md` |

**Resultado: 18/18 requisitos verificables cumplidos.** El único punto fuera del control
de este entregable es el propio documento `Sprint-4-Prototipo-EM4006.docx`, que no llegó
a este entorno (ver `docs/brief.md`, sección 0): si ese archivo contiene criterios
adicionales no reflejados en el mensaje del usuario, no están cubiertos aquí.
