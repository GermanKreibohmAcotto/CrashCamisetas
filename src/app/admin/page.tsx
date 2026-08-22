import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ToggleActiveButton, DeleteProductButton } from "./ProductRowActions";
import { formatPrice } from "@/lib/format";
import { PRODUCT_SELECT, toProductsWithVariants } from "@/lib/products-query";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  const products = toProductsWithVariants(data ?? []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-headline-sm uppercase text-on-surface">
          Productos
        </h2>
        <Link
          href="/admin/nuevo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-fixed"
        >
          + Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-on-surface-variant">
          Todavía no cargaste ningún producto.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-outline-variant/30">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container">
                <th className="px-3 py-2" aria-label="Foto"></th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  Nombre
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  Categoría
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  Precio
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  Stock total
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  Estado
                </th>
                <th className="px-3 py-2" aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0,
                );
                return (
                  <tr
                    key={product.id}
                    className="border-b border-outline-variant/20 last:border-0"
                  >
                    <td className="px-3 py-2">
                      <div className="relative h-11 w-11 overflow-hidden rounded-sm bg-surface-container-low">
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-on-surface">{product.name}</td>
                    <td className="px-3 py-2 text-on-surface-variant">
                      {product.categories.length > 0
                        ? product.categories.map((c) => c.name).join(", ")
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-on-surface-variant">
                      {formatPrice(product.price) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-on-surface-variant">
                      {totalStock}
                    </td>
                    <td className="px-3 py-2">
                      {product.is_active ? (
                        <span className="rounded-sm bg-tertiary/15 px-2 py-0.5 text-xs font-medium text-tertiary">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded-sm bg-surface-container-high px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <Link
                          href={`/admin/${product.id}/editar`}
                          className="text-primary hover:underline"
                        >
                          Editar
                        </Link>
                        <ToggleActiveButton
                          productId={product.id}
                          isActive={product.is_active}
                        />
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
