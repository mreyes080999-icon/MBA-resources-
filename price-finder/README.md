# price-finder — imagen → mejor precio multitienda

Pipeline: imagen → identificar producto → normalizar búsqueda → Amazon / Mercado Libre / Walmart
en paralelo → ranking por precio total (precio + envío) → mejor oferta.

- `pipeline.js` — normalización, coincidencia de título (descarta modelos distintos, p. ej. XM4 vs XM5), ranking y `findBestPrice`.
- `claude-identify.js` — identificación real con visión de Claude (`ANTHROPIC_API_KEY`); `node cli.mjs foto.jpg` la usa si la variable existe, si no cae al demo.
- `mercadolibre.js` — tienda real (API de búsqueda de Mercado Libre, sitio MLM). `LIVE_STORES=1 node cli.mjs foto.jpg` la usa en vez de las tiendas demo. Token opcional `MELI_ACCESS_TOKEN`. Limitación: el envío no viene en la búsqueda, así que el total de ML es solo el precio.
- `amazon.js` — tienda real vía Product Advertising API 5 (amazon.com.mx) con firma SigV4 propia. Requiere `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG` (cuenta Associates). Con `LIVE_STORES=1` se usa junto a Mercado Libre. El envío no viene en la búsqueda.
- `demo-adapters.js` — identificador y tiendas **de demostración** (datos falsos). Sustituir por visión (API de Claude con imagen) y APIs reales de cada tienda; contrato: `search(query) -> [{title, price, shipping?, url, inStock?}]`.
- Una tienda que falla no rompe la búsqueda; se reporta en `errors`.

- `server.mjs` + `index.html` — interfaz web: subes una foto y ves la tarjeta MEJOR PRECIO con "Ver producto". Las llaves se quedan en el servidor. Sin `ANTHROPIC_API_KEY` y `LIVE_STORES` corre en modo demo (con aviso visible).

```
node server.mjs # web en http://localhost:3000 (PORT para cambiar)
node test.mjs   # pruebas
node cli.mjs    # demo
```
