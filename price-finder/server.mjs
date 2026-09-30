// Servidor web local sin dependencias: sirve index.html y POST /api/search { image: "data:image/...;base64,..." }.
// Las llaves viven en variables de entorno del servidor, nunca en el navegador.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { findBestPrice } from "./pipeline.js";
import { demoIdentify, demoStores } from "./demo-adapters.js";
import { makeClaudeIdentify } from "./claude-identify.js";
import { makeAmazon } from "./amazon.js";
import { makeMercadoLibre } from "./mercadolibre.js";

const MAX_BYTES = 8 * 1024 * 1024;
export const config = () => ({
  identify: process.env.ANTHROPIC_API_KEY ? makeClaudeIdentify() : async () => demoIdentify(),
  stores: process.env.LIVE_STORES ? [makeAmazon(), makeMercadoLibre()] : demoStores,
  demo: !process.env.ANTHROPIC_API_KEY || !process.env.LIVE_STORES,
});

export function makeServer(getConfig = config) {
  return createServer(async (req, res) => {
    const send = (code, body, type = "application/json") => { res.writeHead(code, { "content-type": type }); res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
    try {
      if (req.method === "GET" && req.url === "/") return send(200, await readFile(new URL("./index.html", import.meta.url)), "text/html; charset=utf-8");
      if (req.method === "POST" && req.url === "/api/search") {
        let size = 0; const chunks = [];
        for await (const c of req) { if ((size += c.length) > MAX_BYTES) return send(413, { error: "Imagen demasiado grande (máx. 8 MB)" }); chunks.push(c); }
        const m = /^data:(image\/[a-z+]+);base64,(.+)$/s.exec(JSON.parse(Buffer.concat(chunks).toString()).image ?? "");
        if (!m) return send(400, { error: "Se esperaba una imagen (data URL base64)" });
        const cfg = getConfig();
        const r = await findBestPrice({ mediaType: m[1], data: m[2] }, cfg);
        return send(200, { product: r.product, best: r.best, ranked: r.ranked, errors: r.errors, demo: cfg.demo });
      }
      send(404, { error: "No encontrado" });
    } catch (e) { send(500, { error: String(e.message ?? e) }); }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT ?? 3000;
  makeServer().listen(port, () => console.log(`http://localhost:${port}  ${config().demo ? "(modo demo)" : "(modo real)"}`));
}
