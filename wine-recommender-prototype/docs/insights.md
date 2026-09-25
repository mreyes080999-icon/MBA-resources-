# 5 insights del proyecto

Se separa explícitamente lo **observado** (evidencia de este sprint: pruebas de lógica,
auditoría de navegador) de lo que es **hipótesis** (no probado con usuarios reales todavía,
pendiente de la prueba del desconocido en `docs/stranger-test-template.md`).

## 1. Qué preferencias ayudan más a decidir
**Observado:** en las pruebas de lógica, el dulzor y la intensidad son las preguntas que
más mueven el ranking incluso cuando no se elige ningún sabor (caso "respuestas
incompletas": con 0 sabores seleccionados, el motor igual entrega una recomendación con
100% de coincidencia basada solo en dulzor + intensidad + ocasión). Los sabores, en
cambio, solo suman si el catálogo tiene un vino que los cubra exactamente — con pocos
vinos por tipo, a veces ningún candidato tiene más de 1 de los 2 sabores pedidos (ver
perfil "Regalo", overlap de 0.5).
**Hipótesis:** para un catálogo real y más grande, sabor sería la señal más discriminante;
con un catálogo chico como el de esta demo, dulzor/intensidad son más confiables porque
casi todos los vinos tienen un valor definido en esas dos dimensiones.

## 2. Qué dudas puede resolver una muestra
**Hipótesis (no observada con usuarios reales todavía):** la muestra parece más útil
cuando la recomendación tiene un score moderado (40–70%, como en los perfiles
contradictorios o de regalo) que cuando el score es muy alto (>90%, perfil "Cena
especial"). Si el motor ya está muy seguro, probar antes de comprar agrega fricción sin
reducir mucha incertidumbre real; si el motor está inseguro (poca coincidencia de
sabores, presupuesto relajado), la muestra sí resuelve una duda genuina: "¿me va a
gustar esto que no pedí exactamente?". Esto debería confirmarse con la prueba del
desconocido, viendo qué perfil de score elige botella vs. muestras.

## 3. Qué fricciones aparecen al elegir botella frente a muestras
**Observado (auditoría de interfaz):** con la solución actual no hay fricción de
navegación — ambas opciones están una junto a la otra, mismo tamaño, mismo tipo de
botón, y el clic entrega confirmación inmediata. La única fricción visible en el diseño
es que el usuario no puede comparar precio de muestra vs. precio de botella *antes* de
llegar a la pantalla 3 (en la pantalla 2 solo ve ambos precios en una línea compacta).
**Hipótesis:** en una versión real, la fricción real no sería de interfaz sino de
confianza — el usuario podría dudar en pagar por una muestra de un producto que no
conoce si no hay una política de devolución clara, algo que este prototipo no puede
probar porque no hay pago real.

## 4. Qué hipótesis de negocio siguen sin validar
Todas estas son hipótesis explícitas, no resultados:
- Que ofrecer "muestras" realmente reduce la fricción de decisión más que solo mostrar
  una alternativa de menor precio.
- Que un usuario confía en una recomendación explicada por reglas simples (sin humano ni
  IA generativa) tanto como en una recomendación de un sommelier o de reseñas de otros
  usuarios.
- Que 5 preguntas es el punto óptimo entre "encuesta breve" y "recomendación precisa" —
  podría ser que 3 preguntas basten, o que falten 1–2 para que la razón se sienta menos
  genérica en casos de score bajo.
- Que existe una relación real con un proveedor de vinos y muestras dispuesto a cumplir
  lo que esta interfaz promete (este prototipo no valida ni asume ningún convenio).

## 5. Cuál sería el siguiente experimento prioritario
**Hipótesis de priorización (a validar):** correr la prueba del desconocido con 3–5
personas con distinto nivel de conocimiento de vino, midiendo específicamente (a) tiempo
hasta la recomendación, y (b) qué opción de compra eligen según el score de la
recomendación que recibieron. Si se confirma la hipótesis del insight #2 (muestras
resuelven más duda cuando el score es bajo), el siguiente paso de producto sería mostrar
la opción de muestras de forma más prominente cuando el score cae debajo de, por ejemplo,
70%, y la botella de forma más prominente cuando el score es alto — en vez de presentar
ambas siempre con el mismo peso visual como hace este prototipo.
