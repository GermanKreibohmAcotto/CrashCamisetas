import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { Category, ProductWithVariants } from "@/lib/types";

export default async function CatalogPage({ searchParams }: PageProps<"/catalogo">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const categoriaSlug =
    typeof params.categoria === "string" ? params.categoria : undefined;
  const talle = typeof params.talle === "string" ? params.talle : undefined;

  const supabase = await createClient();

  const [{ data: categories }, { data: variantSizes }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("product_variants").select("size"),
  ]);

  const sizes = [...new Set((variantSizes ?? []).map((v) => v.size))].sort();

  // Resolver categoría por slug antes de filtrar: si no existe (URL
  // vieja o inválida), no hay resultados posibles y se evita la query
  // principal en vez de mostrar el catálogo entero por error.
  let categoryId: string | null = null;
  let categoryNotFound = false;
  if (categoriaSlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categoriaSlug)
      .maybeSingle();
    if (category) {
      categoryId = category.id;
    } else {
      categoryNotFound = true;
    }
  }

  // Filtrar por talle con stock requiere resolver primero qué productos
  // tienen esa variante disponible: PostgREST con embeds !inner recortaría
  // el array "variants" completo que necesita ProductCard para el total
  // de stock, así que se hace en dos pasos en vez de un solo query.
  let sizeProductIds: string[] | null = null;
  if (talle) {
    const { data } = await supabase
      .from("product_variants")
      .select("product_id")
      .eq("size", talle)
      .gt("stock", 0);
    sizeProductIds = [...new Set((data ?? []).map((r) => r.product_id))];
  }

  let products: ProductWithVariants[] = [];
  const noPossibleResults =
    categoryNotFound || (sizeProductIds !== null && sizeProductIds.length === 0);

  if (!noPossibleResults) {
    let query = supabase
      .from("products")
      .select("*, variants:product_variants(*), category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (categoryId) query = query.eq("category_id", categoryId);
    if (q) query = query.ilike("name", `%${q}%`);
    if (sizeProductIds) query = query.in("id", sizeProductIds);

    const { data } = await query;
    products = (data ?? []) as ProductWithVariants[];
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
            <Stagger className="grid grid-cols-2 gap-gutter md:grid-cols-3">
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
