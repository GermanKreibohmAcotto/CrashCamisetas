import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/home/Hero";
import {
  FeaturedCollections,
  type CollectionCard,
} from "@/components/home/FeaturedCollections";
import { FeaturesBanner } from "@/components/home/FeaturesBanner";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { PRODUCT_SELECT, toProductsWithVariants } from "@/lib/products-query";
import type { Category } from "@/lib/types";

const FEATURED_LIMIT = 8;

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: coverRows }, { data: featuredProducts }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      // Las categorías no tienen foto propia: se usa la portada del
      // producto activo más nuevo de cada una como imagen de la tarjeta.
      // Un producto en varias categorías es portada candidata de todas.
      supabase
        .from("products")
        .select("id, image_url, product_categories(category_id)")
        .eq("is_active", true)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(FEATURED_LIMIT),
    ]);

  const coverByCategory = new Map<string, string>();
  for (const row of coverRows ?? []) {
    if (!row.image_url) continue;
    for (const pc of row.product_categories ?? []) {
      if (!coverByCategory.has(pc.category_id)) {
        coverByCategory.set(pc.category_id, row.image_url);
      }
    }
  }

  const collections: CollectionCard[] = (categories ?? []).map(
    (category: Category) => ({
      category,
      imageUrl: coverByCategory.get(category.id) ?? null,
    }),
  );

  const products = toProductsWithVariants(featuredProducts ?? []);

  return (
    <>
      <Hero />

      <FeaturedCollections collections={collections} />

      <section className="relative overflow-hidden border-t-2 border-outline-variant/30 bg-surface-container-lowest py-24">
        <div className="pointer-events-none absolute right-0 top-0 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
          <Reveal className="mb-16 flex flex-col items-center text-center">
            <span className="mb-4 font-label text-label-caps uppercase tracking-[0.2em] text-secondary before:mr-2 before:text-primary before:content-['//'] after:ml-2 after:text-primary after:content-['//']">
              Lo Más Buscado
            </span>
            <h2 className="max-w-2xl font-display text-headline-lg uppercase text-on-surface">
              Lo que no puede faltar en tu placard
            </h2>
          </Reveal>

          {products.length === 0 ? (
            <p className="text-center text-on-surface-variant">
              Todavía no hay productos cargados.
            </p>
          ) : (
            <Stagger className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
              {products.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </Stagger>
          )}

          <div className="mt-12 flex justify-center">
            <Link
              href="/catalogo"
              className="skew-slant border-2 border-primary px-8 py-4 font-display text-headline-sm uppercase tracking-wider text-primary transition-all hover:bg-primary/10"
            >
              <span className="skew-slant block">Ver Todo el Catálogo</span>
            </Link>
          </div>
        </div>
      </section>

      <FeaturesBanner />
    </>
  );
}
