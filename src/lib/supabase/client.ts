import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para Client Components: login del admin y subida
// de imágenes a Storage. Usa la publishable key, segura para el navegador
// porque toda la protección real vive en las políticas RLS de la base.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
