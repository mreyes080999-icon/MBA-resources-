// identify(imagePath) con visión de Claude. Requiere ANTHROPIC_API_KEY.
import { readFile } from "node:fs/promises";
import { extname } from "node:path";

const MEDIA = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp" };
const PROMPT = "Identifica el producto de la imagen. Responde SOLO con marca, modelo y color/variante " +
  "(ej. \"Sony WH-1000XM5 Black\"), sin texto extra. Si no puedes identificar marca y modelo con seguridad, responde exactamente UNKNOWN.";

export function makeClaudeIdentify({ apiKey = process.env.ANTHROPIC_API_KEY, model = "claude-sonnet-5-5", fetchImpl = fetch } = {}) {
  return async (imagePath) => {
    if (!apiKey) throw new Error("Falta ANTHROPIC_API_KEY");
    const media_type = MEDIA[extname(imagePath).toLowerCase()];
    if (!media_type) throw new Error(`Formato de imagen no soportado: ${imagePath}`);
    const data = (await readFile(imagePath)).toString("base64");
    const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model, max_tokens: 60,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type, data } },
          { type: "text", text: PROMPT },
        ] }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const text = (await res.json()).content?.find((b) => b.type === "text")?.text?.trim() ?? "";
    if (!text || /^unknown$/i.test(text)) throw new Error("No se pudo identificar el producto en la imagen");
    return text;
  };
}
