import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SizeSelector } from "@/components/product/SizeSelector";
import { ProductCard } from "@/components/ProductCard";
import { Marquee } from "@/components/site/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { JsonLd } from "@/components/seo/JsonLd";
import type { ProductImage, ProductWithVariants } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { PRODUCT_SELECT, getProductBySlug, toProductsWithVariants } from "@/lib/products-query";
import { SITE_URL, STORE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const categoryNames = product.categories.map((c) => c.name).join(", ");
  const price = formatPrice(product.price);
  // Descripción real si el producto la tiene; si no, una armada a partir
  // de lo que ya sabemos (nombre, categorías, precio) — nunca vacía.
  const description = product.description?.trim()
    ? product.description
    : `${product.name}${categoryNames ? ` — ${categoryNames}` : ""}. ${
        price ? `${price}. ` : ""
      }Coordiná tu pedido por WhatsApp en ${STORE_NAME}.`;
  const url = `${SITE_URL}/producto/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url,
      // La foto ya está en Supabase Storage sobre un dominio público —
      // no hace falta generar nada, es lo que hace que compartir el
      // link por WhatsApp muestre la camiseta.
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const typedProduct = await getProductBySlug(slug);

  if (!typedProduct) {
    notFound();
  }

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

  // Relacionados: productos que comparten ALGUNA categoría con este, vía
  // la tabla puente. Dos pasos porque un !inner acá recortaría el embed de
  // variants/categories que necesita ProductCard.
  const categoryIds = typedProduct.categories.map((c) => c.id);
  let related: ProductWithVariants[] = [];
  if (categoryIds.length > 0) {
    const { data: relatedProductIdsRaw } = await supabase
      .from("product_categories")
      .select("product_id")
      .in("category_id", categoryIds)
      .neq("product_id", typedProduct.id);
    const relatedProductIds = [
      ...new Set((relatedProductIdsRaw ?? []).map((r) => r.product_id)),
    ];

    if (relatedProductIds.length > 0) {
      const { data: relatedRaw } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .in("id", relatedProductIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4);
      related = toProductsWithVariants(relatedRaw ?? []);
    }
  }

  const nameParts = typedProduct.name.split(" ");
  const lastWord = nameParts.pop();
  const nameLead = nameParts.join(" ");
  const price = formatPrice(typedProduct.price);
  const productUrl = `${SITE_URL}/producto/${typedProduct.slug}`;
  const totalStock = sortedVariants.reduce((sum, v) => sum + v.stock, 0);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: typedProduct.name,
    ...(typedProduct.image_url ? { image: [typedProduct.image_url] } : {}),
    ...(typedProduct.description ? { description: typedProduct.description } : {}),
    brand: { "@type": "Brand", name: STORE_NAME },
    // A propósito solo se emite si hay precio real: el proyecto soporta
    // "a convenir" (price = null), y declarar un precio inventado sería
    // dato estructurado falso — justo lo que Google penaliza.
    ...(typedProduct.price !== null
      ? {
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "ARS",
            price: typedProduct.price,
            availability:
              totalStock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catálogo",
        item: `${SITE_URL}/catalogo`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: typedProduct.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <ProductGallery
            productName={typedProduct.name}
            coverUrl={typedProduct.image_url}
            images={(galleryImages ?? []) as ProductImage[]}
            badge={typedProduct.badge}
          />

          <div className="flex flex-col gap-6">
            {typedProduct.categories.length > 0 && (
              <span className="font-label text-label-caps uppercase tracking-widest text-primary">
                {typedProduct.categories.map((c) => c.name).join(" · ")}
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
                href={`/catalogo${
                  typedProduct.categories.length > 0
                    ? `?categoria=${typedProduct.categories.map((c) => c.slug).join(",")}`
                    : ""
                }`}
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
