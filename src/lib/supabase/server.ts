import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de Supabase para Server Components, Server Actions y Route
// Handlers. Hay que crear uno nuevo en cada request — nunca reusarlo
// entre requests.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se llamó desde un Server Component, que no puede escribir
            // cookies. El proxy (proxy.ts) ya se encarga de refrescar la
            // sesión en cada request, así que acá se puede ignorar.
          }
        },
      },
    },
  );
}
