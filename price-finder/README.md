# price-finder — imagen → mejor precio multitienda

Pipeline: imagen → identificar producto → normalizar búsqueda → Amazon / Mercado Libre / Walmart
en paralelo → ranking por precio total (precio + envío) → mejor oferta.

- `pipeline.js` — normalización, coincidencia de título (descarta modelos distintos, p. ej. XM4 vs XM5), ranking y `findBestPrice`.
- `demo-adapters.js` — identificador y tiendas **de demostración** (datos falsos). Sustituir por visión (API de Claude con imagen) y APIs reales de cada tienda; contrato: `search(query) -> [{title, price, shipping?, url, inStock?}]`.
- Una tienda que falla no rompe la búsqueda; se reporta en `errors`.

```
node test.mjs   # pruebas
node cli.mjs    # demo
```
