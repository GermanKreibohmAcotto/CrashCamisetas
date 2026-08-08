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

type CartState = {
  items: CartItem[];
  hydrated: boolean;
};

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: CartItem }
  | { type: "setQty"; variantId: string; qty: number }
  | { type: "remove"; variantId: string }
  | { type: "clear" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };

    case "add": {
      const existing = state.items.find(
        (item) => item.variantId === action.item.variantId,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.variantId === action.item.variantId
              ? { ...item, qty: item.qty + action.item.qty }
              : item,
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }

    case "setQty":
      return {
        ...state,
        items: state.items.map((item) =>
          item.variantId === action.variantId
            ? { ...item, qty: action.qty }
            : item,
        ),
      };

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
  addItem: (item: CartItem) => void;
  setQty: (variantId: string, qty: number) => void;
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
    addItem: (item) => dispatch({ type: "add", item }),
    setQty: (variantId, qty) => dispatch({ type: "setQty", variantId, qty }),
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
