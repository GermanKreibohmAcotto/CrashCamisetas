import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { PRODUCT_SELECT, toProductsWithVariants } from "@/lib/products-query";
import type { Category } from "@/lib/types";

// Acepta tanto "?talle=S,M" (lo que arma CatalogFilters) como
// "?talle=S&talle=M" (por si alguien arma la URL a mano), y de paso
// des-duplica.
function parseList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];
}

// AND entre filtros: null significa "este filtro no está activo, no
// restringe nada". Un array (aunque esté vacío) sí restringe.
function intersect(a: string[] | null, b: string[] | null): string[] | null {
  if (a === null) return b;
  if (b === null) return a;
  const set = new Set(b);
  return a.filter((id) => set.has(id));
}

export default async function CatalogPage({ searchParams }: PageProps<"/catalogo">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const categoriaSlugs = parseList(params.categoria as string | string[] | undefined);
  const talles = parseList(params.talle as string | string[] | undefined);

  const supabase = await createClient();

  const [{ data: categories }, { data: variantSizes }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("product_variants").select("size"),
  ]);

  const sizes = [...new Set((variantSizes ?? []).map((v) => v.size))].sort();

  // Categorías: slugs de la URL → ids → product_ids vía la tabla puente.
  // OR entre las categorías marcadas (cualquiera de ellas alcanza).
  let categoryProductIds: string[] | null = null;
  if (categoriaSlugs.length > 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id")
      .in("slug", categoriaSlugs);
    const categoryIds = (cats ?? []).map((c) => c.id);
    if (categoryIds.length === 0) {
      // Ningún slug de la URL existe (URL vieja o typo): no hay resultados
      // posibles, no hace falta ni consultar product_categories.
      categoryProductIds = [];
    } else {
      const { data: prodCats } = await supabase
        .from("product_categories")
        .select("product_id")
        .in("category_id", categoryIds);
      categoryProductIds = [...new Set((prodCats ?? []).map((r) => r.product_id))];
    }
  }

  // Talles: mismo patrón, OR entre los talles marcados, y solo variantes
  // con stock (un talle agotado no cuenta como "disponible").
  let sizeProductIds: string[] | null = null;
  if (talles.length > 0) {
    const { data } = await supabase
      .from("product_variants")
      .select("product_id")
      .in("size", talles)
      .gt("stock", 0);
    sizeProductIds = [...new Set((data ?? []).map((r) => r.product_id))];
  }

  // AND entre categoría y talle: solo productos que cumplen ambos filtros
  // activos a la vez.
  const filteredIds = intersect(categoryProductIds, sizeProductIds);
  const noPossibleResults = filteredIds !== null && filteredIds.length === 0;

  let products = [] as ReturnType<typeof toProductsWithVariants>;

  if (!noPossibleResults) {
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (q) query = query.ilike("name", `%${q}%`);
    if (filteredIds) query = query.in("id", filteredIds);

    const { data } = await query;
    products = toProductsWithVariants(data ?? []);
  }

  return (
    <div className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-8">
        <span className="mb-2 block font-label text-label-caps uppercase text-secondary">
          El Arsenal Completo
        </span>
        <h1 className="font-display text-headline-lg uppercase text-on-surface">
          Catálogo
        </h1>
        <p className="mt-2 max-w-2xl font-body text-on-surface-variant">
          Descubrí la colección completa de camisetas. Filtrá por categoría o
          talle y coordiná tu compra por WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-[240px_1fr]">
        <Suspense fallback={null}>
          <CatalogFilters
            categories={(categories ?? []) as Category[]}
            sizes={sizes}
          />
        </Suspense>

        <div>
          <p className="mb-6 text-sm text-on-surface-variant">
            {products.length}{" "}
            {products.length === 1 ? "resultado" : "resultados"}
          </p>

          {products.length === 0 ? (
            <p className="text-on-surface-variant">
              No encontramos camisetas con esos filtros. Probá con otra
              combinación.
            </p>
          ) : (
            // key fuerza un remount completo del Stagger cuando cambian
            // los filtros. Sin esto, la animación de entrada (whileInView
            // + viewport.once) ya se disparó una sola vez con la grilla
            // original y nunca vuelve a correr para los productos nuevos:
            // quedan pegados en su estado oculto (opacity:0), invisibles
            // aunque la grilla siga ahí. Un componente nuevo trae un
            // IntersectionObserver nuevo, que dispara de inmediato si la
            // grilla ya está en pantalla.
            <Stagger
              key={`${categoriaSlugs.join(",")}|${talles.join(",")}|${q}`}
              className="grid grid-cols-2 gap-gutter md:grid-cols-3"
            >
              {products.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </div>
  );
}
