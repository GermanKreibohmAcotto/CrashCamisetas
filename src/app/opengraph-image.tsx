import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { STORE_NAME } from "@/lib/site";

// Imagen Open Graph por defecto (home y cualquier ruta sin la suya
// propia). Solo el favicon centrado — nada de texto: es lo que pidió
// el usuario después de ver el preview real en un chat.
export const alt = STORE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // La versión de mayor resolución del favicon (la de 96x96 se ve borrosa
  // al escalarla a este tamaño). Se embebe como data URI porque ImageResponse
  // corre en un runtime aislado que no puede pedir un archivo de /public
  // por HTTP en build time.
  const logo = await readFile(
    join(process.cwd(), "public/web-app-manifest-512x512.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Sólido, no gradiente: un linear-gradient acá produce a veces un
          // SVG que resvg (el renderer que usa next/og por debajo) no puede
          // parsear — "Input buffer contains unsupported image format".
          backgroundColor: "#041329",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={512} height={512} alt="" />
      </div>
    ),
    { ...size },
  );
}
