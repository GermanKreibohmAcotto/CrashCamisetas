import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const supabase = await createClient();
  // getClaims() valida el JWT de verdad (no confiar en getSession() para
  // esto). Si no hay sesión válida, afuera.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : undefined;

  return (
    <div>
      <div className="admin-header">
        <h1>Administración</h1>
        <LogoutButton email={email} />
      </div>

      <nav className="admin-nav">
        <Link href="/admin">Productos</Link>
        <Link href="/admin/categorias">Categorías</Link>
      </nav>

      <div className="admin-content">{children}</div>
    </div>
  );
}
