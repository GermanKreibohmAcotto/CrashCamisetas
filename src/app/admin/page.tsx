import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ToggleActiveButton, DeleteProductButton } from "./ProductRowActions";
import type { ProductWithVariants } from "@/lib/types";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*, variants:product_variants(*), category:categories(*)")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as ProductWithVariants[];

  return (
    <div>
      <div className="admin-header">
        <h2>Productos</h2>
        <Link href="/admin/nuevo" className="button button-primary">
          + Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="notice">Todavía no cargaste ningún producto.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th aria-label="Foto"></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock total</th>
                <th>Estado</th>
                <th aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0,
                );
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-thumb">
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="44px"
                          />
                        )}
                      </div>
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category?.name ?? "—"}</td>
                    <td>{totalStock}</td>
                    <td>
                      {product.is_active ? (
                        <span className="badge badge-active">Activo</span>
                      ) : (
                        <span className="badge badge-muted">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link href={`/admin/${product.id}/editar`}>
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
