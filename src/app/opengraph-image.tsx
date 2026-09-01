import { ImageResponse } from "next/og";
import { STORE_NAME } from "@/lib/site";

// Imagen Open Graph por defecto (home y cualquier ruta sin la suya
// propia). Se genera en vez de usar un archivo estático porque
// public/hero-stadium.png es 2752x1536 y pesa ~2MB — proporción
// equivocada y demasiado pesada para un preview de WhatsApp/redes.
export const alt = STORE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // Color sólido, no gradiente: un linear-gradient acá produce un
          // SVG que resvg (el renderer que usa next/og por debajo) a veces
          // no puede parsear — "Input buffer contains unsupported image
          // format", intermitente. Sólido es 100% estable.
          backgroundColor: "#041329",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 200,
            height: 8,
            marginBottom: 40,
            backgroundColor: "#97ccfe",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -2,
            color: "#d6e3ff",
            textTransform: "uppercase",
          }}
        >
          Crash Camisetas
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 34,
            color: "#97ccfe",
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          Camisetas de fútbol para verdaderos hinchas
        </div>
      </div>
    ),
    { ...size },
  );
}
