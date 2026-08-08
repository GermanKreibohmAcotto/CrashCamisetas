import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import type { Category, ProductWithVariants } from "@/lib/types";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const categoriaParam = params.categoria;
  const categorySlug =
    typeof categoriaParam === "string" ? categoriaParam : undefined;

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const baseProductsQuery = () =>
    supabase
      .from("products")
      .select("*, variants:product_variants(*), category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

  let products: ProductWithVariants[] = [];

  if (categorySlug) {
    // Resolver el slug a id primero (en vez de filtrar por
    // "category.slug" con un inner join) mantiene el embed de "category"
    // como left join, así los productos sin categoría siguen apareciendo
    // cuando no hay filtro activo.
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (category) {
      const { data } = await baseProductsQuery().eq("category_id", category.id);
      products = (data ?? []) as ProductWithVariants[];
    }
    // Si el slug no resuelve a ninguna categoría (URL vieja o inválida),
    // products queda vacío en vez de mostrar el catálogo entero.
  } else {
    const { data } = await baseProductsQuery();
    products = (data ?? []) as ProductWithVariants[];
  }

  return (
    <div>
      <h1>Catálogo</h1>

      {categories && categories.length > 0 && (
        <nav className="category-filter">
          <Link href="/" className={!categorySlug ? "active" : undefined}>
            Todas
          </Link>
          {(categories as Category[]).map((category) => (
            <Link
              key={category.id}
              href={`/?categoria=${category.slug}`}
              className={categorySlug === category.slug ? "active" : undefined}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}

      {products.length === 0 ? (
        <p className="notice">Todavía no hay productos cargados.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
