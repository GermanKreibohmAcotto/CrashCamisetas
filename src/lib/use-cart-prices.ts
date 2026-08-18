"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/lib/types";
import type { PriceMap } from "@/lib/whatsapp";

const EMPTY_PRICES: PriceMap = new Map();

// Relee los precios directo de Supabase al mostrar el carrito, en vez de
// confiar en lo que haya en localStorage — ver el comentario sobre
// CartItem en src/lib/types.ts: un precio guardado ahí queda rancio si
// el carrito se deja abierto y termina en un mensaje de WhatsApp con un
// importe que ya no es real.
//
// Lectura pública: la policy products_select_public_active ya permite
// select a "anon". Un producto desactivado no vuelve en el resultado, así
// que queda tratado como "sin precio" en vez de mostrar el importe de
// algo que ya no se vende.
export function useCartPrices(items: CartItem[]): {
  prices: PriceMap;
  loading: boolean;
} {
  const [prices, setPrices] = useState<PriceMap>(EMPTY_PRICES);
  // No hay un booleano `loading` seteado a mano: el linter de hooks de
  // React 19 prohíbe llamar a setState de forma síncrona dentro de un
  // effect (incluso para "avisar que empezó a cargar"), porque encadena
  // un render de más. En cambio, loading se DERIVA comparando la key que
  // se está pidiendo contra la última que efectivamente resolvió.
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);

  const productIds = [...new Set(items.map((item) => item.productId))];
  const hasItems = productIds.length > 0;
  // Clave estable: un array literal nuevo en cada render (por ejemplo
  // tras editar una cantidad) no debe disparar un refetch si el
  // conjunto de productos no cambió.
  const key = productIds.join(",");

  useEffect(() => {
    if (!hasItems) return;

    let cancelled = false;

    createClient()
      .from("products")
      .select("id, price")
      .in("id", key.split(","))
      .then(({ data }) => {
        if (cancelled) return;
        const next: PriceMap = new Map(
          (data ?? []).map((row) => [
            row.id as string,
            row.price as number | string | null,
          ]),
        );
        setPrices(next);
        setResolvedKey(key);
      });

    return () => {
      cancelled = true;
    };
  }, [key, hasItems]);

  // El carrito vacío no pasa por el effect: se deriva directo en el
  // render, sin arrastrar precios de una consulta anterior.
  if (!hasItems) {
    return { prices: EMPTY_PRICES, loading: false };
  }

  return { prices, loading: resolvedKey !== key };
}
