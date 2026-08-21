"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/lib/types";

export type StockMap = Map<string, number>;

const EMPTY_STOCK: StockMap = new Map();

// Relee el stock directo de Supabase al mostrar el carrito, en vez de
// confiar en lo que haya en localStorage — mismo criterio que
// use-cart-prices.ts (ver ese archivo y el comentario sobre CartItem en
// src/lib/types.ts): un stock guardado queda rancio si el admin lo cambia
// mientras el carrito sigue abierto.
//
// Clave por variantId, no productId: el stock es por talle.
//
// Lectura pública: la policy variants_select_public ya permite select a
// "anon".
export function useCartStock(items: CartItem[]): {
  stock: StockMap;
  loading: boolean;
} {
  const [stock, setStock] = useState<StockMap>(EMPTY_STOCK);
  // Igual que en use-cart-prices.ts: loading se DERIVA comparando la key
  // pedida contra la última resuelta, no con un setState síncrono dentro
  // del effect (el linter de hooks de React 19 lo prohíbe).
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);

  const variantIds = [...new Set(items.map((item) => item.variantId))];
  const hasItems = variantIds.length > 0;
  const key = variantIds.join(",");

  useEffect(() => {
    if (!hasItems) return;

    let cancelled = false;

    createClient()
      .from("product_variants")
      .select("id, stock")
      .in("id", key.split(","))
      .then(({ data }) => {
        if (cancelled) return;
        const next: StockMap = new Map(
          (data ?? []).map((row) => [row.id as string, row.stock as number]),
        );
        setStock(next);
        setResolvedKey(key);
      });

    return () => {
      cancelled = true;
    };
  }, [key, hasItems]);

  if (!hasItems) {
    return { stock: EMPTY_STOCK, loading: false };
  }

  return { stock, loading: resolvedKey !== key };
}
