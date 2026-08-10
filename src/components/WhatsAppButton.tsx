"use client";

import { buildWhatsAppUrl, isWhatsAppNumberConfigured } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/icons";
import type { CartItem } from "@/lib/types";

export function WhatsAppButton({ items }: { items: CartItem[] }) {
  if (!isWhatsAppNumberConfigured()) {
    return (
      <p className="rounded-sm border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
        Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER en .env.local para poder
        enviar pedidos.
      </p>
    );
  }

  if (items.length === 0) return null;

  return (
    <a
      href={buildWhatsAppUrl(items)}
      target="_blank"
      rel="noopener noreferrer"
      className="skew-slant flex items-center justify-center gap-3 bg-whatsapp px-8 py-5 font-display text-headline-sm text-white transition-all hover:brightness-110 active:translate-y-1"
    >
      <IconWhatsApp
        className="skew-slant h-5 w-5"
        cutoutColor="var(--color-whatsapp)"
      />
      <span className="skew-slant uppercase">Enviar pedido por WhatsApp</span>
    </a>
  );
}
