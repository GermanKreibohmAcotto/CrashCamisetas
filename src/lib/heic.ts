// Las fotos de iPhone salen en HEIC/HEIF por defecto. Ni los navegadores
// (fuera de Safari) ni el optimizador de imágenes de Next (sharp, sin
// libheif) pueden mostrarlas, así que las convertimos a JPEG en el
// navegador ANTES de subirlas a Supabase Storage — lo que queda guardado
// siempre es un JPEG normal, sin tocar nada del lado del servidor.
function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  // Windows/Android suelen mandar el archivo sin MIME type (application/octet-stream
  // o vacío) para HEIC, así que también miramos la extensión.
  return /\.hei[cf]$/i.test(file.name);
}

export async function toUploadableImage(file: File): Promise<File> {
  if (!isHeic(file)) return file;

  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.85,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;

  const newName = file.name.replace(/\.hei[cf]$/i, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
