import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SizeSelector } from "@/components/product/SizeSelector";
import { ProductCard } from "@/components/ProductCard";
import { Marquee } from "@/components/site/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { ProductImage, ProductWithVariants } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default async function ProductPage({
  params,
}: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, variants:product_variants(*), category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const typedProduct = product as ProductWithVariants;
  const sortedVariants = [...typedProduct.variants].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  // product_images es parte de la migración 001_design.sql. Separado del
  // query principal a propósito: si todavía no se corrió esa migración,
  // esta consulta falla sola (tabla inexistente) sin tumbar la página
  // entera ni convertir un producto real en un 404 falso.
  const { data: galleryImages } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", typedProduct.id)
    .order("sort_order", { ascending: true });

  const { data: relatedRaw } = typedProduct.category_id
    ? await supabase
        .from("products")
        .select("*, variants:product_variants(*), category:categories(*)")
        .eq("category_id", typedProduct.category_id)
        .eq("is_active", true)
        .neq("id", typedProduct.id)
        .order("created_at", { ascending: false })
        .limit(4)
    : { data: [] as ProductWithVariants[] };

  const related = (relatedRaw ?? []) as ProductWithVariants[];

  const nameParts = typedProduct.name.split(" ");
  const lastWord = nameParts.pop();
  const nameLead = nameParts.join(" ");
  const price = formatPrice(typedProduct.price);

  return (
    <>
      <div className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <ProductGallery
            productName={typedProduct.name}
            coverUrl={typedProduct.image_url}
            images={(galleryImages ?? []) as ProductImage[]}
            badge={typedProduct.badge}
          />

          <div className="flex flex-col gap-6">
            {typedProduct.category && (
              <span className="font-label text-label-caps uppercase tracking-widest text-primary">
                {typedProduct.category.name}
              </span>
            )}

            <h1 className="font-display text-headline-lg uppercase text-on-surface">
              {nameLead && <>{nameLead} </>}
              {lastWord && (
                <span className="italic text-secondary">{lastWord}</span>
              )}
            </h1>

            <p className="font-display text-headline-md text-primary">
              {price ?? "Consultar por WhatsApp"}
            </p>

            {typedProduct.description && (
              <p className="max-w-xl font-body text-body-lg text-on-surface-variant">
                {typedProduct.description}
              </p>
            )}

            <SizeSelector product={{ ...typedProduct, variants: sortedVariants }} />
          </div>
        </div>
      </div>

      <Marquee items={["Campeones del Mundo", "Crash Camisetas"]} />

      {related.length > 0 && (
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
            <Reveal className="mb-10 flex items-end justify-between">
              <div>
                <span className="mb-2 block font-label text-label-caps uppercase text-secondary">
                  No te quedes ahí
                </span>
                <h2 className="font-display text-headline-lg uppercase text-on-surface">
                  Completá tu <span className="italic text-primary">Colección</span>
                </h2>
              </div>
              <Link
                href={`/catalogo${typedProduct.category ? `?categoria=${typedProduct.category.slug}` : ""}`}
                className="hidden shrink-0 font-label text-label-caps uppercase text-primary hover:underline sm:block"
              >
                Ver todo →
              </Link>
            </Reveal>

            <Stagger className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
              {related.map((item) => (
                <StaggerItem key={item.id}>
                  <ProductCard product={item} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}
