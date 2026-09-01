import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

// El panel de administración no tiene ningún valor de búsqueda y ya está
// bloqueado en robots.ts — esto es el segundo cinturón: si un crawler
// llega igual por un link externo, que no lo indexe.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
    <div className="mx-auto max-w-6xl px-margin-mobile py-10 md:px-margin-desktop">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-headline-md uppercase text-on-surface">
          Administración
        </h1>
        <LogoutButton email={email} />
      </div>

      <nav className="mb-8 flex gap-6 border-b border-outline-variant/30 pb-4">
        <Link
          href="/admin"
          className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
        >
          Productos
        </Link>
        <Link
          href="/admin/categorias"
          className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
        >
          Categorías
        </Link>
      </nav>

      <div>{children}</div>
    </div>
  );
}
