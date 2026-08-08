"use client";

import { useTransition } from "react";
import { deleteCategory } from "../actions";

export function DeleteCategoryButton({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${categoryName}"? Los productos que la usan quedan sin categoría, no se borran.`,
    );
    if (!confirmed) return;
    startTransition(() => deleteCategory(categoryId));
  }

  return (
    <button
      type="button"
      className="button button-text"
      disabled={isPending}
      onClick={handleClick}
    >
      Eliminar
    </button>
  );
}
