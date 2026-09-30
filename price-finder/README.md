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

**Validar rápido:** `./validar.sh` (Mac/Linux) o `validar.bat` (Windows) — corre las pruebas y abre la web en modo demo. Solo requiere Node 18+.

**Probar con llaves reales:** `ANTHROPIC_API_KEY=... AMAZON_ACCESS_KEY=... AMAZON_SECRET_KEY=... AMAZON_PARTNER_TAG=... node diagnostico.mjs foto.jpg` prueba Claude, Mercado Libre y Amazon por separado e indica cuál falla y por qué (no imprime llaves).

```
node server.mjs # web en http://localhost:3000 (PORT para cambiar)
node test.mjs   # pruebas
node cli.mjs    # demo
```

## Despliegue con Docker
```
docker build -t price-finder .
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=... -e LIVE_STORES=1 \
  -e AMAZON_ACCESS_KEY=... -e AMAZON_SECRET_KEY=... -e AMAZON_PARTNER_TAG=... \
  -e MELI_ACCESS_TOKEN=... \
  -e APP_PASSWORD=... \
  price-finder   # añade -e TRUST_PROXY=1 solo si hay un proxy/balanceador delante
```
- Las llaves se pasan como variables de entorno (o secretos de la plataforma); nunca van en la imagen. Sin ellas corre en modo demo.
- Escucha en `PORT` (3000 por defecto) y expone `/healthz` para el healthcheck de la plataforma.
- **Acceso y límites** (variables de entorno del servidor):
  - `APP_PASSWORD` — si se define, `/api/search` exige esa contraseña (la web la pide y la recuerda en la pestaña). **Defínela siempre en modo real**; sin ella el servidor avisa al arrancar.
  - `RATE_LIMIT` (20) y `RATE_WINDOW_MIN` (60) — búsquedas válidas por IP en la ventana. Más de 10 contraseñas fallidas por IP en 15 min se bloquean.
  - `TRUST_PROXY=1` — si va detrás de un proxy/balanceador (un salto), toma la IP real de `X-Forwarded-For`. Sin esto todos los usuarios compartirían la IP del proxy y el límite sería global.
  - Los límites viven en memoria del proceso: se reinician al redeplegar y no se comparten entre réplicas. Usa una sola instancia o pon el límite en el proxy.
  - Usa HTTPS (el proxy de tu plataforma); la contraseña viaja en una cabecera.
