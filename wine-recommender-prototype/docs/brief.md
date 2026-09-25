# Brief — Prototipo "¿Qué vino elijo?" (Sprint 4, EM4006)

## 0. Nota sobre el insumo
El documento adjunto «Sprint-4-Prototipo-EM4006.docx» **no llegó a este entorno** (no hay
archivos subidos ni en el repo ni en el contenedor). No se inventó su contenido: se usó
como criterio de aceptación el texto completo de la consigna recibida en el mensaje del
usuario, que ya especifica objetivo, alcance, flujo de 3 pantallas, entregables y
tiempos. Si el .docx contiene requisitos adicionales no mencionados en el mensaje,
quedan fuera de este prototipo y deben añadirse en una siguiente iteración.

## 1. Checklist verificable de requisitos (extraídos de la consigna)
- [x] Una sola página, flujo de máximo 3 pantallas: preferencias → recomendación → elección compra.
- [x] Sin registro, sin perfil, sin menú, sin nada que no acerque al momento de valor.
- [x] Encuesta breve y fácil de responder (ocasión, sabores, dulzor, intensidad, presupuesto).
- [x] Catálogo semilla de vinos verosímil con atributos suficientes.
- [x] 3 perfiles de prueba distintos, cargables sin escribir datos.
- [x] Lógica determinista y explicable (no aleatoria, no genérica).
- [x] Respeta presupuesto; si no hay coincidencia, lo señala explícitamente.
- [x] Recomendación principal + alternativa, cada una con razón concreta.
- [x] Código probado con los 3 perfiles + casos límite (incompleto, contradictorio, sin presupuesto viable) ANTES de construir la interfaz.
- [x] Interfaz autocontenida, responsiva, usable sin explicación.
- [x] Botella y muestras mostradas con precio y contenido, claramente distinguidas.
- [x] Todo dato de catálogo/precio/inventario etiquetado como "datos de demostración"; ninguna compra real.
- [x] Botones con resultado comprobable (resumen dentro del prototipo), marcando la simulación.
- [x] Auditoría funcional y visual tras construir, con registro de defectos y correcciones.
- [x] Plantilla de prueba del desconocido (sin inventar resultados si no hay tester real).
- [x] Registro de tiempo real por etapa.
- [x] Matriz de cumplimiento + evaluación final 0–10 con evidencia.
- [x] 5 insights, separando observado de hipótesis.

## 2. Qué se ejecuta de verdad vs. qué se simula
**Real (se ejecuta en este entorno):**
- La lógica de recomendación (JavaScript puro, `logic.js`), probada con Node.js fuera del navegador.
- El prototipo HTML/CSS/JS corre en un navegador real (se abrió y navegó con Playwright/Chromium para la auditoría, ver `docs/ux-audit.md`).
- Los cálculos de score, filtrado por presupuesto, y generación de razones son deterministas y verificables (mismo input → mismo output).

**Simulado (no hay backend, proveedor ni pago reales):**
- El catálogo de vinos: inventado, con atributos verosímiles, etiquetado en la UI como "Catálogo de demostración".
- Precios de botella y muestra: estimados, no vinculados a ningún retailer real.
- Los botones "Comprar botella" / "Elegir muestras": muestran un resumen de la elección dentro de la misma página y aclaran "Simulación — no se procesó ningún pago ni pedido real." No se afirma en ningún punto que hubo una compra, un convenio con retailer o disponibilidad de muestras reales.
- Disponibilidad de stock: no existe el concepto; todo vino del catálogo se asume "disponible" solo a efectos de la demo.

## 3. Entrada del usuario
Encuesta de 5 preguntas, todas de selección (sin texto libre) para minimizar fricción y tiempo de respuesta:
1. **Ocasión**: casual / celebración / regalo / cena con maridaje.
2. **Sabores preferidos** (multi-selección, 0–3): frutal, cítrico, floral, especiado, terroso, ahumado/roble, herbal, bayas rojas.
3. **Dulzor**: seco, semi-seco, dulce.
4. **Intensidad/cuerpo**: ligero, medio, intenso.
5. **Presupuesto por botella**: <$15, $15–30, $30–50, $50+.

Todas las preguntas tienen un valor por defecto o pueden quedar sin responder (excepto presupuesto, que tiene default "$15–30") — así una respuesta incompleta no bloquea el flujo.

## 4. Lógica de recomendación (determinista, ver `logic.js`)
1. Filtrar catálogo por presupuesto (`precioBotella <= tope`). Si el filtro deja 0 vinos, se **relaja el presupuesto** al tope inmediatamente superior disponible en el catálogo y se marca la recomendación con `fueraDePresupuesto: true` + diferencia en dólares, en lugar de fallar o inventar un vino.
2. Para cada vino candidato, calcular un score explicable = suma ponderada de:
   - Coincidencia de sabores (peso 40): sabores en común / sabores seleccionados.
   - Cercanía de dulzor (peso 25): distancia entre nivel elegido y nivel del vino (escala 1–3).
   - Cercanía de intensidad (peso 25): misma lógica, escala 1–3.
   - Afinidad de ocasión → tipo de vino (peso 10): tabla fija (p. ej. celebración favorece espumantes; cena con maridaje favorece tintos de cuerpo medio/alto).
3. Ordenar candidatos por score descendente. El primero es la **recomendación principal**, el segundo (de tipo o perfil de sabor distinto cuando es posible) es la **alternativa**.
4. La razón de cada recomendación se construye a partir de los atributos que realmente coincidieron (no es un texto fijo): ej. "Coincide con tu preferencia por sabores frutales y bayas rojas, es de intensidad media como pediste, y tu ocasión (celebración) combina bien con este estilo."
5. Sin respuestas de sabor: el score usa solo dulzor + intensidad + ocasión (no se inventa afinidad de sabor).
6. Respuestas contradictorias (p. ej. dulzor "dulce" + intensidad "intenso" con ocasión "cena con maridaje", una combinación poco común en el catálogo): el algoritmo no falla, simplemente da scores más bajos a todos los candidatos y aun así elige el mejor disponible, mostrando la razón basada en lo que sí coincidió.

## 5. Tecnología
- HTML + CSS + JavaScript vanilla (ES modules), un solo archivo `index.html` + `logic.js`, sin frameworks ni build step, para que sea autocontenido y abrible con un doble click o `npx serve`.
- Pruebas de lógica: `test-logic.mjs`, ejecutado con `node test-logic.mjs` (Node ≥ 18).
- Sin backend, sin base de datos, sin dependencias externas.

## 6. Supuestos adoptados (marcados por no estar especificados)
- Moneda: USD.
- Tamaño de muestra: 50 ml; precio de muestra ≈ 20% del precio de botella, mínimo $6, redondeado a entero.
- Catálogo: 12 vinos (3–4 por tipo: tinto, blanco, rosado, espumante), suficientes para que cada combinación de encuesta tenga al menos un candidato razonable.
- "Momento de valor" cumplido = usuario ve recomendación explicada + puede elegir botella o muestras, en ≤ 3 clics desde que abre la página (sin contar la carga de un perfil demo).
- No se implementa carrito, checkout multi-ítem, ni historial: excede el alcance del sprint.
