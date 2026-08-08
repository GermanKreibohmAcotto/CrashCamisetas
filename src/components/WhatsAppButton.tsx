"use client";

import { buildWhatsAppUrl, isWhatsAppNumberConfigured } from "@/lib/whatsapp";
import type { CartItem } from "@/lib/types";

export function WhatsAppButton({ items }: { items: CartItem[] }) {
  if (!isWhatsAppNumberConfigured()) {
    return (
      <p className="notice notice-error">
        Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER en .env.local para
        poder enviar pedidos.
      </p>
    );
  }

  if (items.length === 0) return null;

  return (
    <a
      href={buildWhatsAppUrl(items)}
      target="_blank"
      rel="noopener noreferrer"
      className="button button-whatsapp"
    >
      Enviar pedido por WhatsApp
    </a>
  );
}
