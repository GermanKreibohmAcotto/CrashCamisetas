"use client";

import {
  buildWhatsAppUrl,
  isWhatsAppNumberConfigured,
  type PriceMap,
} from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/icons";
import type { CartItem } from "@/lib/types";

export function WhatsAppButton({
  items,
  prices,
  pricesLoading = false,
}: {
  items: CartItem[];
  prices?: PriceMap;
  pricesLoading?: boolean;
}) {
  if (!isWhatsAppNumberConfigured()) {
    return (
      <p className="rounded-sm border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
        Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER en .env.local para poder
        enviar pedidos.
      </p>
    );
  }

  if (items.length === 0) return null;

  // Mientras se releen los precios, el botón queda deshabilitado en vez
  // de clickeable: sin esto hay una ventana chica pero real donde un
  // clic rápido manda el pedido antes de que los importes lleguen.
  if (pricesLoading) {
    return (
      <span className="skew-slant flex items-center justify-center gap-3 bg-whatsapp/50 px-8 py-5 font-display text-headline-sm text-white/80">
        <span className="skew-slant uppercase">Cargando precios…</span>
      </span>
    );
  }

  return (
    <a
      href={buildWhatsAppUrl(items, prices)}
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
