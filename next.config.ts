import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // lucide-react ya viene optimizado por defecto en Next; este paquete
    // no, y sin esto el dev server carga el barrel completo de logos de
    // marca en cada reload.
    optimizePackageImports: ["@icons-pack/react-simple-icons"],
  },
  images: {
    remotePatterns: [
      {
        // Coincide con cualquier proyecto *.supabase.co, acotado a rutas
        // públicas de Storage. Si querés restringirlo a tu proyecto puntual,
        // cambiá "**.supabase.co" por "<tu-ref>.supabase.co".
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
