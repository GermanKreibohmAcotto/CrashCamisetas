import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renombró "middleware.ts" a "proxy.ts" (misma idea, más
// claro que corre en el borde de cada request). Esto refresca el token
// de sesión de Supabase en cada navegación y reenvía las cookies
// actualizadas tanto al Server Component que sigue como al navegador.
//
// Sin esto, las sesiones expiran de forma intermitente y muy difícil
// de debuggear: por eso corre en (casi) todas las rutas via `config.matcher`.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // No agregar lógica entre createServerClient y esta llamada: dispara
  // el refresh del token si hace falta y escribe la cookie nueva antes
  // de que la respuesta se termine de armar.
  await supabase.auth.getClaims();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
