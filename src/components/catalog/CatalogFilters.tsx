"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconCheck } from "@/components/icons";
import type { Category } from "@/lib/types";

type CatalogFiltersProps = {
  categories: Category[];
  sizes: string[];
};

export function CatalogFilters({ categories, sizes }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategoria = searchParams.get("categoria");
  const activeTalle = searchParams.get("talle");
  const hasActiveFilters = Boolean(
    activeCategoria || activeTalle || searchParams.get("q"),
  );

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <aside className="flex flex-col gap-8">
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="text-left font-label text-label-caps uppercase text-secondary transition-colors hover:text-primary"
        >
          Limpiar filtros
        </button>
      )}

      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 font-label text-label-caps uppercase text-on-surface-variant">
            Categoría
          </h3>
          <div className="flex flex-col gap-2">
            {categories.map((category) => {
              const active = activeCategoria === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    updateParam("categoria", active ? null : category.slug)
                  }
                  className={`flex items-center gap-2 text-left text-sm transition-colors ${
                    active
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                      active ? "border-primary bg-primary" : "border-outline"
                    }`}
                  >
                    {active && <IconCheck className="h-3 w-3 text-on-primary" />}
                  </span>
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <h3 className="mb-3 font-label text-label-caps uppercase text-on-surface-variant">
            Talle
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = activeTalle === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateParam("talle", active ? null : size)}
                  className={`flex h-10 w-10 items-center justify-center border text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant text-on-surface hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
