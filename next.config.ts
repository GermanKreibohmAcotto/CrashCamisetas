import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
