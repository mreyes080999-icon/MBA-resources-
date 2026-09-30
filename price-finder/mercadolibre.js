// Adaptador de Mercado Libre (API pública de búsqueda por sitio; MLM = México).
// Token opcional en MELI_ACCESS_TOKEN: ML ha exigido autenticación en algunas cuentas/regiones.
export function makeMercadoLibre({ site = "MLM", token = process.env.MELI_ACCESS_TOKEN, limit = 20, fetchImpl = fetch } = {}) {
  return {
    name: "Mercado Libre",
    async search(query) {
      const url = `https://api.mercadolibre.com/sites/${site}/search?q=${encodeURIComponent(query)}&limit=${limit}&condition=new`;
      const res = await fetchImpl(url, { headers: token ? { authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(`Mercado Libre API ${res.status}`);
      const { results = [] } = await res.json();
      return results.map((r) => ({
        title: r.title,
        price: r.price,
        // La búsqueda no da el costo de envío: solo se sabe si es gratis; si no, queda sin sumar.
        shipping: 0,
        url: r.permalink,
        inStock: (r.available_quantity ?? 1) > 0,
      }));
    },
  };
}
