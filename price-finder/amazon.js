// Adaptador de Amazon vía Product Advertising API 5.0 (SearchItems), firmado con AWS SigV4.
// Requiere credenciales de Amazon Associates: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG.
import { createHash, createHmac } from "node:crypto";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const hmac = (key, s) => createHmac("sha256", key).update(s).digest();

export function signRequest({ host, path, target, body, accessKey, secretKey, region, service = "ProductAdvertisingAPI", now = new Date() }) {
  const amzDate = now.toISOString().replace(/[-:]|\.\d{3}/g, ""); // 20260930T120000Z
  const day = amzDate.slice(0, 8);
  const headers = {
    "content-encoding": "amz-1.0",
    "content-type": "application/json; charset=utf-8",
    host,
    "x-amz-date": amzDate,
    "x-amz-target": target,
  };
  const names = Object.keys(headers).sort(); // ya están en orden alfabético
  const canonical = ["POST", path, "", ...names.map((n) => `${n}:${headers[n]}\n`), names.join(";"), sha256(body)].join("\n");
  const scope = `${day}/${region}/${service}/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonical)].join("\n");
  const kSigning = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, day), region), service), "aws4_request");
  const signature = createHmac("sha256", kSigning).update(toSign).digest("hex");
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${names.join(";")}, Signature=${signature}`;
  return headers;
}

export function makeAmazon({
  accessKey = process.env.AMAZON_ACCESS_KEY, secretKey = process.env.AMAZON_SECRET_KEY, partnerTag = process.env.AMAZON_PARTNER_TAG,
  host = "webservices.amazon.com.mx", region = "us-east-1", marketplace = "www.amazon.com.mx", fetchImpl = fetch, now,
} = {}) {
  return {
    name: "Amazon",
    async search(query) {
      if (!accessKey || !secretKey || !partnerTag) throw new Error("Faltan AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY / AMAZON_PARTNER_TAG");
      const path = "/paapi5/searchitems";
      const body = JSON.stringify({
        Keywords: query, PartnerTag: partnerTag, PartnerType: "Associates", Marketplace: marketplace, ItemCount: 10,
        Resources: ["ItemInfo.Title", "Offers.Listings.Price", "Offers.Listings.Availability.Type"],
      });
      const headers = signRequest({ host, path, body, accessKey, secretKey, region, now, target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems" });
      const res = await fetchImpl(`https://${host}${path}`, { method: "POST", headers, body });
      if (!res.ok) throw new Error(`Amazon PA-API ${res.status}`);
      const items = (await res.json()).SearchResult?.Items ?? [];
      return items.flatMap((it) => {
        const l = it.Offers?.Listings?.[0];
        const price = l?.Price?.Amount;
        if (price == null) return []; // sin oferta actual
        // El envío no viene en SearchItems: el total de Amazon es solo el precio.
        return [{ title: it.ItemInfo?.Title?.DisplayValue ?? "", price, shipping: 0, url: it.DetailPageURL, inStock: l.Availability?.Type === "Now" }];
      });
    },
  };
}
