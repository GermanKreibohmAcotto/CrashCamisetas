import Image from "next/image";
import Link from "next/link";
import type { ProductWithVariants } from "@/lib/types";

// Server Component: solo presenta, no hace falta interactividad acá.
export function ProductCard({ product }: { product: ProductWithVariants }) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <Link href={`/producto/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="image-placeholder">Sin foto</div>
        )}
        {totalStock === 0 && (
          <span className="badge badge-muted product-card-badge">Agotado</span>
        )}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        {product.category && (
          <p className="product-card-category">{product.category.name}</p>
        )}
      </div>
    </Link>
  );
}
