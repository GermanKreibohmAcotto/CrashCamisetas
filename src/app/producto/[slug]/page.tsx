import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AddToCart } from "@/components/AddToCart";
import type { ProductWithVariants } from "@/lib/types";

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

  return (
    <article className="product-detail">
      <div className="product-detail-image">
        {typedProduct.image_url ? (
          <Image
            src={typedProduct.image_url}
            alt={typedProduct.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="image-placeholder">Sin foto</div>
        )}
      </div>

      <div className="product-detail-info">
        {typedProduct.category && (
          <p className="eyebrow">{typedProduct.category.name}</p>
        )}
        <h1>{typedProduct.name}</h1>
        {typedProduct.description && <p>{typedProduct.description}</p>}

        <AddToCart product={{ ...typedProduct, variants: sortedVariants }} />
      </div>
    </article>
  );
}
