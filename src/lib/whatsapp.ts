import type { CartItem } from "@/lib/types";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "la tienda";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

// Sin precios ni totales en pesos a propósito: eso se acuerda charlando
// por WhatsApp. El "Total" acá es una cantidad de artículos, no un importe.
export function buildOrderMessage(items: CartItem[]): string {
  const lines = items.map(
    (item, i) =>
      `${i + 1}. ${item.productName} — Talle ${item.size} — Cantidad: ${item.qty}`,
  );

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const noun = totalQty === 1 ? "artículo" : "artículos";

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

export function buildWhatsAppUrl(items: CartItem[]): string {
  const message = buildOrderMessage(items);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function isWhatsAppNumberConfigured(): boolean {
  return WHATSAPP_NUMBER.length > 0;
}

// Consulta directa de un solo producto (tarjetas de catálogo/home), sin
// pasar por el carrito — no hay talle ni cantidad todavía.
export function buildProductInquiryUrl(productName: string): string {
  const message = `¡Hola ${STORE_NAME}! Me interesa "${productName}", ¿tenés stock y precio?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
