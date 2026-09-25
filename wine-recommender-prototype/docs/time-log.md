# Registro de tiempo real por etapa

Medido con timestamps reales de la sesión (`date` antes/después de cada etapa). Importante:
esto es tiempo de ejecución de un agente trabajando de forma continua, no el tiempo de una
persona en un sprint de 60 minutos con las pausas, cambios de herramienta y deliberación
que eso implica — se reporta igual, tal como pide la consigna, para no declarar cumplido un
plazo que no se midió, pero no debe leerse como equivalente a 60 minutos de trabajo humano.

| Etapa (consigna) | Presupuesto sugerido | Inicio | Fin | Duración real | Notas |
|---|---|---|---|---|---|
| 1) Definir y recortar alcance | 10 min | 03:13:18 | 03:13:18 | incluido en la etapa siguiente | Se hizo en el mismo bloque que el brief, sin corte de herramienta entre ambas |
| 2) Brief | 10 min | 03:13:18 | ~03:15:30 | ~2 min | Brief escrito directamente como entregable (`docs/brief.md`), incluye la nota de que el .docx no llegó al entorno |
| 3) Construir: lógica + auditoría inicial + interfaz | 20 min | ~03:15:30 | 03:22:54 | ~7.4 min | Incluye: catálogo, motor de scoring, 39 pruebas automatizadas, 1 defecto encontrado y corregido, prototipo visual completo, auditoría con Playwright en navegador real (desktop+mobile, claro+oscuro), 2ª pasada de pruebas |
| 4) Prueba del desconocido | 10 min | — | — | no ejecutada | No hay una persona disponible en esta sesión; se dejó la plantilla lista (`docs/stranger-test-template.md`) en vez de inventar resultados o sustituirla por la propia auditoría del equipo |
| 5) Corregir fricciones encontradas | 10 min | 03:22:54 | 03:25:03 | ~2.2 min | Esta etapa se dedicó a redactar los entregables de documentación (matriz, resultados, insights, evaluación); no surgieron fricciones nuevas de interfaz en la auditoría que corregir aparte del defecto de lógica ya resuelto en la etapa 3 |

**Total medido (etapas 1–3 y 5): ~11.6 minutos** de ejecución continua de agente, muy por
debajo del presupuesto de 50 minutos sugerido para esas mismas etapas (10+10+20+10). La
etapa 4 (10 min sugeridos) queda pendiente por completo porque depende de una persona real
externa al equipo, no de más tiempo de trabajo del agente — no se puede "acelerar" ni
simular sin inventar datos, así que se reporta como no ejecutada en vez de forzar un
número.
