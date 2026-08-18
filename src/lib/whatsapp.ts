import type { CartItem } from "@/lib/types";
import { formatPrice, parsePrice } from "@/lib/format";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "la tienda";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

// Precio por producto, tal como lo devuelve Supabase (id -> price). Clave
// productId, no variantId: el precio es por producto, no por talle. Ver
// src/lib/use-cart-prices.ts, que arma este mapa releyendo la base en vez
// de confiar en lo que haya en localStorage.
export type PriceMap = Map<string, number | string | null>;

// Arma el mensaje del pedido. Tiene tres formas según qué tan cargados
// estén los precios de lo que hay en el carrito:
//
// 1. Ningún ítem tiene precio (el estado de todos los productos hoy, y
//    de cualquier producto nuevo hasta que se le cargue el precio en el
//    admin): mensaje IDÉNTICO al de antes de este cambio, sin importes,
//    pidiendo precio y disponibilidad. No hay regresión para lo que ya
//    existe en producción.
// 2. Todos los ítems tienen precio: mensaje con importe por línea y
//    total, cerrando en coordinar el envío en vez de pedir precio.
// 3. Mezcla (lo más común mientras se van cargando precios de a poco):
//    los ítems sin precio salen "a confirmar", el total suma lo que se
//    sabe y aclara cuánto queda pendiente.
export function buildOrderMessage(
  items: CartItem[],
  prices: PriceMap = new Map(),
): string {
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const noun = totalQty === 1 ? "artículo" : "artículos";

  const withPrice = items.map((item) => ({
    item,
    price: parsePrice(prices.get(item.productId)),
  }));

  const nonePriced = withPrice.every(({ price }) => price === null);

  if (nonePriced) {
    const lines = items.map(
      (item, i) =>
        `${i + 1}. ${item.productName} — Talle ${item.size} — Cantidad: ${item.qty}`,
    );

    return [
      `¡Hola ${STORE_NAME}! Me interesa este pedido:`,
      "",
      ...lines,
      "",
      `Total: ${totalQty} ${noun}`,
      "",
      "¿Me pasás precio y disponibilidad?",
    ].join("\n");
  }

  const allPriced = withPrice.every(({ price }) => price !== null);

  const lines = withPrice.map(({ item, price }, i) => {
    const priceText = price !== null ? formatPrice(price) : "a confirmar";
    return `${i + 1}. ${item.productName} — Talle ${item.size} — Cantidad: ${item.qty} — ${priceText}`;
  });

  const knownTotal = withPrice.reduce(
    (sum, { item, price }) => sum + (price !== null ? price * item.qty : 0),
    0,
  );
  const missingQty = withPrice
    .filter(({ price }) => price === null)
    .reduce((sum, { item }) => sum + item.qty, 0);

  const totalLine = allPriced
    ? `Total: ${totalQty} ${noun} — ${formatPrice(knownTotal)}`
    : `Total: ${totalQty} ${noun} — ${formatPrice(knownTotal)} + ${missingQty} a confirmar`;

  const closing = allPriced
    ? "¿Coordinamos el envío?"
    : "¿Me confirmás el precio de lo que falta?";

  return [
    `¡Hola ${STORE_NAME}! Me interesa este pedido:`,
    "",
    ...lines,
    "",
    totalLine,
    "",
    closing,
  ].join("\n");
}

export function buildWhatsAppUrl(items: CartItem[], prices?: PriceMap): string {
  const message = buildOrderMessage(items, prices);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function isWhatsAppNumberConfigured(): boolean {
  return WHATSAPP_NUMBER.length > 0;
}

// Consulta directa de un solo producto (tarjetas de catálogo/home), sin
// pasar por el carrito — no hay talle ni cantidad todavía. Con precio
// publicado no tiene sentido preguntar por él, así que el mensaje cambia.
export function buildProductInquiryUrl(
  productName: string,
  price?: number | string | null,
): string {
  const priceText = formatPrice(price);
  const message = priceText
    ? `¡Hola ${STORE_NAME}! Me interesa "${productName}" (${priceText}), ¿tenés stock?`
    : `¡Hola ${STORE_NAME}! Me interesa "${productName}", ¿tenés stock y precio?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
