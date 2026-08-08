"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function CartPage() {
  const { items, hydrated, setQty, removeItem, clear } = useCart();

  if (!hydrated) {
    return <p className="notice">Cargando tu pedido…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>Todavía no agregaste nada a tu pedido.</p>
        <Link href="/" className="button button-secondary">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Tu pedido</h1>

      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.variantId} className="cart-item">
            <div className="cart-item-image">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  sizes="80px"
                />
              ) : (
                <div className="image-placeholder">Sin foto</div>
              )}
            </div>

            <div className="cart-item-info">
              <Link href={`/producto/${item.productSlug}`}>
                {item.productName}
              </Link>
              <p>Talle {item.size}</p>
            </div>

            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!next || next < 1) {
                  removeItem(item.variantId);
                } else {
                  setQty(item.variantId, next);
                }
              }}
              className="cart-item-qty"
              aria-label={`Cantidad de ${item.productName}, talle ${item.size}`}
            />

            <button
              type="button"
              onClick={() => removeItem(item.variantId)}
              className="button button-text"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-actions">
        <button
          type="button"
          onClick={clear}
          className="button button-secondary"
        >
          Vaciar pedido
        </button>
        <WhatsAppButton items={items} />
      </div>
    </div>
  );
}
