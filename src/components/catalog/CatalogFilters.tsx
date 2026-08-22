"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import type { Category } from "@/lib/types";

type CatalogFiltersProps = {
  categories: Category[];
  sizes: string[];
};

function parseList(value: string | null): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((s) => s.trim()).filter(Boolean))];
}

export function CatalogFilters({ categories, sizes }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategorias = parseList(searchParams.get("categoria"));
  const activeTalles = parseList(searchParams.get("talle"));
  const hasActiveFilters = Boolean(
    activeCategorias.length > 0 ||
      activeTalles.length > 0 ||
      searchParams.get("q"),
  );

  // Agrega o saca `value` de la lista que ya está en `key`, y reescribe el
  // parámetro unido por comas (o lo borra si queda vacío). Varias casillas
  // marcadas a la vez suman con OR entre sí — ver catalogo/page.tsx.
  function toggleListParam(key: string, value: string, current: string[]) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const nextParams = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      nextParams.set(key, next.join(","));
    } else {
      nextParams.delete(key);
    }
    const query = nextParams.toString();
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
              const active = activeCategorias.includes(category.slug);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    toggleListParam("categoria", category.slug, activeCategorias)
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
                    {active && <Check className="h-3 w-3 text-on-primary" />}
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
              const active = activeTalles.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleListParam("talle", size, activeTalles)}
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
