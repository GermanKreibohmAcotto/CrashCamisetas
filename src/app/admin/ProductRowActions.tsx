"use client";

import { useTransition } from "react";
import { toggleProductActive, deleteProduct } from "./actions";

export function ToggleActiveButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => toggleProductActive(productId, !isActive))
      }
      className="text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
    >
      {isActive ? "Desactivar" : "Activar"}
    </button>
  );
}

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `¿Eliminar "${productName}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    startTransition(() => deleteProduct(productId));
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="text-error transition-colors hover:underline disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
