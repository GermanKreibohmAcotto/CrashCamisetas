import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

// Solo productos activos: uno desactivado no tiene por qué aparecer acá,
// aunque su página siga técnicamente accesible por URL directa.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at, image_url")
    .eq("is_active", true);

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: `${SITE_URL}/producto/${p.slug}`,
      // updated_at ya se mantiene solo vía el trigger products_set_updated_at.
      lastModified: new Date(p.updated_at as string),
      changeFrequency: "weekly",
      priority: 0.8,
    };
    if (p.image_url) {
      entry.images = [p.image_url];
    }
    return entry;
  });

  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/catalogo`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productEntries,
  ];
}
