# Sommelier Exprés — prototipo Sprint 4 (EM4006)

Encuesta de un minuto que recomienda un vino explicado y deja elegir entre comprar una
botella o pedir muestras. Prototipo con catálogo y precios de **demostración** — no hay
pagos, inventario ni convenios reales con ningún retailer.

**Prototipo en vivo:** https://claude.ai/artifact/Tq4n6viVWjxM7bwTEeUacG

## Abrir el prototipo (pasos mínimos)
Es un solo archivo HTML autocontenido, sin dependencias ni build step:

```
Abrir wine-recommender-prototype/index.html con doble click en cualquier navegador.
```

No requiere servidor, `npm install` ni conexión a internet (la única llamada externa es a
Google Fonts para tipografías; si no hay red, la página usa sus fuentes de reserva y se ve
igual de funcional).

## Correr las pruebas de la lógica de recomendación
```
cd wine-recommender-prototype
node test-logic.mjs
```
Requiere Node ≥ 18. Debe imprimir `=== RESUMEN: 39 OK, 0 FAIL ===`.

## Estructura
```
wine-recommender-prototype/
├── index.html              # el prototipo — 3 pantallas, un solo archivo
├── logic.js                # motor de recomendación, reutilizable/testeable en Node
├── test-logic.mjs          # batería de pruebas de la lógica (3 perfiles + casos límite)
└── docs/
    ├── brief.md                    # alcance, supuestos, qué es real vs. simulado
    ├── test-results.md             # auditoría de lógica: defecto encontrado y corregido
    ├── ux-audit.md                 # auditoría del prototipo ejecutándolo en navegador
    ├── compliance-matrix.md        # matriz de cumplimiento de la consigna
    ├── stranger-test-template.md   # plantilla de prueba del desconocido (pendiente)
    ├── final-evaluation.md         # evaluación 0–10 con evidencia
    ├── insights.md                 # 5 insights (observado vs. hipótesis)
    └── time-log.md                 # tiempo real por etapa
```

## Qué es real y qué es simulado
- **Real:** la lógica de recomendación (determinista, probada con Node), y la interfaz
  corriendo en un navegador real.
- **Simulado:** el catálogo de 12 vinos, sus precios, y las "compras" de botella/muestras
  (muestran un resumen dentro de la misma página, sin procesar ningún pago).

Ver `docs/brief.md` para el detalle completo.
