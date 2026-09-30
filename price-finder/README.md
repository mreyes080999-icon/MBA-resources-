# price-finder — imagen → mejor precio multitienda

Pipeline: imagen → identificar producto → normalizar búsqueda → Amazon / Mercado Libre / Walmart
en paralelo → ranking por precio total (precio + envío) → mejor oferta.

- `pipeline.js` — normalización, coincidencia de título (descarta modelos distintos, p. ej. XM4 vs XM5), ranking y `findBestPrice`.
- `claude-identify.js` — identificación real con visión de Claude (`ANTHROPIC_API_KEY`); `node cli.mjs foto.jpg` la usa si la variable existe, si no cae al demo.
- `mercadolibre.js` — tienda real (API de búsqueda de Mercado Libre, sitio MLM). `LIVE_STORES=1 node cli.mjs foto.jpg` la usa en vez de las tiendas demo. Token opcional `MELI_ACCESS_TOKEN`. Limitación: el envío no viene en la búsqueda, así que el total de ML es solo el precio.
- `demo-adapters.js` — identificador y tiendas **de demostración** (datos falsos). Sustituir por visión (API de Claude con imagen) y APIs reales de cada tienda; contrato: `search(query) -> [{title, price, shipping?, url, inStock?}]`.
- Una tienda que falla no rompe la búsqueda; se reporta en `errors`.

```
node test.mjs   # pruebas
node cli.mjs    # demo
```
