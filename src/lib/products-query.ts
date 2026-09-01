import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductVariant, ProductWithVariants } from "@/lib/types";

// Select compartido por toda lectura de producto. product_categories es la
// tabla puente N a N: se embebe anidada (dos saltos uno-a-muchos) en vez de
// pedir "categories(*)" directo, porque products todavía tiene la columna
// legacy category_id — un embed plano quedaría ambiguo entre esa FK y la
// tabla puente y PostgREST respondería PGRST201 para cualquier query.
export const PRODUCT_SELECT =
  "*, variants:product_variants(*), product_categories(category:categories(*))";

type RawProductCategory = { category: Category | null };

type RawProduct = {
  variants?: ProductVariant[];
  product_categories?: RawProductCategory[];
  [key: string]: unknown;
};

// Aplana el embed anidado product_categories(category:categories(*)) a un
// array plano de categorías, ordenado por el sort_order de cada categoría.
export function toProductWithVariants(row: RawProduct): ProductWithVariants {
  const categories = (row.product_categories ?? [])
    .map((pc) => pc.category)
    .filter((c): c is Category => c !== null)
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    ...row,
    variants: row.variants ?? [],
    categories,
  } as ProductWithVariants;
}

export function toProductsWithVariants(rows: RawProduct[]): ProductWithVariants[] {
  return rows.map(toProductWithVariants);
}

// Envuelto en cache() de React: generateMetadata y el componente de la
// página piden el mismo producto en el mismo request, y a diferencia de
// fetch(), el cliente de Supabase no se memoiza solo. Sin esto, cada
// visita a /producto/[slug] dispara la consulta dos veces.
export const getProductBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return data ? toProductWithVariants(data) : null;
});
