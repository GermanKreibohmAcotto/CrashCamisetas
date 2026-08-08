"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart-context";
import type { ProductWithVariants } from "@/lib/types";

export function AddToCart({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart();
  const variants = product.variants;
  const firstInStock = variants.find((v) => v.stock > 0);
  const allSoldOut = !firstInStock;

  const [variantId, setVariantId] = useState(firstInStock?.id ?? "");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === variantId);
  const maxQty = selectedVariant?.stock ?? 1;

  if (allSoldOut) {
    return <p className="notice">No queda stock de ningún talle por ahora.</p>;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVariant || selectedVariant.stock < 1) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      size: selectedVariant.size,
      imageUrl: product.image_url,
      qty: Math.min(qty, selectedVariant.stock),
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <form className="add-to-cart" onSubmit={handleSubmit}>
      <label className="field">
        <span>Talle</span>
        <select
          value={variantId}
          onChange={(e) => {
            setVariantId(e.target.value);
            setQty(1);
          }}
        >
          {variants.map((variant) => (
            <option
              key={variant.id}
              value={variant.id}
              disabled={variant.stock === 0}
            >
              {variant.size}
              {variant.stock === 0 ? " — agotado" : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Cantidad</span>
        <input
          type="number"
          min={1}
          max={maxQty}
          value={qty}
          onChange={(e) => {
            const next = Number(e.target.value) || 1;
            setQty(Math.min(Math.max(next, 1), maxQty));
          }}
        />
      </label>

      <button type="submit" className="button button-primary">
        Agregar al pedido
      </button>

      {justAdded && <p className="confirmation">Agregado ✓</p>}
    </form>
  );
}
