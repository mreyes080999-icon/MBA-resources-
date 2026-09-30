// Adaptadores DEMO con datos de ejemplo. Reemplazar por integraciones reales
// (Amazon PA-API, Mercado Libre API, Walmart affiliate/Marketplace) con la misma forma:
//   { name, search(query) -> [{ title, price, shipping?, url, inStock? }] }
// Para identify(image) conectar un modelo de visión (p. ej. la API de Claude con entrada de imagen).

export const demoIdentify = async () => "Sony WH-1000XM5 Black";

const store = (name, rows) => ({ name, search: async () => rows });

export const demoStores = [
  store("Amazon", [
    { title: "Sony WH-1000XM5 Black Wireless Headphones", price: 6499, shipping: 0, url: "https://example.com/amazon/xm5" },
    { title: "Sony WH-1000XM4 Black", price: 4999, url: "https://example.com/amazon/xm4" },
  ]),
  store("Mercado Libre", [
    { title: "Audífonos Sony WH-1000XM5 Black", price: 6199, shipping: 350, url: "https://example.com/ml/xm5" },
  ]),
  store("Walmart", [
    { title: "Sony WH-1000XM5 Black", price: 6799, shipping: 0, url: "https://example.com/walmart/xm5", inStock: false },
  ]),
];
