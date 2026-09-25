# Resultados de la auditoría de lógica (paso 3 de la consigna)

Ejecutado con `node test-logic.mjs` desde `wine-recommender-prototype/`. Salida completa
reproducible; resumen abajo. Node ≥18, sin dependencias externas.

## Primera corrida — defecto encontrado
La primera ejecución completa (38/38 checks que sí corrieron) expuso un defecto que las
propias aserciones no cubrían todavía: en el caso 4 (presupuesto por debajo del vino más
barato del catálogo), `alternative` llegaba como `undefined` porque el pool relajado
contenía un solo vino. La consola mostraba:
```
alternative: undefined $undefined score=undefined
  reason: undefined
```
Esto habría roto la pantalla de recomendación en la interfaz (intento de leer
`undefined.wine.name`).

**Corrección aplicada** (`logic.js`): se separó la elección de la recomendación principal
(que sigue saliendo del pool más ajustado al presupuesto posible) de la búsqueda de
alternativa (que amplía la búsqueda al resto del catálogo solo si el pool ajustado no
alcanza para una segunda opción). Se agregó una prueba de regresión explícita
("también entrega una alternativa (no queda huérfana)") para que este defecto no
reaparezca sin ser detectado.

Primer intento de arreglo (expandir todo el pool al catálogo completo antes de
puntuar) introdujo un problema nuevo: la recomendación principal dejaba de ser la más
cercana al presupuesto pedido (elegía un vino de $18 en vez del más barato de $12
disponible para un presupuesto de $10). Se descartó ese enfoque por el correcto,
descrito arriba.

## Segunda corrida — resultado
```
=== RESUMEN: 39 OK, 0 FAIL ===
```
Todas las verificaciones pasan: los 3 perfiles semilla, respuestas incompletas (sin
sabores), respuestas contradictorias, presupuesto sin coincidencias, y consistencia de
precios de muestra en las 12 referencias del catálogo.

## Casos ejecutados y resultado esperado vs. obtenido

| Caso | Esperado | Obtenido |
|---|---|---|
| Perfil "Cena especial en pareja" | Recomendación tinto intenso/seco con sabores bayas rojas/especiado, dentro de $50 | Cosecha Roja Malbec, $28, 94% — coincide ✅ |
| Perfil "Tarde casual con amigos" | Vino ligero, económico (<$15), floral/cítrico | Pétalo Rosado, $14, 80% — coincide ✅ |
| Perfil "Regalo para alguien que no conozco" | Opción segura tinto/blanco de $15–30, ahumado/terroso | Cosecha Roja Malbec $28 (principal) vs. Brisa Dorada Chardonnay $22 (alternativa), scores muy cercanos (66 vs 64) — coincide, y expone bien la lógica de desempate ✅ |
| Respuestas incompletas (sin sabores) | No debe fallar; recomendación basada solo en dulzor/intensidad/ocasión | Verano Rosado Syrah, 100% — sin errores, sin "undefined" ✅ |
| Respuestas contradictorias (dulce+ligero+cena de maridaje, presupuesto bajo) | Debe entregar igual una recomendación, con score bajo (<60) que refleje el desajuste | Pétalo Rosado, score 42 — coincide ✅ |
| Presupuesto sin ninguna coincidencia (por debajo del vino más barato) | No debe fallar; debe relajar el presupuesto y marcarlo explícitamente | `budgetRelaxed:true`, `overBudget:true`, precio real > presupuesto pedido — coincide ✅ |
| Consistencia de precios | Toda muestra debe costar menos que su botella, con mínimo razonable | 12/12 vinos cumplen, mínimo $6 — coincide ✅ |

## Nota sobre el caso "presupuesto sin coincidencias"
Los presets de la encuesta (`<$15`, `$15–30`, `$30–50`, `$50+`) siempre incluyen al menos
el vino más barato del catálogo ($12), así que ese caso extremo no es alcanzable desde los
controles de la interfaz tal como está diseñada. Se probó de todas formas llamando a
`recommend()` directamente con un tope sintético ($10) para verificar que el motor no se
rompe si en el futuro el catálogo cambia o se agregan presupuestos más bajos. Esto es una
prueba de robustez del motor, no un escenario reproducible hoy desde la UI.
