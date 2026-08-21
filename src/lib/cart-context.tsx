"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "crash-cart-v1";

// Tope por talle para un pedido minorista. Quien necesite más que esto es
// mayorista, y ese volumen se negocia charlando por WhatsApp — que es
// justamente el modelo del negocio. Cambiar en un solo lugar si hace falta
// otro número.
export const MAX_QTY_PER_ITEM = 50;

type CartState = {
  items: CartItem[];
  hydrated: boolean;
};

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: CartItem; maxQty?: number }
  | { type: "setQty"; variantId: string; qty: number; maxQty?: number }
  | { type: "remove"; variantId: string }
  | { type: "clear" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };

    // El clamp acá es la red de seguridad real — lo que valida el
    // formulario de producto es solo UX. Sin esto, clickear "Agregar"
    // varias veces seguidas suma sin techo (bug reportado: "me deja
    // agregar infinitas camisetas").
    case "add": {
      const cap = action.maxQty ?? MAX_QTY_PER_ITEM;
      const existing = state.items.find(
        (item) => item.variantId === action.item.variantId,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.variantId === action.item.variantId
              ? { ...item, qty: Math.min(item.qty + action.item.qty, cap) }
              : item,
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.item, qty: Math.min(action.item.qty, cap) },
        ],
      };
    }

    case "setQty": {
      const cap = action.maxQty ?? MAX_QTY_PER_ITEM;
      return {
        ...state,
        items: state.items.map((item) =>
          item.variantId === action.variantId
            ? { ...item, qty: Math.min(action.qty, cap) }
            : item,
        ),
      };
    }

    case "remove":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.variantId !== action.variantId,
        ),
      };

    case "clear":
      return { ...state, items: [] };

    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  totalQty: number;
  // maxQty es el tope absoluto para ESE talle (min(stock, MAX_QTY_PER_ITEM)),
  // no lo que falta para llegar a él — el reducer hace la resta contra lo
  // que ya haya en el carrito.
  addItem: (item: CartItem, maxQty?: number) => void;
  setQty: (variantId: string, qty: number, maxQty?: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    hydrated: false,
  });

  // Hidratar desde localStorage recién en un efecto, nunca durante el
  // render: si se leyera localStorage en el render inicial, el HTML que
  // ya mandó el servidor (que no conoce el carrito del navegador) no
  // coincidiría con el del cliente y React tiraría un hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const items = raw ? (JSON.parse(raw) as CartItem[]) : [];
      dispatch({ type: "hydrate", items });
    } catch {
      dispatch({ type: "hydrate", items: [] });
    }
  }, []);

  // Persistir cada cambio, pero solo después de hidratar: si no, el
  // primer render (carrito vacío, hydrated=false) pisaría con "[]" lo
  // que localStorage ya tenía guardado antes de llegar a leerlo.
  useEffect(() => {
    if (!state.hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, state.hydrated]);

  const totalQty = state.items.reduce((sum, item) => sum + item.qty, 0);

  const value: CartContextValue = {
    items: state.items,
    hydrated: state.hydrated,
    totalQty,
    addItem: (item, maxQty) => dispatch({ type: "add", item, maxQty }),
    setQty: (variantId, qty, maxQty) =>
      dispatch({ type: "setQty", variantId, qty, maxQty }),
    removeItem: (variantId) => dispatch({ type: "remove", variantId }),
    clear: () => dispatch({ type: "clear" }),
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return ctx;
}
