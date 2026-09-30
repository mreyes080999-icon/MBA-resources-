// Servidor web local sin dependencias: sirve index.html y POST /api/search { image: "data:image/...;base64,..." }.
// Las llaves viven en variables de entorno del servidor, nunca en el navegador.
import { createServer } from "node:http";
import { timingSafeEqual, createHash } from "node:crypto";
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

// Ventana deslizante por clave (IP). hit() devuelve true si aún está dentro del límite.
export function makeLimiter(max, windowMs, now = () => Date.now()) {
  const hits = new Map();
  return {
    hit(key) {
      const t = now(), recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
      const ok = recent.length < max;
      if (ok) recent.push(t);
      recent.length ? hits.set(key, recent) : hits.delete(key);
      if (hits.size > 10000) hits.clear(); // tope de memoria
      return ok;
    },
  };
}

const digest = (s) => createHash("sha256").update(s).digest();
const passwordOk = (given, expected) => timingSafeEqual(digest(given ?? ""), digest(expected));

export function makeServer(getConfig = config, {
  password = process.env.APP_PASSWORD,
  rateMax = Number(process.env.RATE_LIMIT ?? 20), rateWindowMs = Number(process.env.RATE_WINDOW_MIN ?? 60) * 60_000,
  trustProxy = !!process.env.TRUST_PROXY, now,
} = {}) {
  const searches = makeLimiter(rateMax, rateWindowMs, now);
  const failures = makeLimiter(10, 15 * 60_000, now); // freno a adivinar la contraseña
  // Tras un proxy (1 salto) la IP real es la última de X-Forwarded-For; sin proxy, la del socket.
  const clientIp = (req) => (trustProxy && req.headers["x-forwarded-for"]?.split(",").pop().trim()) || req.socket.remoteAddress;
  return createServer(async (req, res) => {
    const send = (code, body, type = "application/json") => { res.writeHead(code, { "content-type": type }); res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
    try {
      if (req.method === "GET" && req.url === "/healthz") return send(200, { ok: true });
      if (req.method === "GET" && req.url === "/") return send(200, await readFile(new URL("./index.html", import.meta.url)), "text/html; charset=utf-8");
      if (req.method === "POST" && req.url === "/api/search") {
        const ip = clientIp(req);
        if (password && !passwordOk(req.headers["x-app-password"], password)) {
          if (!failures.hit(ip)) return send(429, { error: "Demasiados intentos. Espera unos minutos." });
          return send(401, { error: "Contraseña incorrecta o faltante" });
        }
        if (!searches.hit(ip)) return send(429, { error: "Límite de búsquedas alcanzado. Intenta más tarde." });
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
  if (!process.env.APP_PASSWORD && process.env.LIVE_STORES) console.warn("AVISO: modo real sin APP_PASSWORD; cualquiera con la URL gasta tus APIs.");
  makeServer().listen(port, () => console.log(`http://localhost:${port}  ${config().demo ? "(modo demo)" : "(modo real)"}`));
}
